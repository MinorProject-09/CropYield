const Prediction = require("../models/Prediction")

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    const text = await res.text()
    let data
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = text
    }
    return { ok: res.ok, status: res.status, data }
  } finally {
    clearTimeout(timeout)
  }
}

function normalizeMlBaseUrl(raw) {
  const base = (raw || "").trim() || "http://127.0.0.1:8000"
  return base.endsWith("/") ? base.slice(0, -1) : base
}

/**
 * Placeholder yield model until ML service is connected.
 * Uses normalized inputs so the API contract stays stable.
 */
function clamp01(n) {
  return clamp(Number(n), 0, 1)
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

    const lat = Number(location.latitude)
    const lng = Number(location.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ message: "latitude and longitude are required to query weather + ML model" })
    }

    // Weather (Open-Meteo; no API key). Used to build correct ML-service input.
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}` +
      `&longitude=${encodeURIComponent(lng)}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation`

    const weatherResp = await fetchJsonWithTimeout(weatherUrl, { method: "GET" }, 8000)
    if (!weatherResp.ok || !weatherResp.data?.current) {
      return res.status(502).json({
        message: "Failed to fetch weather data for ML input",
        detail: weatherResp.data,
      })
    }

    const temperature = Number(weatherResp.data.current.temperature_2m)
    const humidity = Number(weatherResp.data.current.relative_humidity_2m)
    const rainfall = Number(weatherResp.data.current.precipitation)

    if (![temperature, humidity, rainfall].every(Number.isFinite)) {
      return res.status(502).json({
        message: "Weather provider returned invalid values",
        detail: weatherResp.data?.current ?? null,
      })
    }

    // Ensure ML-service input is in the correct format (matches ml-service/api/app.py keys)
    const mlPayload = {
      temperature,
      humidity,
      rainfall,
      ph: Number(soilPh),
      N: Number(nitrogen),
      P: Number(phosphorus),
      K: Number(potassium),
    }

    const mlBaseUrl = normalizeMlBaseUrl(process.env.ML_SERVICE_URL)
    const mlTimeoutMs = Number(process.env.ML_SERVICE_TIMEOUT_MS || 8000)

    const mlResp = await fetchJsonWithTimeout(
      `${mlBaseUrl}/predict`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mlPayload),
      },
      Number.isFinite(mlTimeoutMs) ? mlTimeoutMs : 8000
    )

    if (!mlResp.ok) {
      return res.status(502).json({
        message: "ML service request failed",
        mlServiceUrl: mlBaseUrl,
        status: mlResp.status,
        detail: mlResp.data,
      })
    }

    const recommendedCrop = mlResp.data?.crop
    const confidence = mlResp.data?.confidence

    if (typeof recommendedCrop !== "string" || !recommendedCrop.trim()) {
      return res.status(502).json({
        message: "ML service returned an invalid crop label",
        detail: mlResp.data,
      })
    }

    if (!Number.isFinite(Number(confidence))) {
      return res.status(502).json({
        message: "ML service returned an invalid confidence score",
        detail: mlResp.data,
      })
    }

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
      recommendedCrop: recommendedCrop.trim(),
      confidence: clamp01(confidence),
    })

    await prediction.save()

    res.json({
      message: "Prediction generated",
      recommendedCrop: recommendedCrop.trim(),
      confidence: clamp01(confidence),
      mlInput: mlPayload,
      id: prediction._id,
    })
  } catch (err) {
    console.error("predictCropYield:", err)
    res.status(500).json({ message: err.message || "Prediction failed" })
  }
}
