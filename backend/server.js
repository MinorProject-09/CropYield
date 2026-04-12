const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();

const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
});

const app = express();
const httpServer = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "https://cropyield-ljg9.onrender.com",
].filter(Boolean);

// ✅ Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Attach io to app so controllers can emit
app.set("io", io);

// ✅ CORS for Express
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");

// Health check
app.get("/", (req, res) => res.json({ status: "Crop Yield Prediction API Running 🌾" }));

// Serve uploaded community images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth",           require("./routes/authRoutes"));
app.use("/api/ml/prediction",  require("./routes/predictionRoutes"));
app.use("/api/geocode",        require("./routes/geocodeRoutes"));
app.use("/api/chat",           require("./routes/chatRoutes"));
app.use("/api/sensor",         require("./routes/sensorRoutes"));
app.use("/api/weather",        require("./routes/weatherRoutes"));
app.use("/api/market",         require("./routes/marketRoutes"));
app.use("/api/community",      require("./routes/communityRoutes"));
app.use("/api/notifications",  require("./routes/notificationRoutes"));
app.use("/api/push",           require("./routes/pushRoutes"));

// ✅ Socket.IO — farmers join their own room by userId
io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });
  socket.on("disconnect", () => {});
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { family: 4 })
  .then(() => {
    console.log("✅ MongoDB Connected");
    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
