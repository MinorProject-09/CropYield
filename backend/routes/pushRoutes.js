const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const PushSub = require("../models/PushSubscription");
const { sendPush, VAPID_PUBLIC_KEY } = require("../utils/pushNotification");

// GET /api/push/vapid-key — frontend needs this to subscribe
router.get("/vapid-key", (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY || null });
});

// POST /api/push/subscribe — save subscription
router.post("/subscribe", auth, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription?.endpoint) return res.status(400).json({ message: "Invalid subscription" });
    // Upsert by endpoint
    await PushSub.findOneAndUpdate(
      { userId: req.user._id, "subscription.endpoint": subscription.endpoint },
      { userId: req.user._id, subscription },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/push/unsubscribe
router.post("/unsubscribe", auth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    await PushSub.deleteMany({ userId: req.user._id, "subscription.endpoint": endpoint });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper exported for use in other controllers
router.sendToUser = async (userId, title, body, url = "/") => {
  const subs = await PushSub.find({ userId }).lean();
  for (const s of subs) {
    const result = await sendPush(s.subscription, title, body, url);
    if (result === "expired") {
      await PushSub.deleteOne({ _id: s._id });
    }
  }
};

module.exports = router;
