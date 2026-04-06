const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  author:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  authorName:{ type: String, required: true },
  body:      { type: String, required: true, maxlength: 2000 },
  upvotes:   { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isExpert:  { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  author:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  authorName:{ type: String, required: true },
  title:     { type: String, required: true, maxlength: 200 },
  body:      { type: String, required: true, maxlength: 3000 },
  tags:      [{ type: String }],          // crop names, topics
  crop:      { type: String, default: "" },
  upvotes:   { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  views:     { type: Number, default: 0 },
  answers:   [answerSchema],
  solved:    { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ crop: 1 });

module.exports = mongoose.model("Post", postSchema);
