const nodemailer = require("nodemailer");

// Create transporter lazily so env vars are always loaded
function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Send a password reset email with a 6-digit OTP
 */
exports.sendPasswordResetEmail = async (to, otp) => {
  await getTransporter().sendMail({
    from: `"CropYield" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your CropYield password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#2d5a27">🌾 CropYield Password Reset</h2>
        <p>Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:2rem;font-weight:bold;letter-spacing:0.3em;color:#4a8c3f;padding:1rem;background:#e8f5e4;border-radius:8px;text-align:center">
          ${otp}
        </div>
        <p style="color:#6b7280;font-size:0.85rem;margin-top:1rem">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

/**
 * Send an email verification OTP
 */
exports.sendVerificationEmail = async (to, otp) => {
  await getTransporter().sendMail({
    from: `"CropYield" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your CropYield email",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#2d5a27">🌾 Verify your email</h2>
        <p>Enter this OTP to verify your account. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:2rem;font-weight:bold;letter-spacing:0.3em;color:#4a8c3f;padding:1rem;background:#e8f5e4;border-radius:8px;text-align:center">
          ${otp}
        </div>
      </div>
    `,
  });
};
