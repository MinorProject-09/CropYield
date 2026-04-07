/**
 * MarketPage.jsx — Market Intelligence
 * Live mandi prices, best time/place to sell, seasonal price calendar,
 * MSP comparison, and selling strategy advisor.
 */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getMarketPrices, getMarketBestTime } from "../api/api";

// ── All supported crops ───────────────────────────────────────────────────────
const CROPS = [
  "rice","wheat","maize","chickpea","kidney beans","pigeon peas",
  "moth beans","mung bean","black gram","lentil","pomegranate",
  "banana","mango","grapes","watermelon","muskmelon","apple",
  "orange","papaya","coconut","cotton","jute","coffee",
];

const STATES = [
  "Punjab","Haryana","Uttar Pradesh","Maharashtra","Karnataka",
  "Andhra Pradesh","Telangana","Madhya Pradesh","Rajasthan","Gujarat",
  "Tamil Nadu","West Bengal","Bihar","Odisha","Kerala",
];

const CROP_EMOJI = {
  rice:"🌾",wheat:"🌿",maize:"🌽",chickpea:"🫘","kidney beans":"🫘",
  "pigeon peas":"🌱","moth beans":"🫘","mung bean":"🫘","black gram":"🫘",
  lentil:"🫘",pomegranate:"🍎",banana:"🍌",mango:"🥭",grapes:"🍇",
  watermelon:"🍉",muskmelon:"🍈",apple:"🍎",orange:"🍊",papaya:"🍈",
  coconut:"🥥",cotton:"🌿",jute:"🌿",coffee:"☕",
};

// ── Price bar ─────────────────────────────────────────────────────────────────
function PriceBar({ min, modal, max, msp }) {
  const allVals = [min, modal, max, msp].filter(Boolean);
  const lo = Math.min(...allVals) * 0.9;
  const hi = Math.max(...allVals) * 1.05;
  const pct = v => Math.round(((v - lo) / (hi - lo)) * 100);
  return (
    <div className="relative h-6 bg-gray-100 dark:bg-slate-700 rounded-full overflow-visible mt-1">
      {/* Range bar */}
      <div className="absolute h-full bg-green-200 dark:bg-green-800 rounded-full"
        style={{ left: `${pct(min)}%`, width: `${pct(max) - pct(min)}%` }} />
      {/* Modal marker */}
      <div className="absolute top-0 h-full w-1 bg-green-600 dark:bg-green-400 rounded-full"
        style={{ left: `${pct(modal)}%` }} />
      {/* MSP marker */}
      {msp && (
        <div className="absolute top-0 h-full w-0.5 bg-red-500 rounded-full"
          style={{ left: `${pct(msp)}%` }}
          title={`MSP ₹${msp}`} />
      )}
    </div>
  );
}

// ── Mandi price card ──────────────────────────────────────────────────────────
function MandiCard({ price, rank, msp, t }) {
  const aboveMsp = msp ? price.modal_price > msp : null;
  const pctAbove = msp ? Math.round(((price.modal_price - msp) / msp) * 100) : null;
  return (
    <div className={`rounded-2xl border p-4 ${
      rank === 0
        ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 shadow-md"
        : "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700"
    }`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            {rank === 0 && <span className="text-sm">🥇</span>}
            <span className="font-bold text-gray-900 dark:text-slate-100 text-sm">{price.market}</span>
          </div>
          <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            {price.district}, {price.state} · {price.arrival_date}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-green-700 dark:text-green-400">
            ₹{price.modal_price.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-gray-400 dark:text-slate-500">{t("per quintal")}</div>
        </div>
      </div>

      <PriceBar min={price.min_price} modal={price.modal_price} max={price.max_price} msp={msp} />

      <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mt-1.5">
        <span>↓ ₹{price.min_price.toLocaleString("en-IN")}</span>
        <span className={`font-semibold ${aboveMsp ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
          {pctAbove !== null ? `${pctAbove >= 0 ? "+" : ""}${pctAbove}% vs MSP` : ""}
        </span>
        <span>↑ ₹{price.max_price.toLocaleString("en-IN")}</span>
      </div>

      {price.source === "estimated" && (
        <div className="text-xs text-gray-400 dark:text-slate-500 mt-1.5 italic">
          ~ {t("Estimated based on MSP + seasonal factors")}
        </div>
      )}
    </div>
  );
}

// ── Seasonal price chart (SVG sparkline) ─────────────────────────────────────
function SeasonalChart({ monthlyPrices, currentMonthNum, t }) {
  if (!monthlyPrices?.length) return null;
  const prices = monthlyPrices.map(m => m.estimatedPrice);
  const mn = Math.min(...prices), mx = Math.max(...prices), range = mx - mn || 1;
  const W = 360, H = 80;
  const x = i => (i / 11) * W;
  const y = v => H - ((v - mn) / range) * (H - 10) - 5;
  const pts = prices.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const MONTHS = ["J","F","M","A","M","J","J","A","S","O","N","D"];

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-4">
        📅 {t("Seasonal Price Calendar")} ({t("₹/quintal")})
      </h3>
      <div className="overflow-x-auto">
        <svg width={W + 20} height={H + 30} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(f => (
            <line key={f} x1={0} y1={y(mn + f * range)} x2={W} y2={y(mn + f * range)}
              stroke="#e5e7eb" strokeWidth="1" className="dark:stroke-slate-700" />
          ))}
          {/* Line */}
          <polyline points={pts} fill="none" stroke="#22c55e" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
          {/* Dots */}
          {prices.map((v, i) => {
            const m = monthlyPrices[i];
            const isCurrent = (i + 1) === currentMonthNum;
            return (
              <g key={i}>
                <circle cx={x(i)} cy={y(v)} r={isCurrent ? 6 : m.isBest ? 5 : m.isWorst ? 5 : 3}
                  fill={m.isBest ? "#f59e0b" : m.isWorst ? "#ef4444" : isCurrent ? "#3b82f6" : "#22c55e"}
                  stroke="white" strokeWidth="1.5" />
                {(m.isBest || m.isWorst || isCurrent) && (
                  <text x={x(i)} y={y(v) - 10} textAnchor="middle" fontSize="9"
                    fill={m.isBest ? "#d97706" : m.isWorst ? "#dc2626" : "#2563eb"}
                    className="font-semibold">
                    ₹{v.toLocaleString("en-IN")}
                  </text>
                )}
              </g>
            );
          })}
          {/* Month labels */}
          {MONTHS.map((m, i) => (
            <text key={i} x={x(i)} y={H + 20} textAnchor="middle" fontSize="10"
              fill={(i + 1) === currentMonthNum ? "#2563eb" : "#9ca3af"}
              fontWeight={(i + 1) === currentMonthNum ? "bold" : "normal"}>
              {m}
            </text>
          ))}
        </svg>
      </div>
      <div className="flex gap-4 mt-2 text-xs flex-wrap">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> {t("Best month")}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> {t("Worst month")}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> {t("Current month")}</span>
        <span className="flex items-center gap-1"><span className="w-0.5 h-3 bg-red-500 inline-block" /> {t("MSP floor")}</span>
      </div>
    </div>
  );
}

// ── Selling strategy card ─────────────────────────────────────────────────────
function SellingStrategy({ bestTime, prices, t }) {
  if (!bestTime) return null;
  const { advice, bestMonth, worstMonth, currentMonth, msp } = bestTime;
  const best = prices?.bestMandi;
  const isGoodTime = currentMonth?.index >= 1.05;
  const isBadTime  = currentMonth?.index <= 0.92;

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${
      isGoodTime ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
      : isBadTime ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
    }`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{isGoodTime ? "✅" : isBadTime ? "⚠️" : "📊"}</span>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{t("Selling Strategy")}</h3>
          <p className="text-sm text-gray-700 dark:text-slate-300 mt-1 leading-relaxed">{t(advice)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {[
          { label: t("MSP Floor"),      value: `₹${msp?.toLocaleString("en-IN")}/q`,                  color: "text-red-600 dark:text-red-400" },
          { label: t("Current Est."),   value: `₹${currentMonth?.estimatedPrice?.toLocaleString("en-IN")}/q`, color: "text-blue-600 dark:text-blue-400" },
          { label: t("Best Month"),     value: `${bestMonth?.month} — ₹${bestMonth?.estimatedPrice?.toLocaleString("en-IN")}/q`, color: "text-amber-600 dark:text-amber-400" },
          { label: t("Best Mandi"),     value: best ? `${best.market}` : "—",                          color: "text-green-700 dark:text-green-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/70 dark:bg-slate-700/50 rounded-xl p-2.5 border border-white/50 dark:border-slate-600">
            <div className="text-gray-400 dark:text-slate-500 mb-0.5">{label}</div>
            <div className={`font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Where to sell */}
      <div>
        <h4 className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">{t("Where to Sell")}</h4>
        <div className="grid sm:grid-cols-3 gap-2 text-xs">
          {[
            { icon:"🏪", label:"APMC Mandi",          desc:t("Regulated market — transparent pricing. Check Agmarknet for daily rates."), url:"https://agmarknet.gov.in" },
            { icon:"💻", label:"eNAM Portal",          desc:t("Sell online to buyers across India. Register at enam.gov.in."),            url:"https://www.enam.gov.in" },
            { icon:"🏛️", label:"Govt. Procurement",   desc:t("Sell at MSP through FCI/NAFED. Guaranteed minimum price."),               url:"https://dfpd.gov.in" },
          ].map(({ icon, label, desc, url }) => (
            <a key={label} href={url} target="_blank" rel="noopener noreferrer"
              className="bg-white dark:bg-slate-700 rounded-xl p-3 border border-gray-100 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-600 transition block">
              <div className="font-semibold text-gray-800 dark:text-slate-200">{icon} {label} ↗</div>
              <div className="text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MarketPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [commodity, setCommodity] = useState(() => {
    // Default to user's last predicted crop if available
    return "rice";
  });
  const [state,     setState]     = useState(user?.location?.state || "");
  const [prices,    setPrices]    = useState(null);
  const [bestTime,  setBestTime]  = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const fetchAll = useCallback(async (crop, st) => {
    setLoading(true); setError(null);
    try {
      const [pr, bt] = await Promise.all([
        getMarketPrices(crop, st),
        getMarketBestTime(crop),
      ]);
      setPrices(pr.data);
      setBestTime(bt.data);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to fetch market data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(commodity, state); }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchAll(commodity, state);
  }

  const currentMonthNum = new Date().getMonth() + 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-[Outfit,system-ui,sans-serif]">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-800 to-green-700 text-white px-6 py-10">
        <div className="max-w-5xl mx-auto flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-green-300 text-sm mb-1">💰 {t("Market Intelligence")}</p>
            <h1 className="text-2xl md:text-3xl font-bold">{t("Live Mandi Prices")}</h1>
            <p className="text-green-200 text-sm mt-1 max-w-xl">
              {t("Compare prices across mandis, find the best time and place to sell your crop.")}
            </p>
          </div>
          {prices && (
            <div className="flex gap-3 flex-wrap">
              {prices.source === "live" ? (
                <span className="bg-green-500/20 border border-green-400/40 text-green-200 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> {t("Live Data")}
                </span>
              ) : (
                <span className="bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                  ~ {t("Estimated Prices")}
                </span>
              )}
              {prices.premiumOverMsp !== null && (
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                  prices.premiumOverMsp >= 0
                    ? "bg-green-500/20 border-green-400/40 text-green-200"
                    : "bg-red-500/20 border-red-400/40 text-red-200"
                }`}>
                  {prices.premiumOverMsp >= 0 ? "+" : ""}{prices.premiumOverMsp}% {t("vs MSP")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 space-y-8">

        {/* Search form */}
        <form onSubmit={handleSearch}
          className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1 block">{t("Crop")}</label>
              <div className="relative">
                <select value={commodity} onChange={e => setCommodity(e.target.value)}
                  className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:border-green-500 appearance-none pr-8">
                  {CROPS.map(c => (
                    <option key={c} value={c}>{CROP_EMOJI[c] || "🌾"} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1 block">{t("State")}</label>
              <div className="relative">
                <select value={state} onChange={e => setState(e.target.value)}
                  className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:border-green-500 appearance-none pr-8">
                  <option value="">{t("All India")}</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
              </div>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-xl text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{t("Loading…")}</>
                  : `🔍 ${t("Get Prices")}`}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-4 text-red-700 dark:text-red-400 text-sm">
            ⚠ {error}
          </div>
        )}

        {prices && bestTime && (
          <>
            {/* Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: CROP_EMOJI[commodity] || "🌾", label: t("Crop"),          value: commodity.charAt(0).toUpperCase() + commodity.slice(1), color: "text-gray-900 dark:text-slate-100" },
                { icon: "🏛️",                          label: t("MSP 2024-25"),   value: prices.msp ? `₹${prices.msp.toLocaleString("en-IN")}/q` : "—", color: "text-red-600 dark:text-red-400" },
                { icon: "📊",                          label: t("Avg Mandi Price"),value: prices.avgModal ? `₹${prices.avgModal.toLocaleString("en-IN")}/q` : "—", color: "text-green-700 dark:text-green-400" },
                { icon: "🥇",                          label: t("Best Price"),     value: prices.bestMandi ? `₹${prices.bestMandi.modal_price.toLocaleString("en-IN")}/q` : "—", color: "text-amber-600 dark:text-amber-400" },
              ].map(({ icon, label, value, color }) => (
                <div key={label} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className="text-xs text-gray-400 dark:text-slate-500">{label}</div>
                    <div className={`font-bold text-sm ${color}`}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selling strategy */}
            <SellingStrategy bestTime={bestTime} prices={prices} t={t} />

            {/* Seasonal chart */}
            <SeasonalChart monthlyPrices={bestTime.monthlyPrices} currentMonthNum={currentMonthNum} t={t} />

            {/* Mandi price list */}
            {/* <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                  🏪 {t("Mandi Prices")} — {prices.prices?.length} {t("markets")}
                  {state && ` · ${state}`}
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                  <span className="w-3 h-0.5 bg-red-500 inline-block" /> {t("MSP")}
                  <span className="w-3 h-0.5 bg-green-500 inline-block ml-2" /> {t("Modal")}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {prices.prices?.map((p, i) => (
                  <MandiCard key={`${p.market}-${i}`} price={p} rank={i} msp={prices.msp} t={t} />
                ))}
              </div> */}
            {/* </div> */}

            {/* Data source note */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4 text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <p className="font-semibold">ℹ️ {t("About this data")}</p>
              {prices.source === "live"
                ? <p>{t("Live prices from Agmarknet (data.gov.in). Updated daily. Prices in ₹ per quintal (100 kg).")}</p>
                : <p>{t("Estimated prices based on MSP 2024-25 + seasonal market factors + regional mandi variation. For live prices, add DATA_GOV_API_KEY to backend .env (free registration at data.gov.in).")}</p>
              }
              <p>{t("Always verify prices at your local mandi before selling. Prices vary by variety, quality, and daily arrivals.")}</p>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href:"https://agmarknet.gov.in",    icon:"📊", label:t("Agmarknet Live Prices") },
                { href:"https://www.enam.gov.in",     icon:"💻", label:t("eNAM Online Market") },
                { href:"https://dfpd.gov.in",         icon:"🏛️", label:t("Govt. Procurement") },
                { href:"https://pmkisan.gov.in",      icon:"💰", label:t("PM-KISAN Portal") },
              ].map(({ href, icon, label }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-gray-700 dark:text-slate-300 hover:border-green-300 dark:hover:border-green-600 transition">
                  <span className="text-base">{icon}</span>{label} ↗
                </a>
              ))}
            </div>
          </>
        )}

        {/* Internal links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { to:"/schemes",    icon:"🏛️", label:t("Govt. Schemes & Subsidies") },
            { to:"/profit",     icon:"📊", label:t("Profit Analysis") },
            { to:"/prediction", icon:"🌾", label:t("Crop Prediction") },
          ].map(({ to, icon, label }) => (
            <Link key={to} to={to}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 text-sm font-medium text-gray-700 dark:text-slate-300 hover:border-green-300 dark:hover:border-green-600 transition">
              <span className="text-lg">{icon}</span>{label}
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
