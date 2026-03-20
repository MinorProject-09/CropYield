const mongoose = require("mongoose");

const EmailOTPSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: Number
});

module.exports = mongoose.model("EmailOTP", EmailOTPSchema);