const mongoose = require("mongoose")

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  location: {
    mode: { type: String, enum: ["map", "details"], required: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    details: { type: String, default: "" },
  },
  soilPh:      { type: Number, required: true },
  nitrogen:    { type: Number, required: true },
  phosphorus:  { type: Number, required: true },
  potassium:   { type: Number, required: true },
  cropMonth:   { type: Number, required: true },
  duration:    { type: Number, required: true },
  farmSizeHa:  { type: Number, default: 1 },

  // Weather at time of prediction — needed to reconstruct profit analysis
  temperature: { type: Number, default: null },
  humidity:    { type: Number, default: null },
  rainfall:    { type: Number, default: null },

  // ML output
  recommendedCrop: { type: String, required: true },
  confidence:      { type: Number, required: true },
  top3: [{ crop: String, confidence: Number }],

  // Yield output
  yieldQHa:    { type: Number, default: null },
  totalYieldQ: { type: Number, default: null },

  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Prediction", predictionSchema)
