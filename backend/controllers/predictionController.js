const Prediction = require("../models/Prediction")
const jwt = require("jsonwebtoken")

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
      farmSizeHa,
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

    // ── Weather from Open-Meteo ───────────────────────────────────────────────
    // temperature + humidity: current conditions from forecast API
    // rainfall: dataset 'rainfall' column = average monthly rainfall (annual/12)
    //   Verified by cross-referencing dataset values with known Indian crop regions:
    //   rice=236mm/mo (implied 2834mm/yr), muskmelon=25mm/mo (296mm/yr), etc.
    //   We fetch annual rainfall from the ERA5 climate normals API and divide by 12.
    //   This gives stable, location-representative values that match the training data.

    const currentWeatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}` +
      `&longitude=${encodeURIComponent(lng)}` +
      `&current=temperature_2m,relative_humidity_2m`

    // ERA5 climate normals — annual precipitation sum for the location
    const climateRainfallUrl =
      `https://climate-api.open-meteo.com/v1/climate?` +
      `latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}` +
      `&models=EC_Earth3P_HR&daily=precipitation_sum` +
      `&start_date=2000-01-01&end_date=2000-12-31`

    const [weatherResp, climateResp] = await Promise.all([
      fetchJsonWithTimeout(currentWeatherUrl, { method: "GET" }, 8000),
      fetchJsonWithTimeout(climateRainfallUrl, { method: "GET" }, 10000),
    ])

    if (!weatherResp.ok || !weatherResp.data?.current) {
      return res.status(502).json({
        message: "Failed to fetch weather data",
        detail: weatherResp.data,
      })
    }

    const temperature = Number(weatherResp.data.current.temperature_2m)
    const humidity    = Number(weatherResp.data.current.relative_humidity_2m)

    if (![temperature, humidity].every(Number.isFinite)) {
      return res.status(502).json({
        message: "Weather provider returned invalid temperature/humidity",
        detail: weatherResp.data?.current ?? null,
      })
    }

    // Compute average monthly rainfall = annual / 12, clamped to dataset range 20–298mm
    let rainfall = 100 // fallback near dataset mean
    if (climateResp.ok && Array.isArray(climateResp.data?.daily?.precipitation_sum)) {
      const annualSum = climateResp.data.daily.precipitation_sum
        .reduce((acc, v) => acc + (Number(v) || 0), 0)
      const monthlyAvg = annualSum / 12
      rainfall = Math.min(298, Math.max(20, Math.round(monthlyAvg * 10) / 10))
    }

    // ML payload — key order matches train.py: N, P, K, temperature, humidity, ph, rainfall
    const mlPayload = {
      N: Number(nitrogen),
      P: Number(phosphorus),
      K: Number(potassium),
      temperature,
      humidity,
      ph: Number(soilPh),
      rainfall,
      farm_size_ha: Number(farmSizeHa) > 0 ? Number(farmSizeHa) : 1.0,
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

    const yieldData = mlResp.data?.yield || {}

    const prediction = new Prediction({
      userId: (() => {
        try {
          const token = req.headers.authorization?.split(" ")[1];
          if (!token) return null;
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          return decoded.id || null;
        } catch { return null; }
      })(),
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
      yieldQHa:    yieldData.yield_q_ha    ?? null,
      totalYieldQ: yieldData.total_yield_q ?? null,
      farmSizeHa:  yieldData.farm_size_ha  ?? null,
    })

    await prediction.save()

    res.json({
      message: "Prediction generated",
      recommendedCrop: recommendedCrop.trim(),
      confidence: clamp01(confidence),
      top3: mlResp.data?.top3 || [],
      mlInput: mlPayload,
      weather: { temperature, humidity, rainfall },
      yield: yieldData,
      id: prediction._id,
    })
  } catch (err) {
    console.error("predictCropYield:", err)
    res.status(500).json({ message: err.message || "Prediction failed" })
  }
}

exports.getPredictionHistory = async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({ predictions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePrediction = async (req, res) => {
  try {
    const prediction = await Prediction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!prediction) return res.status(404).json({ message: "Prediction not found" });
    await prediction.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
