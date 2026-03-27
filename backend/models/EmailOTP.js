const mongoose = require("mongoose");

const EmailOTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ["verify", "reset"], default: "verify" },
  createdAt: { type: Date, default: Date.now, expires: 600 } // auto-delete after 10 min
});

module.exports = mongoose.model("EmailOTP", EmailOTPSchema);