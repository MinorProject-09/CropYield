const Notification = require("../models/Notification");

// GET /api/notifications — last 20 for current user
exports.getNotifications = async (req, res) => {
  try {
    const notes = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).limit(20).lean();
    const unread = notes.filter(n => !n.read).length;
    res.json({ notifications: notes, unread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    await Notification.updateOne({ _id: req.params.id, userId: req.user._id }, { read: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper — called internally when an answer is posted
exports.createAnswerNotification = async (io, postAuthorId, answererName, postId, postTitle) => {
  try {
    const note = await Notification.create({
      userId:  postAuthorId,
      type:    "answer",
      message: `${answererName} answered your question: "${postTitle.slice(0, 60)}${postTitle.length > 60 ? "…" : ""}"`,
      postId,
    });
    // Push via Socket.IO to the post author's room
    if (io) {
      io.to(`user:${postAuthorId}`).emit("notification:new", {
        notification: note,
        unread: await Notification.countDocuments({ userId: postAuthorId, read: false }),
      });
    }
  } catch {}
};
