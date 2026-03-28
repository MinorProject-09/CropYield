const mongoose = require("mongoose")

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  location: {
    mode: { type: String, enum: ["map", "details"], required: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    details: { type: String, default: "" },
  },
  soilPh: { type: Number, required: true },
  nitrogen: { type: Number, required: true },
  phosphorus: { type: Number, required: true },
  potassium: { type: Number, required: true },
  cropMonth: { type: Number, required: true },
  duration: { type: Number, required: true },
  recommendedCrop: { type: String, required: true },
  confidence: { type: Number, required: true },
  predictedYield: { type: Number, required: false }, // legacy; no longer used
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Prediction", predictionSchema)
