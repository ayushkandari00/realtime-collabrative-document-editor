const nodemailer = require('nodemailer');

/**
 * Send an email using Nodemailer
 * @param {object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `ChatApp <noreply@chatapp.com>`,
    to,
    subject,
    html,
  });
};

/**
 * Generate HTML email for password reset
 * @param {string} resetUrl - Full reset URL
 * @param {string} name - User's name
 */
const passwordResetEmailTemplate = (resetUrl, name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:Inter,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#1a1a2e;border-radius:20px;overflow:hidden;border:1px solid rgba(99,102,241,0.2);">
    <div style="padding:32px;background:linear-gradient(135deg,#4f46e5,#7c3aed);text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">💬 ChatApp</h1>
    </div>
    <div style="padding:40px 32px;">
      <h2 style="color:#f1f5f9;margin:0 0 12px;font-size:20px;">Hi ${name},</h2>
      <p style="color:#94a3b8;margin:0 0 24px;line-height:1.6;">
        We received a request to reset your password. Click the button below to create a new one. This link expires in <strong style="color:#818cf8;">15 minutes</strong>.
      </p>
      <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;">
        Reset Password →
      </a>
      <p style="color:#64748b;margin:24px 0 0;font-size:13px;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
`;

module.exports = { sendEmail, passwordResetEmailTemplate };
