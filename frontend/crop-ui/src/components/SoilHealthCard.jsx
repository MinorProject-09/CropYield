/**
 * SoilHealthCard.jsx
 * Shows soil health score, NPK status bars, pH status,
 * fertilizer recommendations, and crop rotation advice.
 */
import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { getSoilHealthScore, getFertilizerAdvice, CROP_ROTATION } from "../data/cropAdvisory";

function NutrientBar({ label, value, low, high, unit = "kg/ha" }) {
  const pct = Math.min(100, Math.max(0, (value / (high * 1.5)) * 100));
  const status = value < low ? "low" : value > high ? "high" : "good";
  const colors = { low: "bg-red-400", good: "bg-green-500", high: "bg-amber-400" };
  const textColors = { low: "text-red-600 dark:text-red-400", good: "text-green-700 dark:text-green-400", high: "text-amber-600 dark:text-amber-400" };
  const labels = { low: "Low", good: "Good", high: "High" };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-gray-700 dark:text-slate-300">{label}</span>
        <span className={`font-bold ${textColors[status]}`}>{value} {unit} — {labels[status]}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${colors[status]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SoilHealthCard({ N, P, K, ph, crop }) {
  const { t } = useLanguage();
  const [showFertilizer, setShowFertilizer] = useState(false);
  const [showRotation, setShowRotation] = useState(false);

  const health = getSoilHealthScore(N, P, K, ph);
  const fertilizer = getFertilizerAdvice(crop, N, P, K, ph);
  const rotation = CROP_ROTATION[crop?.toLowerCase()];

  const scoreColor = health.color === "green" ? "text-green-700 dark:text-green-400"
                   : health.color === "amber"  ? "text-amber-600 dark:text-amber-400"
                   : "text-red-600 dark:text-red-400";
  const ringColor  = health.color === "green" ? "stroke-green-500"
                   : health.color === "amber"  ? "stroke-amber-400"
                   : "stroke-red-400";

  const circumference = 2 * Math.PI * 28;
  const dash = (health.score / 100) * circumference;

  return (
    <div className="rounded-2xl border border-green-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg">🧪</span>
        <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm uppercase tracking-wide">{t("Soil Health Report")}</h3>
      </div>

      {/* Score ring + nutrient bars */}
      <div className="flex items-center gap-5">
        {/* Circular score */}
        <div className="relative flex-shrink-0 w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="6" />
            <circle cx="32" cy="32" r="28" fill="none" className={ringColor} strokeWidth="6"
              strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-base font-bold ${scoreColor}`}>{health.score}</span>
            <span className="text-xs text-gray-400">/100</span>
          </div>
        </div>

        {/* Nutrient bars */}
        <div className="flex-1 space-y-2">
          <NutrientBar label="N" value={N} low={100} high={200} />
          <NutrientBar label="P" value={P} low={20}  high={60}  />
          <NutrientBar label="K" value={K} low={40}  high={120} />
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-gray-700 dark:text-slate-300">pH</span>
            <span className={`font-bold ${ph >= 6.0 && ph <= 7.5 ? "text-green-700 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
              {ph} — {ph >= 6.0 && ph <= 7.5 ? "Ideal" : ph < 6.0 ? "Acidic" : "Alkaline"}
            </span>
          </div>
        </div>
      </div>

      {/* Issues */}
      {health.issues.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {health.issues.map(issue => (
            <span key={issue} className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-full">
              ⚠ {t(issue)}
            </span>
          ))}
        </div>
      )}

      {/* Fertilizer advice toggle */}
      {fertilizer.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowFertilizer(v => !v)}
            className="w-full flex items-center justify-between text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl px-3 py-2 hover:bg-green-100 dark:hover:bg-green-900/40 transition"
          >
            <span>🌿 {t("Fertilizer Recommendations")} ({fertilizer.length})</span>
            <span>{showFertilizer ? "▲" : "▼"}</span>
          </button>
          {showFertilizer && (
            <div className="mt-2 space-y-2">
              {fertilizer.map((f, i) => (
                <div key={i} className={`rounded-xl p-3 text-xs border ${
                  f.urgency === "high"   ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" :
                  f.urgency === "medium" ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" :
                  "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                }`}>
                  <div className="font-semibold text-gray-800 dark:text-slate-200 mb-1">{f.icon} {t(f.issue)}</div>
                  <div className="text-gray-600 dark:text-slate-400 leading-relaxed">{t(f.fix)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Crop rotation */}
      {rotation && (
        <div>
          <button
            type="button"
            onClick={() => setShowRotation(v => !v)}
            className="w-full flex items-center justify-between text-xs font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl px-3 py-2 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition"
          >
            <span>🔄 {t("Crop Rotation Advice")}</span>
            <span>{showRotation ? "▲" : "▼"}</span>
          </button>
          {showRotation && (
            <div className="mt-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-3 text-xs space-y-2">
              <p className="text-gray-600 dark:text-slate-400">{t(rotation.reason)}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-purple-700 dark:text-purple-400 font-semibold">{t("Grow next")}:</span>
                {rotation.next.map(c => (
                  <span key={c} className="bg-white dark:bg-slate-700 border border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full capitalize">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
