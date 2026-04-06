const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  ingestReading, getLatest, getHistory, getAlerts, deleteReading,
} = require("../controllers/sensorController");

router.post("/",           auth, ingestReading);
router.get("/latest",      auth, getLatest);
router.get("/history",     auth, getHistory);
router.get("/alerts",      auth, getAlerts);
router.delete("/:id",      auth, deleteReading);

module.exports = router;
