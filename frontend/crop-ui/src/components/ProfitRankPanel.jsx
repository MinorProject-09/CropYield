/**
 * ProfitRankPanel.jsx
 * Displays top-4 crops ranked by estimated net profit.
 * Shows previous / current / projected profit, expenditure breakdown, ROI, and price trend.
 */
import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { getCropInfo } from "../data/cropInfo";
import { getProfitRank } from "../api/api";

const RANK_COLORS = [
  { bg: "bg-amber-50 dark:bg-amber-900/20",   border: "border-amber-300 dark:border-amber-700",  badge: "bg-amber-400 text-white",  label: "🥇" },
  { bg: "bg-slate-50 dark:bg-slate-700/30",   border: "border-slate-300 dark:border-slate-600",  badge: "bg-slate-400 text-white",  label: "🥈" },
  { bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-300 dark:border-orange-700",badge: "bg-orange-400 text-white", label: "🥉" },
  { bg: "bg-green-50 dark:bg-green-900/20",   border: "border-green-200 dark:border-green-700",  badge: "bg-green-500 text-white",  label: "4️⃣" },
];

function fmt(n) {
  if (n == null) return "—";
  return `₹${Math.abs(Math.round(n)).toLocaleString("en-IN")}`;
}

function ProfitBar({ prev, current, projected }) {
  const max = Math.max(Math.abs(prev), Math.abs(current), Math.abs(projected), 1);
  const bar = (val, color) => (
    <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${Math.min(100, (Math.abs(val) / max) * 100)}%` }}
      />
    </div>
  );
  return (
    <div className="space-y-1 mt-2">
      {bar(prev,      "bg-gray-400")}
      {bar(current,   "bg-green-500")}
      {bar(projected, "bg-blue-500")}
    </div>
  );
}

function CostBreakdown({ breakdown, total, t }) {
  const [open, setOpen] = useState(false);
  const items = Object.entries(breakdown || {});
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="text-xs text-green-700 dark:text-green-400 font-semibold flex items-center gap-1 hover:underline"
      >
        {t("Cost breakdown")} {open ? "▲" : "▼"}
      </button>
      {open && (
        <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
          {items.map(([k, v]) => (
            <div key={k} className="flex justify-between bg-white dark:bg-slate-700 rounded-lg px-2 py-1.5 border border-gray-100 dark:border-slate-600">
              <span className="text-gray-500 dark:text-slate-400 capitalize">{t(k)}</span>
              <span className="font-semibold text-gray-800 dark:text-slate-200">{fmt(v)}</span>
            </div>
          ))}
          <div className="col-span-2 flex justify-between bg-red-50 dark:bg-red-900/20 rounded-lg px-2 py-1.5 border border-red-100 dark:border-red-800">
            <span className="text-red-700 dark:text-red-400 font-semibold">{t("Total cost")}</span>
            <span className="font-bold text-red-700 dark:text-red-400">{fmt(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfitRankPanel({ mlInput, top3, farmSizeHa }) {
  const { t } = useLanguage();
  const [ranked, setRanked]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!mlInput || !top3?.length) return;

    // Build candidate list: top3 from ML + expand to include more crops from all classes
    const candidates = top3.map(c => ({ crop: c.crop, confidence: c.confidence }));

    setLoading(true);
    setError(null);

    getProfitRank({
      candidates,
      N:           mlInput.N,
      P:           mlInput.P,
      K:           mlInput.K,
      temperature: mlInput.temperature,
      humidity:    mlInput.humidity,
      ph:          mlInput.ph,
      rainfall:    mlInput.rainfall,
      farm_size_ha: farmSizeHa || mlInput.farm_size_ha || 1,
    })
      .then(({ data }) => setRanked(data.ranked || []))
      .catch(err => setError(err.response?.data?.message || err.message || "Failed to load profit ranking"))
      .finally(() => setLoading(false));
  }, [mlInput, top3, farmSizeHa]);

  if (!mlInput || !top3?.length) return null;

  return (
    <div className="rounded-2xl border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">📊</span>
        <p className="text-sm font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wide">
          {t("Profit Ranking — Top 4 Crops")}
        </p>
      </div>

      <p className="text-xs text-purple-600 dark:text-purple-400 leading-relaxed">
        {t("Ranked by net profit using current market prices, historical MSP trends, yield estimates, and input costs.")}
      </p>

      {/* Legend */}
      <div className="flex gap-3 text-xs flex-wrap">
        {[
          { color: "bg-gray-400",  label: t("Prev year") },
          { color: "bg-green-500", label: t("Current") },
          { color: "bg-blue-500",  label: t("Projected") },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
            <span className={`inline-block w-3 h-2 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 py-4 justify-center">
          <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          {t("Calculating profit analysis…")}
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 border border-red-200 dark:border-red-800">
          ⚠ {error}
        </div>
      )}

      {ranked && ranked.map((item, idx) => {
        const colors = RANK_COLORS[idx] || RANK_COLORS[3];
        const info   = getCropInfo(item.crop);
        const profitPositive = item.profit_current >= 0;

        return (
          <div key={item.crop} className={`rounded-xl border ${colors.border} ${colors.bg} p-4 space-y-2`}>
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{colors.label}</span>
                <img src={info?.image} alt={item.crop} className="w-5 h-5" />
                <span className="font-bold text-gray-900 dark:text-slate-100 capitalize text-sm">{item.crop}</span>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {Math.round(item.confidence * 100)}% {t("match")}
                </span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${profitPositive ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {profitPositive ? "+" : "-"}{fmt(item.profit_current)}
                </div>
                <div className="text-xs text-gray-400 dark:text-slate-500">{t("net profit")}</div>
              </div>
            </div>

            {/* Profit bars */}
            <ProfitBar prev={item.profit_prev} current={item.profit_current} projected={item.profit_projected} />

            {/* 3-column profit figures */}
            <div className="grid grid-cols-3 gap-1.5 text-xs text-center">
              <div className="bg-white/70 dark:bg-slate-700/50 rounded-lg p-2 border border-gray-100 dark:border-slate-600">
                <div className="text-gray-400 dark:text-slate-500 mb-0.5">{t("Prev year")}</div>
                <div className={`font-bold ${item.profit_prev >= 0 ? "text-gray-700 dark:text-slate-200" : "text-red-500"}`}>
                  {item.profit_prev >= 0 ? "+" : "-"}{fmt(item.profit_prev)}
                </div>
              </div>
              <div className="bg-white/70 dark:bg-slate-700/50 rounded-lg p-2 border border-green-200 dark:border-green-700">
                <div className="text-green-600 dark:text-green-400 mb-0.5 font-semibold">{t("Current")}</div>
                <div className={`font-bold ${profitPositive ? "text-green-700 dark:text-green-400" : "text-red-500"}`}>
                  {profitPositive ? "+" : "-"}{fmt(item.profit_current)}
                </div>
              </div>
              <div className="bg-white/70 dark:bg-slate-700/50 rounded-lg p-2 border border-blue-200 dark:border-blue-700">
                <div className="text-blue-600 dark:text-blue-400 mb-0.5">{t("Projected")}</div>
                <div className={`font-bold ${item.profit_projected >= 0 ? "text-blue-700 dark:text-blue-400" : "text-red-500"}`}>
                  {item.profit_projected >= 0 ? "+" : "-"}{fmt(item.profit_projected)}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-white/80 dark:bg-slate-700/60 rounded-lg px-2 py-1 border border-gray-100 dark:border-slate-600 text-gray-600 dark:text-slate-300">
                📈 {t("ROI")} <span className="font-bold text-green-700 dark:text-green-400">{item.roi_pct}%</span>
              </span>
              <span className="bg-white/80 dark:bg-slate-700/60 rounded-lg px-2 py-1 border border-gray-100 dark:border-slate-600 text-gray-600 dark:text-slate-300">
                📦 {item.yield_q_ha} {t("q/ha")}
              </span>
              <span className="bg-white/80 dark:bg-slate-700/60 rounded-lg px-2 py-1 border border-gray-100 dark:border-slate-600 text-gray-600 dark:text-slate-300">
                💹 MSP {item.price_trend_pct > 0 ? "+" : ""}{item.price_trend_pct}% {t("YoY")}
              </span>
              <span className="bg-white/80 dark:bg-slate-700/60 rounded-lg px-2 py-1 border border-gray-100 dark:border-slate-600 text-gray-600 dark:text-slate-300">
                📊 {t("CAGR")} {item.cagr_pct}%
              </span>
            </div>

            {/* Market price row */}
            <div className="grid grid-cols-3 gap-1.5 text-xs text-center">
              {[
                { label: t("Prev price"), val: item.market_price_prev },
                { label: t("Curr price"), val: item.market_price_current },
                { label: t("Proj price"), val: item.market_price_projected },
              ].map(({ label, val }) => (
                <div key={label} className="bg-white/60 dark:bg-slate-700/40 rounded-lg p-1.5 border border-gray-100 dark:border-slate-600">
                  <div className="text-gray-400 dark:text-slate-500">{label}</div>
                  <div className="font-semibold text-gray-700 dark:text-slate-200">₹{val?.toLocaleString("en-IN")}/q</div>
                </div>
              ))}
            </div>

            {/* Cost breakdown (collapsible) */}
            <CostBreakdown breakdown={item.cost_breakdown} total={item.total_cost} t={t} />
          </div>
        );
      })}

      <p className="text-xs text-gray-400 dark:text-slate-500 leading-relaxed pt-1">
        * {t("Profit estimates use MSP-based market prices with regional premium factors. Actual profits depend on local market conditions, farming practices, and weather.")}
      </p>
    </div>
  );
}
