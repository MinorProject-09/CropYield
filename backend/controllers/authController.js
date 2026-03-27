const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const EmailOTP = require("../models/EmailOTP");
const { sendPasswordResetEmail, sendVerificationEmail } = require("../utils/mailer");

function toPublicUser(doc) {
  if (!doc) return null;
  const user = doc.toObject ? doc.toObject() : { ...doc };
  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  return user;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Register ──────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, farmSize, soilType } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const farmSizeNum = farmSize === "" || farmSize == null ? undefined : Number(farmSize);

    const user = await User.create({
      name,
      email,
      password: hashed,
      farmSize: Number.isFinite(farmSizeNum) ? farmSizeNum : undefined,
      soilType: soilType || undefined,
      provider: "local",
      emailVerified: false,
    });

    // Send verification OTP
    const otp = generateOTP();
    await EmailOTP.deleteMany({ email, type: "verify" });
    await EmailOTP.create({ email, otp, type: "verify" });
    await sendVerificationEmail(email, otp);

    res.json({
      message: "Account created. Please verify your email before logging in.",
      requiresVerification: true,
      email,
    });

  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Verify Email OTP ──────────────────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await EmailOTP.findOne({ email, type: "verify" });
    if (!record || record.otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await User.updateOne({ email }, { emailVerified: true });
    await EmailOTP.deleteMany({ email, type: "verify" });

    const user = await User.findOne({ email });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: toPublicUser(user) });

  } catch (err) {
    console.error("❌ verifyEmail error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Resend Verification OTP ───────────────────────────────────────────────────
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, provider: "local" });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.emailVerified) return res.status(400).json({ message: "Email already verified" });

    const otp = generateOTP();
    await EmailOTP.deleteMany({ email, type: "verify" });
    await EmailOTP.create({ email, otp, type: "verify" });
    await sendVerificationEmail(email, otp);

    res.json({ message: "Verification OTP resent" });
  } catch (err) {
    console.error("❌ resendVerification error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        requiresVerification: true,
        email,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: toPublicUser(user) });

  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, provider: "local" });
    // Always respond the same to prevent email enumeration
    if (!user) {
      return res.json({ message: "If that email exists, a reset OTP has been sent." });
    }

    const otp = generateOTP();
    await EmailOTP.deleteMany({ email, type: "reset" });
    await EmailOTP.create({ email, otp, type: "reset" });
    await sendPasswordResetEmail(email, otp);

    res.json({ message: "If that email exists, a reset OTP has been sent." });

  } catch (err) {
    console.error("❌ forgotPassword error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = await EmailOTP.findOne({ email, type: "reset" });
    if (!record || record.otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashed });
    await EmailOTP.deleteMany({ email, type: "reset" });

    res.json({ message: "Password reset successfully. You can now log in." });

  } catch (err) {
    console.error("❌ resetPassword error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Get Me ────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    res.json({ user: toPublicUser(req.user) });
  } catch (err) {
    console.error("❌ getMe error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── OAuth Success ─────────────────────────────────────────────────────────────
const frontendBase = () => process.env.FRONTEND_URL || "http://localhost:5173";

exports.oauthSuccess = (req, res) => {
  try {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${frontendBase()}/auth/callback?token=${token}`);
  } catch (err) {
    console.error("❌ OAuth error:", err.message);
    res.redirect(`${frontendBase()}/login?error=oauth_failed`);
  }
};
