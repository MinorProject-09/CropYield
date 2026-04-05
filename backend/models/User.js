const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String
  },

  avatar: {
    type: String
  },

  role: {
    type: String,
    enum: ["farmer", "admin"],
    default: "farmer"
  },

  farmSize: {
    type: Number
  },

  soilType: {
    type: String
  },

  location: {
    state: String,
    district: String
  },

  googleId: {
    type: String,
    sparse: true
  },

  githubId: {
    type: String,
    sparse: true
  },

  provider: {
    type: String,
    enum: ["local", "google", "github"],
    default: "local"
  },

  emailVerified: {
    type: Boolean,
    default: false
  },

  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date }

},
{ timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);