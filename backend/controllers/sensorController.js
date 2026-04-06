const SensorReading = require("../models/SensorReading");

// ── Alert thresholds ──────────────────────────────────────────────────────────
const THRESHOLDS = {
  soilMoisture: { low: 20, high: 85,  unit: "%",    name: "Soil Moisture" },
  soilPh:       { low: 5.5, high: 8.0, unit: "",    name: "Soil pH" },
  nitrogen:     { low: 50,  high: 280, unit: "kg/ha",name: "Nitrogen" },
  phosphorus:   { low: 10,  high: 80,  unit: "kg/ha",name: "Phosphorus" },
  potassium:    { low: 20,  high: 150, unit: "kg/ha",name: "Potassium" },
  temperature:  { low: 5,   high: 45,  unit: "°C",  name: "Temperature" },
  humidity:     { low: 20,  high: 95,  unit: "%",   name: "Humidity" },
};

function generateAlerts(reading) {
  const alerts = [];
  for (const [key, thresh] of Object.entries(THRESHOLDS)) {
    const val = reading[key];
    if (val == null) continue;
    if (val < thresh.low) {
      alerts.push({
        sensor: key,
        level: key === "soilMoisture" ? "critical" : "warning",
        message: getAlertMessage(key, "low", val, thresh),
        action:  getAlertAction(key, "low"),
        value: val,
        unit: thresh.unit,
      });
    } else if (val > thresh.high) {
      alerts.push({
        sensor: key,
        level: "warning",
        message: getAlertMessage(key, "high", val, thresh),
        action:  getAlertAction(key, "high"),
        value: val,
        unit: thresh.unit,
      });
    }
  }
  return alerts;
}

function getAlertMessage(sensor, direction, value, thresh) {
  const dir = direction === "low" ? "Low" : "High";
  const msgs = {
    soilMoisture: {
      low:  `⚠ Soil moisture critically low (${value}%) — Irrigate now`,
      high: `⚠ Soil moisture too high (${value}%) — Risk of waterlogging`,
    },
    soilPh: {
      low:  `⚠ Soil pH too acidic (${value}) — Apply lime to correct`,
      high: `⚠ Soil pH too alkaline (${value}) — Apply gypsum or sulphur`,
    },
    nitrogen: {
      low:  `⚠ Nitrogen deficient (${value} kg/ha) — Apply urea fertilizer`,
      high: `⚠ Excess nitrogen (${value} kg/ha) — Risk of lodging and pest attraction`,
    },
    phosphorus: {
      low:  `⚠ Phosphorus deficient (${value} kg/ha) — Apply DAP or SSP`,
      high: `⚠ Excess phosphorus (${value} kg/ha) — Reduce P application`,
    },
    potassium: {
      low:  `⚠ Potassium deficient (${value} kg/ha) — Apply MOP fertilizer`,
      high: `⚠ Excess potassium (${value} kg/ha) — Reduce K application`,
    },
    temperature: {
      low:  `⚠ Temperature too low (${value}°C) — Risk of frost damage`,
      high: `⚠ Temperature too high (${value}°C) — Risk of heat stress`,
    },
    humidity: {
      low:  `⚠ Humidity too low (${value}%) — Increase irrigation frequency`,
      high: `⚠ Humidity too high (${value}%) — Risk of fungal disease`,
    },
  };
  return msgs[sensor]?.[direction] || `${dir} ${sensor}: ${value}`;
}

function getAlertAction(sensor, direction) {
  const actions = {
    soilMoisture: { low: "Irrigate immediately. Check drip/sprinkler system.", high: "Stop irrigation. Improve field drainage." },
    soilPh:       { low: "Apply agricultural lime (CaCO₃) @ 2–4 t/ha.", high: "Apply gypsum @ 2–3 t/ha or elemental sulphur." },
    nitrogen:     { low: "Apply Urea 46% N @ 50–100 kg/ha as top-dressing.", high: "Skip next nitrogen application. Monitor crop." },
    phosphorus:   { low: "Apply DAP @ 100 kg/ha or SSP @ 250 kg/ha at next sowing.", high: "Avoid phosphorus fertilizer for next 2 seasons." },
    potassium:    { low: "Apply MOP (Muriate of Potash) @ 50–100 kg/ha.", high: "Reduce potassium application. Test soil again in 30 days." },
    temperature:  { low: "Cover crops with mulch. Delay sowing if possible.", high: "Increase irrigation frequency. Provide shade if possible." },
    humidity:     { low: "Increase irrigation. Use mulching to retain moisture.", high: "Improve ventilation. Watch for fungal disease symptoms." },
  };
  return actions[sensor]?.[direction] || "Consult your local KVK agronomist.";
}

// ── POST /api/sensor — ingest a reading (from IoT device or manual entry) ────
exports.ingestReading = async (req, res) => {
  try {
    const { deviceId, label, soilMoisture, soilPh, nitrogen, phosphorus,
            potassium, temperature, humidity, rainfall } = req.body;

    const reading = await SensorReading.create({
      userId: req.user._id,
      deviceId: deviceId || "default",
      label: label || "",
      soilMoisture: soilMoisture != null ? Number(soilMoisture) : null,
      soilPh:       soilPh       != null ? Number(soilPh)       : null,
      nitrogen:     nitrogen     != null ? Number(nitrogen)     : null,
      phosphorus:   phosphorus   != null ? Number(phosphorus)   : null,
      potassium:    potassium    != null ? Number(potassium)    : null,
      temperature:  temperature  != null ? Number(temperature)  : null,
      humidity:     humidity     != null ? Number(humidity)     : null,
      rainfall:     rainfall     != null ? Number(rainfall)     : null,
    });

    const alerts = generateAlerts(reading);
    res.status(201).json({ reading, alerts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/sensor/latest — latest reading per device ───────────────────────
exports.getLatest = async (req, res) => {
  try {
    // Get distinct deviceIds for this user
    const devices = await SensorReading.distinct("deviceId", { userId: req.user._id });
    const readings = await Promise.all(
      devices.map(deviceId =>
        SensorReading.findOne({ userId: req.user._id, deviceId })
          .sort({ createdAt: -1 })
          .lean()
      )
    );
    const result = readings.filter(Boolean).map(r => ({
      ...r,
      alerts: generateAlerts(r),
    }));
    res.json({ readings: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/sensor/history — last N readings for a device ───────────────────
exports.getHistory = async (req, res) => {
  try {
    const { deviceId = "default", limit = 24 } = req.query;
    const readings = await SensorReading.find({ userId: req.user._id, deviceId })
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit), 100))
      .lean();
    res.json({ readings: readings.reverse() }); // oldest first for charts
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/sensor/alerts — active alerts from latest reading ───────────────
exports.getAlerts = async (req, res) => {
  try {
    const devices = await SensorReading.distinct("deviceId", { userId: req.user._id });
    const allAlerts = [];
    for (const deviceId of devices) {
      const latest = await SensorReading.findOne({ userId: req.user._id, deviceId })
        .sort({ createdAt: -1 }).lean();
      if (latest) {
        const alerts = generateAlerts(latest);
        alerts.forEach(a => allAlerts.push({ ...a, deviceId, label: latest.label }));
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
