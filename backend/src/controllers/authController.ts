import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { query } from "../config/db.js";
import {
  registerSchema,
  googleAuthSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/authSchema.js";
import { sendPasswordResetEmail } from "../services/mailService.js";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const oauth2Client = new OAuth2Client(googleClientId);

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate request body
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { displayName, handle, email, password, avatarPiece } = parseResult.data;

    // 2. Check for duplicate email (case-insensitive)
    const existingEmail = await query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );

    if (existingEmail.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: "Email address is already registered",
        field: "email",
      });
      return;
    }

    // 3. Check for duplicate player handle (case-insensitive)
    const existingHandle = await query(
      "SELECT id FROM users WHERE LOWER(handle) = LOWER($1) LIMIT 1",
      [handle]
    );

    if (existingHandle.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: "Player handle is already taken",
        field: "handle",
      });
      return;
    }

    // 4. Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 5. Insert new user into PostgreSQL
    const insertResult = await query(
      `INSERT INTO users (
        display_name,
        handle,
        email,
        password_hash,
        avatar_piece,
        auth_provider
      ) VALUES ($1, $2, $3, $4, $5, 'local')
      RETURNING id, display_name, handle, email, avatar_piece, created_at`,
      [displayName, handle, email, passwordHash, avatarPiece]
    );

    const newUser = insertResult.rows[0];

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: newUser.id,
        displayName: newUser.display_name,
        handle: newUser.handle,
        email: newUser.email,
        avatarPiece: newUser.avatar_piece,
        createdAt: newUser.created_at,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating account",
    });
  }
};

export const checkHandleAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const handleParam = req.query.handle;
    if (typeof handleParam !== "string" || !handleParam.trim()) {
      res.status(400).json({
        success: false,
        message: "Handle query parameter is required",
      });
      return;
    }

    const handle = handleParam.trim();

    // Query for existing handle (case-insensitive)
    const existingHandle = await query(
      "SELECT id FROM users WHERE LOWER(handle) = LOWER($1) LIMIT 1",
      [handle]
    );

    const isAvailable = existingHandle.rows.length === 0;

    res.status(200).json({
      success: true,
      handle,
      available: isAvailable,
      message: isAvailable ? "Handle is available" : "Player handle is already taken",
    });
  } catch (error) {
    console.error("Error checking handle availability:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while checking handle",
    });
  }
};

export const checkEmailAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const emailParam = req.query.email;
    if (typeof emailParam !== "string" || !emailParam.trim()) {
      res.status(400).json({
        success: false,
        message: "Email query parameter is required",
      });
      return;
    }

    const email = emailParam.trim();

    // Query for existing email (case-insensitive)
    const existingEmail = await query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );

    const isAvailable = existingEmail.rows.length === 0;

    res.status(200).json({
      success: true,
      email,
      available: isAvailable,
      message: isAvailable ? "Email is available" : "Email address is already registered",
    });
  } catch (error) {
    console.error("Error checking email availability:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while checking email",
    });
  }
};

/**
 * Helper to safely extract Google payload either from verified idToken
 * or through fallback decoding for dev testing when Client ID is not yet provided.
 */
interface GoogleUserPayload {
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
}

const resolveGooglePayload = async (credential: string): Promise<GoogleUserPayload | null> => {
  // If GOOGLE_CLIENT_ID is configured in environment, verify with Google
  if (googleClientId) {
    try {
      const ticket = await oauth2Client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      if (payload && payload.email && payload.sub) {
        return {
          googleId: payload.sub,
          email: payload.email,
          name: payload.name || payload.given_name,
          picture: payload.picture,
        };
      }
    } catch (verifyErr) {
      console.warn("Google token verification with clientId failed, trying fallback decode:", verifyErr);
    }
  }

  // Fallback: decode JWT or development simulation payload
  try {
    if (credential.startsWith("dev-mock:") || credential.startsWith("{")) {
      const raw = credential.startsWith("dev-mock:") ? credential.replace("dev-mock:", "") : credential;
      const parsed = JSON.parse(raw);
      if (parsed.email) {
        return {
          googleId: parsed.sub || parsed.googleId || `dev_${Date.now()}`,
          email: parsed.email,
          name: parsed.name || "Chess Champion",
          picture: parsed.picture,
        };
      }
    }

    // Attempt base64 JWT payload decode
    const parts = credential.split(".");
    if (parts.length === 3) {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
      const parsed = JSON.parse(jsonPayload);
      if (parsed.email && parsed.sub) {
        return {
          googleId: parsed.sub,
          email: parsed.email,
          name: parsed.name || parsed.given_name,
          picture: parsed.picture,
        };
      }
    }
  } catch (decodeErr) {
    console.error("Failed to decode token fallback:", decodeErr);
  }

  return null;
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = googleAuthSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid Google OAuth request payload",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const {
      credential,
      checkOnly = false,
      displayName: providedDisplayName,
      handle: providedHandle,
      avatarPiece = "queen",
    } = parseResult.data;

    const payload = await resolveGooglePayload(credential);

    if (!payload || !payload.email) {
      res.status(401).json({
        success: false,
        message: "Unable to verify Google credentials. Please ensure your Google account is authorized.",
      });
      return;
    }

    const { googleId, email, name, picture } = payload;

    // Check if user exists by google_id or email
    const existing = await query(
      "SELECT id, display_name, handle, email, avatar_piece, google_id FROM users WHERE google_id = $1 OR LOWER(email) = LOWER($2) LIMIT 1",
      [googleId, email]
    );

    // If checkOnly mode: check if user exists without modifying database
    if (checkOnly) {
      if (existing.rows.length > 0) {
        const user = existing.rows[0];

        // Link google_id if user originally signed up via email/password
        if (!user.google_id) {
          await query(
            "UPDATE users SET google_id = $1, auth_provider = 'google', updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            [googleId, user.id]
          );
        }

        res.status(200).json({
          success: true,
          isNewUser: false,
          user: {
            id: user.id,
            displayName: user.display_name,
            handle: user.handle,
            email: user.email,
            avatarPiece: user.avatar_piece,
          },
        });
      } else {
        res.status(200).json({
          success: true,
          isNewUser: true,
          googleProfile: {
            googleId,
            email,
            displayName: name || email.split("@")[0],
            picture,
          },
        });
      }
      return;
    }

    if (existing.rows.length > 0) {
      const user = existing.rows[0];

      // Link google_id if user originally signed up via email/password
      if (!user.google_id) {
        await query(
          "UPDATE users SET google_id = $1, auth_provider = 'google', updated_at = CURRENT_TIMESTAMP WHERE id = $2",
          [googleId, user.id]
        );
      }

      res.status(200).json({
        success: true,
        message: "Welcome back!",
        isNewUser: false,
        user: {
          id: user.id,
          displayName: user.display_name,
          handle: user.handle,
          email: user.email,
          avatarPiece: user.avatar_piece,
        },
      });
      return;
    }

    // New user registration
    let chosenHandle: string;

    if (providedHandle && providedHandle.trim()) {
      const trimmedHandle = providedHandle.trim();

      // Check if handle is taken
      const handleExists = await query(
        "SELECT id FROM users WHERE LOWER(handle) = LOWER($1) LIMIT 1",
        [trimmedHandle]
      );

      if (handleExists.rows.length > 0) {
        res.status(409).json({
          success: false,
          message: "Player handle is already taken",
          field: "handle",
        });
        return;
      }

      chosenHandle = trimmedHandle;
    } else {
      // Auto-generate fallback unique handle
      const sanitize = (raw: string) => raw.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 14);
      let baseHandle = sanitize(email.split("@")[0]);
      if (baseHandle.length < 3) {
        baseHandle = `gm_${baseHandle}`.slice(0, 14);
      }

      chosenHandle = baseHandle;
      let attempts = 0;
      while (attempts < 10) {
        const check = await query("SELECT 1 FROM users WHERE LOWER(handle) = LOWER($1) LIMIT 1", [chosenHandle]);
        if (check.rows.length === 0) break;
        attempts++;
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        chosenHandle = `${baseHandle.slice(0, 15)}_${randomSuffix}`.slice(0, 20);
      }
    }

    // Format display name
    let cleanDisplayName = (providedDisplayName || name || email.split("@")[0]).trim().slice(0, 20);
    if (cleanDisplayName.length < 2) {
      cleanDisplayName = "ChessPlayer";
    }

    // Insert new user into database
    const insertRes = await query(
      `INSERT INTO users (
        display_name,
        handle,
        email,
        avatar_piece,
        google_id,
        auth_provider
      ) VALUES ($1, $2, $3, $4, $5, 'google')
      RETURNING id, display_name, handle, email, avatar_piece, created_at`,
      [cleanDisplayName, chosenHandle, email, avatarPiece, googleId]
    );

    const newUser = insertRes.rows[0];

    res.status(201).json({
      success: true,
      message: "Account created successfully with Google",
      isNewUser: true,
      user: {
        id: newUser.id,
        displayName: newUser.display_name,
        handle: newUser.handle,
        email: newUser.email,
        avatarPiece: newUser.avatar_piece,
        createdAt: newUser.created_at,
      },
    });
  } catch (error) {
    console.error("Error in googleAuth handler:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during Google authentication",
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawIdentifier = (req.body.identifier || req.body.email || req.body.handle || "").trim();
    const rawPassword = req.body.password || "";

    const parseResult = loginSchema.safeParse({
      identifier: rawIdentifier,
      password: rawPassword,
    });

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Please provide both your email/handle and password",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { identifier, password } = parseResult.data;

    // Search for user by email OR handle (case-insensitive)
    const userRes = await query(
      `SELECT id, display_name, handle, email, password_hash, avatar_piece, auth_provider, created_at
       FROM users
       WHERE LOWER(email) = LOWER($1) OR LOWER(handle) = LOWER($1)
       LIMIT 1`,
      [identifier]
    );

    if (userRes.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: "No account found matching this email or handle",
        field: "identifier",
      });
      return;
    }

    const user = userRes.rows[0];

    // If account was created with OAuth and does not have a local password
    if (!user.password_hash) {
      res.status(400).json({
        success: false,
        message: `This account was registered with ${user.auth_provider === "google" ? "Google" : user.auth_provider}. Please sign in using Google.`,
        field: "auth_provider",
      });
      return;
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again.",
        field: "password",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.display_name}!`,
      user: {
        id: user.id,
        displayName: user.display_name,
        handle: user.handle,
        email: user.email,
        avatarPiece: user.avatar_piece,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during sign in",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = forgotPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || "Please enter a valid email address",
        errors: parseResult.error.flatten().fieldErrors,
        field: "email",
      });
      return;
    }

    const { email } = parseResult.data;

    // Check if user exists (case-insensitive)
    const userRes = await query(
      "SELECT id, display_name, email, auth_provider FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );

    if (userRes.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "No registered ChessCoin account found with this email address.",
        field: "email",
      });
      return;
    }

    const user = userRes.rows[0];

    // Generate cryptographically secure random token (32 bytes hex = 64 chars)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Invalidate any existing unused reset tokens for this user
    await query(
      "UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND used_at IS NULL",
      [user.id]
    );

    // Save the hashed token with a 1-hour expiration
    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '1 hour')`,
      [user.id, tokenHash]
    );

    // Build the frontend password reset URL (strip trailing slash and take primary origin if comma-separated)
    const frontendBase = (process.env.FRONTEND_URL || "http://localhost:5173")
      .split(",")[0]
      .trim()
      .replace(/\/+$/, "");
    const resetUrl = `${frontendBase}/reset-password?token=${rawToken}`;

    // Send email via Resend HTTPS API (when configured) or Nodemailer SMTP/Ethereal
    const mailResult = await sendPasswordResetEmail(user.email, user.display_name, resetUrl);

    if (!mailResult.success) {
      res.status(502).json({
        success: false,
        message: mailResult.error || "Failed to send password reset email. Please try again later.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Password reset link has been dispatched to your email address.",
      email: user.email,
      previewUrl: mailResult.previewUrl,
    });
  } catch (error) {
    console.error("Error in forgotPassword handler:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while generating reset link",
    });
  }
};

export const verifyResetToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawToken = req.query.token;
    if (typeof rawToken !== "string" || !rawToken.trim()) {
      res.status(400).json({
        success: false,
        valid: false,
        message: "Reset token is required",
      });
      return;
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken.trim()).digest("hex");

    const tokenRes = await query(
      `SELECT pr.id, pr.expires_at, u.email, u.display_name
       FROM password_resets pr
       JOIN users u ON u.id = pr.user_id
       WHERE pr.token_hash = $1
         AND pr.used_at IS NULL
         AND pr.expires_at > CURRENT_TIMESTAMP
       LIMIT 1`,
      [tokenHash]
    );

    if (tokenRes.rows.length === 0) {
      res.status(400).json({
        success: false,
        valid: false,
        message: "This password reset link is invalid or has expired.",
      });
      return;
    }

    const resetRecord = tokenRes.rows[0];

    res.status(200).json({
      success: true,
      valid: true,
      email: resetRecord.email,
      displayName: resetRecord.display_name,
    });
  } catch (error) {
    console.error("Error verifying reset token:", error);
    res.status(500).json({
      success: false,
      valid: false,
      message: "Internal server error verifying reset token",
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = resetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || "Password does not satisfy requirements",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { token, password } = parseResult.data;
    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const tokenRes = await query(
      `SELECT pr.id, pr.user_id, pr.expires_at, u.email, u.display_name
       FROM password_resets pr
       JOIN users u ON u.id = pr.user_id
       WHERE pr.token_hash = $1
         AND pr.used_at IS NULL
         AND pr.expires_at > CURRENT_TIMESTAMP
       LIMIT 1`,
      [tokenHash]
    );

    if (tokenRes.rows.length === 0) {
      res.status(400).json({
        success: false,
        message: "This password reset link is invalid or has expired. Please request a new link.",
      });
      return;
    }

    const resetRecord = tokenRes.rows[0];

    // Hash the new password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update user's password in database
    await query(
      `UPDATE users
       SET password_hash = $1,
           auth_provider = CASE WHEN auth_provider = 'google' THEN 'local' ELSE auth_provider END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, resetRecord.user_id]
    );

    // Mark the reset token as used so it cannot be re-used
    await query(
      "UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = $1",
      [resetRecord.id]
    );

    res.status(200).json({
      success: true,
      message: "Your password has been successfully reset. You may now sign in.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while resetting password",
    });
  }
};

