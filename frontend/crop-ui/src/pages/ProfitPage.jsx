import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext";
import { getCropInfo } from "../data/cropInfo";
import { getProfitRank } from "../api/api";

/* ── helpers ─────────────────────────────────────────────────────────────── */
const RANK_MEDAL = ["🥇", "🥈", "🥉", "4️⃣"];
const RANK_BG    = [
  "bg-amber-50  dark:bg-amber-900/20  border-amber-200  dark:border-amber-700",
  "bg-slate-50  dark:bg-slate-800/60  border-slate-200  dark:border-slate-600",
  "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700",
  "bg-green-50  dark:bg-green-900/20  border-green-200  dark:border-green-700",
];

function inr(n) {
  if (n == null || isNaN(n)) return "—";
  const abs = Math.abs(Math.round(n));
  return (n < 0 ? "−" : "") + "₹" + abs.toLocaleString("en-IN");
}

function ProfitBadge({ value }) {
  const pos = value >= 0;
  return (
    <span className={`font-bold text-sm ${pos ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
      {pos ? "▲ " : "▼ "}{inr(value)}
    </span>
  );
}

function TrendArrow({ pct }) {
  if (pct == null) return <span className="text-gray-400">—</span>;
  const pos = pct >= 0;
  return (
    <span className={`text-xs font-semibold ${pos ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
      {pos ? "▲" : "▼"} {Math.abs(pct)}%
    </span>
  );
}

/* ── Main table row ──────────────────────────────────────────────────────── */
function CropRow({ item, rank, t, onLearnMore }) {
  const [showCost, setShowCost] = useState(false);
  const info = getCropInfo(item.crop);
  const bgCls = RANK_BG[rank] || RANK_BG[3];

  return (
    <>
      {/* Main row */}
      <tr className={`border-b border-gray-100 dark:border-slate-700 ${bgCls} transition`}>
        {/* Rank */}
        <td className="px-3 py-4 text-center text-xl font-bold whitespace-nowrap">
          {RANK_MEDAL[rank]}
        </td>

        {/* Crop name */}
        <td className="px-3 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{info?.emoji || "🌾"}</span>
            <div>
              <div className="font-bold text-gray-900 dark:text-slate-100 capitalize text-sm">{item.crop}</div>
              <div className="text-xs text-gray-400 dark:text-slate-500">{info?.season || "—"}</div>
            </div>
          </div>
        </td>

        {/* Yield */}
        <td className="px-3 py-4 text-center">
          <div className="font-semibold text-gray-800 dark:text-slate-200 text-sm">{item.yield_q_ha}</div>
          <div className="text-xs text-gray-400">{t("q/ha")}</div>
        </td>

        {/* Total expenditure */}
        <td className="px-3 py-4 text-center">
          <div className="font-semibold text-red-600 dark:text-red-400 text-sm">{inr(item.total_cost)}</div>
          <button
            type="button"
            onClick={() => setShowCost(v => !v)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-0.5"
          >
            {showCost ? t("Hide") : t("Details")} {showCost ? "▲" : "▼"}
          </button>
        </td>

        {/* Prev year profit */}
        <td className="px-3 py-4 text-center">
          <ProfitBadge value={item.profit_prev} />
          <div className="text-xs text-gray-400 mt-0.5">{t("Last year")}</div>
        </td>

        {/* Current profit */}
        <td className="px-3 py-4 text-center">
          <ProfitBadge value={item.profit_current} />
          <div className="text-xs text-gray-400 mt-0.5">{t("This year")}</div>
        </td>

        {/* Projected profit */}
        <td className="px-3 py-4 text-center">
          <ProfitBadge value={item.profit_projected} />
          <div className="text-xs text-gray-400 mt-0.5">{t("Next year")}</div>
        </td>

        {/* ROI */}
        <td className="px-3 py-4 text-center">
          <div className={`font-bold text-sm ${item.roi_pct >= 0 ? "text-green-700 dark:text-green-400" : "text-red-500"}`}>
            {item.roi_pct}%
          </div>
          <div className="text-xs text-gray-400">{t("Return")}</div>
        </td>

        {/* MSP trend */}
        <td className="px-3 py-4 text-center">
          <TrendArrow pct={item.price_trend_pct} />
          <div className="text-xs text-gray-400 mt-0.5">{t("Price trend")}</div>
        </td>

        {/* Learn More (placeholder for docs) */}
        <td className="px-3 py-4 text-center">
          <button
            type="button"
            onClick={() => onLearnMore(item)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 px-3 py-1.5 rounded-lg transition"
          >
            📖 {t("Guide")}
          </button>
        </td>
      </tr>

      {/* Cost breakdown sub-row */}
      {showCost && (
        <tr className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
          <td colSpan={10} className="px-6 py-3">
            <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              💸 {t("Expenditure breakdown for")} {item.crop} ({item.farm_size_ha} {t("ha")})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {Object.entries(item.cost_breakdown || {}).map(([k, v]) => (
                <div key={k} className="bg-gray-50 dark:bg-slate-700 rounded-lg px-3 py-2 border border-gray-100 dark:border-slate-600 text-center">
                  <div className="text-gray-400 dark:text-slate-500 capitalize text-xs">{t(k)}</div>
                  <div className="font-bold text-gray-800 dark:text-slate-200 text-sm mt-0.5">{inr(v)}</div>
                </div>
              ))}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 border border-red-200 dark:border-red-800 text-center">
                <div className="text-red-500 dark:text-red-400 text-xs font-semibold">{t("Total")}</div>
                <div className="font-bold text-red-700 dark:text-red-400 text-sm mt-0.5">{inr(item.total_cost)}</div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Guide modal (placeholder for future docs) ───────────────────────────── */
function GuideModal({ item, onClose, t }) {
  if (!item) return null;
  const info = getCropInfo(item.crop);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{info?.emoji || "🌾"}</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 capitalize">{item.crop}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-xl">✕</button>
        </div>

        {info && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { label: t("Season"),   value: info.season },
              { label: t("Water"),    value: info.water },
              { label: t("Ideal pH"), value: info.ph },
              { label: t("Duration"), value: `${info.days} ${t("days")}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2.5 border border-gray-100 dark:border-slate-600">
                <div className="text-xs text-gray-400 dark:text-slate-500">{label}</div>
                <div className="font-semibold text-gray-800 dark:text-slate-200 mt-0.5">{value}</div>
              </div>
            ))}
          </div>
        )}

        {info?.tip && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-200 dark:border-green-700 text-sm text-gray-700 dark:text-slate-300">
            💡 {info.tip}
          </div>
        )}

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-700 text-xs text-amber-700 dark:text-amber-400">
          📄 {t("Full farming guide — coming soon. This section will include step-by-step sowing, irrigation, pest control, and harvesting instructions.")}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-xl transition text-sm"
        >
          {t("Close")}
        </button>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function ProfitPage() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Data passed from PredictionPage or Dashboard history via router state
  const { mlInput, top3, farmSizeHa, recommendedCrop, fromHistory, predictionDate } = location.state || {};

  const [ranked,  setRanked]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [guide,   setGuide]   = useState(null);  // item for guide modal

  useEffect(() => {
    if (!mlInput || !top3?.length) return;

    setLoading(true);
    setError(null);

    getProfitRank({
      candidates:  top3.map(c => ({ crop: c.crop, confidence: c.confidence })),
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
      .catch(err => setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Failed"))
      .finally(() => setLoading(false));
  }, [mlInput, top3, farmSizeHa]);

  // No data passed — show a friendly message
  if (!mlInput) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-[Outfit,system-ui,sans-serif]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <p className="text-5xl mb-4">📊</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">{t("No prediction data found")}</h1>
          <p className="text-gray-500 dark:text-slate-400 mb-6">{t("Run a crop prediction first, then click the Profit Analysis button.")}</p>
          <Link to="/prediction">
            <button className="bg-green-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-800 transition">
              {t("Go to Prediction →")}
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-[Outfit,system-ui,sans-serif]">
      <Navbar />

      {guide && <GuideModal item={guide} onClose={() => setGuide(null)} t={t} />}

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-800 to-green-700 text-white px-6 py-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-green-300 text-sm mb-1">📊 {t("Profit Analysis")}</p>
            <h1 className="text-2xl md:text-3xl font-bold">{t("Which crop earns you the most?")}</h1>
            <p className="text-green-200 text-sm mt-1">
              {t("Top 3 crops ranked by net profit — based on your soil, location, and market prices.")}
            </p>
            {recommendedCrop && (
              <p className="text-green-300 text-xs mt-2">
                🌾 {t("AI recommended")}: <span className="font-bold text-white capitalize">{recommendedCrop}</span>
                {fromHistory && predictionDate && (
                  <span className="ml-2 text-green-400">
                    · {new Date(predictionDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(fromHistory ? "/dashboard" : -1)}
            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
          >
            ← {t(fromHistory ? "Back to Dashboard" : "Back to Prediction")}
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6">

        {/* Info banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4 mb-6 flex gap-3 items-start">
          <span className="text-xl flex-shrink-0">ℹ️</span>
          <div className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
            <strong>{t("How to read this table:")}</strong>{" "}
            {t("Each row is one crop. 'Expenditure' is what you spend to grow it. 'Profit' is what you earn after spending. Green means profit, red means loss. 'Return %' shows how much you earn for every ₹100 spent.")}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-20 text-green-700 dark:text-green-400">
            <span className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-base font-medium">{t("Calculating profit for all crops…")}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-5 text-red-700 dark:text-red-400 text-sm">
            ⚠ {error}
          </div>
        )}

        {ranked && (
          <>
            {/* ── Mobile cards (shown on small screens) ── */}
            <div className="md:hidden space-y-4">
              {ranked.map((item, idx) => {
                const info = getCropInfo(item.crop);
                return (
                  <div key={item.crop} className={`rounded-2xl border p-5 space-y-3 ${RANK_BG[idx] || RANK_BG[3]}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{RANK_MEDAL[idx]}</span>
                        <span className="text-xl">{info?.emoji || "🌾"}</span>
                        <span className="font-bold text-gray-900 dark:text-slate-100 capitalize">{item.crop}</span>
                      </div>
                      <span className={`text-sm font-bold ${item.profit_current >= 0 ? "text-green-700 dark:text-green-400" : "text-red-600"}`}>
                        {item.profit_current >= 0 ? "▲" : "▼"} {inr(item.profit_current)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { label: t("Expenditure"),  value: inr(item.total_cost),       color: "text-red-600 dark:text-red-400" },
                        { label: t("Return %"),      value: `${item.roi_pct}%`,          color: item.roi_pct >= 0 ? "text-green-700 dark:text-green-400" : "text-red-500" },
                        { label: t("Last year"),     value: inr(item.profit_prev),       color: item.profit_prev >= 0 ? "text-gray-700 dark:text-slate-200" : "text-red-500" },
                        { label: t("This year"),     value: inr(item.profit_current),    color: item.profit_current >= 0 ? "text-green-700 dark:text-green-400" : "text-red-500" },
                        { label: t("Next year est."),value: inr(item.profit_projected),  color: item.profit_projected >= 0 ? "text-blue-700 dark:text-blue-400" : "text-red-500" },
                        { label: t("Price trend"),   value: `${item.price_trend_pct > 0 ? "▲" : "▼"} ${Math.abs(item.price_trend_pct)}%`, color: item.price_trend_pct >= 0 ? "text-green-600" : "text-red-500" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white/70 dark:bg-slate-700/50 rounded-lg p-2 border border-gray-100 dark:border-slate-600">
                          <div className="text-gray-400 dark:text-slate-500">{label}</div>
                          <div className={`font-bold mt-0.5 ${color}`}>{value}</div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setGuide(item)}
                      className="w-full bg-green-700 hover:bg-green-800 text-white text-sm font-semibold py-2 rounded-xl transition"
                    >
                      📖 {t("Farming Guide")}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table (hidden on mobile) ── */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-green-700 text-white text-xs uppercase tracking-wide">
                    <th className="px-3 py-3 text-center">{t("Rank")}</th>
                    <th className="px-3 py-3 text-left">{t("Crop")}</th>
                    <th className="px-3 py-3 text-center">{t("Yield")}</th>
                    <th className="px-3 py-3 text-center">{t("Expenditure")}</th>
                    <th className="px-3 py-3 text-center">{t("Last Year Profit")}</th>
                    <th className="px-3 py-3 text-center">{t("This Year Profit")}</th>
                    <th className="px-3 py-3 text-center">{t("Next Year Est.")}</th>
                    <th className="px-3 py-3 text-center">{t("Return %")}</th>
                    <th className="px-3 py-3 text-center">{t("Price Trend")}</th>
                    <th className="px-3 py-3 text-center">{t("Guide")}</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((item, idx) => (
                    <CropRow
                      key={item.crop}
                      item={item}
                      rank={idx}
                      t={t}
                      onLearnMore={setGuide}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Market price reference */}
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                💰 {t("Market Price Reference (₹ per quintal)")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-slate-700">
                      <th className="text-left py-2 pr-4">{t("Crop")}</th>
                      <th className="text-center py-2 px-3">{t("Last Year")}</th>
                      <th className="text-center py-2 px-3">{t("Current")}</th>
                      <th className="text-center py-2 px-3">{t("Projected")}</th>
                      <th className="text-center py-2 px-3">{t("Change")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranked.map(item => (
                      <tr key={item.crop} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                        <td className="py-2 pr-4 font-medium text-gray-800 dark:text-slate-200 capitalize">
                          {getCropInfo(item.crop)?.emoji} {item.crop}
                        </td>
                        <td className="text-center py-2 px-3 text-gray-600 dark:text-slate-400">₹{item.market_price_prev?.toLocaleString("en-IN")}</td>
                        <td className="text-center py-2 px-3 font-semibold text-gray-900 dark:text-slate-100">₹{item.market_price_current?.toLocaleString("en-IN")}</td>
                        <td className="text-center py-2 px-3 text-blue-600 dark:text-blue-400">₹{item.market_price_projected?.toLocaleString("en-IN")}</td>
                        <td className="text-center py-2 px-3"><TrendArrow pct={item.price_trend_pct} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs text-gray-400 dark:text-slate-500 mt-4 leading-relaxed">
              * {t("Profit estimates are based on government MSP prices with open-market premium factors, average Indian yield data, and CACP input cost benchmarks. Actual results depend on your local market, farming practices, and weather conditions.")}
            </p>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
