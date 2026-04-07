import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

// ── 7 parameters config ───────────────────────────────────────────────────────
const PARAMS = [
  { key: "nitrogen",    label: "Nitrogen",     icon: "🌿", unit: " mg/kg", min: 0,   max: 300, low: 50,  high: 280, decimals: 0, color: "#22c55e", source: "sensor" },
  { key: "phosphorus",  label: "Phosphorus",   icon: "🌱", unit: " mg/kg", min: 0,   max: 100, low: 10,  high: 80,  decimals: 0, color: "#f59e0b", source: "sensor" },
  { key: "potassium",   label: "Potassium",    icon: "💪", unit: " mg/kg", min: 0,   max: 200, low: 20,  high: 150, decimals: 0, color: "#ec4899", source: "sensor" },
  { key: "soilPh",      label: "Soil pH",      icon: "🧪", unit: "",       min: 0,   max: 14,  low: 5.5, high: 8.0, decimals: 1, color: "#8b5cf6", source: "sensor" },
  { key: "temperature", label: "Temperature",  icon: "🌡️", unit: "°C",    min: 0,   max: 50,  low: 5,   high: 45,  decimals: 1, color: "#f97316", source: "sensor" },
  { key: "humidity",    label: "Humidity",     icon: "💦", unit: "%",      min: 0,   max: 100, low: 20,  high: 95,  decimals: 0, color: "#06b6d4", source: "sensor" },
  { key: "rainfall",    label: "Rainfall",     icon: "🌧️", unit: " mm",   min: 0,   max: 300, low: 0,   high: 250, decimals: 1, color: "#3b82f6", source: "weather" },
];

// ── Gauge ─────────────────────────────────────────────────────────────────────
function Gauge({ value, min, max, low, high, unit, label, icon, decimals, flash, source }) {
  const pct = value != null ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : null;
  const status = value == null ? "nd" : value < low ? "crit" : value > high ? "warn" : "ok";
  const C = {
    ok:   { ring: "stroke-green-500", text: "text-green-700 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-200 dark:border-green-700",  badge: "✅ Normal"   },
    warn: { ring: "stroke-amber-400", text: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-900/20",  border: "border-amber-200 dark:border-amber-700",  badge: "🟡 Warning"  },
    crit: { ring: "stroke-red-500",   text: "text-red-600 dark:text-red-400",      bg: "bg-red-50 dark:bg-red-900/20",      border: "border-red-200 dark:border-red-700",      badge: "🔴 Critical" },
    nd:   { ring: "stroke-gray-300",  text: "text-gray-400 dark:text-slate-500",   bg: "bg-gray-50 dark:bg-slate-800",      border: "border-gray-200 dark:border-slate-700",   badge: "⚪ No data"  },
  }[status];
  const circ = 2 * Math.PI * 36;
  const dash = pct != null ? (pct / 100) * circ : 0;
  return (
    <div className={`rounded-2xl border ${C.border} ${C.bg} p-4 flex flex-col items-center gap-2 transition-all duration-300 ${flash ? "ring-2 ring-green-400 scale-105" : ""}`}>
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="7" className="dark:stroke-slate-700" />
          <circle cx="40" cy="40" r="36" fill="none" className={C.ring} strokeWidth="7"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl">{icon}</span>
          <span className={`text-sm font-bold ${C.text}`}>
            {value != null ? `${Number(value).toFixed(decimals)}${unit}` : "—"}
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold text-gray-700 dark:text-slate-300">{label}</div>
        <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{C.badge}</div>
        <div className="text-xs mt-0.5">
          {source === "weather"
            ? <span className="text-blue-500 dark:text-blue-400">🌤 Weather API</span>
            : <span className="text-green-600 dark:text-green-400">📡 Sensor</span>}
        </div>
      </div>
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color = "#22c55e", w = 120, h = 44 }) {
  const vals = (data || []).map(Number).filter(v => !isNaN(v));
  if (vals.length < 2) return <div className="h-11 flex items-center justify-center text-xs text-gray-300 dark:text-slate-600">—</div>;
  const mn = Math.min(...vals), mx = Math.max(...vals), range = mx - mn || 1;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - mn) / range) * (h - 6) - 3}`).join(" ");
  const last = vals[vals.length - 1];
  const lx = w, ly = h - ((last - mn) / range) * (h - 6) - 3;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="3" fill={color} />
    </svg>
  );
}

// ── Alert card ────────────────────────────────────────────────────────────────
function AlertCard({ alert }) {
  const crit = alert.level === "critical";
  return (
    <div className={`rounded-xl border p-4 ${crit ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700" : "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700"}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{crit ? "🔴" : "🟡"}</span>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${crit ? "text-red-800 dark:text-red-300" : "text-amber-800 dark:text-amber-300"}`}>{alert.message}</p>
          <p className="text-xs text-gray-600 dark:text-slate-400 mt-1 leading-relaxed">💊 {alert.action}</p>
        </div>
      </div>
    </div>
  );
}

// ── Device Key Panel ──────────────────────────────────────────────────────────
function DeviceKeyPanel({ t }) {
  const [deviceKey, setDeviceKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regen, setRegen] = useState(false);

  useEffect(() => {
    getSensorDeviceKey().then(r => setDeviceKey(r.data.deviceKey)).catch(() => {});
  }, []);

  async function handleRegen() {
    if (!window.confirm("Regenerate device key? Your Arduino sketch will need updating.")) return;
    setRegen(true);
    try {
      const r = await regenerateSensorDeviceKey();
      setDeviceKey(r.data.deviceKey);
    } finally { setRegen(false); }
  }

  function copy(text) {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 space-y-3">
      <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center">🔑</span>
        {t("Your Device API Key")}
      </h3>
      <p className="text-xs text-gray-500 dark:text-slate-400">
        {t("Paste this key into your Arduino sketch. The device posts directly to the server — no login needed.")}
      </p>
      {deviceKey ? (
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-gray-900 text-green-400 text-xs font-mono px-3 py-2 rounded-xl overflow-x-auto">{deviceKey}</code>
          <button onClick={() => copy(deviceKey)}
            className="bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-3 py-2 rounded-xl transition flex-shrink-0">
            {copied ? "✅ Copied" : "📋 Copy"}
          </button>
          <button onClick={handleRegen} disabled={regen}
            className="bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold px-3 py-2 rounded-xl transition flex-shrink-0 disabled:opacity-50">
            {regen ? "…" : "🔄"}
          </button>
        </div>
      ) : (
        <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded-xl animate-pulse" />
      )}
      <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-3 py-2">
        ⚠ {t("Keep this key private. If compromised, regenerate it immediately.")}
      </p>
    </div>
  );
}

// ── Wiring Diagram — lightbox + download ─────────────────────────────────────
function WiringDiagram({ option }) {
  const [lightbox, setLightbox] = useState(false);
  const [imgMissing, setImgMissing] = useState(false);
  const src = option === "opt1" ? "/images/wiring-opt1.jpg" : "/images/wiring-opt2.jpg";
  const label = option === "opt1" ? "Option 1 Wiring Diagram" : "Option 2 Wiring Diagram";
  const filename = option === "opt1" ? "wiring-opt1.jpg" : "wiring-opt2.jpg";

  // reset missing state when option changes
  useEffect(() => setImgMissing(false), [option]);

  function handleDownload() {
    const a = document.createElement("a");
    a.href = src;
    a.download = filename;
    a.click();
  }

  if (imgMissing) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 flex flex-col items-center justify-center py-10 text-center gap-2">
        <span className="text-4xl">🔌</span>
        <p className="text-sm font-semibold text-gray-600 dark:text-slate-400">{label}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500">
          Add image at{" "}
          <code className="bg-gray-100 dark:bg-slate-600 px-1 rounded">
            public/images/{filename}
          </code>
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Thumbnail with action bar */}
      <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 group relative">
        <img
          src={src}
          alt={label}
          className="w-full object-contain max-h-80 cursor-zoom-in transition-opacity group-hover:opacity-90"
          onClick={() => setLightbox(true)}
          onError={() => setImgMissing(true)}
        />
        {/* Overlay hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
          <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full">🔍 Click to enlarge</span>
        </div>
        {/* Action bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
          <span className="text-xs font-semibold text-gray-600 dark:text-slate-400">{label}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setLightbox(true)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition"
            >
              🔍 View full
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400 hover:text-green-900 transition"
            >
              ⬇ Download
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <img
              src={src}
              alt={label}
              className="w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            />
            {/* Lightbox controls */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={handleDownload}
                className="bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
              >
                ⬇ Download
              </button>
              <button
                onClick={() => setLightbox(false)}
                className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-center text-white/60 text-xs mt-2">{label} — click outside to close</p>
          </div>
        </div>
      )}
    </>
  );
}

// ── Hardware Setup Guide ──────────────────────────────────────────────────────
const OPT1_DEVICES = [
  {
    name: "Arduino Uno R3 (Clone)",
    role: "Central brain — reads sensors & controls Wi-Fi",
    price: "₹200",
    icon: "🧠",
    buyLinks: [
      { label: "Amazon.in", url: "https://www.amazon.in/s?k=arduino+uno+r3+clone" },
    ],
    docLink: "https://docs.arduino.cc/hardware/uno-rev3/",
    specs: ["Microcontroller: ATmega328P", "Operating Voltage: 5V", "Digital I/O Pins: 14", "Analog Input Pins: 6", "Flash Memory: 32 KB", "Clock Speed: 16 MHz"],
    notes: "The CH340 clone works identically to the original. Install CH340 USB driver on Windows if not detected.",
  },
  {
    name: "RS485 NPK Sensor",
    role: "Measures Nitrogen, Phosphorus, Potassium via Modbus RS485",
    price: "₹5,549",
    icon: "🌿",
    buyLinks: [
      { label: "Arrowtechcart", url: "https://arrowtechcart.com/products/soil-npk-sensor-with-rs-485?variant=50355159662886&country=IN&currency=INR&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic&srsltid=AfmBOoosLRf_i6SN5GZeauDyCv8Cd7YKR6kHh3w-yR9J_TA9PU7p4bq3e1A" },
      { label: "Amazon.in", url: "https://www.amazon.in/s?k=rs485+npk+soil+sensor" },
    ],
    docLink: "https://www.modbustools.com/modbus.html",
    specs: ["Protocol: RS485 Modbus RTU", "Supply Voltage: 9–24V DC", "Baud Rate: 4800 bps", "Measures: N, P, K (mg/kg)", "Probe Material: Stainless Steel", "IP Rating: IP68"],
    notes: "Requires MAX485 module to interface with Arduino. Insert probe 10–15 cm deep into moist soil for accurate readings.",
  },
  {
    name: "Analog pH Sensor Kit",
    role: "Measures soil acidity/alkalinity (0–14 pH)",
    price: "₹1,400",
    icon: "🧪",
    buyLinks: [
      { label: "techtonics", url: "https://techtonics.in/product/analog-ph-sensor-kit-with-ph-electrode-probe-for-arduino/?srsltid=AfmBOorl5H-sQL9dODBKOMUyTmHLp_Qvy1Yho5I5FsmjydsWlW3gwegOVvI" },
      { label: "Amazon.in", url: "https://www.amazon.in/s?k=analog+ph+sensor+kit+arduino" },
    ],
    docLink: "https://wiki.dfrobot.com/PH_meter_V1.1_SKU__SEN0161",
    specs: ["Output: Analog voltage (0–3.3V)", "pH Range: 0–14", "Supply Voltage: 5V", "Response Time: < 1 min", "Accuracy: ±0.1 pH", "Probe: BNC connector"],
    notes: "Calibrate with pH 4.0 and pH 7.0 buffer solutions before first use. Rinse probe with distilled water between readings.",
  },
  {
    name: "MAX485 Module",
    role: "Converts RS485 differential signal to TTL for Arduino",
    price: "₹50",
    icon: "🔄",
    buyLinks: [
      { label: "olelectronics", url: "https://olelectronics.in/product/max485/?utm_source=Google%20Shopping&utm_campaign=Google%20Shopping%20Product%20Feed&utm_medium=cpc&utm_term=11218&srsltid=AfmBOoplgcsUG_TThUxxJ4dM_NbspYNy-AjP357S14N3_h2y9svcHLVD5aI" },
      { label: "Amazon.in", url: "https://www.amazon.in/s?k=max485+module" },
    ],
    docLink: "https://www.analog.com/media/en/technical-documentation/data-sheets/MAX1487-MAX491.pdf",
    specs: ["IC: MAX485", "Supply Voltage: 5V", "Data Rate: Up to 2.5 Mbps", "Pins: RO, DI, DE, RE, A, B, VCC, GND", "Half-duplex RS485", "Operating Temp: 0–70°C"],
    notes: "DE and RE pins are tied together and controlled by one Arduino pin to switch between transmit and receive mode.",
  },
  {
    name: "ESP8266 Wi-Fi Module (ESP-01)",
    role: "Connects Arduino to Wi-Fi and sends data to server",
    price: "₹165",
    icon: "📶",
    buyLinks: [
      { label: "graylogix", url: "https://www.graylogix.in/product/esp01-esp8266-wifi-module-original?srsltid=AfmBOorgphjT_gZwulaZJVfMR_xkklm22zRJlRiV6dPuY9nDQtZTAUnQfFY" },
      { label: "Amazon.in", url: "https://www.amazon.in/s?k=esp8266+esp-01+wifi+module" },
    ],
    docLink: "https://www.espressif.com/sites/default/files/documentation/0a-esp8266ex_datasheet_en.pdf",
    specs: ["Wi-Fi: 802.11 b/g/n", "Supply Voltage: 3.3V (strictly)", "Current: 80 mA peak", "Protocol: TCP/IP", "Baud Rate: 115200", "Flash: 1 MB"],
    notes: "⚠ Runs on 3.3V only — connecting to 5V will destroy it. Use a voltage divider or level shifter on TX/RX lines from Arduino.",
  },
  {
    name: "12V 1A Power Adapter",
    role: "Powers the NPK sensor (requires 9–24V) and Arduino",
    price: "₹132",
    icon: "🔌",
    buyLinks: [
      { label: "Amazon.in", url: "https://www.amazon.in/s?k=12v+1a+dc+power+adapter" },
      { label: "quartzcomponents", url: "https://quartzcomponents.com/products/12v-1a-dc-power-adapter?variant=42451535560938&country=IN&currency=INR&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic?utm_source=google&utm_medium=FreeListings&srsltid=AfmBOorI7ThxzvqfJCvIbPv6Ah2_NXJZ_LHhuz0UCvVVFmoVJYY1vjTEK08/" },
    ],
    docLink: null,
    specs: ["Output: 12V DC, 1A", "Connector: 5.5mm barrel jack", "Input: 100–240V AC", "Polarity: Centre positive"],
    notes: "Use a 12V-to-5V buck converter to power the Arduino from the same 12V supply instead of USB.",
  },
  {
    name: "MB102 Breadboard + Jumper Wires",
    role: "Organises all wiring without soldering",
    price: "₹278",
    icon: "🔗",
    buyLinks: [
      { label: "kspelectronics", url: "https://kspelectronics.in/product/mb102-830-points-solderless-breadboard/?srsltid=AfmBOooxCUGfFkFAl2uwuw-9fowtl9davFmTBPFJFRBBA304mjVWc-QhPGM" },
      { label: "Amazon.in", url: "https://www.amazon.in/s?k=mb102+breadboard+jumper+wires+kit" },
    ],
    docLink: null,
    specs: ["830 tie-points", "Includes 65-piece jumper wire set", "Male-to-male, male-to-female wires"],
    notes: "Use different wire colours for power (red=5V, orange=12V, black=GND) to avoid wiring mistakes.",
  },
];

const OPT2_DEVICES = [
  {
    name: "Soil 7-in-1 RS485 Sensor",
    role: "All-in-one: N, P, K, pH, Temperature, Humidity, EC",
    price: "₹4,840",
    icon: "🌱",
    buyLinks: [
      { label: "sumeetinstruments", url: "https://sumeetinstruments.com/Soil-NPK-pH-EC-Temperature-Moisture-7in1-Sensor-RS485?srsltid=AfmBOooaBkk-aZdVEYYo-qr8OdDLick2EGFNhF2MY9HOMINGOo2c092eUrQ" },
      { label: "Amazon.in", url: "https://www.amazon.in/s?k=7+in+1+soil+sensor+npk+ph+rs485" },
    ],
    docLink: "https://www.modbustools.com/modbus.html",
    specs: ["Protocol: RS485 Modbus RTU", "Supply Voltage: 12V DC", "Measures: N, P, K, pH, Temp, Humidity, EC", "Baud Rate: 4800 bps", "Cable: 4-wire (Brown=12V, Black=GND, Yellow=A, Blue=B)", "IP Rating: IP68 Waterproof"],
    notes: "Insert probe 10–15 cm into moist soil. Wait 30 seconds after insertion before reading. No calibration needed — factory calibrated.",
  },
  {
    name: "Arduino Uno R3 (CH340)",
    role: "Processes sensor data and controls Wi-Fi module",
    price: "₹213",
    icon: "🧠",
    buyLinks: [
      { label: "Robu.in", url: "https://robu.in/product/arduino-uno-r3-ch340-development-board/" },
      { label: "Amazon.in", url: "https://www.amazon.in/s?k=arduino+uno+r3+ch340" },
    ],
    docLink: "https://docs.arduino.cc/hardware/uno-rev3/",
    specs: ["Microcontroller: ATmega328P", "USB Chip: CH340 (install driver)", "Operating Voltage: 5V", "Digital I/O: 14 pins", "Analog Input: 6 pins", "Clock: 16 MHz"],
    notes: "Install CH340 driver from: https://sparks.gogo.co.nz/ch340.html — required for Windows/Mac to recognise the board via USB.",
  },
  {
    name: "MAX485 TTL to RS485 Module",
    role: "Bridges the 7-in-1 sensor RS485 signal to Arduino TTL",
    price: "₹26",
    icon: "🔄",
    buyLinks: [
      { label: "quartzcomponents", url: "https://quartzcomponents.com/products/max485-ttl-to-rs485?variant=44161639383274&country=IN&currency=INR&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic?utm_source=google&utm_medium=FreeListings&srsltid=AfmBOoo7JmkAhBgmC3__oHoVGPghoE3BfTMUWjWt-uOHOcE2EVApNJyAzyY" },
      { label: "Amazon.in", url: "https://www.amazon.in/s?k=max485+ttl+rs485+module" },
    ],
    docLink: "https://www.analog.com/media/en/technical-documentation/data-sheets/MAX1487-MAX491.pdf",
    specs: ["IC: MAX485", "Supply: 5V", "Half-duplex", "Pins: RO, DI, DE, RE, A, B", "Data Rate: 2.5 Mbps max"],
    notes: "Connect DE and RE together to a single Arduino pin (Pin 4). HIGH = transmit, LOW = receive.",
  },
  {
    name: "ESP8266 Wi-Fi Module (ESP-01)",
    role: "Connects Arduino to Wi-Fi and sends data to server",
    price: "₹165",
    icon: "📶",
    buyLinks: [
      { label: "graylogix", url: "https://www.graylogix.in/product/esp01-esp8266-wifi-module-original?srsltid=AfmBOorgphjT_gZwulaZJVfMR_xkklm22zRJlRiV6dPuY9nDQtZTAUnQfFY" },
      { label: "Amazon.in", url: "https://www.amazon.in/s?k=esp8266+esp-01+wifi+module" },
    ],
    docLink: "https://www.espressif.com/sites/default/files/documentation/0a-esp8266ex_datasheet_en.pdf",
    specs: ["Wi-Fi: 802.11 b/g/n", "Supply Voltage: 3.3V (strictly)", "Current: 80 mA peak", "Protocol: TCP/IP", "Baud Rate: 115200", "Flash: 1 MB"],
    notes: "⚠ Runs on 3.3V only — connecting to 5V will destroy it. Use a voltage divider or level shifter on TX/RX lines from Arduino.",
  },
  {
    name: "12V 2A Power Adapter",
    role: "Stable power for both the 7-in-1 sensor and Arduino",
    price: "₹129",
    icon: "🔌",
    buyLinks: [
      { label: "Amazon.in", url: "https://www.amazon.in/s?k=12v+2a+dc+adapter" },
    ],
    docLink: null,
    specs: ["Output: 12V DC, 2A", "Connector: 5.5mm barrel jack", "Input: 100–240V AC"],
    notes: "Tap the 12V line into the Arduino's DC barrel jack (Vin pin accepts 7–12V). No separate USB needed.",
  },
];

function DeviceCard({ device }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <span className="text-3xl flex-shrink-0">{device.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h4 className="font-bold text-gray-800 dark:text-slate-200 text-sm">{device.name}</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{device.role}</p>
            </div>
            <span className="text-sm font-bold text-green-700 dark:text-green-400 flex-shrink-0">{device.price}</span>
          </div>
          {/* Buy links */}
          <div className="flex flex-wrap gap-2 mt-2">
            {device.buyLinks.map(l => (
              <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-3 py-1 rounded-lg transition">
                🛒 {l.label}
              </a>
            ))}
            {device.docLink && (
              <a href={device.docLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700 text-xs font-semibold px-3 py-1 rounded-lg transition">
                📄 Datasheet
              </a>
            )}
          </div>
        </div>
      </div>
      {/* Expand toggle */}
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-slate-700/40 border-t border-gray-100 dark:border-slate-700 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition">
        <span>{open ? "Hide" : "Show"} specs & notes</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 space-y-3 border-t border-gray-50 dark:border-slate-700">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">Specifications</p>
            <ul className="space-y-0.5">
              {device.specs.map((s, i) => (
                <li key={i} className="text-xs text-gray-700 dark:text-slate-300 flex items-start gap-1.5">
                  <span className="text-green-500 flex-shrink-0 mt-0.5">•</span>{s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
            💡 {device.notes}
          </div>
        </div>
      )}
    </div>
  );
}

function HardwareGuide({ t }) {
  const [option, setOption] = useState("opt2");
  const [codeTab, setCodeTab] = useState("arduino");

  const OPT1_COMPONENTS = OPT1_DEVICES;
  const OPT2_COMPONENTS = OPT2_DEVICES;

  const ARDUINO_CODE = `#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <SoftwareSerial.h>

// ── Config — replace these ────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL    = "http://YOUR_SERVER_IP:5001/api/sensor/device";
const char* DEVICE_KEY    = "YOUR_DEVICE_KEY_HERE";  // from dashboard
const char* DEVICE_ID     = "field-sensor-1";
const char* LABEL         = "North Field";

// ── RS485 / MAX485 pins ───────────────────────────────────
SoftwareSerial rs485Serial(2, 3); // RO=D2, DI=D3
#define DE_RE_PIN 4

// ── 7-in-1 Modbus query (NPK+pH+Temp+Hum) ────────────────
byte query[] = {0x01,0x03,0x00,0x00,0x00,0x07,0x04,0x08};

void setup() {
  Serial.begin(115200);
  rs485Serial.begin(4800);
  pinMode(DE_RE_PIN, OUTPUT);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
  Serial.println("WiFi connected");
}

float readSensor(int reg) {
  // Send Modbus query
  digitalWrite(DE_RE_PIN, HIGH);
  rs485Serial.write(query, sizeof(query));
  rs485Serial.flush();
  digitalWrite(DE_RE_PIN, LOW);
  delay(200);

  byte response[19];
  int i = 0;
  while (rs485Serial.available() && i < 19) response[i++] = rs485Serial.read();

  if (i < 19) return -1;
  // Parse: each register is 2 bytes starting at response[3]
  // reg 0=Hum, 1=Temp, 2=EC, 3=pH, 4=N, 5=P, 6=K
  int idx = 3 + reg * 2;
  return ((response[idx] << 8) | response[idx+1]) / 10.0;
}

void loop() {
  float humidity    = readSensor(0);
  float temperature = readSensor(1);
  float ph          = readSensor(3);
  float nitrogen    = readSensor(4);
  float phosphorus  = readSensor(5);
  float potassium   = readSensor(6);

  StaticJsonDocument<256> doc;
  doc["deviceKey"]    = DEVICE_KEY;
  doc["deviceId"]     = DEVICE_ID;
  doc["label"]        = LABEL;
  doc["nitrogen"]     = nitrogen;
  doc["phosphorus"]   = phosphorus;
  doc["potassium"]    = potassium;
  doc["soilPh"]       = ph;
  doc["temperature"]  = temperature;
  doc["humidity"]     = humidity;
  String body; serializeJson(doc, body);

  WiFiClient client;
  HTTPClient http;
  http.begin(client, SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(body);
  Serial.println("HTTP " + String(code));
  http.end();

  delay(60000); // every 60 seconds
}`;

  const CURL_CODE = `# Test from terminal — replace YOUR_DEVICE_KEY and YOUR_SERVER_IP

curl -X POST http://YOUR_SERVER_IP:5001/api/sensor/device \\
  -H "Content-Type: application/json" \\
  -d '{
    "deviceKey":   "YOUR_DEVICE_KEY",
    "deviceId":    "test-device",
    "label":       "Test Field",
    "nitrogen":    42,
    "phosphorus":  18,
    "potassium":   35,
    "soilPh":      6.8,
    "temperature": 24.5,
    "humidity":    62
  }'

# Expected: {"reading": {...}, "alerts": [...]}`;

  const FLOW_STEPS = [
    { icon: "🔌", title: "Sensor reads data", desc: "7-in-1 probe measures N, P, K, pH, Temp, Humidity via RS485" },
    { icon: "🔧", title: "Arduino processes", desc: "Sends Modbus query via MAX485, unpacks 7 values from response" },
    { icon: "📶", title: "ESP8266 sends HTTP POST", desc: `POST to /api/sensor/device with deviceKey — no login needed` },
    { icon: "🗄️", title: "Server saves to MongoDB", desc: "Backend validates, stores reading, generates alerts" },
    { icon: "⚡", title: "Socket.IO pushes live", desc: "Dashboard updates instantly — no page refresh needed" },
    { icon: "🌤", title: "Rainfall from Weather API", desc: "Auto-fetched by your location, shown alongside sensor data" },
  ];

  return (
    <div className="space-y-6">
      {/* Data flow */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5">
        <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm mb-4">⚡ {t("How Data Reaches Your Dashboard")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FLOW_STEPS.map((s, i) => (
            <div key={i} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xs font-semibold text-gray-800 dark:text-slate-200">{s.title}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Option tabs */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-slate-700">
          {[
            { id: "opt1", label: "Option 1 — Individual Sensors", price: "₹7,774" },
            { id: "opt2", label: "Option 2 — 7-in-1 Integrated ⭐", price: "₹5,373" },
          ].map(o => (
            <button key={o.id} onClick={() => setOption(o.id)}
              className={`flex-1 px-4 py-3 text-xs font-semibold border-b-2 transition ${option === o.id ? "border-green-600 text-green-700 dark:text-green-400 bg-white dark:bg-slate-800" : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 bg-gray-50 dark:bg-slate-700/30"}`}>
              {o.label} <span className="ml-1 text-green-600 dark:text-green-400">{o.price}</span>
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {/* Wiring diagram — click to lightbox, download button */}
          <WiringDiagram option={option} />

          {/* Device cards with buy links, specs, docs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wide">
              🛒 Components — Click to buy & view specs
            </h4>
            {(option === "opt1" ? OPT1_COMPONENTS : OPT2_COMPONENTS).map((device, i) => (
              <DeviceCard key={i} device={device} />
            ))}
            {/* Total */}
            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl px-4 py-3">
              <span className="font-bold text-gray-800 dark:text-slate-200 text-sm">Total Estimated Cost</span>
              <span className="font-bold text-green-700 dark:text-green-400 text-lg">
                {option === "opt1" ? "₹7,774" : "₹5,373"}
              </span>
            </div>
          </div>

          {/* Comparison (opt2 only) */}
          {option === "opt2" && (
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              {[
                { label: "Ease of Assembly", opt1: "Moderate (multiple boards)", opt2: "✅ High (simple wiring)" },
                { label: "Durability", opt1: "Sensitive (exposed pH board)", opt2: "✅ Industrial (fully waterproof)" },
                { label: "Maintenance", opt1: "pH probe needs calibration often", opt2: "✅ Self-contained, very stable" },
                { label: "Scalability", opt1: "Harder to mass-produce", opt2: "✅ Ideal for mass production" },
              ].map(({ label, opt1, opt2 }) => (
                <div key={label} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 border border-gray-100 dark:border-slate-600">
                  <div className="font-semibold text-gray-700 dark:text-slate-300 mb-1">{label}</div>
                  <div className="text-gray-400 dark:text-slate-500">Option 1: {opt1}</div>
                  <div className="text-green-600 dark:text-green-400">Option 2: {opt2}</div>
                </div>
              ))}
            </div>
          )}

          {/* Full step-by-step connection guide */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wide">
              🔌 Step-by-Step Connection Guide
            </h4>
            {option === "opt1" ? (
              <div className="space-y-3">
                {[
                  {
                    step: "1", title: "Power Setup",
                    color: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700",
                    badge: "bg-orange-500",
                    items: [
                      "Connect 12V adapter → Breadboard positive rail (red)",
                      "Connect GND → Breadboard negative rail (black)",
                      "Add a 12V-to-5V buck converter: IN+ → 12V rail, IN- → GND rail",
                      "Buck converter OUT+ → Arduino 5V pin, OUT- → Arduino GND",
                    ],
                  },
                  {
                    step: "2", title: "NPK Sensor → MAX485",
                    color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
                    badge: "bg-green-600",
                    items: [
                      "NPK Sensor V+ (red wire) → 12V rail on breadboard",
                      "NPK Sensor V- (black wire) → GND rail on breadboard",
                      "NPK Sensor A (yellow wire) → MAX485 pin A",
                      "NPK Sensor B (blue wire) → MAX485 pin B",
                    ],
                  },
                  {
                    step: "3", title: "MAX485 → Arduino",
                    color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
                    badge: "bg-blue-600",
                    items: [
                      "MAX485 VCC → Arduino 5V",
                      "MAX485 GND → Arduino GND",
                      "MAX485 RO (Receiver Out) → Arduino Digital Pin 2",
                      "MAX485 DI (Driver In) → Arduino Digital Pin 3",
                      "MAX485 DE + RE (tied together) → Arduino Digital Pin 4",
                    ],
                  },
                  {
                    step: "4", title: "pH Sensor → Arduino",
                    color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700",
                    badge: "bg-purple-600",
                    items: [
                      "pH Sensor board VCC → Arduino 5V",
                      "pH Sensor board GND → Arduino GND",
                      "pH Sensor board Po (analog out) → Arduino A0",
                      "Calibrate: dip probe in pH 7.0 buffer, adjust potentiometer until reading = 7.0",
                    ],
                  },
                  {
                    step: "5", title: "ESP8266 → Arduino",
                    color: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700",
                    badge: "bg-red-500",
                    items: [
                      "⚠ ESP8266 runs on 3.3V only — use LDO regulator or 3.3V pin",
                      "ESP8266 VCC → Arduino 3.3V pin",
                      "ESP8266 GND → Arduino GND",
                      "ESP8266 TX → Arduino Pin 10 (SoftwareSerial RX)",
                      "Arduino Pin 11 (SoftwareSerial TX) → voltage divider → ESP8266 RX",
                      "Voltage divider: 1kΩ from Arduino TX, then 2kΩ to GND, junction → ESP RX",
                    ],
                  },
                ].map(({ step, title, color, badge, items }) => (
                  <div key={step} className={`rounded-xl border p-4 ${color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-6 h-6 rounded-full ${badge} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>{step}</span>
                      <span className="font-bold text-gray-800 dark:text-slate-200 text-sm">{title}</span>
                    </div>
                    <ul className="space-y-1">
                      {items.map((item, i) => (
                        <li key={i} className="text-xs text-gray-700 dark:text-slate-300 flex items-start gap-1.5">
                          <span className="flex-shrink-0 mt-0.5">→</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  {
                    step: "1", title: "Power Setup",
                    color: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700",
                    badge: "bg-orange-500",
                    items: [
                      "Connect 12V 2A adapter to a terminal block or breadboard power rail",
                      "12V rail → 7-in-1 sensor Brown wire (V+)",
                      "GND rail → 7-in-1 sensor Black wire (GND)",
                      "12V rail → Arduino DC Barrel Jack (Vin) — Arduino regulates internally to 5V",
                    ],
                  },
                  {
                    step: "2", title: "7-in-1 Sensor → MAX485",
                    color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
                    badge: "bg-green-600",
                    items: [
                      "Sensor Yellow wire (RS485-A) → MAX485 pin A",
                      "Sensor Blue wire (RS485-B) → MAX485 pin B",
                      "MAX485 VCC → Arduino 5V",
                      "MAX485 GND → Arduino GND (common ground with sensor)",
                    ],
                  },
                  {
                    step: "3", title: "MAX485 → Arduino",
                    color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
                    badge: "bg-blue-600",
                    items: [
                      "MAX485 RO (Receiver Out) → Arduino Digital Pin 2",
                      "MAX485 DI (Driver In) → Arduino Digital Pin 3",
                      "MAX485 DE + RE (bridge them with a wire) → Arduino Digital Pin 4",
                    ],
                  },
                  {
                    step: "4", title: "ESP8266 → Arduino",
                    color: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700",
                    badge: "bg-red-500",
                    items: [
                      "⚠ ESP8266 is 3.3V only — never connect to 5V",
                      "ESP8266 VCC → Arduino 3.3V pin",
                      "ESP8266 GND → Arduino GND",
                      "ESP8266 TX → Arduino Pin 10 (SoftwareSerial RX — direct, 3.3V is safe for Arduino input)",
                      "Arduino Pin 11 (TX) → 1kΩ resistor → junction → ESP8266 RX",
                      "Junction → 2kΩ resistor → GND (this divides 5V to ~3.3V for ESP RX)",
                    ],
                  },
                  {
                    step: "5", title: "Final Checks",
                    color: "bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600",
                    badge: "bg-gray-600",
                    items: [
                      "Double-check all GND connections share a common ground",
                      "Insert 7-in-1 probe 10–15 cm into moist soil",
                      "Upload Arduino sketch (from code tab below)",
                      "Open Serial Monitor at 115200 baud — you should see 'WiFi connected' then 'HTTP 201'",
                      "Dashboard will update live within 60 seconds of first successful POST",
                    ],
                  },
                ].map(({ step, title, color, badge, items }) => (
                  <div key={step} className={`rounded-xl border p-4 ${color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-6 h-6 rounded-full ${badge} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>{step}</span>
                      <span className="font-bold text-gray-800 dark:text-slate-200 text-sm">{title}</span>
                    </div>
                    <ul className="space-y-1">
                      {items.map((item, i) => (
                        <li key={i} className="text-xs text-gray-700 dark:text-slate-300 flex items-start gap-1.5">
                          <span className="flex-shrink-0 mt-0.5">→</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code tabs */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
          {[
            { id: "arduino", label: "🔧 Arduino + ESP8266" },
            { id: "curl",    label: "💻 cURL / Test" },
          ].map(tb => (
            <button key={tb.id} onClick={() => setCodeTab(tb.id)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${codeTab === tb.id ? "border-green-600 text-green-700 dark:text-green-400 bg-white dark:bg-slate-800" : "border-transparent text-gray-500 dark:text-slate-400"}`}>
              {tb.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <pre className="bg-gray-900 text-green-300 text-xs p-5 overflow-x-auto max-h-96 leading-relaxed font-mono">
            {codeTab === "arduino" ? ARDUINO_CODE : CURL_CODE}
          </pre>
          <button onClick={() => navigator.clipboard?.writeText(codeTab === "arduino" ? ARDUINO_CODE : CURL_CODE)}
            className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
            📋 Copy
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Manual Entry Form ─────────────────────────────────────────────────────────
function ManualEntryForm({ onSubmit, loading, t }) {
  const [form, setForm] = useState({
    deviceId: "manual", label: "",
    nitrogen: "", phosphorus: "", potassium: "",
    soilPh: "", temperature: "", humidity: "",
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const cls = "w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200";
  const FIELDS = [
    { key: "nitrogen",    label: "🌿 Nitrogen (mg/kg)",   ph: "e.g. 42",  step: "1"   },
    { key: "phosphorus",  label: "🌱 Phosphorus (mg/kg)", ph: "e.g. 18",  step: "1"   },
    { key: "potassium",   label: "💪 Potassium (mg/kg)",  ph: "e.g. 35",  step: "1"   },
    { key: "soilPh",      label: "🧪 Soil pH",            ph: "0–14",     step: "0.1" },
    { key: "temperature", label: "🌡️ Temperature (°C)",   ph: "e.g. 24",  step: "0.1" },
    { key: "humidity",    label: "💦 Humidity (%)",       ph: "0–100",    step: "0.1" },
  ];
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}
      className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
      <div>
        <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm uppercase tracking-wide">✏️ {t("Manual Entry")}</h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t("Enter readings manually if you don't have an IoT device yet. Rainfall is fetched from weather API automatically.")}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1 block">{t("Field / Device Name")}</label>
          <input value={form.label} onChange={set("label")} className={cls} placeholder={t("e.g. North Field")} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1 block">{t("Device ID")}</label>
          <input value={form.deviceId} onChange={set("deviceId")} className={cls} placeholder="manual" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {FIELDS.map(({ key, label, ph, step }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1 block">{label}</label>
            <input type="number" step={step} value={form[key]} onChange={set(key)} className={cls} placeholder={ph} />
          </div>
        ))}
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-xl text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
        {loading
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{t("Saving…")}</>
          : `📊 ${t("Save Reading")}`}
      </button>
    </form>
  );
}

// ── History Table ─────────────────────────────────────────────────────────────
function HistoryTable({ history, onDelete, t }) {
  const [deleting, setDeleting] = useState(null);
  if (!history.length) return null;
  const COLS = ["nitrogen", "phosphorus", "potassium", "soilPh", "temperature", "humidity"];
  const HEADS = ["🌿 N", "🌱 P", "💪 K", "🧪 pH", "🌡️ Temp", "💦 Hum%"];
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700">
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">🗂 {t("Reading History")} ({history.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400">
              <th className="px-3 py-2 text-left font-semibold">{t("Time")}</th>
              <th className="px-3 py-2 text-left font-semibold">{t("Field")}</th>
              {HEADS.map(h => <th key={h} className="px-3 py-2 text-center font-semibold">{h}</th>)}
              <th className="px-3 py-2 text-center font-semibold">{t("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {[...history].reverse().slice(0, 20).map((r, i) => (
              <tr key={r._id || i} className="border-t border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                <td className="px-3 py-2 text-gray-500 dark:text-slate-400 whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-3 py-2 text-gray-700 dark:text-slate-300 font-medium">{r.label || r.deviceId}</td>
                {COLS.map(k => (
                  <td key={k} className="px-3 py-2 text-center text-gray-700 dark:text-slate-300">
                    {r[k] != null ? Number(r[k]).toFixed(1) : <span className="text-gray-300 dark:text-slate-600">—</span>}
                  </td>
                ))}
                <td className="px-3 py-2 text-center">
                  <button type="button" disabled={deleting === r._id}
                    onClick={async () => {
                      if (!window.confirm("Delete this reading?")) return;
                      setDeleting(r._id);
                      try { await deleteSensorReading(r._id); onDelete(r._id); }
                      catch { alert("Could not delete."); }
                      finally { setDeleting(null); }
                    }}
                    className="text-red-400 hover:text-red-600 transition disabled:opacity-40">
                    {deleting === r._id ? "…" : "🗑"}
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
  const [showGuide,      setShowGuide]      = useState(false);
  const [socketStatus,   setSocketStatus]   = useState("connecting"); // connecting | live | disconnected
  const [flashKeys,      setFlashKeys]      = useState({});
  const socketRef = useRef(null);

  // ── Fetch initial data ──────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [lr, ar] = await Promise.all([getSensorLatest(), getSensorAlerts()]);
      setReadings(lr.data.readings || []);
      setAlerts(ar.data.alerts || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (deviceId) => {
    try {
      const res = await getSensorHistory(deviceId, 48);
      setHistory(res.data.readings || []);
    } catch {}
  }, []);

  // ── Fetch rainfall from weather API (today's precipitation_sum) ───────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await getWeatherForecast(pos.coords.latitude, pos.coords.longitude);
          // Open-Meteo returns daily.precipitation_sum array; index 0 = today
          const rain = res.data?.daily?.precipitation_sum?.[0] ?? null;
          setRainfall(rain);
        } catch {}
      },
      () => {}
    );
  }, []);

  useEffect(() => { fetchAll(); fetchHistory(selectedDevice); }, [fetchAll, fetchHistory, selectedDevice]);

  // ── Socket.IO real-time connection ─────────────────────────────────────────
  useEffect(() => {
    if (!user?._id) return;

    const socket = socketIO(SERVER, { withCredentials: true, transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketStatus("live");
      socket.emit("join", user._id);
    });

    socket.on("disconnect", () => setSocketStatus("disconnected"));
    socket.on("connect_error", () => setSocketStatus("disconnected"));

    socket.on("sensor:update", ({ reading, alerts: newAlerts }) => {
      // Update readings list
      setReadings(prev => {
        const idx = prev.findIndex(r => r.deviceId === reading.deviceId);
        const updated = { ...reading, alerts: newAlerts };
        if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next; }
        return [...prev, updated];
      });
      // Append to history
      setHistory(prev => [...prev, reading].slice(-48));
      // Update alerts
      setAlerts(newAlerts);
      // Flash changed gauges
      const changed = {};
      PARAMS.forEach(p => { if (reading[p.key] != null) changed[p.key] = true; });
      setFlashKeys(changed);
      setTimeout(() => setFlashKeys({}), 800);
    });

    return () => { socket.disconnect(); };
  }, [user?._id]);

  // ── Manual submit ───────────────────────────────────────────────────────────
  async function handleSubmit(form) {
    setSaving(true); setError(null);
    try {
      await postSensorReading(form);
      const dev = form.deviceId || "default";
      setSelectedDevice(dev);
      await fetchAll();
      await fetchHistory(dev);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDeleteHistory(id) {
    setHistory(h => h.filter(r => r._id !== id));
  }

  function useForPrediction() {
    if (!latest) return;
    navigate("/prediction", {
      state: {
        prefill: {
          soilPh:      latest.soilPh,
          nitrogen:    latest.nitrogen,
          phosphorus:  latest.phosphorus,
          potassium:   latest.potassium,
        },
      },
    });
  }

  const latest       = readings.find(r => r.deviceId === selectedDevice) || readings[0];
  const devices      = [...new Set(readings.map(r => r.deviceId))];
  const hasData      = readings.length > 0;
  const critCount    = alerts.filter(a => a.level === "critical").length;
  const warnCount    = alerts.filter(a => a.level === "warning").length;

  // Build the 7 values for display (rainfall from weather API)
  const displayValues = latest
    ? { ...latest, rainfall: rainfall ?? latest.rainfall }
    : { rainfall };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-[Outfit,system-ui,sans-serif]">
      <Navbar />

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-green-800 to-green-700 text-white px-6 py-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-green-300 text-sm mb-1">📡 {t("IoT Monitoring")}</p>
            <h1 className="text-2xl md:text-3xl font-bold">{t("Live Sensor Dashboard")}</h1>
            <p className="text-green-200 text-sm mt-1">{t("Real-time soil monitoring — 7 parameters, instant alerts.")}</p>
            <div className="flex gap-3 mt-3 flex-wrap">
              {/* Socket status */}
              <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                socketStatus === "live"
                  ? "bg-green-500/20 border-green-400/40 text-green-200"
                  : socketStatus === "connecting"
                  ? "bg-yellow-500/20 border-yellow-400/40 text-yellow-200"
                  : "bg-gray-500/20 border-gray-400/40 text-gray-300"
              }`}>
                <span className={`w-2 h-2 rounded-full ${socketStatus === "live" ? "bg-green-400 animate-pulse" : socketStatus === "connecting" ? "bg-yellow-400 animate-pulse" : "bg-gray-400"}`} />
                {socketStatus === "live" ? "Live" : socketStatus === "connecting" ? "Connecting…" : "Disconnected"}
              </span>
              {critCount > 0 && <span className="bg-red-500/20 border border-red-400/40 text-red-200 text-xs font-semibold px-3 py-1 rounded-full">🔴 {critCount} Critical</span>}
              {warnCount > 0 && <span className="bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold px-3 py-1 rounded-full">🟡 {warnCount} Warning</span>}
              {alerts.length === 0 && hasData && <span className="bg-green-500/20 border border-green-400/40 text-green-200 text-xs font-semibold px-3 py-1 rounded-full">✅ All Normal</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {latest && (
              <button onClick={useForPrediction}
                className="bg-white text-green-800 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-green-50 transition shadow">
                🌾 {t("Use for Prediction")}
              </button>
            )}
            <button onClick={() => { fetchAll(); fetchHistory(selectedDevice); }}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl transition">
              🔄 {t("Refresh")}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 space-y-8">

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {t("Active Alerts")} ({alerts.length})
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {alerts.map((a, i) => <AlertCard key={i} alert={a} />)}
            </div>
          </div>
        )}

        {alerts.length === 0 && !loading && hasData && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300 text-sm">{t("All sensors normal")}</p>
              <p className="text-xs text-green-600 dark:text-green-400">{t("No alerts detected. Your farm conditions are within healthy ranges.")}</p>
            </div>
          </div>
        )}

        {/* Device tabs */}
        {devices.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {devices.map(d => (
              <button key={d} onClick={() => { setSelectedDevice(d); fetchHistory(d); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${selectedDevice === d ? "bg-green-700 text-white border-green-700" : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-green-300"}`}>
                📡 {readings.find(r => r.deviceId === d)?.label || d}
              </button>
            ))}
          </div>
        )}

        {/* 7 Gauges */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(7)].map((_, i) => <div key={i} className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 animate-pulse h-44" />)}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                📊 {t("Live Readings — 7 Parameters")}
                {latest && (
                  <span className="ml-2 text-xs font-normal text-gray-400 dark:text-slate-500 normal-case">
                    · {t("Updated")} {new Date(latest.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    {latest.label && ` · ${latest.label}`}
                  </span>
                )}
              </h2>
              {latest && (
                <button onClick={useForPrediction}
                  className="text-xs font-semibold text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-xl hover:bg-green-100 transition">
                  🌾 {t("Use for Prediction")}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {PARAMS.map(g => (
                <Gauge key={g.key}
                  value={displayValues?.[g.key]}
                  label={t(g.label)} icon={g.icon} unit={g.unit}
                  min={g.min} max={g.max} low={g.low} high={g.high}
                  decimals={g.decimals} source={g.source}
                  flash={!!flashKeys[g.key]} />
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
              📡 N, P, K, pH, Temp, Humidity — from IoT sensor &nbsp;|&nbsp; 🌤 Rainfall — from Weather API
            </p>
          </div>
        )}

        {/* Trend sparklines */}
        {history.length > 1 && (
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-4">
              📈 {t("Trend History")} ({history.length} {t("readings")})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {PARAMS.filter(p => p.source === "sensor").map(({ key, label, color, unit }) => {
                const vals = history.map(r => r[key]).filter(v => v != null);
                if (!vals.length) return null;
                const last = vals[vals.length - 1];
                const mn = Math.min(...vals), mx = Math.max(...vals);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-600 dark:text-slate-400">{t(label)}</span>
                      <span className="font-bold text-gray-800 dark:text-slate-200">{Number(last).toFixed(1)}{unit}</span>
                    </div>
                    <Sparkline data={vals} color={color} />
                    <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500">
                      <span>↓ {mn.toFixed(1)}</span><span>↑ {mx.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History table */}
        {history.length > 0 && (
          <div>
            <button onClick={() => setShowHistory(v => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition">
              🗂 {t("Reading History")} ({history.length}) {showHistory ? "▲" : "▼"}
            </button>
            {showHistory && <div className="mt-3"><HistoryTable history={history} onDelete={handleDeleteHistory} t={t} /></div>}
          </div>
        )}

        {/* Device Key */}
        <DeviceKeyPanel t={t} />

        {/* Manual entry */}
        <ManualEntryForm onSubmit={handleSubmit} loading={saving} t={t} />

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-4 text-red-700 dark:text-red-400 text-sm">
            ⚠ {error}
          </div>
        )}

        {/* Hardware guide toggle */}
        <div>
          <button onClick={() => setShowGuide(v => !v)}
            className="w-full flex items-center justify-between bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 dark:text-slate-300 hover:border-green-300 transition">
            <span>🔌 {t("Hardware Setup Guide — Component Lists, Wiring Diagrams & Code")}</span>
            <span>{showGuide ? "▲" : "▼"}</span>
          </button>
          {showGuide && <div className="mt-4"><HardwareGuide t={t} /></div>}
        </div>

      </main>
      <Footer />
    </div>
  );
}
