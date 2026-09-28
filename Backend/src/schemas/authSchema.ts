import { z } from "zod";

export const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .min(2, "Display name must be at least 2 characters")
    .max(20, "Display name cannot exceed 20 characters"),
  handle: z
    .string()
    .trim()
    .min(1, "Player handle is required")
    .min(3, "Handle must be at least 3 characters")
    .max(20, "Handle cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Handle can only contain letters, numbers, and underscores"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Must be at least 6 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one digit")
    .regex(/[\W_]/, "Must contain at least one special character"),
  avatarPiece: z.enum(["rook", "pawn", "bishop", "queen", "king", "knight"]),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(1, "Google credential token is required"),
  checkOnly: z.boolean().optional(),
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(20, "Display name cannot exceed 20 characters")
    .optional(),
  handle: z
    .string()
    .trim()
    .min(3, "Handle must be at least 3 characters")
    .max(20, "Handle cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Handle can only contain letters, numbers, and underscores")
    .optional(),
  avatarPiece: z.enum(["rook", "pawn", "bishop", "queen", "king", "knight"]).optional().default("queen"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
