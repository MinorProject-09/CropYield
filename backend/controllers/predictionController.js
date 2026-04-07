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
  } catch (err) {
    console.error(`Fetch error for ${url}:`, err.message)
    return { ok: false, status: 500, data: null, error: err.message }
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
    // The dataset's "rainfall" column = long-term average monthly rainfall (mm/month).
    // We must NOT use recent/seasonal data — a dry-season query would give near-zero
    // for a high-rainfall region. Instead we fetch the full past year from the
    // historical archive API and compute annual_total / 12 = monthly average.
    // This matches the dataset's scale (20–298 mm/month) regardless of query season.

    const currentWeatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}` +
      `&longitude=${encodeURIComponent(lng)}` +
      `&current=temperature_2m,relative_humidity_2m&timezone=auto`

    // Historical archive: full previous calendar year for annual rainfall average
    const now = new Date();
    const prevYear = now.getFullYear() - 1;
    const archiveUrl =
      `https://archive-api.open-meteo.com/v1/archive?latitude=${encodeURIComponent(lat)}` +
      `&longitude=${encodeURIComponent(lng)}` +
      `&start_date=${prevYear}-01-01&end_date=${prevYear}-12-31` +
      `&daily=precipitation_sum&timezone=auto`

    const [weatherResp, archiveResp] = await Promise.all([
      fetchJsonWithTimeout(currentWeatherUrl, { method: "GET" }, 8000),
      fetchJsonWithTimeout(archiveUrl, { method: "GET" }, 10000),
    ])

    let temperature = 29.05; // fallback
    let humidity = 66.67;    // fallback
    let rainfall = 103.5;    // fallback = dataset overall mean

    if (!weatherResp.ok || !weatherResp.data?.current) {
      console.warn("Using fallback weather data due to API failure");
    } else {
      const tempNum = Number(weatherResp.data.current.temperature_2m);
      const humNum  = Number(weatherResp.data.current.relative_humidity_2m);
      if (Number.isFinite(tempNum)) temperature = tempNum;
      else console.warn("Weather provider returned invalid temperature. Using fallback.");
      if (Number.isFinite(humNum)) humidity = humNum;
      else console.warn("Weather provider returned invalid humidity. Using fallback.");
    }

    // Annual total / 12 = monthly average — matches dataset scale exactly
    if (archiveResp.ok && Array.isArray(archiveResp.data?.daily?.precipitation_sum)) {
      const precipArr = archiveResp.data.daily.precipitation_sum;
      const annualTotal = precipArr.reduce((acc, v) => acc + (Number(v) || 0), 0);
      const monthlyAvg = annualTotal / 12;
      rainfall = Math.min(298, Math.max(20, Math.round(monthlyAvg * 10) / 10));
      console.log(`Rainfall for (${lat},${lng}): annual=${annualTotal.toFixed(1)}mm → monthly avg=${rainfall}mm`);
    } else {
      console.warn("Archive API failed, using fallback rainfall:", archiveResp.data?.reason || "unknown");
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
      soilPh:      Number(soilPh),
      nitrogen:    Number(nitrogen),
      phosphorus:  Number(phosphorus),
      potassium:   Number(potassium),
      cropMonth:   Number(cropMonth),
      duration:    Number(duration),
      farmSizeHa:  mlPayload.farm_size_ha,
      temperature,
      humidity,
      rainfall,
      recommendedCrop: recommendedCrop.trim(),
      confidence:  clamp01(confidence),
      top3:        mlResp.data?.top3 || [],
      yieldQHa:    yieldData.yield_q_ha    ?? null,
      totalYieldQ: yieldData.total_yield_q ?? null,
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

exports.updateHarvest = async (req, res) => {
  try {
    const { actualYieldQ, harvestNotes } = req.body;
    if (actualYieldQ == null || isNaN(Number(actualYieldQ))) {
      return res.status(400).json({ message: "actualYieldQ must be a number" });
    }
    const prediction = await Prediction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!prediction) return res.status(404).json({ message: "Prediction not found" });

    prediction.actualYieldQ  = Number(actualYieldQ);
    prediction.harvestNotes  = typeof harvestNotes === "string" ? harvestNotes.trim() : "";
    prediction.harvestedAt   = new Date();
    await prediction.save();

    res.json({ message: "Harvest logged", prediction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfitRank = async (req, res) => {
  try {
    const { candidates, N, P, K, temperature, humidity, ph, rainfall, farm_size_ha, duration_days } = req.body;

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ message: "candidates array is required" });
    }

    const mlBaseUrl = (process.env.ML_SERVICE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

    const payload = {
      candidates,
      N: Number(N),
      P: Number(P),
      K: Number(K),
      temperature: Number(temperature),
      humidity: Number(humidity),
      ph: Number(ph),
      rainfall: Number(rainfall),
      farm_size_ha: Number(farm_size_ha) > 0 ? Number(farm_size_ha) : 1.0,
      duration_days: Number(duration_days) > 0 ? Math.round(Number(duration_days)) : 90,
    };

    const resp = await fetchJsonWithTimeout(
      `${mlBaseUrl}/profit-rank`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
      12000
    );

    if (!resp.ok) {
      return res.status(502).json({
        message: "ML service profit-rank failed",
        detail: resp.data,
        mlStatus: resp.status,
      });
    }

    res.json(resp.data);
  } catch (err) {
    console.error("getProfitRank:", err);
    res.status(500).json({ message: err.message || "Profit rank failed" });
  }
};
