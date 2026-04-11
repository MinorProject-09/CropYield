const Post = require("../models/Post");

// ── GET /api/community/posts ──────────────────────────────────────────────────
exports.getPosts = async (req, res) => {
  try {
    const { crop, tag, sort = "recent", page = 1, limit = 20 } = req.query;
    const filter = {};
    if (crop) filter.crop = crop.toLowerCase();
    if (tag)  filter.tags = tag.toLowerCase();

    // "unanswered" is a filter, not a sort — posts with no answers
    if (sort === "unanswered") {
      filter.$expr = { $eq: [{ $size: "$answers" }, 0] };
    }

    const sortObj = sort === "popular"
      ? { upvotes: -1, createdAt: -1 }
      : { createdAt: -1 };  // recent + unanswered both sort by newest

    const posts = await Post.find(filter)
      .sort(sortObj)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await Post.countDocuments(filter);
    res.json({ posts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/community/posts/:id ──────────────────────────────────────────────
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).lean();
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/community/posts ─────────────────────────────────────────────────
exports.createPost = async (req, res) => {
  try {
    const { title, body, crop, tags } = req.body;
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ message: "Title and body are required" });
    }
    // Images uploaded via multer (up to 3)
    const images = (req.files || []).map(f => `/uploads/community/${f.filename}`);

    const post = await Post.create({
      author:     req.user._id,
      authorName: req.user.name || "Farmer",
      title:      title.trim().slice(0, 200),
      body:       body.trim().slice(0, 3000),
      crop:       (crop || "").toLowerCase().trim(),
      tags:       Array.isArray(tags) ? tags.map(t => t.toLowerCase().trim()).filter(Boolean) : [],
      images,
    });
    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/community/posts/:id/upvote ─────────────────────────────────────
exports.upvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const uid = req.user._id.toString();
    const already = post.upvotedBy.map(String).includes(uid);
    if (already) {
      post.upvotes = Math.max(0, post.upvotes - 1);
      post.upvotedBy = post.upvotedBy.filter(id => id.toString() !== uid);
    } else {
      post.upvotes += 1;
      post.upvotedBy.push(req.user._id);
    }
    await post.save();
    res.json({ upvotes: post.upvotes, upvoted: !already });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/community/posts/:id/answers ────────────────────────────────────
exports.addAnswer = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body?.trim()) return res.status(400).json({ message: "Answer body required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const answerCount = await Post.countDocuments({ "answers.author": req.user._id });
    const isExpert = answerCount >= 5;
    const isAgronomist = req.user.role === "agronomist";

    post.answers.push({
      author:       req.user._id,
      authorName:   req.user.name || "Farmer",
      body:         body.trim().slice(0, 2000),
      isExpert,
      isAgronomist,
    });
    await post.save();

    // Notify post author (not if they answered their own post)
    if (post.author.toString() !== req.user._id.toString()) {
      const { createAnswerNotification } = require("./notificationController");
      const io = req.app.get("io");
      await createAnswerNotification(io, post.author, req.user.name || "A farmer", post._id, post.title);
    }

    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/community/posts/:id/answers/:aid/upvote ────────────────────────
exports.upvoteAnswer = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const answer = post.answers.id(req.params.aid);
    if (!answer) return res.status(404).json({ message: "Answer not found" });

    const uid = req.user._id.toString();
    const already = answer.upvotedBy.map(String).includes(uid);
    if (already) {
      answer.upvotes = Math.max(0, answer.upvotes - 1);
      answer.upvotedBy = answer.upvotedBy.filter(id => id.toString() !== uid);
    } else {
      answer.upvotes += 1;
      answer.upvotedBy.push(req.user._id);
    }
    await post.save();
    res.json({ upvotes: answer.upvotes, upvoted: !already });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/community/posts/:id ──────────────────────────────────────────
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.user._id });
    if (!post) return res.status(404).json({ message: "Post not found or not yours" });
    await post.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
