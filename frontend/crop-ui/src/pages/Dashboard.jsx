import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getPredictionHistory, updateProfile, deletePrediction } from "../api/api";
import { INDIAN_STATES_AND_UTS } from "../data/indiaStates";
import { DISTRICTS_BY_STATE } from "../data/indiaDistrictsByState";
import { getCropInfo } from "../data/cropInfo";

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
  const pct = Math.round((value || 0) * 100);
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
  { id: "overview", label: "Overview" },
  { id: "history",  label: "Prediction History" },
  { id: "profile",  label: "My Profile" },
];

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ history, historyLoading }) {
  const tips = [
    { icon: "💧", tip: "Check soil moisture before sowing — over-watering reduces yield by up to 20%." },
    { icon: "🌡️", tip: "Soil temperature above 15°C is ideal for most Kharif crops." },
    { icon: "🧪", tip: "A soil pH between 6.0–7.5 suits most crops. Test your soil every season." },
    { icon: "🌱", tip: "Rotate crops each season to naturally replenish soil nutrients." },
    { icon: "📅", tip: "Sow Rabi crops (wheat, mustard) between October and December for best results." },
  ];
  const tip = tips[new Date().getDay() % tips.length];
  const lastPrediction = history?.[0];

  return (
    <div className="space-y-6">
      {/* Stats */}
     

      {/* Daily tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start">
        <span className="text-2xl">{tip.icon}</span>
        <div>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Farming Tip of the Day</p>
          <p className="text-gray-700 text-sm leading-relaxed">{tip.tip}</p>
        </div>
      </div>

      {/* Last prediction */}
      {historyLoading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-gray-400 text-sm">Loading history…</div>
      ) : lastPrediction ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Last Prediction</h3>
            <Link to="/prediction" className="text-xs text-green-700 font-semibold hover:underline">New prediction →</Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-4xl">{getCropInfo(lastPrediction.recommendedCrop)?.emoji || "🌾"}</div>
            <div className="flex-1">
              <p className="text-xl font-bold text-green-800 capitalize">{lastPrediction.recommendedCrop}</p>
              <ConfidenceBar value={lastPrediction.confidence} />
              <p className="text-xs text-gray-400 mt-1">
                {new Date(lastPrediction.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                {lastPrediction.location?.details ? ` · ${lastPrediction.location.details}` : ""}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
          <p className="text-3xl mb-2">🌱</p>
          <p className="text-gray-500 text-sm mb-4">No predictions yet. Run your first one!</p>
          <Link to="/prediction">
            <button className="bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-800 transition">
              Start Prediction →
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

// ── History Tab ───────────────────────────────────────────────────────────────
function HistoryTab({ history, loading, onDelete }) {
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
        <p className="text-gray-500 text-sm mb-4">No prediction history yet.</p>
        <Link to="/prediction">
          <button className="bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-800 transition">
            Make Your First Prediction →
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
          ⬇ Export CSV
        </button>
      </div>

      {history.map((p) => {
        const month = MONTHS[(p.cropMonth || 1) - 1];
        const location = p.location?.details || (p.location?.latitude ? `${Number(p.location.latitude).toFixed(2)}°, ${Number(p.location.longitude).toFixed(2)}°` : "—");
        const info = getCropInfo(p.recommendedCrop);
        return (
          <div key={p._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-green-200 transition">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-xl flex-shrink-0">
                {info?.emoji || "🌾"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-gray-900 capitalize">{p.recommendedCrop}</span>
                  <Badge color={p.confidence >= 0.75 ? "green" : p.confidence >= 0.5 ? "amber" : "blue"}>
                    {Math.round(p.confidence * 100)}% confidence
                  </Badge>
                  {info?.season && <Badge color="blue">{info.season}</Badge>}
                </div>
                <ConfidenceBar value={p.confidence} />
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                  <span>📍 {location}</span>
                  <span>📅 {month} · {p.duration}d</span>
                  <span>🧪 pH {p.soilPh} · N{p.nitrogen} P{p.phosphorus} K{p.potassium}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-xs text-gray-400 text-right">
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
          </div>
        );
      })}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ user, setUser }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    farmSize: user?.farmSize ?? "",
    soilType: user?.soilType || "",
    state: user?.location?.state || "",
    district: user?.location?.district || "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const districts = DISTRICTS_BY_STATE[form.state] || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === "state") setForm(f => ({ ...f, state: value, district: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await updateProfile({
        name: form.name,
        farmSize: form.farmSize,
        soilType: form.soilType,
        location: { state: form.state, district: form.district },
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

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition bg-white";
  const selectCls = `${inputCls} appearance-none`;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold text-white">
          {user?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{user?.name}</p>
          <p className="text-green-200 text-sm">{user?.email}</p>
          <div className="flex gap-2 mt-1">
            <Badge color="green">{user?.provider || "local"}</Badge>
            {user?.emailVerified
              ? <Badge color="green">✓ Verified</Badge>
              : <Badge color="amber">✗ Unverified</Badge>}
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
        </div>

        {error   && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">⚠ {error}</p>}
        {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">✓ {success}</p>}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-green-800 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, setUser } = useAuth();
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
      <main className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="bg-gradient-to-br from-green-800 to-green-700 text-white px-6 py-10">
          <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-green-300 text-sm mb-1">Dashboard</p>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {user?.name?.split(" ")[0] || "Farmer"} 👋
              </h1>
              <p className="text-green-200 text-sm mt-1">
                {history.length > 0
                  ? `You have ${history.length} prediction${history.length > 1 ? "s" : ""} so far.`
                  : "Run your first prediction to get started."}
              </p>
            </div>
            <Link to="/prediction">
              <button className="bg-white text-green-800 font-bold px-5 py-2.5 rounded-xl hover:bg-green-50 transition shadow text-sm">
                🌾 New Prediction →
              </button>
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 w-fit shadow-sm">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-green-700 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                {tab.id === "history" && history.length > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === "history" ? "bg-white/20 text-white" : "bg-green-100 text-green-700"}`}>
                    {history.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "overview" && <OverviewTab history={history} historyLoading={historyLoading} />}
          {activeTab === "history"  && <HistoryTab  history={history} loading={historyLoading} onDelete={handleDelete} />}
          {activeTab === "profile"  && <ProfileTab  user={user} setUser={setUser} />}
        </div>
      </main>
    </>
  );
}
