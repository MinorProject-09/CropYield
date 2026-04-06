/**
 * PestAlertCard.jsx
 * Shows pest and disease alerts for the recommended crop
 * based on the current month.
 */
import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { PEST_ALERTS } from "../data/cropAdvisory";

const SEVERITY_STYLE = {
  high:   { bg: "bg-red-50 dark:bg-red-900/20",    border: "border-red-200 dark:border-red-800",    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",    icon: "🔴" },
  medium: { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", icon: "🟡" },
  low:    { bg: "bg-blue-50 dark:bg-blue-900/20",   border: "border-blue-200 dark:border-blue-800",   badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",   icon: "🔵" },
};

export default function PestAlertCard({ crop, cropMonth }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(null);

  const alerts = PEST_ALERTS[crop?.toLowerCase()] || [];
  const month = Number(cropMonth) || new Date().getMonth() + 1;

  // Filter to alerts relevant to this month (±1 month window)
  const relevant = alerts.filter(a =>
    a.months.some(m => Math.abs(m - month) <= 1 || Math.abs(m - month) >= 11)
  );

  if (alerts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-800 p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐛</span>
          <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm uppercase tracking-wide">{t("Pest & Disease Alerts")}</h3>
        </div>
        {relevant.length > 0 && (
          <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 font-semibold px-2 py-0.5 rounded-full">
            {relevant.length} {t("active")}
          </span>
        )}
      </div>

      {relevant.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-slate-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl px-3 py-2">
          ✅ {t("No major pest or disease threats expected this month for")} {crop}.
        </p>
      ) : (
        <div className="space-y-2">
          {relevant.map((alert, i) => {
            const style = SEVERITY_STYLE[alert.severity] || SEVERITY_STYLE.low;
            const isOpen = expanded === i;
            return (
              <div key={i} className={`rounded-xl border ${style.border} ${style.bg} overflow-hidden`}>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span>{style.icon}</span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">{t(alert.name)}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${style.badge}`}>
                      {t(alert.type === "pest" ? "Pest" : "Disease")}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs">{isOpen ? "▲" : "▼"}</span>
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 space-y-2 text-xs">
                    <div className="bg-white/60 dark:bg-slate-700/40 rounded-lg p-2">
                      <span className="font-semibold text-gray-700 dark:text-slate-300">🔍 {t("Signs")}: </span>
                      <span className="text-gray-600 dark:text-slate-400">{t(alert.sign)}</span>
                    </div>
                    <div className="bg-white/60 dark:bg-slate-700/40 rounded-lg p-2">
                      <span className="font-semibold text-gray-700 dark:text-slate-300">💊 {t("Action")}: </span>
                      <span className="text-gray-600 dark:text-slate-400">{t(alert.action)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* All alerts (not just current month) */}
      {alerts.length > relevant.length && (
        <p className="text-xs text-gray-400 dark:text-slate-500">
          +{alerts.length - relevant.length} {t("more alerts in other months — check the full calendar.")}
        </p>
      )}
    </div>
  );
}
