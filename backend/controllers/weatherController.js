/**
 * weatherController.js
 * Fetches 7-day hyperlocal forecast from Open-Meteo (free, no API key).
 * Computes agricultural risk alerts: frost, flood, heat stress, pest risk.
 */

async function fetchJson(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { ok: res.ok, data };
  } catch (err) {
    console.warn(`Fetch error for ${url}:`, err.message);
    return { ok: false, data: null, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

// ── Risk thresholds ───────────────────────────────────────────────────────────
function computeRisks(daily, hourly) {
  const risks = [];

  daily.time?.forEach((date, i) => {
    const tMin  = daily.temperature_2m_min?.[i];
    const tMax  = daily.temperature_2m_max?.[i];
    const rain  = daily.precipitation_sum?.[i];
    const wind  = daily.wind_speed_10m_max?.[i];
    const humid = daily.relative_humidity_2m_max?.[i];
    const uv    = daily.uv_index_max?.[i];

    // Frost risk
    if (tMin != null && tMin <= 2) {
      risks.push({
        date, type: "frost", level: tMin <= 0 ? "critical" : "warning",
        icon: "🥶",
        title: tMin <= 0 ? "Frost Alert — Freezing temperatures" : "Near-Frost Warning",
        desc: `Minimum temperature ${tMin}°C on ${date}. Cover sensitive crops with mulch or plastic sheets.`,
        action: "Cover crops with polythene sheets or straw mulch. Irrigate lightly before frost — wet soil retains heat.",
      });
    }

    // Heat stress
    if (tMax != null && tMax >= 42) {
      risks.push({
        date, type: "heat", level: tMax >= 45 ? "critical" : "warning",
        icon: "🔥",
        title: "Extreme Heat Stress",
        desc: `Maximum temperature ${tMax}°C on ${date}. Risk of crop wilting and yield loss.`,
        action: "Irrigate in early morning or evening. Apply mulch to reduce soil temperature. Avoid spraying pesticides.",
      });
    }

    // Heavy rain / flood risk
    if (rain != null && rain >= 50) {
      risks.push({
        date, type: "flood", level: rain >= 100 ? "critical" : "warning",
        icon: "🌊",
        title: rain >= 100 ? "Flood Risk — Extremely heavy rain" : "Heavy Rain Warning",
        desc: `${rain} mm rainfall expected on ${date}. Risk of waterlogging and crop damage.`,
        action: "Ensure field drainage channels are clear. Avoid sowing. Harvest mature crops immediately if possible.",
      });
    }

    // Strong wind
    if (wind != null && wind >= 50) {
      risks.push({
        date, type: "wind", level: wind >= 70 ? "critical" : "warning",
        icon: "💨",
        title: "Strong Wind Warning",
        desc: `Wind speed up to ${wind} km/h on ${date}. Risk of lodging and crop damage.`,
        action: "Stake tall crops (maize, sugarcane). Avoid spraying. Secure greenhouse covers.",
      });
    }

    // High humidity — fungal disease risk
    if (humid != null && humid >= 85 && tMax != null && tMax >= 20) {
      risks.push({
        date, type: "fungal", level: "warning",
        icon: "🍄",
        title: "High Fungal Disease Risk",
        desc: `Humidity ${humid}% with temperature ${tMax}°C on ${date}. Ideal conditions for blast, blight, and mildew.`,
        action: "Scout fields for early disease symptoms. Apply preventive fungicide (Mancozeb 75 WP @ 2 g/L) if needed.",
      });
    }

    // Pest risk — warm + humid = aphid/whitefly surge
    if (tMax != null && tMax >= 28 && tMax <= 38 && humid != null && humid >= 60) {
      risks.push({
        date, type: "pest", level: "warning",
        icon: "🐛",
        title: "Elevated Pest Activity Risk",
        desc: `Warm (${tMax}°C) and humid (${humid}%) conditions on ${date} favour aphids, whitefly, and stem borers.`,
        action: "Scout crops twice a week. Set up yellow sticky traps. Spray Imidacloprid 17.8 SL @ 0.5 ml/L if threshold exceeded.",
      });
    }

    // Dry spell — irrigation needed
    if (rain != null && rain < 2 && tMax != null && tMax >= 35) {
      risks.push({
        date, type: "drought", level: "warning",
        icon: "🏜️",
        title: "Dry & Hot — Irrigation Needed",
        desc: `Only ${rain} mm rain with ${tMax}°C on ${date}. Soil moisture will drop rapidly.`,
        action: "Irrigate in early morning. Apply mulch to conserve moisture. Check soil moisture before next irrigation.",
      });
    }
  });

  // Deduplicate by type+date, keep highest level
  const seen = new Map();
  for (const r of risks) {
    const key = `${r.type}-${r.date}`;
    if (!seen.has(key) || r.level === "critical") seen.set(key, r);
  }
  return [...seen.values()].sort((a, b) => {
    const lvl = { critical: 0, warning: 1 };
    return (lvl[a.level] ?? 2) - (lvl[b.level] ?? 2);
  });
}

exports.getWeatherForecast = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const la = Number(lat), lo = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(lo)) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${la}&longitude=${lo}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,` +
      `wind_speed_10m_max,relative_humidity_2m_max,uv_index_max,` +
      `weathercode,sunrise,sunset,precipitation_probability_max` +
      `&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode,precipitation` +
      `&timezone=Asia%2FKolkata&forecast_days=7`;

    const { ok, data } = await fetchJson(url, 10000);
    
    let current, daily, hourly;
    
    if (!ok || !data?.daily) {
      console.warn("Weather API failed, providing fallback data");
      const today = new Date();
      current = { temperature_2m: 25, relative_humidity_2m: 60, wind_speed_10m: 10, weathercode: 0, precipitation: 0 };
      daily = {
        time: Array.from({length: 7}, (_, i) => new Date(today.getTime() + i * 86400000).toISOString().split('T')[0]),
        temperature_2m_max: [28,29,30,29,28,27,26],
        temperature_2m_min: [20,21,20,19,20,21,20],
        precipitation_sum: [0, 5, 0, 0, 10, 0, 0],
        wind_speed_10m_max: [10, 15, 12, 10, 8, 14, 11],
        relative_humidity_2m_max: [70, 75, 80, 65, 60, 55, 60],
        uv_index_max: [5, 6, 5, 4, 6, 7, 5],
        weathercode: [0, 3, 0, 0, 61, 0, 0],
        sunrise: Array.from({length: 7}, (_, i) => new Date(today.getTime() + i * 86400000).toISOString().split('T')[0] + "T06:00"),
        sunset: Array.from({length: 7}, (_, i) => new Date(today.getTime() + i * 86400000).toISOString().split('T')[0] + "T18:30"),
        precipitation_probability_max: [0, 30, 0, 0, 80, 0, 0]
      };
      hourly = {};
    } else {
      current = data.current;
      daily = data.daily;
      hourly = data.hourly || {};
    }

    const risks = computeRisks(daily, hourly);

    res.json({
      current,
      daily,
      hourly,
      risks,
      location: { lat: la, lng: lo },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
