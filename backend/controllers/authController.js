const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function toPublicUser(doc) {
  if (!doc) return null;
  const user = doc.toObject ? doc.toObject() : { ...doc };
  delete user.password;
  return user;
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, farmSize, soilType } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const farmSizeNum =
      farmSize === "" || farmSize === undefined || farmSize === null
        ? undefined
        : Number(farmSize);

    const user = await User.create({
      name,
      email,
      password: hashed,
      farmSize: Number.isFinite(farmSizeNum) ? farmSizeNum : undefined,
      soilType: soilType || undefined,
      provider: "local",
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: toPublicUser(user) });

  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

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

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: toPublicUser(user) });

  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.json({ user: toPublicUser(req.user) });
  } catch (err) {
    console.error("❌ getMe error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

const frontendBase = () =>
  process.env.FRONTEND_URL || "http://localhost:5173";

exports.oauthSuccess = (req, res) => {
  try {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(`${frontendBase()}/auth/callback?token=${token}`);

  } catch (err) {
    console.error("❌ OAuth error:", err.message);
    res.redirect(`${frontendBase()}/login?error=oauth_failed`);
  }
};