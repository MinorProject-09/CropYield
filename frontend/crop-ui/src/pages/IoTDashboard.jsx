import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { io as socketIO } from "socket.io-client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  getSensorLatest, getSensorHistory, getSensorAlerts,
  postSensorReading, deleteSensorReading,
  getSensorDeviceKey, regenerateSensorDeviceKey,
  getWeatherForecast,
} from "../api/api";

const SERVER = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5001";

const PARAMS = [
  { key: "nitrogen",    label: "Nitrogen",    icon: "🌿", unit: " mg/kg", min: 0,  max: 300, low: 50,  high: 280, decimals: 0, color: "#22c55e", source: "sensor" },
  { key: "phosphorus",  label: "Phosphorus",  icon: "🌱", unit: " mg/kg", min: 0,  max: 100, low: 10,  high: 80,  decimals: 0, color: "#f59e0b", source: "sensor" },
  { key: "potassium",   label: "Potassium",   icon: "💪", unit: " mg/kg", min: 0,  max: 200, low: 20,  high: 150, decimals: 0, color: "#ec4899", source: "sensor" },
  { key: "soilPh",      label: "Soil pH",     icon: "🧪", unit: "",       min: 0,  max: 14,  low: 5.5, high: 8.0, decimals: 1, color: "#8b5cf6", source: "sensor" },
  { key: "temperature", label: "Temperature", icon: "🌡️", unit: "°C",    min: 0,  max: 50,  low: 5,   high: 45,  decimals: 1, color: "#f97316", source: "sensor" },
  { key: "humidity",    label: "Humidity",    icon: "💦", unit: "%",      min: 0,  max: 100, low: 20,  high: 95,  decimals: 0, color: "#06b6d4", source: "sensor" },
  { key: "rainfall",    label: "Rainfall",    icon: "🌧️", unit: " mm",   min: 0,  max: 300, low: 0,   high: 250, decimals: 1, color: "#3b82f6", source: "weather" },
];

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ param, value, flash }) {
  const pct = value != null ? Math.min(100, Math.max(0, ((value - param.min) / (param.max - param.min)) * 100)) : 0;
  const status = value == null ? "nd" : value < param.low ? "crit" : value > param.high ? "warn" : "ok";
  const statusMap = {
    ok:   { label: "Normal",   dot: "bg-emerald-400", bar: "bg-emerald-400", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-200 dark:ring-emerald-800" },
    warn: { label: "Warning",  dot: "bg-amber-400",   bar: "bg-amber-400",   text: "text-amber-600 dark:text-amber-400",     ring: "ring-amber-200 dark:ring-amber-800" },
    crit: { label: "Critical", dot: "bg-red-500",     bar: "bg-red-500",     text: "text-red-600 dark:text-red-400",         ring: "ring-red-200 dark:ring-red-800" },
    nd:   { label: "No data",  dot: "bg-gray-300",    bar: "bg-gray-200",    text: "text-gray-400 dark:text-slate-500",      ring: "ring-gray-100 dark:ring-slate-700" },
  };
  const S = statusMap[status];

  return (
    <div className={`group relative bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-gray-100 dark:border-slate-700/60  hover:shadow-md transition-all duration-300 overflow-hidden ${flash ? "ring-2 " + S.ring + " scale-[1.02]" : ""}`}>
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-4 translate-x-4" style={{ background: param.color }} />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{param.icon}</span>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">{param.label}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              {param.source === "weather" ? "🌤 Weather" : "📡 Sensor"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${S.dot} ${status === "ok" ? "animate-pulse" : ""}`} />
          <span className={`text-xs font-semibold ${S.text}`}>{S.label}</span>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-3xl font-bold text-gray-900 dark:text-slate-100 tabular-nums">
          {value != null ? Number(value).toFixed(param.decimals) : "—"}
        </span>
        <span className="text-sm text-gray-400 dark:text-slate-500 ml-1">{param.unit.trim()}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${S.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-300 dark:text-slate-600 mt-1">
        <span>{param.min}</span><span>{param.max}{param.unit.trim()}</span>
      </div>
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color, w = 100, h = 36 }) {
  const vals = (data || []).map(Number).filter(v => !isNaN(v));
  if (vals.length < 2) return <div className="h-9 flex items-center text-xs text-gray-300 dark:text-slate-600">—</div>;
  const mn = Math.min(...vals), mx = Math.max(...vals), range = mx - mn || 1;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - mn) / range) * (h - 4) - 2}`).join(" ");
  const last = vals[vals.length - 1];
  const lx = w, ly = h - ((last - mn) / range) * (h - 4) - 2;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      <circle cx={lx} cy={ly} r="3" fill={color} />
    </svg>
  );
}

// ── Alert Banner ──────────────────────────────────────────────────────────────
function AlertBanner({ alerts }) {
  const [idx, setIdx] = useState(0);
  if (!alerts.length) return null;
  const a = alerts[idx];
  const crit = a.level === "critical";
  return (
    <div className={`rounded-2xl border p-4 flex items-start gap-3 ${crit ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800" : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"}`}>
      <span className="text-xl flex-shrink-0 mt-0.5">{crit ? "🔴" : "🟡"}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${crit ? "text-red-800 dark:text-red-300" : "text-amber-800 dark:text-amber-300"}`}>{a.message}</p>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">💊 {a.action}</p>
      </div>
      {alerts.length > 1 && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setIdx(i => (i - 1 + alerts.length) % alerts.length)} className="w-6 h-6 rounded-full bg-white/60 dark:bg-slate-700 text-xs flex items-center justify-center hover:bg-white transition">‹</button>
          <span className="text-xs text-gray-400">{idx + 1}/{alerts.length}</span>
          <button onClick={() => setIdx(i => (i + 1) % alerts.length)} className="w-6 h-6 rounded-full bg-white/60 dark:bg-slate-700 text-xs flex items-center justify-center hover:bg-white transition">›</button>
        </div>
      )}
    </div>
  );
}

// ── Device Key Panel ──────────────────────────────────────────────────────────
function DeviceKeyPanel({ t }) {
  const [deviceKey, setDeviceKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [regen, setRegen] = useState(false);

  useEffect(() => { getSensorDeviceKey().then(r => setDeviceKey(r.data.deviceKey)).catch(() => {}); }, []);

  async function handleRegen() {
    if (!window.confirm("Regenerate device key? Your Arduino sketch will need updating.")) return;
    setRegen(true);
    try { const r = await regenerateSensorDeviceKey(); setDeviceKey(r.data.deviceKey); }
    finally { setRegen(false); }
  }

  function copy(text) {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">🔑 Device API Key</h3>
          <p className="text-xs text-slate-400 mt-0.5">Paste into your Arduino sketch — no login needed</p>
        </div>
        <button onClick={handleRegen} disabled={regen}
          className="text-xs text-slate-400 hover:text-white transition disabled:opacity-40 flex items-center gap-1">
          {regen ? <span className="w-3 h-3 border border-slate-400 border-t-white rounded-full animate-spin" /> : "🔄"} Regenerate
        </button>
      </div>
      {deviceKey ? (
        <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2">
          <code className="flex-1 text-emerald-400 text-xs font-mono truncate">{deviceKey}</code>
          <button onClick={() => copy(deviceKey)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition flex-shrink-0 ${copied ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      ) : (
        <div className="h-9 bg-slate-800 rounded-xl animate-pulse" />
      )}
      <p className="text-xs text-amber-400/80">⚠ Keep this private. Regenerate immediately if compromised.</p>
    </div>
  );
}

// ── Startup Kit Vision ────────────────────────────────────────────────────────
function StartupKitVision() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 p-6">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full -translate-y-16 translate-x-16" />
      <div className="relative">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">🌱</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 dark:text-slate-100">CropYield IoT Starter Kit</h3>
              <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-700">
                🚧 Under Development
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              An affordable soil monitoring kit built for Indian farmers — plug in, power on, see your field data live.
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed mb-5">
          Most IoT soil sensors cost ₹15,000–₹50,000 — completely out of reach for a small farmer.
          We are building a plug-and-play kit under <strong className="text-emerald-700 dark:text-emerald-400">₹5,000</strong> that
          measures all 7 key parameters and sends data directly to this dashboard in real time.
          No technical knowledge required. Just a power socket and Wi-Fi.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: "💰", label: "Target Price", value: "< ₹5,000" },
            { icon: "⏱️", label: "Setup Time",   value: "< 15 min" },
            { icon: "📡", label: "Update Rate",  value: "Every 60s" },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-white dark:border-slate-700">
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
              <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {["🌿 N", "🌱 P", "💪 K", "🧪 pH", "🌡️ Temp", "💦 Humidity", "🌧️ Rainfall"].map(p => (
            <span key={p} className="bg-white/80 dark:bg-slate-800/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-gray-700 dark:text-slate-300 px-2.5 py-1 rounded-full">{p}</span>
          ))}
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            We are prototyping and testing the hardware. The dashboard is fully ready — once the kit ships, plug it in and your data appears here instantly.
            Interested in early testing? Reach out via the community section.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Manual Entry Form ─────────────────────────────────────────────────────────
function ManualEntryForm({ onSubmit, loading, t }) {
  const [form, setForm] = useState({ deviceId: "manual", label: "", nitrogen: "", phosphorus: "", potassium: "", soilPh: "", temperature: "", humidity: "" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const inp = "w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition placeholder:text-gray-300 dark:placeholder:text-slate-500";
  const FIELDS = [
    { key: "nitrogen",    label: "Nitrogen",    unit: "mg/kg", ph: "e.g. 42",  step: "1"   },
    { key: "phosphorus",  label: "Phosphorus",  unit: "mg/kg", ph: "e.g. 18",  step: "1"   },
    { key: "potassium",   label: "Potassium",   unit: "mg/kg", ph: "e.g. 35",  step: "1"   },
    { key: "soilPh",      label: "Soil pH",     unit: "0–14",  ph: "e.g. 6.8", step: "0.1" },
    { key: "temperature", label: "Temperature", unit: "°C",    ph: "e.g. 24",  step: "0.1" },
    { key: "humidity",    label: "Humidity",    unit: "%",     ph: "e.g. 65",  step: "0.1" },
  ];
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="card rounded-2xl p-6  space-y-5">
      <div>
        <h3 className="font-bold text-gray-900 dark:text-slate-100 text-base">✏️ Manual Entry</h3>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">No IoT device yet? Enter readings from a soil test report or lab result.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 block">Field Name</label>
          <input value={form.label} onChange={set("label")} className={inp} placeholder="e.g. North Field" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 block">Device ID</label>
          <input value={form.deviceId} onChange={set("deviceId")} className={inp} placeholder="manual" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {FIELDS.map(({ key, label, unit, ph, step }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 block">
              {label} <span className="font-normal text-gray-300 dark:text-slate-600">({unit})</span>
            </label>
            <input type="number" step={step} value={form[key]} onChange={set(key)} className={inp} placeholder={ph} />
          </div>
        ))}
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-60 flex items-center justify-center gap-2 ">
        {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</> : "Save Reading →"}
      </button>
    </form>
  );
}

// ── History Table ─────────────────────────────────────────────────────────────
function HistoryTable({ history, onDelete }) {
  const [deleting, setDeleting] = useState(null);
  if (!history.length) return null;
  const COLS  = ["nitrogen", "phosphorus", "potassium", "soilPh", "temperature", "humidity"];
  const HEADS = ["N", "P", "K", "pH", "Temp", "Hum"];
  return (
    <div className="card rounded-2xl overflow-hidden ">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700/60 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300">Reading History</h3>
        <span className="text-xs text-gray-400 dark:text-slate-500">{history.length} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-700/30 text-gray-400 dark:text-slate-500">
              <th className="px-4 py-2.5 text-left font-semibold">Time</th>
              <th className="px-4 py-2.5 text-left font-semibold">Field</th>
              {HEADS.map(h => <th key={h} className="px-3 py-2.5 text-center font-semibold">{h}</th>)}
              <th className="px-3 py-2.5 text-center font-semibold" />
            </tr>
          </thead>
          <tbody>
            {[...history].reverse().slice(0, 20).map((r, i) => (
              <tr key={r._id || i} className="border-t border-gray-50 dark:border-slate-700/30 hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition">
                <td className="px-4 py-2.5 text-gray-400 dark:text-slate-500 whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-2.5 text-gray-700 dark:text-slate-300 font-medium">{r.label || r.deviceId}</td>
                {COLS.map(k => (
                  <td key={k} className="px-3 py-2.5 text-center text-gray-600 dark:text-slate-400 tabular-nums">
                    {r[k] != null ? Number(r[k]).toFixed(1) : <span className="text-gray-200 dark:text-slate-700">—</span>}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-center">
                  <button type="button" disabled={deleting === r._id}
                    onClick={async () => {
                      if (!window.confirm("Delete this reading?")) return;
                      setDeleting(r._id);
                      try { await deleteSensorReading(r._id); onDelete(r._id); }
                      catch { alert("Could not delete."); }
                      finally { setDeleting(null); }
                    }}
                    className="text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition disabled:opacity-40 text-base">
                    {deleting === r._id ? "…" : "×"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function IoTDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [readings,       setReadings]       = useState([]);
  const [history,        setHistory]        = useState([]);
  const [alerts,         setAlerts]         = useState([]);
  const [rainfall,       setRainfall]       = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState(null);
  const [selectedDevice, setSelectedDevice] = useState("default");
  const [showHistory,    setShowHistory]    = useState(false);
  const [showVision,     setShowVision]     = useState(false);
  const [socketStatus,   setSocketStatus]   = useState("connecting");
  const [flashKeys,      setFlashKeys]      = useState({});
  const [activeTab,      setActiveTab]      = useState("overview"); // overview | entry | history
  const socketRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      const [lr, ar] = await Promise.all([getSensorLatest(), getSensorAlerts()]);
      setReadings(lr.data.readings || []);
      setAlerts(ar.data.alerts || []);
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  }, []);

  const fetchHistory = useCallback(async (deviceId) => {
    try { const res = await getSensorHistory(deviceId, 48); setHistory(res.data.readings || []); } catch {}
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const res = await getWeatherForecast(pos.coords.latitude, pos.coords.longitude);
        setRainfall(res.data?.daily?.precipitation_sum?.[0] ?? null);
      } catch {}
    }, () => {});
  }, []);

  useEffect(() => { fetchAll(); fetchHistory(selectedDevice); }, [fetchAll, fetchHistory, selectedDevice]);

  useEffect(() => {
    if (!user?._id) return;
    const socket = socketIO(SERVER, { withCredentials: true, transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => { setSocketStatus("live"); socket.emit("join", user._id); });
    socket.on("disconnect", () => setSocketStatus("disconnected"));
    socket.on("connect_error", () => setSocketStatus("disconnected"));
    socket.on("sensor:update", ({ reading, alerts: newAlerts }) => {
      setReadings(prev => {
        const idx = prev.findIndex(r => r.deviceId === reading.deviceId);
        const updated = { ...reading, alerts: newAlerts };
        if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next; }
        return [...prev, updated];
      });
      setHistory(prev => [...prev, reading].slice(-48));
      setAlerts(newAlerts);
      const changed = {};
      PARAMS.forEach(p => { if (reading[p.key] != null) changed[p.key] = true; });
      setFlashKeys(changed);
      setTimeout(() => setFlashKeys({}), 800);
    });
    return () => { socket.disconnect(); };
  }, [user?._id]);

  async function handleSubmit(form) {
    setSaving(true); setError(null);
    try {
      await postSensorReading(form);
      const dev = form.deviceId || "default";
      setSelectedDevice(dev);
      await fetchAll(); await fetchHistory(dev);
      setActiveTab("overview");
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setSaving(false); }
  }

  function useForPrediction() {
    if (!latest) return;
    navigate("/prediction", { state: { prefill: { soilPh: latest.soilPh, nitrogen: latest.nitrogen, phosphorus: latest.phosphorus, potassium: latest.potassium } } });
  }

  const latest      = readings.find(r => r.deviceId === selectedDevice) || readings[0];
  const devices     = [...new Set(readings.map(r => r.deviceId))];
  const hasData     = readings.length > 0;
  const critCount   = alerts.filter(a => a.level === "critical").length;
  const warnCount   = alerts.filter(a => a.level === "warning").length;
  const displayVals = latest ? { ...latest, rainfall: rainfall ?? latest.rainfall } : { rainfall };

  const statusColor = socketStatus === "live" ? "bg-emerald-500" : socketStatus === "connecting" ? "bg-amber-400" : "bg-gray-400";
  const statusLabel = socketStatus === "live" ? "Live" : socketStatus === "connecting" ? "Connecting" : "Offline";

  return (
    <div className="min-h-screen bg-page font-[Outfit,system-ui,sans-serif]">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f4c2a] via-[#166534] to-[#15803d] text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #4ade80 0%, transparent 50%), radial-gradient(circle at 80% 20%, #86efac 0%, transparent 40%)" }} />
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2.5 h-2.5 rounded-full ${statusColor} ${socketStatus === "live" ? "animate-pulse" : ""}`} />
                <span className="text-emerald-300 text-sm font-medium">{statusLabel}</span>
                <span className="text-emerald-500 text-sm">·</span>
                <span className="text-emerald-300 text-sm">IoT Sensor Dashboard</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                Soil Intelligence
                <span className="block text-emerald-300 text-2xl md:text-3xl font-normal mt-1">Real-time field monitoring</span>
              </h1>
              <p className="text-emerald-200/80 text-sm max-w-md leading-relaxed">
                7 parameters tracked live — N, P, K, pH, Temperature, Humidity, and Rainfall.
                Instant alerts when your soil needs attention.
              </p>

              {/* Alert badges */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {critCount > 0 && (
                  <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-400/30 text-red-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />{critCount} Critical
                  </span>
                )}
                {warnCount > 0 && (
                  <span className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{warnCount} Warning
                  </span>
                )}
                {alerts.length === 0 && hasData && (
                  <span className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />All Normal
                  </span>
                )}
              </div>
            </div>

            {/* Hero actions */}
            <div className="flex flex-col gap-2 items-end">
              {latest && (
                <button onClick={useForPrediction}
                  className="bg-white text-emerald-800 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition shadow-lg flex items-center gap-2">
                  🌾 Use for Prediction
                </button>
              )}
              <button onClick={() => { fetchAll(); fetchHistory(selectedDevice); }}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition flex items-center gap-2">
                ↻ Refresh
              </button>
              {latest && (
                <p className="text-emerald-300/60 text-xs text-right">
                  Last update {new Date(latest.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  {latest.label && ` · ${latest.label}`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-1">
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "entry",    label: "✏️ Manual Entry" },
            { id: "history",  label: `🗂 History${history.length ? ` (${history.length})` : ""}` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3.5 text-sm font-semibold border-b-2 transition whitespace-nowrap ${activeTab === tab.id ? "border-emerald-600 text-emerald-700 dark:text-emerald-400" : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Device selector */}
        {devices.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {devices.map(d => (
              <button key={d} onClick={() => { setSelectedDevice(d); fetchHistory(d); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${selectedDevice === d ? "bg-emerald-600 text-white border-emerald-600 " : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-emerald-300"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selectedDevice === d ? "bg-white" : "bg-gray-300"}`} />
                {readings.find(r => r.deviceId === d)?.label || d}
              </button>
            ))}
          </div>
        )}

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">

            {/* Alert banner */}
            {alerts.length > 0 && <AlertBanner alerts={alerts} />}
            {alerts.length === 0 && !loading && hasData && (
              <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl px-5 py-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">All sensors normal</p>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-500">Farm conditions are within healthy ranges.</p>
                </div>
              </div>
            )}

            {/* 7 stat cards */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[...Array(7)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />)}
              </div>
            ) : (
              <>
                {!hasData && (
                  <div className="text-center py-16 space-y-3">
                    <div className="text-5xl">📡</div>
                    <p className="font-semibold text-gray-700 dark:text-slate-300">No sensor data yet</p>
                    <p className="text-sm text-gray-400 dark:text-slate-500">Connect an IoT device or enter readings manually.</p>
                    <button onClick={() => setActiveTab("entry")}
                      className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
                      Enter Manually →
                    </button>
                  </div>
                )}
                {hasData && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {PARAMS.map(p => (
                      <StatCard key={p.key} param={p} value={displayVals?.[p.key]} flash={!!flashKeys[p.key]} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Trend sparklines */}
            {history.length > 1 && (
              <div className="card rounded-2xl p-6 ">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-900 dark:text-slate-100">Trend History</h2>
                  <span className="text-xs text-gray-400 dark:text-slate-500">{history.length} readings</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {PARAMS.filter(p => p.source === "sensor").map(({ key, label, color, unit }) => {
                    const vals = history.map(r => r[key]).filter(v => v != null);
                    if (!vals.length) return null;
                    const last = vals[vals.length - 1];
                    const mn = Math.min(...vals), mx = Math.max(...vals);
                    const trend = vals.length > 1 ? (vals[vals.length - 1] - vals[vals.length - 2]) : 0;
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-600 dark:text-slate-400">{label}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-slate-100 tabular-nums">{Number(last).toFixed(1)}{unit.trim()}</span>
                            {trend !== 0 && <span className={`text-xs ${trend > 0 ? "text-red-400" : "text-emerald-400"}`}>{trend > 0 ? "↑" : "↓"}</span>}
                          </div>
                        </div>
                        <Sparkline data={vals} color={color} />
                        <div className="flex justify-between text-xs text-gray-300 dark:text-slate-600">
                          <span>↓{mn.toFixed(1)}</span><span>↑{mx.toFixed(1)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Device key */}
            <DeviceKeyPanel t={t} />

            {/* Startup kit vision — collapsible */}
            <div>
              <button onClick={() => setShowVision(v => !v)}
                className="w-full flex items-center justify-between card rounded-2xl px-5 py-4 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700 transition ">
                <span className="flex items-center gap-2">
                  🌱 CropYield IoT Starter Kit — Our Vision
                  <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">Under Development</span>
                </span>
                <span className="text-gray-400">{showVision ? "▲" : "▼"}</span>
              </button>
              {showVision && <div className="mt-3"><StartupKitVision /></div>}
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { to: "/prediction", icon: "🌾", label: "Run Prediction" },
                { to: "/weather",    icon: "🌤", label: "Weather" },
                { to: "/dashboard",  icon: "📊", label: "Dashboard" },
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to}
                  className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/60 rounded-xl py-3 text-sm font-medium text-gray-600 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-400 transition ">
                  <span>{icon}</span>{label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── ENTRY TAB ── */}
        {activeTab === "entry" && (
          <div className="max-w-2xl space-y-4">
            <ManualEntryForm onSubmit={handleSubmit} loading={saving} t={t} />
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-700 dark:text-red-400 text-sm">
                ⚠ {error}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <HistoryTable history={history} onDelete={id => setHistory(h => h.filter(r => r._id !== id))} />
        )}

      </main>
      <Footer />
    </div>
  );
}
