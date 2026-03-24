const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();

// ✅ Fail fast on missing env vars
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
});

const app = express();

// ✅ 1. CORS — must be first
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


// ✅ 2. Body parser
app.use(express.json());

// ✅ 3. Session — must be before passport
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }  // set to true in production with HTTPS
}));

// ✅ 4. Passport — after session
app.use(passport.initialize());
app.use(passport.session());

// ✅ 5. Passport config — after passport middleware
require("./config/passport");

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Crop Yield Prediction API Running 🌾" });
});

// Routes
const authRoutes = require("./routes/authRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const geocodeRoutes = require("./routes/geocodeRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/ml/prediction", predictionRoutes);
app.use("/api/geocode", geocodeRoutes);

// ✅ Global error handler — catches any unhandled errors
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });