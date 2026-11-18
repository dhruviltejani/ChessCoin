import nodemailer from "nodemailer";
import type { Transporter, TestAccount } from "nodemailer";

interface SendMailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string | false;
  error?: string;
}

let cachedTransporter: Transporter | null = null;

const getTransporter = async (): Promise<Transporter> => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  // 1. If explicit SMTP credentials are provided in .env
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const isSecure =
      process.env.SMTP_SECURE === "true" ||
      Number(process.env.SMTP_PORT) === 465;

    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    return cachedTransporter;
  }

  // 2. Fallback to Ethereal test account for development/testing
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log("----------------------------------------------------------------");
    console.log("[Nodemailer] Using auto-generated Ethereal test email account:");
    console.log(`[Nodemailer] User: ${testAccount.user}`);
    console.log("----------------------------------------------------------------");

    cachedTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    return cachedTransporter;
  } catch (err) {
    console.warn("[Nodemailer] Failed to create Ethereal test account, using JSON/Console transport:", err);
    // 3. Fallback to jsonTransport if network for ethereal fails
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return cachedTransporter;
  }
};

export const sendPasswordResetEmail = async (
  to: string,
  displayName: string,
  resetUrl: string
): Promise<SendMailResult> => {
  try {
    const transporter = await getTransporter();
    const fromAddress =
      process.env.EMAIL_FROM || '"ChessCoin Security" <no-reply@chesscoin.org>';

    const subject = "Reset Your ChessCoin Password";

    const textContent = `
Hello ${displayName || "Player"},

We received a request to reset your password for ChessCoin.

You can reset your password by opening the following secure link in your browser:
${resetUrl}

This link is valid for 1 hour. If you did not request a password reset, please ignore this email.

ChessCoin Security Protocol
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #080b11;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      width: 100%;
      background-color: #080b11;
      padding: 40px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background: #0d121c;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 36px 30px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .brand-header {
      text-align: center;
      margin-bottom: 28px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-title span {
      color: #38bdf8;
    }
    .badge-icon {
      width: 54px;
      height: 54px;
      margin: 0 auto 16px auto;
      background: #111a2e;
      border: 1px solid #0284c7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      line-height: 54px;
      font-size: 24px;
    }
    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 12px;
      text-align: center;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #94a3b8;
      margin-top: 0;
      margin-bottom: 18px;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0;
    }
    .btn {
      display: inline-block;
      background-color: #38bdf8;
      color: #090d16 !important;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      padding: 13px 32px;
      border-radius: 12px;
      letter-spacing: 0.2px;
      box-shadow: 0 4px 18px rgba(56, 189, 248, 0.35);
    }
    .link-fallback {
      background: #070a12;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 12px 14px;
      word-break: break-all;
      font-size: 12px;
      color: #38bdf8;
      font-family: monospace;
      margin-bottom: 24px;
    }
    .footer {
      text-align: center;
      border-top: 1px solid #1e293b;
      padding-top: 22px;
      margin-top: 24px;
      font-size: 12px;
      color: #64748b;
    }
    .security-note {
      font-size: 12px;
      color: #64748b;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="brand-header">
        <h1 class="brand-title">Chess<span>Coin</span></h1>
      </div>

      <div class="badge-icon">🔄</div>

      <h2>Reset Your Password</h2>
      <p>Hello <strong>${displayName || "Chessmaster"}</strong>,</p>
      <p>
        We received a request to reset your password for your ChessCoin account.
        Click the button below to set a new password:
      </p>

      <div class="btn-container">
        <a href="${resetUrl}" class="btn" target="_blank" rel="noopener noreferrer">
          Reset Password &rarr;
        </a>
      </div>

      <p class="security-note">
        Or copy and paste this link into your web browser:
      </p>
      <div class="link-fallback">
        <a href="${resetUrl}" style="color: #38bdf8; text-decoration: none;">${resetUrl}</a>
      </div>

      <p class="security-note">
        <strong>Note:</strong> This recovery link will expire in <strong>1 hour</strong>. If you did not initiate this request, no action is required and your account remains safe.
      </p>

      <div class="footer">
        &copy; 2025 ChessCoin Protocol. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log("================================================================");
    console.log(`[Nodemailer] Password reset email sent to: ${to}`);
    console.log(`[Nodemailer] Message ID: ${info.messageId}`);
    if (previewUrl) {
      console.log(`[Nodemailer] Ethereal Preview URL: ${previewUrl}`);
    }
    console.log(`[Nodemailer] Direct Reset URL: ${resetUrl}`);
    console.log("================================================================");

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || false,
    };
  } catch (error) {
    console.error("[Nodemailer] Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};
