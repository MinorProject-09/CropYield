const mongoose = require("mongoose")

const predictionSchema = new mongoose.Schema({
  crop: String,
  rainfall: Number,
  temperature: Number,
  soil: String,
  predictedYield: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Prediction", predictionSchema)