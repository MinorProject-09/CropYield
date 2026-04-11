const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const { getNotifications, markAllRead, markRead } = require("../controllers/notificationController");

router.get("/",              auth, getNotifications);
router.post("/read-all",     auth, markAllRead);
router.post("/:id/read",     auth, markRead);

module.exports = router;
