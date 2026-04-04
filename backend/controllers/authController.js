const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const EmailOTP = require("../models/EmailOTP");
const MobileOTP = require("../models/MobileOTP");
const { sendPasswordResetEmail, sendVerificationEmail } = require("../utils/mailer");
const { sendSmsOtp } = require("../utils/sms");

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

// ── Password strength validator ──────────────────────────────────────────────
// Rules: min 8 chars, at least one uppercase, one lowercase, one underscore
// Only allows: A-Z, a-z, 0-9, _
function validatePassword(password) {
  if (!/^[A-Za-z0-9_]+$/.test(password)) {
    return "Password can only contain letters, numbers, and underscores.";
  }
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/_/.test(password)) return "Password must contain at least one underscore (_).";
  return null;
}

function normalizePhoneNumber(value) {
  if (!value) return null;
  const raw = String(value).trim();
  const digits = raw.replace(/\D/g, "");
  const defaultCountry = process.env.SMS_DEFAULT_COUNTRY_CODE || "91";
  if (!digits) return null;

  if (raw.startsWith("+")) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+${defaultCountry}${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+${defaultCountry}${digits.slice(1)}`;
  }
  if (digits.length === defaultCountry.length + 10 && digits.startsWith(defaultCountry)) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

async function createAndSendMobileOtp({ phoneNumber, purpose, name, email }) {
  const normalized = normalizePhoneNumber(phoneNumber);
  if (!normalized) {
    return { ok: false, message: "Invalid phone number" };
  }

  const otp = generateOTP();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await MobileOTP.deleteMany({ phoneNumber: normalized, purpose });
  await MobileOTP.create({ phoneNumber: normalized, otpHash, purpose, expiresAt });

  const smsResult = await sendSmsOtp(normalized, otp, purpose);
  if (!smsResult.ok) {
    return { ok: false, message: smsResult.error || "Failed to send SMS" };
  }

  return { ok: true, phoneNumber: normalized };
}

async function verifyMobileOtp({ phoneNumber, otp, purpose }) {
  const normalized = normalizePhoneNumber(phoneNumber);
  if (!normalized) return false;
  const record = await MobileOTP.findOne({ phoneNumber: normalized, purpose });
  if (!record) return false;
  const otpHash = hashOtp(otp);
  if (record.otpHash !== otpHash) return false;
  await MobileOTP.deleteMany({ phoneNumber: normalized, purpose });
  return true;
}

// ── Mobile register request OTP ───────────────────────────────────────────────
exports.mobileRegisterRequestOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ message: "Phone number is required." });

    const normalized = normalizePhoneNumber(phoneNumber);
    const existing = await User.findOne({ phoneNumber: normalized });
    if (existing) {
      return res.status(400).json({ message: "A user already exists with this phone number." });
    }

    const result = await createAndSendMobileOtp({ phoneNumber: normalized, purpose: "signup" });
    if (!result.ok) {
      return res.status(500).json({ message: result.message });
    }

    res.json({
      message: "OTP sent to your phone.",
      smsSent: result.smsSent,
      fallback: result.fallback || false,
    });
  } catch (err) {
    console.error("❌ mobileRegisterRequestOtp error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Mobile register verify OTP ────────────────────────────────────────────────
exports.mobileRegisterVerify = async (req, res) => {
  try {
    const { name, phoneNumber, otp, password } = req.body;
    if (!name || !phoneNumber || !otp || !password) {
      return res.status(400).json({ message: "Name, phone number, OTP, and password are required." });
    }

    const normalized = normalizePhoneNumber(phoneNumber);
    const validOtp = await verifyMobileOtp({ phoneNumber: normalized, otp, purpose: "signup" });
    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const existing = await User.findOne({ phoneNumber: normalized });
    if (existing) {
      return res.status(400).json({ message: "A user already exists with this phone number." });
    }

    const pwdError = validatePassword(password);
    if (pwdError) return res.status(400).json({ message: pwdError });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      phoneNumber: normalized,
      password: hashed,
      provider: "mobile",
      phoneVerified: true,
      emailVerified: false,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error("❌ mobileRegisterVerify error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Mobile register verify (Firebase OTP front-end validated) ───────────────────
exports.mobileRegisterVerifyFirebase = async (req, res) => {
  try {
    const { name, phoneNumber, password } = req.body;
    if (!name || !phoneNumber || !password) {
      return res.status(400).json({ message: "Name, phone number, and password are required." });
    }

    const normalized = normalizePhoneNumber(phoneNumber);
    if (!normalized) return res.status(400).json({ message: "Invalid phone number." });

    const existing = await User.findOne({ phoneNumber: normalized });
    if (existing) {
      return res.status(400).json({ message: "A user already exists with this phone number." });
    }

    const pwdError = validatePassword(password);
    if (pwdError) return res.status(400).json({ message: pwdError });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      phoneNumber: normalized,
      password: hashed,
      provider: "mobile",
      phoneVerified: true,
      emailVerified: false,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error("❌ mobileRegisterVerifyFirebase error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Mobile login verify (Firebase OTP front-end validated) ───────────────────────
exports.mobileLoginVerifyFirebase = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ message: "Phone number is required." });

    const normalized = normalizePhoneNumber(phoneNumber);
    if (!normalized) return res.status(400).json({ message: "Invalid phone number." });

    const user = await User.findOne({ phoneNumber: normalized, provider: "mobile" });
    if (!user) {
      return res.status(404).json({ message: "No account found for this phone number." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error("❌ mobileLoginVerifyFirebase error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Mobile login request OTP ─────────────────────────────────────────────────
exports.mobileLoginRequestOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ message: "Phone number is required." });

    const normalized = normalizePhoneNumber(phoneNumber);
    const user = await User.findOne({ phoneNumber: normalized, provider: "mobile" });
    if (!user) {
      return res.status(404).json({ message: "No account found for this phone number." });
    }

    const result = await createAndSendMobileOtp({ phoneNumber: normalized, purpose: "login" });
    if (!result.ok) {
      return res.status(500).json({ message: result.message });
    }

    res.json({
      message: "OTP sent to your phone.",
      smsSent: result.smsSent,
      fallback: result.fallback || false,
    });
  } catch (err) {
    console.error("❌ mobileLoginRequestOtp error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Mobile login verify OTP ──────────────────────────────────────────────────
exports.mobileLoginVerify = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: "Phone number and OTP are required." });
    }

    const normalized = normalizePhoneNumber(phoneNumber);
    const user = await User.findOne({ phoneNumber: normalized, provider: "mobile" });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const validOtp = await verifyMobileOtp({ phoneNumber: normalized, otp, purpose: "login" });
    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error("❌ mobileLoginVerify error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Register ──────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, farmSize, soilType } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const pwdError = validatePassword(password);
    if (pwdError) return res.status(400).json({ message: pwdError });

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

    const pwdError = validatePassword(newPassword);
    if (pwdError) return res.status(400).json({ message: pwdError });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashed });
    await EmailOTP.deleteMany({ email, type: "reset" });

    res.json({ message: "Password reset successfully. You can now log in." });

  } catch (err) {
    console.error("❌ resetPassword error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── Update Profile ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, farmSize, soilType, location } = req.body;
    const updates = {};
    if (name?.trim()) updates.name = name.trim();
    if (farmSize !== undefined) updates.farmSize = farmSize === "" ? undefined : Number(farmSize);
    if (soilType !== undefined) updates.soilType = soilType;
    if (location?.state !== undefined) updates["location.state"] = location.state;
    if (location?.district !== undefined) updates["location.district"] = location.district;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -passwordResetToken -passwordResetExpires");

    res.json({ user });
  } catch (err) {
    console.error("❌ updateProfile error:", err.message);
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
