const mongoose = require("mongoose");

const sensorReadingSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deviceId: { type: String, default: "default" },  // supports multiple devices per farm

  // Soil sensors
  soilMoisture: { type: Number, default: null },  // % (0–100)
  soilPh:       { type: Number, default: null },  // 0–14
  nitrogen:     { type: Number, default: null },  // kg/ha
  phosphorus:   { type: Number, default: null },  // kg/ha
  potassium:    { type: Number, default: null },  // kg/ha

  // Climate sensors
  temperature:  { type: Number, default: null },  // °C
  humidity:     { type: Number, default: null },  // %
  rainfall:     { type: Number, default: null },  // mm

  // Optional label (e.g. "Field A", "North plot")
  label: { type: String, default: "" },

  createdAt: { type: Date, default: Date.now },
});

// Index for fast latest-reading queries
sensorReadingSchema.index({ userId: 1, deviceId: 1, createdAt: -1 });

module.exports = mongoose.model("SensorReading", sensorReadingSchema);
