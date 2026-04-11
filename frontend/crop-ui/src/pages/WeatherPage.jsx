/**
 * WeatherPage.jsx
 * Hyperlocal 7-day agricultural weather forecast with risk alerts.
 * Uses Open-Meteo free API via backend proxy.
 */
import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getWeatherForecast } from "../api/api";

// ── WMO weather code → icon + label ──────────────────────────────────────────
function wmoInfo(code) {
  if (code == null) return { icon: "🌤", label: "Unknown" };
  if (code === 0)              return { icon: "☀️",  label: "Clear sky" };
  if (code <= 2)               return { icon: "🌤",  label: "Partly cloudy" };
  if (code === 3)              return { icon: "☁️",  label: "Overcast" };
  if (code <= 49)              return { icon: "🌫",  label: "Fog" };
  if (code <= 59)              return { icon: "🌦",  label: "Drizzle" };
  if (code <= 69)              return { icon: "🌧",  label: "Rain" };
  if (code <= 79)              return { icon: "🌨",  label: "Snow" };
  if (code <= 84)              return { icon: "🌦",  label: "Rain showers" };
  if (code <= 94)              return { icon: "⛈",  label: "Thunderstorm" };
  return { icon: "⛈",  label: "Severe storm" };
}

// ── Day card ──────────────────────────────────────────────────────────────────
function DayCard({ date, tMax, tMin, rain, rainProb, wind, code, isToday, t }) {
  const { icon, label } = wmoInfo(code);
  const dayName = isToday ? t("Today") : new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const rainRisk = rain >= 50 ? "text-red-600 dark:text-red-400" : rain >= 20 ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400";
  const safeToSpray = (rain ?? 99) < 2 && (wind ?? 99) < 15 && (tMax ?? 99) < 38;

  return (
    <div className={`rounded-2xl border p-4 flex flex-col items-center gap-2 text-center transition ${
      isToday
        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 shadow-md"
        : "bg-white dark:bg-slate-800/80 border-gray-100 dark:border-slate-700/60 hover:border-emerald-200 dark:hover:border-emerald-700"
    }`}>
      <div className="text-xs font-semibold text-gray-500 dark:text-slate-400">{dayName}</div>
      <div className="text-4xl">{icon}</div>
      <div className="text-xs text-gray-500 dark:text-slate-400">{t(label)}</div>
      <div className="flex items-center gap-1.5 text-sm font-bold">
        <span className="text-red-500">{tMax != null ? `${Math.round(tMax)}°` : "—"}</span>
        <span className="text-gray-300 dark:text-slate-600">/</span>
        <span className="text-blue-500">{tMin != null ? `${Math.round(tMin)}°` : "—"}</span>
      </div>
      <div className={`text-xs font-semibold ${rainRisk}`}>
        🌧 {rain != null ? `${rain} mm` : "—"}
        {rainProb != null && <span className="text-gray-400 dark:text-slate-500 font-normal"> ({rainProb}%)</span>}
      </div>
      <div className="text-xs text-gray-400 dark:text-slate-500">💨 {wind != null ? `${Math.round(wind)} km/h` : "—"}</div>
      {/* Spray window badge */}
      {safeToSpray ? (
        <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
          🌿 Safe to Spray
        </span>
      ) : (
        <span className="text-xs font-semibold bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 px-2 py-0.5 rounded-full">
          ✗ Avoid Spray
        </span>
      )}
    </div>
  );
}

// ── Risk alert card ───────────────────────────────────────────────────────────
function RiskCard({ risk, t }) {
  const [open, setOpen] = useState(false);
  const isCrit = risk.level === "critical";
  return (
    <div className={`rounded-xl border overflow-hidden ${
      isCrit
        ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
        : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700"
    }`}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-3 p-4 text-left">
        <span className="text-xl flex-shrink-0">{risk.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isCrit ? "bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-300" : "bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300"
            }`}>
              {isCrit ? "🔴 Critical" : "🟡 Warning"}
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-500">{risk.date}</span>
          </div>
          <p className={`font-semibold text-sm mt-1 ${isCrit ? "text-red-800 dark:text-red-300" : "text-amber-800 dark:text-amber-300"}`}>
            {t(risk.title)}
          </p>
          <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">{t(risk.desc)}</p>
        </div>
        <span className="text-gray-400 flex-shrink-0 text-xs mt-1">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-slate-700 pt-3">
          <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">💊 {t("Recommended Action")}:</p>
          <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{t(risk.action)}</p>
        </div>
      )}
    </div>
  );
}

// ── Current conditions strip ──────────────────────────────────────────────────
function CurrentStrip({ current, t }) {
  if (!current) return null;
  const { icon } = wmoInfo(current.weathercode);
  return (
    <div className="space-y-3">
      {current.description && (
        <p className="text-sm text-gray-600 dark:text-slate-400 capitalize">
          {icon} {current.description}
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "🌡️", label: t("Temperature"),  value: `${current.temperature_2m}°C${current.feels_like != null ? ` (feels ${current.feels_like.toFixed(1)}°)` : ""}` },
          { icon: "💦",  label: t("Humidity"),     value: `${current.relative_humidity_2m}%` },
          { icon: "💨",  label: t("Wind"),         value: `${current.wind_speed_10m} km/h` },
          { icon: "🌧",  label: t("Rain (1h)"),    value: `${current.precipitation ?? 0} mm` },
          ...(current.pressure ? [{ icon: "🔵", label: t("Pressure"), value: `${current.pressure} hPa` }] : []),
          ...(current.visibility != null ? [{ icon: "👁", label: t("Visibility"), value: `${current.visibility} km` }] : []),
        ].map(({ icon: ic, label, value }) => (
          <div key={label} className="card rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">{ic}</span>
            <div>
              <div className="text-xs text-gray-400 dark:text-slate-500">{label}</div>
              <div className="font-bold text-gray-900 dark:text-slate-100 text-sm">{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Location picker ───────────────────────────────────────────────────────────
function LocationPicker({ onLocate, loading, t }) {
  const [manual, setManual] = useState({ lat: "", lng: "" });
  return (
    <div className="card rounded-2xl p-5  space-y-4">
      <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm uppercase tracking-wide">
        📍 {t("Set Your Farm Location")}
      </h3>
      <button
        type="button"
        onClick={() => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition(
            pos => onLocate(pos.coords.latitude, pos.coords.longitude),
            () => alert("Location access denied. Enter coordinates manually.")
          );
        }}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 btn-primary py-2.5 rounded-xl text-sm transition disabled:opacity-60"
      >
        {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{t("Detecting…")}</> : `📡 ${t("Use My Current Location")}`}
      </button>
      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
        <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
        {t("or enter manually")}
        <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
      </div>
      <div className="flex gap-2">
        <input type="number" step="any" value={manual.lat} onChange={e => setManual(m => ({ ...m, lat: e.target.value }))}
          placeholder={t("Latitude")}
          className="flex-1 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:border-emerald-500" />
        <input type="number" step="any" value={manual.lng} onChange={e => setManual(m => ({ ...m, lng: e.target.value }))}
          placeholder={t("Longitude")}
          className="flex-1 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:border-emerald-500" />
        <button
          type="button"
          onClick={() => { if (manual.lat && manual.lng) onLocate(Number(manual.lat), Number(manual.lng)); }}
          className="btn-primary px-4 py-2 rounded-xl text-sm transition"
        >
          {t("Go")}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WeatherPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [weather,  setWeather]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [coords,   setCoords]   = useState(null);
  const [locName,  setLocName]  = useState("");

  const fetchWeather = useCallback(async (lat, lng) => {
    setLoading(true); setError(null);
    try {
      const res = await getWeatherForecast(lat, lng);
      setWeather(res.data);
      setCoords({ lat, lng });
      // Reverse geocode for display name
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then(r => r.json())
        .then(d => setLocName(d.address?.village || d.address?.town || d.address?.city || d.address?.county || ""))
        .catch(() => {});
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-detect on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => {} // silent fail — show location picker
    );
  }, [fetchWeather]);

  const daily  = weather?.daily;
  const risks  = weather?.risks || [];
  const criticalRisks = risks.filter(r => r.level === "critical");
  const warningRisks  = risks.filter(r => r.level === "warning");

  return (
    <div className="min-h-screen bg-page font-[Outfit,system-ui,sans-serif]">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1e3a5f] via-[#1d4ed8] to-[#2563eb] text-white px-6 py-10">
        <div className="max-w-5xl mx-auto flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-2">🌤 {t("Weather & Risk")}</p>
            <h1 className="text-2xl md:text-3xl font-bold">{t("7-Day Farm Forecast")}</h1>
            <p className="text-blue-200/80 text-sm mt-1.5">
              {t("Accurate 5-day forecast with frost, flood, pest, and disease risk alerts.")}
            </p>
            {locName && coords && (
              <p className="text-blue-300/70 text-xs mt-2">
                📍 {locName} · {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
              </p>
            )}
          </div>
          {risks.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {criticalRisks.length > 0 && (
                <span className="bg-red-500/20 border border-red-400/40 text-red-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                  🔴 {criticalRisks.length} {t("Critical")}
                </span>
              )}
              {warningRisks.length > 0 && (
                <span className="bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                  🟡 {warningRisks.length} {t("Warnings")}
                </span>
              )}
            </div>
          )}
          {risks.length === 0 && weather && (
            <span className="bg-green-500/20 border border-green-400/40 text-green-200 text-xs font-semibold px-3 py-1.5 rounded-full">
              ✅ {t("No risks this week")}
            </span>
          )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 space-y-8">

        {/* Location picker */}
        {!weather && !loading && (
          <LocationPicker onLocate={fetchWeather} loading={loading} t={t} />
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-20 text-emerald-700 dark:text-emerald-400">
            <span className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-base font-medium">{t("Fetching hyperlocal forecast…")}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-5 text-red-700 dark:text-red-400 text-sm">
            ⚠ {error}
            <button onClick={() => coords && fetchWeather(coords.lat, coords.lng)}
              className="ml-3 underline text-xs">{t("Retry")}</button>
          </div>
        )}

        {weather && (
          <>
            {/* Current conditions */}
            <div>
              <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-3">
                ⚡ {t("Current Conditions")}
              </h2>
              <CurrentStrip current={weather.current} t={t} />
            </div>

            {/* Risk alerts — shown prominently */}
            {risks.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {t("Agricultural Risk Alerts")} ({risks.length})
                </h2>
                <div className="space-y-3">
                  {risks.map((r, i) => <RiskCard key={i} risk={r} t={t} />)}
                </div>
              </div>
            )}

            {/* All clear */}
            {risks.length === 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-5 flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300">{t("No agricultural risks this week")}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                    {t("Weather conditions are favourable for farming. Good time to sow, spray, or harvest.")}
                  </p>
                </div>
              </div>
            )}

            {/* 7-day forecast grid */}
            <div>
              <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-3">
                📅 {t("5-Day Forecast")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {daily?.time?.map((date, i) => (
                  <DayCard
                    key={date}
                    date={date}
                    tMax={daily.temperature_2m_max?.[i]}
                    tMin={daily.temperature_2m_min?.[i]}
                    rain={daily.precipitation_sum?.[i]}
                    rainProb={daily.precipitation_probability_max?.[i]}
                    wind={daily.wind_speed_10m_max?.[i]}
                    code={daily.weathercode?.[i]}
                    isToday={i === 0}
                    t={t}
                  />
                ))}
              </div>
            </div>

            {/* Spray window summary */}
            {daily?.time && (() => {
              const safedays = daily.time.filter((_, i) =>
                (daily.precipitation_sum?.[i] ?? 99) < 2 &&
                (daily.wind_speed_10m_max?.[i] ?? 99) < 15 &&
                (daily.temperature_2m_max?.[i] ?? 99) < 38
              );
              return (
                <div className={`rounded-2xl border p-4 flex items-start gap-3 ${
                  safedays.length > 0
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50"
                    : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50"
                }`}>
                  <span className="text-2xl flex-shrink-0">{safedays.length > 0 ? "🌿" : "⚠️"}</span>
                  <div>
                    <p className={`font-bold text-sm ${safedays.length > 0 ? "text-emerald-800 dark:text-emerald-300" : "text-amber-800 dark:text-amber-300"}`}>
                      {safedays.length > 0
                        ? `${safedays.length} safe day${safedays.length > 1 ? "s" : ""} for spraying this week`
                        : "No ideal spray days this week"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Conditions: rain &lt; 2mm · wind &lt; 15 km/h · temp &lt; 38°C
                      {safedays.length > 0 && (
                        <span className="ml-1 font-medium text-emerald-700 dark:text-emerald-400">
                          — {safedays.map(d => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })).join(", ")}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Sunrise/sunset */}
            {daily?.sunrise && (
              <div className="card rounded-2xl p-5 ">
                <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-3">
                  🌅 {t("Sunrise & Sunset")}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs text-center">
                  {daily.time?.map((date, i) => (
                    <div key={date} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-2.5">
                      <div className="text-gray-400 dark:text-slate-500 mb-1">
                        {new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" })}
                      </div>
                      <div className="text-amber-500 font-semibold">
                        🌅 {daily.sunrise?.[i]?.split("T")[1]?.slice(0, 5) || "—"}
                      </div>
                      <div className="text-indigo-500 font-semibold mt-0.5">
                        🌇 {daily.sunset?.[i]?.split("T")[1]?.slice(0, 5) || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Farming advisory based on forecast */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-5">
              <h3 className="font-bold text-green-800 dark:text-green-300 text-sm mb-3">
                🌾 {t("This Week's Farming Advisory")}
              </h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-slate-300">
                {(() => {
                  const tips = [];
                  const totalRain = daily?.precipitation_sum?.reduce((s, v) => s + (v || 0), 0) || 0;
                  const maxTemp   = Math.max(...(daily?.temperature_2m_max?.filter(Boolean) || [0]));
                  const minTemp   = Math.min(...(daily?.temperature_2m_min?.filter(Boolean) || [99]));
                  const rainyDays = daily?.precipitation_sum?.filter(v => v >= 5).length || 0;

                  if (totalRain > 100) tips.push({ icon: "🌧", text: t(`Heavy week (${Math.round(totalRain)} mm total). Avoid sowing. Ensure drainage. Delay pesticide spraying.`) });
                  else if (totalRain < 10) tips.push({ icon: "💧", text: t(`Dry week (${Math.round(totalRain)} mm total). Irrigate every 2–3 days. Apply mulch to conserve moisture.`) });
                  else tips.push({ icon: "✅", text: t(`Moderate rainfall (${Math.round(totalRain)} mm). Good conditions for most field operations.`) });

                  if (maxTemp >= 40) tips.push({ icon: "🔥", text: t("Extreme heat expected. Irrigate in early morning. Avoid midday field work.") });
                  if (minTemp <= 5)  tips.push({ icon: "🥶", text: t("Cold nights ahead. Protect sensitive crops with mulch or covers.") });
                  if (rainyDays >= 4) tips.push({ icon: "🍄", text: t("Multiple rainy days — high fungal disease risk. Scout fields daily and apply preventive fungicide.") });

                  const sprayDays = daily?.time?.filter((_, i) =>
                    (daily.precipitation_sum?.[i] || 0) < 2 &&
                    (daily.wind_speed_10m_max?.[i] || 0) < 20
                  ).length || 0;
                  if (sprayDays > 0) tips.push({ icon: "🌿", text: t(`${sprayDays} good day(s) for pesticide/fertilizer spraying this week (low rain, low wind).`) });

                  return tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="flex-shrink-0">{tip.icon}</span>
                      <span>{tip.text}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Change location */}
            <details className="card rounded-2xl  overflow-hidden">
              <summary className="px-5 py-3 cursor-pointer text-sm font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200">
                📍 {t("Change Location")}
              </summary>
              <div className="px-5 pb-5">
                <LocationPicker onLocate={fetchWeather} loading={loading} t={t} />
              </div>
            </details>

            <p className="text-xs text-gray-400 dark:text-slate-500">
              * {t("Forecast data from OpenWeatherMap (openweathermap.org). Updated every 3 hours. Agricultural risk thresholds based on ICAR guidelines.")}
            </p>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
