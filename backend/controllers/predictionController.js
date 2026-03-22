const Prediction = require("../models/Prediction")

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

/**
 * Placeholder yield model until ML service is connected.
 * Uses normalized inputs so the API contract stays stable.
 */
function computeDummyYield(body) {
  const { soilPh, nitrogen, phosphorus, potassium, cropMonth, duration } = body
  const n = clamp(Number(nitrogen) / 200, 0, 1.5)
  const p = clamp(Number(phosphorus) / 80, 0, 1.5)
  const k = clamp(Number(potassium) / 250, 0, 1.5)
  const ph = clamp(1 - Math.abs(Number(soilPh) - 6.5) / 6.5, 0, 1)
  const monthFactor = clamp(Math.sin((Number(cropMonth) / 12) * Math.PI), 0, 1)
  const dur = clamp(Number(duration) / 180, 0, 2)
  const base = 2.5 + n * 1.2 + p * 0.9 + k * 0.8 + ph * 1.1 + monthFactor * 0.6 + dur * 0.4
  return Math.round(base * 100) / 100
}

exports.predictCropYield = async (req, res) => {
  try {
    const {
      location,
      soilPh,
      nitrogen,
      phosphorus,
      potassium,
      cropMonth,
      duration,
    } = req.body

    if (
      soilPh == null ||
      nitrogen == null ||
      phosphorus == null ||
      potassium == null ||
      cropMonth == null ||
      duration == null
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: soilPh, nitrogen, phosphorus, potassium, cropMonth, duration",
      })
    }

    if (!location || !location.mode) {
      return res.status(400).json({ message: "location.mode is required (map or details)" })
    }

    if (location.mode === "map") {
      if (location.latitude == null || location.longitude == null) {
        return res
          .status(400)
          .json({ message: "For map mode, latitude and longitude are required" })
      }
    }

    if (location.mode === "details") {
      const d = typeof location.details === "string" ? location.details.trim() : ""
      if (!d) {
        return res.status(400).json({ message: "For details mode, location details are required" })
      }
    }

    const predictedYield = computeDummyYield({
      soilPh,
      nitrogen,
      phosphorus,
      potassium,
      cropMonth,
      duration,
    })

    const prediction = new Prediction({
      location: {
        mode: location.mode,
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
        details: typeof location.details === "string" ? location.details : "",
      },
      soilPh: Number(soilPh),
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      cropMonth: Number(cropMonth),
      duration: Number(duration),
      predictedYield,
    })

    await prediction.save()

    res.json({
      message: "Prediction generated",
      predictedYield,
      id: prediction._id,
    })
  } catch (err) {
    console.error("predictCropYield:", err)
    res.status(500).json({ message: err.message || "Prediction failed" })
  }
}
