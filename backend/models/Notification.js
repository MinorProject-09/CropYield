const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type:    { type: String, enum: ["answer", "upvote"], default: "answer" },
  message: { type: String, required: true },
  postId:  { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  read:    { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
