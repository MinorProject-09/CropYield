/**
 * weatherController.js
 * Uses OpenWeatherMap API:
 *   - Current weather:  GET /weather
 *   - 5-day forecast:   GET /forecast  (3-hour intervals → aggregated to daily)
 *
 * Free tier: 1,000 calls/day — plenty for this app.
 * Sign up at https://openweathermap.org/api → copy API key → set OPENWEATHER_API_KEY in .env
 *
 * Response shape is kept identical to the old Open-Meteo shape so WeatherPage.jsx
 * and IoTDashboard.jsx need zero changes.
 */

const OWM_KEY = process.env.OPEN_WEATHER_MAP_API_KEY;
const OWM_BASE = "https://api.openweathermap.org/data/2.5";

async function fetchJson(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.warn(`Fetch error for ${url}:`, err.message);
    return { ok: false, data: null, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

// ── Map OWM weather id → WMO-style code (reuse existing frontend wmoInfo()) ──
function owmIdToWmo(id) {
  if (!id) return 0;
  if (id >= 200 && id < 300) return 95;  // thunderstorm
  if (id >= 300 && id < 400) return 51;  // drizzle
  if (id >= 500 && id < 600) return 61;  // rain
  if (id >= 600 && id < 700) return 71;  // snow
  if (id >= 700 && id < 800) return 45;  // fog/mist
  if (id === 800)             return 0;   // clear
  if (id === 801)             return 1;   // few clouds
  if (id === 802)             return 2;   // scattered clouds
  if (id >= 803)              return 3;   // overcast
  return 0;
}

// ── Aggregate 3-hour OWM forecast slots into daily buckets ───────────────────
function aggregateDays(list) {
  const days = {};
  for (const slot of list) {
    const date = slot.dt_txt.split(" ")[0]; // "YYYY-MM-DD"
    if (!days[date]) {
      days[date] = {
        temps: [], tempMins: [], tempMaxs: [],
        rain: 0, humidity: [], wind: [], codes: [],
        pop: [],  // probability of precipitation
        sunrise: null, sunset: null,
      };
    }
    const d = days[date];
    d.temps.push(slot.main.temp);
    d.tempMins.push(slot.main.temp_min);
    d.tempMaxs.push(slot.main.temp_max);
    d.rain += (slot.rain?.["3h"] || 0);
    d.humidity.push(slot.main.humidity);
    d.wind.push(slot.wind?.speed ? slot.wind.speed * 3.6 : 0); // m/s → km/h
    d.codes.push(owmIdToWmo(slot.weather?.[0]?.id));
    d.pop.push(Math.round((slot.pop || 0) * 100));
  }
  return days;
}

// ── Agricultural risk computation (same logic as before) ─────────────────────
function computeRisks(dailyAgg) {
  const risks = [];
  for (const [date, d] of Object.entries(dailyAgg)) {
    const tMax  = d.tempMaxs.length ? Math.max(...d.tempMaxs) : null;
    const tMin  = d.tempMins.length ? Math.min(...d.tempMins) : null;
    const rain  = d.rain;
    const wind  = d.wind.length ? Math.max(...d.wind) : null;
    const humid = d.humidity.length ? Math.max(...d.humidity) : null;

    if (tMin != null && tMin <= 2) {
      risks.push({
        date, type: "frost", level: tMin <= 0 ? "critical" : "warning",
        icon: "🥶",
        title: tMin <= 0 ? "Frost Alert — Freezing temperatures" : "Near-Frost Warning",
        desc: `Minimum temperature ${tMin.toFixed(1)}°C on ${date}. Cover sensitive crops.`,
        action: "Cover crops with polythene sheets or straw mulch. Irrigate lightly before frost — wet soil retains heat.",
      });
    }
    if (tMax != null && tMax >= 42) {
      risks.push({
        date, type: "heat", level: tMax >= 45 ? "critical" : "warning",
        icon: "🔥",
        title: "Extreme Heat Stress",
        desc: `Maximum temperature ${tMax.toFixed(1)}°C on ${date}. Risk of crop wilting.`,
        action: "Irrigate in early morning or evening. Apply mulch to reduce soil temperature.",
      });
    }
    if (rain >= 50) {
      risks.push({
        date, type: "flood", level: rain >= 100 ? "critical" : "warning",
        icon: "🌊",
        title: rain >= 100 ? "Flood Risk — Extremely heavy rain" : "Heavy Rain Warning",
        desc: `${rain.toFixed(1)} mm rainfall expected on ${date}. Risk of waterlogging.`,
        action: "Ensure field drainage channels are clear. Avoid sowing. Harvest mature crops if possible.",
      });
    }
    if (wind != null && wind >= 50) {
      risks.push({
        date, type: "wind", level: wind >= 70 ? "critical" : "warning",
        icon: "💨",
        title: "Strong Wind Warning",
        desc: `Wind speed up to ${wind.toFixed(0)} km/h on ${date}. Risk of lodging.`,
        action: "Stake tall crops. Avoid spraying. Secure greenhouse covers.",
      });
    }
    if (humid != null && humid >= 85 && tMax != null && tMax >= 20) {
      risks.push({
        date, type: "fungal", level: "warning",
        icon: "🍄",
        title: "High Fungal Disease Risk",
        desc: `Humidity ${humid}% with ${tMax.toFixed(1)}°C on ${date}. Ideal for blast, blight, mildew.`,
        action: "Apply preventive fungicide (Mancozeb 75 WP @ 2 g/L). Scout fields daily.",
      });
    }
    if (tMax != null && tMax >= 28 && tMax <= 38 && humid != null && humid >= 60) {
      risks.push({
        date, type: "pest", level: "warning",
        icon: "🐛",
        title: "Elevated Pest Activity Risk",
        desc: `Warm (${tMax.toFixed(1)}°C) and humid (${humid}%) on ${date} — aphids, whitefly risk.`,
        action: "Scout crops twice a week. Set yellow sticky traps. Spray Imidacloprid if threshold exceeded.",
      });
    }
    if (rain < 2 && tMax != null && tMax >= 35) {
      risks.push({
        date, type: "drought", level: "warning",
        icon: "🏜️",
        title: "Dry & Hot — Irrigation Needed",
        desc: `Only ${rain.toFixed(1)} mm rain with ${tMax.toFixed(1)}°C on ${date}.`,
        action: "Irrigate in early morning. Apply mulch to conserve moisture.",
      });
    }
  }

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

// ── Controller ────────────────────────────────────────────────────────────────
exports.getWeatherForecast = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const la = Number(lat), lo = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(lo)) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    if (!OWM_KEY || OWM_KEY === "your_openweathermap_api_key_here") {
      return res.status(503).json({
        message: "OpenWeatherMap API key not configured. Add OPENWEATHER_API_KEY to backend/.env — get a free key at https://openweathermap.org/api",
      });
    }

    const units = "metric";
    const [currentRes, forecastRes] = await Promise.all([
      fetchJson(`${OWM_BASE}/weather?lat=${la}&lon=${lo}&units=${units}&appid=${OWM_KEY}`),
      fetchJson(`${OWM_BASE}/forecast?lat=${la}&lon=${lo}&units=${units}&cnt=40&appid=${OWM_KEY}`),
    ]);

    if (!currentRes.ok || !currentRes.data?.main) {
      const msg = currentRes.data?.message || "OpenWeatherMap request failed";
      console.error("OWM current error:", msg, "status:", currentRes.status);
      return res.status(502).json({ message: `Weather API error: ${msg}` });
    }
    if (!forecastRes.ok || !forecastRes.data?.list) {
      const msg = forecastRes.data?.message || "OpenWeatherMap forecast failed";
      console.error("OWM forecast error:", msg);
      return res.status(502).json({ message: `Weather forecast error: ${msg}` });
    }

    const owmCurrent  = currentRes.data;
    const owmForecast = forecastRes.data;

    // ── Normalise current → same shape as before ──────────────────────────
    const current = {
      temperature_2m:       owmCurrent.main.temp,
      relative_humidity_2m: owmCurrent.main.humidity,
      wind_speed_10m:       Math.round(owmCurrent.wind.speed * 3.6), // m/s → km/h
      weathercode:          owmIdToWmo(owmCurrent.weather?.[0]?.id),
      precipitation:        owmCurrent.rain?.["1h"] || 0,
      feels_like:           owmCurrent.main.feels_like,
      pressure:             owmCurrent.main.pressure,
      visibility:           owmCurrent.visibility ? Math.round(owmCurrent.visibility / 1000) : null,
      description:          owmCurrent.weather?.[0]?.description || "",
    };

    // ── Aggregate 3-hour slots into daily ─────────────────────────────────
    const dailyAgg = aggregateDays(owmForecast.list);

    // Add today's sunrise/sunset from current call
    const todayStr = new Date().toISOString().split("T")[0];
    if (dailyAgg[todayStr]) {
      dailyAgg[todayStr].sunrise = new Date(owmCurrent.sys.sunrise * 1000).toISOString();
      dailyAgg[todayStr].sunset  = new Date(owmCurrent.sys.sunset  * 1000).toISOString();
    }

    const dates = Object.keys(dailyAgg).sort();

    // ── Build daily arrays (same keys WeatherPage.jsx reads) ──────────────
    const daily = {
      time:                        dates,
      temperature_2m_max:          dates.map(d => Math.max(...dailyAgg[d].tempMaxs)),
      temperature_2m_min:          dates.map(d => Math.min(...dailyAgg[d].tempMins)),
      precipitation_sum:           dates.map(d => parseFloat(dailyAgg[d].rain.toFixed(1))),
      wind_speed_10m_max:          dates.map(d => parseFloat(Math.max(...dailyAgg[d].wind).toFixed(1))),
      uv_index_max:                dates.map(() => null), // OWM free tier doesn't include UV
      weathercode:                 dates.map(d => {
        // pick the most severe code of the day
        const codes = dailyAgg[d].codes;
        return codes.reduce((a, b) => b > a ? b : a, 0);
      }),
      sunrise: dates.map(d => dailyAgg[d].sunrise || null),
      sunset:  dates.map(d => dailyAgg[d].sunset  || null),
      precipitation_probability_max: dates.map(d => Math.max(...dailyAgg[d].pop)),
      humidity_max: dates.map(d => Math.max(...dailyAgg[d].humidity)),
    };

    // ── Hourly humidity (for risk computation compatibility) ──────────────
    const hourly = {
      relative_humidity_2m: owmForecast.list.map(s => s.main.humidity),
    };

    const risks = computeRisks(dailyAgg);

    res.json({
      current,
      daily,
      hourly,
      risks,
      location: { lat: la, lng: lo },
      source: "OpenWeatherMap",
    });

  } catch (err) {
    console.error("❌ weatherController error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
