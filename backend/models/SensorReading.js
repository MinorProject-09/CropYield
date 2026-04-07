const mongoose = require("mongoose");

const sensorReadingSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deviceId:   { type: String, default: "default" },
  label:      { type: String, default: "" },

  // 7 core parameters
  nitrogen:     { type: Number, default: null }, // mg/kg
  phosphorus:   { type: Number, default: null }, // mg/kg
  potassium:    { type: Number, default: null }, // mg/kg
  soilPh:       { type: Number, default: null }, // 0–14
  temperature:  { type: Number, default: null }, // °C
  humidity:     { type: Number, default: null }, // %
  // rainfall comes from weather API, stored here when fetched
  rainfall:     { type: Number, default: null }, // mm

  createdAt: { type: Date, default: Date.now },
});

sensorReadingSchema.index({ userId: 1, deviceId: 1, createdAt: -1 });

module.exports = mongoose.model("SensorReading", sensorReadingSchema);
