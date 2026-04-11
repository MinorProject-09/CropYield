const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  ingestReading, ingestFromDevice,
  getLatest, getHistory, getAlerts,
  deleteReading, getDeviceKey, regenerateDeviceKey,
} = require("../controllers/sensorController");

// Public — Arduino/ESP8266 posts here with deviceKey (no JWT)
router.post("/device", ingestFromDevice);

// Protected — browser/manual
router.post("/",                        auth, ingestReading);
router.get("/latest",                   auth, getLatest);
router.get("/history",                  auth, getHistory);
router.get("/alerts",                   auth, getAlerts);
router.get("/device-key",               auth, getDeviceKey);
router.post("/device-key/regenerate",   auth, regenerateDeviceKey);
router.delete("/:id",                   auth, deleteReading);

module.exports = router;
