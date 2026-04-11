const SensorReading = require("../models/SensorReading");

// ── Alert thresholds (7 parameters only) ─────────────────────────────────────
const THRESHOLDS = {
  nitrogen:    { low: 50,  high: 280, unit: "mg/kg", name: "Nitrogen" },
  phosphorus:  { low: 10,  high: 80,  unit: "mg/kg", name: "Phosphorus" },
  potassium:   { low: 20,  high: 150, unit: "mg/kg", name: "Potassium" },
  soilPh:      { low: 5.5, high: 8.0, unit: "",      name: "Soil pH" },
  temperature: { low: 5,   high: 45,  unit: "°C",    name: "Temperature" },
  humidity:    { low: 20,  high: 95,  unit: "%",      name: "Humidity" },
};

const ALERT_MESSAGES = {
  nitrogen:    { low: (v) => `⚠ Nitrogen deficient (${v} mg/kg) — Apply urea fertilizer`,    high: (v) => `⚠ Excess nitrogen (${v} mg/kg) — Risk of lodging` },
  phosphorus:  { low: (v) => `⚠ Phosphorus deficient (${v} mg/kg) — Apply DAP or SSP`,       high: (v) => `⚠ Excess phosphorus (${v} mg/kg) — Reduce P application` },
  potassium:   { low: (v) => `⚠ Potassium deficient (${v} mg/kg) — Apply MOP fertilizer`,    high: (v) => `⚠ Excess potassium (${v} mg/kg) — Reduce K application` },
  soilPh:      { low: (v) => `⚠ Soil pH too acidic (${v}) — Apply lime to correct`,           high: (v) => `⚠ Soil pH too alkaline (${v}) — Apply gypsum or sulphur` },
  temperature: { low: (v) => `⚠ Temperature too low (${v}°C) — Risk of frost damage`,        high: (v) => `⚠ Temperature too high (${v}°C) — Risk of heat stress` },
  humidity:    { low: (v) => `⚠ Humidity too low (${v}%) — Increase irrigation frequency`,   high: (v) => `⚠ Humidity too high (${v}%) — Risk of fungal disease` },
};

const ALERT_ACTIONS = {
  nitrogen:    { low: "Apply Urea 46% N @ 50–100 kg/ha as top-dressing.",         high: "Skip next nitrogen application. Monitor crop." },
  phosphorus:  { low: "Apply DAP @ 100 kg/ha or SSP @ 250 kg/ha at next sowing.", high: "Avoid phosphorus fertilizer for next 2 seasons." },
  potassium:   { low: "Apply MOP (Muriate of Potash) @ 50–100 kg/ha.",            high: "Reduce potassium application. Test soil again in 30 days." },
  soilPh:      { low: "Apply agricultural lime (CaCO₃) @ 2–4 t/ha.",             high: "Apply gypsum @ 2–3 t/ha or elemental sulphur." },
  temperature: { low: "Cover crops with mulch. Delay sowing if possible.",        high: "Increase irrigation frequency. Provide shade if possible." },
  humidity:    { low: "Increase irrigation. Use mulching to retain moisture.",    high: "Improve ventilation. Watch for fungal disease symptoms." },
};

function generateAlerts(reading) {
  const alerts = [];
  for (const [key, thresh] of Object.entries(THRESHOLDS)) {
    const val = reading[key];
    if (val == null) continue;
    if (val < thresh.low) {
      alerts.push({
        sensor: key, level: "critical",
        message: ALERT_MESSAGES[key].low(val),
        action:  ALERT_ACTIONS[key].low,
        value: val, unit: thresh.unit,
      });
    } else if (val > thresh.high) {
      alerts.push({
        sensor: key, level: "warning",
        message: ALERT_MESSAGES[key].high(val),
        action:  ALERT_ACTIONS[key].high,
        value: val, unit: thresh.unit,
      });
    }
  }
  return alerts;
}

// ── POST /api/sensor — ingest from IoT device or manual entry ────────────────
exports.ingestReading = async (req, res) => {
  try {
    const { deviceId, label, nitrogen, phosphorus, potassium,
            soilPh, temperature, humidity, rainfall } = req.body;

    const reading = await SensorReading.create({
      userId:      req.user._id,
      deviceId:    deviceId    || "default",
      label:       label       || "",
      nitrogen:    nitrogen    != null ? Number(nitrogen)    : null,
      phosphorus:  phosphorus  != null ? Number(phosphorus)  : null,
      potassium:   potassium   != null ? Number(potassium)   : null,
      soilPh:      soilPh      != null ? Number(soilPh)      : null,
      temperature: temperature != null ? Number(temperature) : null,
      humidity:    humidity    != null ? Number(humidity)    : null,
      rainfall:    rainfall    != null ? Number(rainfall)    : null,
    });

    const alerts = generateAlerts(reading);

    // ✅ Emit real-time update via Socket.IO to this user's room
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${req.user._id}`).emit("sensor:update", { reading, alerts });
    }

    // ✅ SMS alert for critical readings
    const { sendSoilAlertSMS } = require("../utils/smsAlert");
    await sendSoilAlertSMS(req.user, alerts);

    // ✅ Push notification for critical readings
    const critical = alerts.filter(a => a.level === "critical");
    if (critical.length > 0) {
      const pushRouter = req.app._router?.stack?.find(l => l.regexp?.test("/api/push"))?.handle;
      if (pushRouter?.sendToUser) {
        await pushRouter.sendToUser(
          req.user._id,
          "🔴 Critical Soil Alert",
          critical.map(a => a.message).join(" | "),
          "/iot"
        );
      }
    }

    res.status(201).json({ reading, alerts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/sensor/device — device key auth (no JWT, for Arduino/ESP8266) ──
exports.ingestFromDevice = async (req, res) => {
  try {
    const User = require("../models/User");
    const { deviceKey, deviceId, label, nitrogen, phosphorus, potassium,
            soilPh, temperature, humidity, rainfall } = req.body;

    if (!deviceKey) return res.status(401).json({ message: "deviceKey required" });

    const user = await User.findOne({ deviceKey });
    if (!user) return res.status(401).json({ message: "Invalid deviceKey" });

    const reading = await SensorReading.create({
      userId:      user._id,
      deviceId:    deviceId    || "default",
      label:       label       || "",
      nitrogen:    nitrogen    != null ? Number(nitrogen)    : null,
      phosphorus:  phosphorus  != null ? Number(phosphorus)  : null,
      potassium:   potassium   != null ? Number(potassium)   : null,
      soilPh:      soilPh      != null ? Number(soilPh)      : null,
      temperature: temperature != null ? Number(temperature) : null,
      humidity:    humidity    != null ? Number(humidity)    : null,
      rainfall:    rainfall    != null ? Number(rainfall)    : null,
    });

    const alerts = generateAlerts(reading);

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${user._id}`).emit("sensor:update", { reading, alerts });
    }

    res.status(201).json({ reading, alerts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/sensor/latest ────────────────────────────────────────────────────
exports.getLatest = async (req, res) => {
  try {
    const devices = await SensorReading.distinct("deviceId", { userId: req.user._id });
    const readings = await Promise.all(
      devices.map(deviceId =>
        SensorReading.findOne({ userId: req.user._id, deviceId })
          .sort({ createdAt: -1 }).lean()
      )
    );
    const result = readings.filter(Boolean).map(r => ({ ...r, alerts: generateAlerts(r) }));
    res.json({ readings: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/sensor/history ───────────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const { deviceId = "default", limit = 24 } = req.query;
    const readings = await SensorReading.find({ userId: req.user._id, deviceId })
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit), 100))
      .lean();
    res.json({ readings: readings.reverse() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/sensor/alerts ────────────────────────────────────────────────────
exports.getAlerts = async (req, res) => {
  try {
    const devices = await SensorReading.distinct("deviceId", { userId: req.user._id });
    const allAlerts = [];
    for (const deviceId of devices) {
      const latest = await SensorReading.findOne({ userId: req.user._id, deviceId })
        .sort({ createdAt: -1 }).lean();
      if (latest) {
        generateAlerts(latest).forEach(a => allAlerts.push({ ...a, deviceId, label: latest.label }));
      }
    }
    res.json({ alerts: allAlerts, count: allAlerts.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/sensor/:id ────────────────────────────────────────────────────
exports.deleteReading = async (req, res) => {
  try {
    await SensorReading.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/sensor/device-key — get or generate device key ──────────────────
exports.getDeviceKey = async (req, res) => {
  try {
    const User = require("../models/User");
    let user = await User.findById(req.user._id);
    if (!user.deviceKey) {
      user.deviceKey = require("crypto").randomBytes(20).toString("hex");
      await user.save();
    }
    res.json({ deviceKey: user.deviceKey, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/sensor/device-key/regenerate ────────────────────────────────────
exports.regenerateDeviceKey = async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user._id);
    user.deviceKey = require("crypto").randomBytes(20).toString("hex");
    await user.save();
    res.json({ deviceKey: user.deviceKey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
