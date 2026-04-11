import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { getPredictionHistory, updateProfile, deletePrediction } from "../api/api";
import { INDIAN_STATES_AND_UTS } from "../data/indiaStates";
import { DISTRICTS_BY_STATE } from "../data/indiaDistrictsByState";
import { getCropInfo } from "../data/cropInfo";
import { MSP_2024 } from "../data/mspData";
import YieldTracker from "../components/YieldTracker";
import FarmAdvisor from "../components/FarmAdvisor";
import SeasonalPlanner from "../components/SeasonalPlanner";
import FarmMap from "../components/FarmMap";
import { usePushNotifications } from "../hooks/usePushNotifications";

const SOIL_TYPES = ["Sandy", "Loamy", "Clay", "Silt", "Peaty", "Chalky", "Sandy Loam", "Clay Loam", "Other"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function Badge({ children, color = "green" }) {
  const colors = {
    green: "bg-green-100 text-green-800 border-green-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    blue:  "bg-blue-100 text-blue-800 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color]}`}>
      {children}
    </span>
  );
}

function ConfidenceBar({ value }) {
  
  const pct = Math.round(Math.min(Math.max(value || 0, 0), 1) * 100);

  const color = pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-9 text-right">{pct}%</span>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", labelKey: "Overview" },
  { id: "history",  labelKey: "Prediction History" },
  { id: "msp",      labelKey: "MSP Prices" },
  { id: "profile",  labelKey: "My Profile" },
];

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ user, history, historyLoading }) {
  const { t } = useLanguage();
  const tips = [
    { icon: "💧", tip: "Check soil moisture before sowing — over-watering reduces yield by up to 20%." },
    { icon: "🌡️", tip: "Soil temperature above 15°C is ideal for most Kharif crops." },
    { icon: "🧪", tip: "A soil pH between 6.0–7.5 suits most crops. Test your soil every season." },
    { icon: "🌱", tip: "Rotate crops each season to naturally replenish soil nutrients." },
    { icon: "📅", tip: "Sow Rabi crops (wheat, mustard) between October and December for best results." },
  ];
  const tip = tips[new Date().getDay() % tips.length];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger">
        {[
          { icon: "🌾", label: t("Total Predictions"), value: history.length, color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700" },
          { icon: "✅", label: t("Harvests Logged"),   value: history.filter(p => p.actualYieldQ != null).length, color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700" },
          { icon: "🏆", label: t("Best Crop"),         value: history[0] ? (getCropInfo(history[0].recommendedCrop)?.image || "🌾") + " " + history[0].recommendedCrop : "—", color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700" },
          { icon: "📈", label: t("Avg Confidence"),    value: history.length ? Math.round(history.reduce((s, p) => s + p.confidence, 0) / history.length * 100) + "%" : "—", color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700" },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="stat-card animate-fade-up">
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full -translate-y-4 translate-x-4" style={{ background: color, opacity: 0.08 }} />
            <div className="text-2xl mb-2">{icon}</div>
            <div className="font-extrabold text-gray-900 dark:text-slate-100 text-lg capitalize truncate">{value}</div>
            <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Personalized farm advisor */}
      <FarmAdvisor user={user} history={history} />

      {/* Seasonal planner for most recent prediction */}
      {history.length > 0 && (
        <SeasonalPlanner prediction={history[0]} />
      )}

      {/* Daily tip */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 flex gap-4 items-start">
        <span className="text-2xl flex-shrink-0">{tip.icon}</span>
        <div>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1">{t("Farming Tip of the Day")}</p>
          <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">{t(tip.tip)}</p>
        </div>
      </div>
    </div>
  );
}

// ── History Tab ───────────────────────────────────────────────────────────────
function HistoryTab({ history, loading, onDelete, setHistory }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this prediction?")) return;
    setDeleting(id);
    try {
      await deletePrediction(id);
      onDelete(id);
    } catch {
      alert("Could not delete. Try again.");
    } finally {
      setDeleting(null);
    }
  };

  const exportCSV = () => {
    if (!history.length) return;
    const headers = ["Date","Crop","Confidence","pH","N","P","K","Month","Duration","Location"];
    const rows = history.map(p => [
      new Date(p.createdAt).toLocaleDateString("en-IN"),
      p.recommendedCrop,
      `${Math.round(p.confidence * 100)}%`,
      p.soilPh, p.nitrogen, p.phosphorus, p.potassium,
      MONTHS[(p.cropMonth || 1) - 1],
      `${p.duration}d`,
      p.location?.details || (p.location?.latitude ? `${Number(p.location.latitude).toFixed(4)},${Number(p.location.longitude).toFixed(4)}` : ""),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "predictions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!history?.length) {
    return (
      <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-gray-500 text-sm mb-4">{t("No prediction history yet.")}</p>
        <Link to="/prediction">
          <button className="bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-800 transition">
            {t("Make Your First Prediction →")}
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Export button */}
      <div className="flex justify-end">
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 text-xs font-semibold text-green-700 border border-green-200 bg-white px-4 py-2 rounded-xl hover:bg-green-50 transition"
        >
          ⬇ {t("Export CSV")}
        </button>
      </div>

      {history.map((p) => {
        const month = MONTHS[(p.cropMonth || 1) - 1];
        const location = p.location?.details || (p.location?.latitude ? `${Number(p.location.latitude).toFixed(2)}°, ${Number(p.location.longitude).toFixed(2)}°` : "—");
        const info = getCropInfo(p.recommendedCrop);

        // Build mlInput from stored fields for profit page navigation
        const mlInput = (p.nitrogen != null && p.temperature != null) ? {
          N:           p.nitrogen,
          P:           p.phosphorus,
          K:           p.potassium,
          temperature: p.temperature,
          humidity:    p.humidity,
          ph:          p.soilPh,
          rainfall:    p.rainfall,
          farm_size_ha: p.farmSizeHa || 1,
        } : null;

        return (
          <div key={p._id} className="card rounded-2xl p-5  hover:border-green-200 dark:hover:border-green-700 transition">
            <div className="flex items-start gap-4">
              <div className="w-40 h-20 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-xl flex-shrink-0"> 
                <img src={info.image} className='w-40 h-20' alt={p.recommendedCrop}></img>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-gray-900 dark:text-slate-100 capitalize">{p.recommendedCrop}</span>
                  <Badge color={p.confidence >= 0.75 ? "green" : p.confidence >= 0.5 ? "amber" : "blue"}>
                    {Math.round(p.confidence * 100)}% {t("confidence")}
                  </Badge>
                  {info?.season && <Badge color="blue">{info.season}</Badge>}
                </div>
                <ConfidenceBar value={p.confidence} />
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-slate-400">
                  <span>📍 {location}</span>
                  <span>📅 {month} · {p.duration}d</span>
                  <span>🧪 pH {p.soilPh} · N{p.nitrogen} P{p.phosphorus} K{p.potassium}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-xs text-gray-400 dark:text-slate-500 text-right">
                  {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  <br />
                  {new Date(p.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <button
                  onClick={() => handleDelete(p._id)}
                  disabled={deleting === p._id}
                  className="text-xs text-red-400 hover:text-red-600 transition disabled:opacity-50"
                  title="Delete prediction"
                >
                  {deleting === p._id ? "…" : "🗑"}
                </button>
              </div>
            </div>

            {/* Profit analysis button */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/profit", {
                  state: {
                    mlInput:         mlInput || {
                      N: p.nitrogen, P: p.phosphorus, K: p.potassium,
                      temperature: p.temperature || 25,
                      humidity:    p.humidity    || 70,
                      ph:          p.soilPh,
                      rainfall:    p.rainfall    || 100,
                      farm_size_ha: p.farmSizeHa || 1,
                    },
                    top3:            p.top3?.length ? p.top3 : [{ crop: p.recommendedCrop, confidence: p.confidence }],
                    farmSizeHa:      p.farmSizeHa || 1,
                    duration:        p.duration || 90,
                    recommendedCrop: p.recommendedCrop,
                    fromHistory:     true,
                    predictionDate:  p.createdAt,
                  }
                })}
                className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-xl py-2 transition"
              >
                📊 {t("View Profit Analysis")}
              </button>
            </div>

            {/* Yield tracker */}
            <YieldTracker
              prediction={p}
              onUpdated={(updated) => setHistory(h => h.map(x => x._id === updated._id ? updated : x))}
            />
          </div>
        );
      })}
    </div>
  );
}

// ── Push Notification Toggle ──────────────────────────────────────────────────
function PushToggle() {
  const { supported, subscribed, loading, subscribe, unsubscribe } = usePushNotifications();
  if (!supported) return null;
  return (
    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl px-4 py-3 sm:col-span-2">
      <div>
        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">🔔 Browser Push Notifications</p>
        <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">
          {subscribed ? "Enabled — you'll get alerts even when the tab is closed" : "Get instant alerts in your browser for critical events"}
        </p>
      </div>
      <button type="button" onClick={subscribed ? unsubscribe : subscribe} disabled={loading}
        className={`text-xs font-semibold px-4 py-2 rounded-xl transition disabled:opacity-50 ${
          subscribed
            ? "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}>
        {loading ? "…" : subscribed ? "Disable" : "Enable"}
      </button>
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ user, setUser }) {
  const [form, setForm] = useState({
    name:      user?.name || "",
    farmSize:  user?.farmSize ?? "",
    soilType:  user?.soilType || "",
    state:     user?.location?.state || "",
    district:  user?.location?.district || "",
    phone:     user?.phone || "",
    smsAlerts: user?.smsAlerts ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const districts = DISTRICTS_BY_STATE[form.state] || [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    if (name === "state") setForm(f => ({ ...f, state: value, district: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await updateProfile({
        name:      form.name,
        farmSize:  form.farmSize,
        soilType:  form.soilType,
        location:  { state: form.state, district: form.district },
        phone:     form.phone,
        smsAlerts: form.smsAlerts,
      });
      setUser(res.data.user);
      setSuccess("Profile updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-700/60 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition placeholder:text-gray-300 dark:placeholder:text-slate-500";
  const selectCls = `${inputCls} appearance-none`;

  return (
    <div className="card rounded-2xl  overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f4c2a] via-[#166534] to-[#15803d] px-6 py-6 flex items-center gap-4">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #86efac 0%, transparent 50%)" }} />
        <div className="relative w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="relative">
          <p className="text-white font-bold text-lg leading-tight">{user?.name}</p>
          <p className="text-emerald-200 text-sm">{user?.email}</p>
          <div className="flex gap-2 mt-1.5">
            <Badge color="green">{user?.provider || "local"}</Badge>
            {user?.emailVerified ? <Badge color="green">✓ Verified</Badge> : <Badge color="amber">✗ Unverified</Badge>}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} className={inputCls} placeholder="Your name" required />
          </div>

          {/* Email — read only */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
            <input value={user?.email || ""} readOnly className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`} />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>

          {/* Farm Size */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Farm Size (hectares)</label>
            <input name="farmSize" type="number" min="0" step="0.1" value={form.farmSize} onChange={handleChange} className={inputCls} placeholder="e.g. 12.5" />
          </div>

          {/* Soil Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Soil Type</label>
            <div className="relative">
              <select name="soilType" value={form.soilType} onChange={handleChange} className={selectCls}>
                <option value="">Select soil type</option>
                {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
            </div>
          </div>

          {/* State */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">State / UT</label>
            <div className="relative">
              <select name="state" value={form.state} onChange={handleChange} className={selectCls}>
                <option value="">Select state</option>
                {INDIAN_STATES_AND_UTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
            </div>
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">District</label>
            {districts.length > 0 ? (
              <div className="relative">
                <select name="district" value={form.district} onChange={handleChange} className={selectCls}>
                  <option value="">Select district</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
              </div>
            ) : (
              <input name="district" value={form.district} onChange={handleChange} className={inputCls} placeholder="Enter district" />
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">📱 Mobile Number</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange}
              className={inputCls} placeholder="10-digit mobile (for SMS alerts)" maxLength={10} />
          </div>

          {/* SMS Alerts toggle */}
          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">📲 WhatsApp/SMS Alerts</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Get critical soil and weather alerts on your phone</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="smsAlerts" checked={form.smsAlerts} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:bg-emerald-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>

          {/* Push Notifications toggle */}
          <PushToggle />
        </div>

        {error   && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">⚠ {error}</p>}
        {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">✓ {success}</p>}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</> : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Farm Map */}
      <FarmMap user={user} onFieldsSaved={(fields) => setUser(u => ({ ...u, fields }))} />
    </div>
  );
}

// ── MSP Prices Tab ────────────────────────────────────────────────────────────
function MSPTab() {
  const seasons = ["Kharif", "Rabi", "Zaid", "Perennial"];
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
        <span className="text-xl">ℹ️</span>
        <div>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Government of India — MSP 2024-25</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Minimum Support Price (MSP) is the price at which the government purchases crops from farmers. Announced by CCEA. Prices in ₹ per quintal (100 kg).
          </p>
        </div>
      </div>
      {seasons.map(season => {
        const crops = Object.entries(MSP_2024).filter(([, v]) => v.season === season);
        if (!crops.length) return null;
        return (
          <div key={season}>
            <h3 className="font-semibold text-gray-700 text-sm mb-3 uppercase tracking-wide">{season} Crops</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {crops.map(([crop, data]) => {
                const info = getCropInfo(crop);
                return (
                  <div key={crop} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3  hover:border-green-200 transition">
                    <span className="text-2xl">{info?.emoji || "🌾"}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 capitalize text-sm">{crop.replace(/([a-z])([A-Z])/g, "$1 $2")}</p>
                      <p className="text-xs text-gray-400">{data.season}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700 text-base">₹{data.msp.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-green-600">{data.change} from last year</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    getPredictionHistory()
      .then(res => setHistory(res.data.predictions || []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  // Poll for new predictions every 10s when on history/overview tab
  useEffect(() => {
    if (activeTab === "profile") return;
    const interval = setInterval(() => {
      getPredictionHistory()
        .then(res => setHistory(res.data.predictions || []))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleDelete = (id) => setHistory(h => h.filter(p => p._id !== id));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-page">

        {/* Hero */}
        <div className="page-hero noise">
          <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4 relative">
            <div>
              <div className="section-label" style={{ color: "#86efac" }}>Dashboard</div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">
                {t("Welcome back")}, {user?.name?.split(" ")[0] || t("Farmer")} 👋
              </h1>
              <p className="text-emerald-200/70 text-sm mt-2">
                {history.length > 0
                  ? `${history.length} prediction${history.length > 1 ? "s" : ""} so far.`
                  : t("Run your first prediction to get started.")}
              </p>
            </div>
            <Link to="/prediction">
              <button className="btn-primary text-sm px-6 py-3">
                🌾 {t("New Prediction →")}
              </button>
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Tabs */}
          <div className="flex gap-0.5 bg-gray-100 dark:bg-slate-800/60 rounded-xl p-1 mb-7 w-fit border border-gray-200 dark:border-slate-700/60">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 "
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                }`}
              >
                {t(tab.labelKey)}
                {tab.id === "history" && history.length > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === "history" ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400"}`}>
                    {history.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "overview" && <OverviewTab user={user} history={history} historyLoading={historyLoading} />}
          {activeTab === "history"  && <HistoryTab  history={history} loading={historyLoading} onDelete={handleDelete} setHistory={setHistory} />}
          {activeTab === "msp"      && <MSPTab />}
          {activeTab === "profile"  && <ProfileTab  user={user} setUser={setUser} />}
        </div>
      </main>
    </>
  );
}
 