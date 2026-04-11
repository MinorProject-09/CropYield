const mongoose = require("mongoose");

const pushSubSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subscription: { type: Object, required: true }, // browser PushSubscription JSON
  createdAt:    { type: Date, default: Date.now },
});

pushSubSchema.index({ userId: 1 });

module.exports = mongoose.model("PushSubscription", pushSubSchema);
