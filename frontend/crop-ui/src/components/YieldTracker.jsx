/**
 * YieldTracker.jsx
 * Lets farmers log their actual harvest and compare to the prediction.
 * Shows accuracy over time in the dashboard.
 */
import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import api from "../api/api";

export default function YieldTracker({ prediction, onUpdated }) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [actualYield, setActualYield] = useState(prediction.actualYieldQ ?? "");
  const [notes, setNotes] = useState(prediction.harvestNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const predicted = prediction.totalYieldQ ?? prediction.yieldQHa;
  const actual = prediction.actualYieldQ;
  const diff = actual != null && predicted != null
    ? Math.round(((actual - predicted) / predicted) * 100)
    : null;

  async function save() {
    if (!actualYield || isNaN(Number(actualYield))) {
      setError(t("Enter a valid yield number"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.put(`/api/ml/prediction/${prediction._id}/harvest`, {
        actualYieldQ: Number(actualYield),
        harvestNotes: notes,
      });
      setEditing(false);
      onUpdated?.({ ...prediction, actualYieldQ: Number(actualYield), harvestNotes: notes });
    } catch (err) {
      setError(err.response?.data?.message || t("Failed to save"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
      {!editing ? (
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-slate-400">
            {actual != null ? (
              <span className="flex items-center gap-2">
                <span>🌾 {t("Actual harvest")}: <strong className="text-gray-800 dark:text-slate-200">{actual} q</strong></span>
                {diff !== null && (
                  <span className={`font-semibold ${diff >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                    ({diff >= 0 ? "+" : ""}{diff}% {t("vs prediction")})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-gray-400 dark:text-slate-500 italic">{t("Harvest not logged yet")}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            {actual != null ? t("Edit") : t("Log Harvest")} ✏️
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              value={actualYield}
              onChange={e => setActualYield(e.target.value)}
              placeholder={t("Actual yield (quintals)")}
              className="flex-1 text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:border-green-500"
            />
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="text-xs bg-green-700 hover:bg-green-800 text-white font-semibold px-3 py-2 rounded-lg transition disabled:opacity-60"
            >
              {saving ? "…" : t("Save")}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setError(""); }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-slate-400 px-2"
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={t("Notes (optional): weather issues, pest damage, etc.")}
            className="w-full text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:border-green-500"
          />
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
