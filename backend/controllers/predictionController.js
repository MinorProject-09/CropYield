const Prediction = require("../models/Prediction")

exports.predictCropYield = async (req, res) => {

  const { crop, rainfall, temperature, soil } = req.body

  // Dummy prediction logic (temporary)
  const predictedYield = (rainfall * 0.3) + (temperature * 0.5)

  const prediction = new Prediction({
    crop,
    rainfall,
    temperature,
    soil,
    predictedYield
  })

  await prediction.save()

  res.json({
    message: "Prediction generated",
    predictedYield
  })
}