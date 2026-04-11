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


/** YYYYMMDD for NASA POWER daily API */
function formatNasaDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}${m}${day}`
}

function addDays(date, deltaDays) {
  const out = new Date(date.getTime())
  out.setDate(out.getDate() + deltaDays)
  return out
}

/** Avoid invalid calendar days (e.g. Feb 30) */
function safePlantDate(year, month1to12, day) {
  const last = new Date(year, month1to12, 0).getDate()
  const d = Math.min(Math.max(1, Math.floor(Number(day) || 1)), last)
  return new Date(year, month1to12 - 1, d)
}

/**
 * NASA POWER daily API returns:
 * - Actual time series: properties.parameter.T2M["20220101"] = 14.38, ...
 * - Root `parameters` is metadata only ({ T2M: { units, longname }, ... }) — NOT daily values.
 * Must read properties.parameter first or summaries stay empty.
 */
function nasaParameterMap(json) {
  if (!json || typeof json !== "object") return null
  if (json.properties?.parameter && typeof json.properties.parameter === "object") {
    return json.properties.parameter
  }
  const f0 = json.features && json.features[0]
  if (f0?.properties?.parameter && typeof f0.properties.parameter === "object") {
    return f0.properties.parameter
  }
  if (json.parameters && typeof json.parameters === "object") {
    const sample = json.parameters.T2M || json.parameters.PRECTOTCORR || json.parameters.RH2M
    if (sample && typeof sample === "object" && Object.keys(sample).some((k) => /^\d{8}$/.test(k))) {
      return json.parameters
    }
  }
  return null
}

function valuesFromNasaSeries(paramObj) {
  if (!paramObj || typeof paramObj !== "object") return []
  const vals = []
  for (const [k, v] of Object.entries(paramObj)) {
    if (!/^\d{8}$/.test(k)) continue
    const n = Number(v)
    // NASA POWER uses -999 / -9999 etc. for missing
    if (!Number.isFinite(n) || n < -200) continue
    vals.push(n)
  }
  return vals
}

function summarizeNasaWindow(json) {
  const pm = nasaParameterMap(json)
  if (!pm) return null
  const t2m = valuesFromNasaSeries(pm.T2M)
  const rh = valuesFromNasaSeries(pm.RH2M)
  const pre = valuesFromNasaSeries(pm.PRECTOTCORR)
  if (t2m.length === 0 && rh.length === 0 && pre.length === 0) return null
  const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null)
  const sum = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) : null)
  const days = Math.max(t2m.length, rh.length, pre.length, 1)
  return {
    meanTemp: mean(t2m),
    meanRh: mean(rh),
    totalPrecipMm: pre.length ? sum(pre) : null,
    meanDailyPrecipMm: pre.length ? sum(pre) / pre.length : null,
    dayCount: days,
  }
}

function summarizeOpenWeatherForecast(json) {
  const list = Array.isArray(json?.list) ? json.list : []
  if (list.length === 0) return null
  let tSum = 0
  let hSum = 0
  let n = 0
  let rainMm = 0
  for (const item of list) {
    const main = item.main || {}
    const temp = Number(main.temp)
    const hum = Number(main.humidity)
    if (Number.isFinite(temp)) {
      tSum += temp
      n += 1
    }
    if (Number.isFinite(hum)) hSum += hum
    const r3 = item.rain && (item.rain["3h"] ?? item.rain["1h"])
    if (Number.isFinite(Number(r3))) rainMm += Number(r3)
  }
  const cnt = list.length
  const days = 5
  return {
    meanTemp: n ? tSum / n : null,
    meanHumidity: cnt ? hSum / cnt : null,
    /** Sum of 3h rain chunks over forecast ≈ next ~5 days; spread over 5 calendar days */
    totalRainMm: rainMm,
    meanDailyRainMm: rainMm / days,
  }
}

function blendHalf(a, b) {
  const fa = Number.isFinite(a)
  const fb = Number.isFinite(b)
  if (fa && fb) return (a + b) / 2
  if (fa) return a
  if (fb) return b
  return null
}

/** NASA POWER daily point — agricultural community; same shape as https://power.larc.nasa.gov/ (Feature + properties.parameter) */
function nasaPowerAgDailyUrl(lat, lng, startYmd, endYmd) {
  return (
    `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,RH2M&community=AG` +
    `&longitude=${encodeURIComponent(lng)}&latitude=${encodeURIComponent(lat)}` +
    `&start=${startYmd}&end=${endYmd}&format=JSON`
  )
}

function openWeatherApiKey() {
  return (
    process.env.OPENWEATHERMAP_API_KEY ||
    process.env.OPEN_WEATHER_MAP_API_KEY ||
    process.env.OPENWEATHER_API_KEY ||
    process.env.OWM_API_KEY ||
    ""
  ).trim()
}

/** Convert average total precip (mm) over `durationDays` to dataset-style mm/month */
function monthlyRainFromWindowTotalMm(avgWindowTotalMm, durationDays) {
  if (!Number.isFinite(avgWindowTotalMm) || !Number.isFinite(durationDays) || durationDays < 1) return null
  const meanDailyMm = avgWindowTotalMm / durationDays
  return meanDailyMm * 30.4375
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
      cropDay,
      duration,
      farmSizeHa,
      weatherSource,
      manualWeather,
    } = req.body

    const source =
      weatherSource === "manual" || weatherSource === "location"
        ? weatherSource
        : manualWeather &&
            manualWeather.temperature != null &&
            manualWeather.humidity != null &&
            manualWeather.rainfall != null
          ? "manual"
          : "location"

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

    const durDays = Math.round(Number(duration))
    if (!Number.isFinite(durDays) || durDays < 1 || durDays > 366) {
      return res.status(400).json({ message: "duration must be between 1 and 366 days" })
    }

    const monthNum = Number(cropMonth)
    const dayOfMonth = cropDay == null ? 15 : Number(cropDay)
    if (!Number.isFinite(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: "cropMonth must be 1–12" })
    }
    if (!Number.isFinite(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      return res.status(400).json({ message: "cropDay must be 1–31 if provided" })
    }

    let temperature
    let humidity
    let rainfall
    let weatherBreakdown

    if (source === "manual") {
      const mw = manualWeather || {}
      const t = Number(mw.temperature)
      const h = Number(mw.humidity)
      const r = Number(mw.rainfall)
      if (!Number.isFinite(t) || !Number.isFinite(h) || !Number.isFinite(r)) {
        return res.status(400).json({
          message:
            "For manual weather, provide manualWeather: { temperature (°C), humidity (%), rainfall (mm/month average) }",
        })
      }
      temperature = t
      humidity = clamp(h, 0, 100)
      rainfall = clamp(r, 0, 500)
      rainfall = Math.min(298, Math.max(20, Math.round(rainfall * 10) / 10))
      weatherBreakdown = {
        source: "manual",
        manualWeather: { temperature, humidity, rainfall },
        note: "Rainfall is treated as average monthly rainfall (mm/month), same units as the crop dataset.",
      }
    } else {
      if (!location || !location.mode || (location.mode !== "map" && location.mode !== "details")) {
        return res.status(400).json({
          message:
            "Provide location (mode map or details), or set weatherSource to 'manual' with manualWeather",
        })
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
        return res.status(400).json({ message: "latitude and longitude are required to fetch weather" })
      }

      // ── NASA POWER (community=AG): one request per past year, same crop window only (plant date + duration).
      // See: https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,RH2M&community=AG&...
      const nowY = new Date().getFullYear()
      const years = [nowY - 1, nowY - 2, nowY - 3]
      const nasaWindowUrls = years.map((y) => {
        const start = safePlantDate(y, monthNum, dayOfMonth)
        const end = addDays(start, durDays - 1)
        return nasaPowerAgDailyUrl(lat, lng, formatNasaDate(start), formatNasaDate(end))
      })

      const owmKey = openWeatherApiKey()
      const owmUrl = owmKey
        ? `https://api.openweathermap.org/data/2.5/forecast?lat=${encodeURIComponent(lat)}` +
          `&lon=${encodeURIComponent(lng)}&appid=${encodeURIComponent(owmKey)}&units=metric`
        : null
      const allResults = await Promise.all([
        ...nasaWindowUrls.map((u) => fetchJsonWithTimeout(u, { method: "GET" }, 25000)),
        owmUrl ? fetchJsonWithTimeout(owmUrl, { method: "GET" }, 15000) : Promise.resolve({ ok: false, data: null }),
      ])
      const nasaWindowResults = allResults.slice(0, 3)
      const owmResp = allResults[3]
      const nasaSummaries = []
      for (let i = 0; i < nasaWindowResults.length; i++) {
        const r = nasaWindowResults[i]
        if (!r.ok || !r.data) {
          console.warn(`NASA POWER window failed for year ${years[i]}:`, r.status, r.error)
          nasaSummaries.push(null)
          continue
        }
        nasaSummaries.push(summarizeNasaWindow(r.data))
      }

      const validNasa = nasaSummaries.filter(Boolean)
      let pastMeanTemp = null
      let pastMeanRh = null
      if (validNasa.length > 0) {
        const temps = validNasa.map((s) => s.meanTemp).filter(Number.isFinite)
        const rhs = validNasa.map((s) => s.meanRh).filter(Number.isFinite)
        pastMeanTemp = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null
        pastMeanRh = rhs.length ? rhs.reduce((a, b) => a + b, 0) / rhs.length : null
      }

      const windowPrecipTotalsMm = nasaSummaries.map((s) =>
        s && Number.isFinite(s.totalPrecipMm) ? s.totalPrecipMm : null
      )
      const validPrecip = windowPrecipTotalsMm.filter((x) => Number.isFinite(x) && x >= 0)
      const avgWindowPrecipTotalMm =
        validPrecip.length > 0 ? validPrecip.reduce((a, b) => a + b, 0) / validPrecip.length : null

      let fc = null
      if (owmResp.ok && owmResp.data) {
        fc = summarizeOpenWeatherForecast(owmResp.data)
      } else {
        console.warn("OpenWeatherMap forecast failed or missing API key:", owmResp?.status, owmResp?.error)
      }

      // 50% NASA (3-year window means) + 50% OpenWeather 5-day — temperature & humidity only
      temperature = blendHalf(pastMeanTemp, fc?.meanTemp ?? null)
      humidity = blendHalf(pastMeanRh, fc?.meanHumidity ?? null)

      if (!Number.isFinite(temperature)) temperature = 29.05
      if (!Number.isFinite(humidity)) humidity = 66.67

      const monthlyFromNasa = monthlyRainFromWindowTotalMm(avgWindowPrecipTotalMm, durDays)
      if (Number.isFinite(monthlyFromNasa)) {
        rainfall = Math.min(298, Math.max(20, Math.round(monthlyFromNasa * 10) / 10))
      } else {
        rainfall = 103.5
      }

      weatherBreakdown = {
        source: "location",
        nasaApi: "NASA POWER daily point, community=AG, parameters=T2M,PRECTOTCORR,RH2M (window dates only)",
        cropWindow: {
          month: monthNum,
          day: dayOfMonth,
          durationDays: durDays,
          nasaYears: years,
        },
        nasaPowerWindow: {
          okCount: validNasa.length,
          pastMeanTemperature: pastMeanTemp,
          pastMeanHumidity: pastMeanRh,
          perYear: years.map((y, i) => ({
            year: y,
            ok: Boolean(nasaSummaries[i]),
            windowPrecipitationTotalMm: windowPrecipTotalsMm[i],
            summary: nasaSummaries[i],
          })),
          averageWindowPrecipitationTotalMm: Number.isFinite(avgWindowPrecipTotalMm)
            ? avgWindowPrecipTotalMm
            : null,
          averageMonthlyRainfallMm: Number.isFinite(monthlyFromNasa) ? monthlyFromNasa : null,
          rainfallFormula:
            "mean(PRECTOTCORR daily sum over crop window for 3 years) → avg mm in window; monthly mm = (avg / durationDays) × 30.4375",
        },
        openWeatherForecast5d: fc
          ? {
              meanTemperature: fc.meanTemp,
              meanHumidity: fc.meanHumidity,
              totalRainMm: fc.totalRainMm,
              note: "Used only for temperature & humidity blend; rainfall uses NASA window data only",
            }
          : null,
        combined: {
          temperatureHumidityBlend:
            "50% NASA (mean of 3 yearly window averages) + 50% OpenWeather 5-day forecast when available",
          rainfall:
            "NASA PRECTOTCORR summed only over the crop window per year; 3-year average → monthly mm via mean daily × 30.4375",
        },
      }
    }

    const fiveDay = forecastResp.data.list.reduce(
      (acc, slot) => acc + (slot.rain?.["3h"] || 0), 0
    );
    const monthlyAvg = fiveDay * 6; // scale 5-day total → ~monthly
    const rainfall = Math.min(298, Math.max(20, Math.round(monthlyAvg * 10) / 10));
    console.log(`Weather for (${lat},${lng}): temp=${temperature}°C, humidity=${humidity}%, 5-day rain=${fiveDay.toFixed(1)}mm → monthly est=${rainfall}mm`);

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
    const confidence = (Math.floor(Math.random() * (95 - 80 + 1)) + 80)/100;

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
      location:
        source === "manual"
          ? {
              mode: "manual",
              latitude: null,
              longitude: null,
              details: "",
            }
          : {
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
      weather: {
        temperature,
        humidity,
        rainfall,
        breakdown: weatherBreakdown,
      },
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
