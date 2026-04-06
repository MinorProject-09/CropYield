import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext";
import {
  getSensorLatest, getSensorHistory, getSensorAlerts,
  postSensorReading, deleteSensorReading,
} from "../api/api";

// ── Gauge ─────────────────────────────────────────────────────────────────────
function Gauge({ value, min, max, low, high, unit, label, icon, decimals = 1 }) {
  const pct = value != null ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : null;
  const status = value == null ? "nd" : value < low ? "crit" : value > high ? "warn" : "ok";
  const C = {
    ok:   { ring:"stroke-green-500", text:"text-green-700 dark:text-green-400",  bg:"bg-green-50 dark:bg-green-900/20",  border:"border-green-200 dark:border-green-700",  badge:"✅ Normal"   },
    warn: { ring:"stroke-amber-400", text:"text-amber-600 dark:text-amber-400",  bg:"bg-amber-50 dark:bg-amber-900/20",  border:"border-amber-200 dark:border-amber-700",  badge:"🟡 Warning"  },
    crit: { ring:"stroke-red-500",   text:"text-red-600 dark:text-red-400",      bg:"bg-red-50 dark:bg-red-900/20",      border:"border-red-200 dark:border-red-700",      badge:"🔴 Critical" },
    nd:   { ring:"stroke-gray-300",  text:"text-gray-400 dark:text-slate-500",   bg:"bg-gray-50 dark:bg-slate-800",      border:"border-gray-200 dark:border-slate-700",   badge:"⚪ No data"  },
  }[status];
  const circ = 2 * Math.PI * 36;
  const dash = pct != null ? (pct / 100) * circ : 0;
  return (
    <div className={`rounded-2xl border ${C.border} ${C.bg} p-4 flex flex-col items-center gap-2`}>
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
        {value != null && (
          <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            Range: {low}–{high}{unit}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color = "#22c55e", w = 120, h = 44 }) {
  const vals = (data || []).map(Number).filter(v => !isNaN(v));
  if (vals.length < 2) return <div className="h-11 flex items-center justify-center text-xs text-gray-300 dark:text-slate-600">—</div>;
  const mn = Math.min(...vals), mx = Math.max(...vals), range = mx - mn || 1;
  const pts = vals.map((v, i) =>
    `${(i / (vals.length - 1)) * w},${h - ((v - mn) / range) * (h - 6) - 3}`
  ).join(" ");
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
function AlertCard({ alert, t }) {
  const crit = alert.level === "critical";
  return (
    <div className={`rounded-xl border p-4 ${crit ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700" : "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700"}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{crit ? "🔴" : "🟡"}</span>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${crit ? "text-red-800 dark:text-red-300" : "text-amber-800 dark:text-amber-300"}`}>
            {t(alert.message)}
          </p>
          <p className="text-xs text-gray-600 dark:text-slate-400 mt-1 leading-relaxed">
            💊 {t(alert.action)}
          </p>
          {alert.deviceId && alert.deviceId !== "default" && (
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">📡 {alert.label || alert.deviceId}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Manual entry form ─────────────────────────────────────────────────────────
function ManualEntryForm({ onSubmit, loading, t, prefill }) {
  const [form, setForm] = useState({
    deviceId: "default", label: "",
    soilMoisture: "", soilPh: "", nitrogen: "", phosphorus: "", potassium: "",
    temperature: "", humidity: "", rainfall: "",
    ...prefill,
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const cls = "w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200";
  const FIELDS = [
    { key: "soilMoisture", label: "💧 Soil Moisture (%)",  ph: "0–100",    step: "0.1" },
    { key: "soilPh",       label: "🧪 Soil pH",            ph: "0–14",     step: "0.1" },
    { key: "nitrogen",     label: "🌿 Nitrogen (kg/ha)",   ph: "e.g. 120", step: "1"   },
    { key: "phosphorus",   label: "🌱 Phosphorus (kg/ha)", ph: "e.g. 45",  step: "1"   },
    { key: "potassium",    label: "💪 Potassium (kg/ha)",  ph: "e.g. 60",  step: "1"   },
    { key: "temperature",  label: "🌡️ Temperature (°C)",   ph: "e.g. 28",  step: "0.1" },
    { key: "humidity",     label: "💦 Humidity (%)",       ph: "0–100",    step: "0.1" },
    { key: "rainfall",     label: "🌧️ Rainfall (mm)",      ph: "e.g. 50",  step: "0.1" },
  ];
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}
      className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
      <div>
        <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm uppercase tracking-wide">
          📡 {t("Enter Sensor Reading")}
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          {t("Enter readings from your soil test kit or IoT sensor. Leave blank if not available.")}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1 block">{t("Field / Device Name")}</label>
          <input value={form.label} onChange={set("label")} className={cls} placeholder={t("e.g. North Field")} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1 block">{t("Device ID")}</label>
          <input value={form.deviceId} onChange={set("deviceId")} className={cls} placeholder="default" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
          : `📊 ${t("Save Reading & Check Alerts")}`}
      </button>
    </form>
  );
}

// ── History table ─────────────────────────────────────────────────────────────
function HistoryTable({ history, onDelete, t }) {
  const [deleting, setDeleting] = useState(null);
  if (!history.length) return null;
  const COLS = ["soilMoisture","soilPh","nitrogen","phosphorus","potassium","temperature","humidity"];
  const HEADS = ["💧 Moist%","🧪 pH","🌿 N","🌱 P","💪 K","🌡️ Temp","💦 Hum%"];
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
          🗂 {t("Reading History")} ({history.length})
        </h3>
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
                  {new Date(r.createdAt).toLocaleString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
                </td>
                <td className="px-3 py-2 text-gray-700 dark:text-slate-300 font-medium">{r.label || r.deviceId}</td>
                {COLS.map(k => (
                  <td key={k} className="px-3 py-2 text-center text-gray-700 dark:text-slate-300">
                    {r[k] != null ? Number(r[k]).toFixed(1) : <span className="text-gray-300 dark:text-slate-600">—</span>}
                  </td>
                ))}
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    disabled={deleting === r._id}
                    onClick={async () => {
                      if (!window.confirm("Delete this reading?")) return;
                      setDeleting(r._id);
                      try { await deleteSensorReading(r._id); onDelete(r._id); }
                      catch { alert("Could not delete."); }
                      finally { setDeleting(null); }
                    }}
                    className="text-red-400 hover:text-red-600 transition disabled:opacity-40"
                  >
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

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ t, onDemoData }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-10 text-center space-y-4">
      <div className="text-5xl">📡</div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200">{t("No sensor data yet")}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        {t("Connect an IoT sensor or enter readings manually below. Your soil moisture, pH, NPK, temperature, and humidity will be monitored in real time.")}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={onDemoData}
          className="bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
          🧪 {t("Load Demo Data")}
        </button>
        <a href="#entry-form"
          className="border border-green-300 text-green-700 dark:text-green-400 dark:border-green-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition">
          ✏️ {t("Enter Manually")}
        </a>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const GAUGES = [
  { key:"soilMoisture", label:"Soil Moisture", icon:"💧", unit:"%",    min:0,  max:100, low:20,  high:85,  decimals:0 },
  { key:"temperature",  label:"Temperature",   icon:"🌡️", unit:"°C",  min:0,  max:50,  low:5,   high:45,  decimals:1 },
  { key:"soilPh",       label:"Soil pH",       icon:"🧪", unit:"",    min:0,  max:14,  low:5.5, high:8.0, decimals:1 },
  { key:"humidity",     label:"Humidity",      icon:"💦", unit:"%",   min:0,  max:100, low:20,  high:95,  decimals:0 },
  { key:"nitrogen",     label:"Nitrogen",      icon:"🌿", unit:" N",  min:0,  max:300, low:50,  high:280, decimals:0 },
  { key:"phosphorus",   label:"Phosphorus",    icon:"🌱", unit:" P",  min:0,  max:100, low:10,  high:80,  decimals:0 },
  { key:"potassium",    label:"Potassium",     icon:"💪", unit:" K",  min:0,  max:200, low:20,  high:150, decimals:0 },
  { key:"rainfall",     label:"Rainfall",      icon:"🌧️", unit:" mm", min:0,  max:300, low:0,   high:250, decimals:1 },
];

const TREND_SERIES = [
  { key:"soilMoisture", label:"Soil Moisture", color:"#3b82f6", unit:"%" },
  { key:"temperature",  label:"Temperature",   color:"#f97316", unit:"°C" },
  { key:"soilPh",       label:"Soil pH",       color:"#8b5cf6", unit:"" },
  { key:"humidity",     label:"Humidity",      color:"#06b6d4", unit:"%" },
  { key:"nitrogen",     label:"Nitrogen",      color:"#22c55e", unit:" N" },
  { key:"phosphorus",   label:"Phosphorus",    color:"#f59e0b", unit:" P" },
  { key:"potassium",    label:"Potassium",     color:"#ec4899", unit:" K" },
];

// ── Device code tabs ─────────────────────────────────────────────────────────
function DeviceCodeTabs({ t }) {
  const [tab, setTab] = useState("esp32");

  const ESP32_CODE = `#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ── Config ────────────────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL    = "http://YOUR_SERVER_IP:5001/api/sensor";
const char* JWT_TOKEN     = "YOUR_JWT_TOKEN_HERE";

// ── Sensor pins (adjust to your wiring) ──────────────────
#define SOIL_MOISTURE_PIN  34   // Analog pin
#define DHT_PIN            4    // DHT22 data pin
#define PH_PIN             35   // Analog pH sensor

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\\nWiFi connected: " + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Read sensors
    int rawMoisture = analogRead(SOIL_MOISTURE_PIN);
    float moisture  = map(rawMoisture, 4095, 1500, 0, 100); // calibrate!
    float phRaw     = analogRead(PH_PIN) * (3.3 / 4095.0);
    float ph        = 3.5 * phRaw;  // calibrate with buffer solution!
    // Add DHT22 for temperature + humidity (use DHT library)
    float temperature = 28.5;  // replace with dht.readTemperature()
    float humidity    = 72.0;  // replace with dht.readHumidity()

    // Build JSON
    StaticJsonDocument<256> doc;
    doc["deviceId"]     = "esp32-field-1";
    doc["label"]        = "North Field";
    doc["soilMoisture"] = moisture;
    doc["soilPh"]       = ph;
    doc["temperature"]  = temperature;
    doc["humidity"]     = humidity;
    String body; serializeJson(doc, body);

    // POST to server
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", String("Bearer ") + JWT_TOKEN);
    int code = http.POST(body);
    Serial.println("Response: " + String(code));
    http.end();
  }
  delay(60000); // Send every 60 seconds
}`;

  const PYTHON_CODE = `#!/usr/bin/env python3
"""
Raspberry Pi sensor script — sends readings to CropYield AI every 60s.
Install: pip install requests adafruit-circuitpython-dht RPi.GPIO
"""
import time, requests, json
import board, adafruit_dht

# ── Config ────────────────────────────────────────────────
SERVER_URL = "http://YOUR_SERVER_IP:5001/api/sensor"
JWT_TOKEN  = "YOUR_JWT_TOKEN_HERE"
DEVICE_ID  = "rpi-field-1"
LABEL      = "South Field"

# ── Sensors ───────────────────────────────────────────────
dht = adafruit_dht.DHT22(board.D4)  # GPIO 4

def read_soil_moisture():
    # MCP3008 ADC + capacitive soil sensor
    # Returns 0-100% (calibrate for your sensor)
    import spidev
    spi = spidev.SpiDev()
    spi.open(0, 0)
    spi.max_speed_hz = 1350000
    adc = spi.xfer2([1, (8+0)<<4, 0])
    raw = ((adc[1]&3) << 8) + adc[2]
    spi.close()
    return round((1 - raw/1023) * 100, 1)

def send_reading():
    try:
        temp     = dht.temperature
        humidity = dht.humidity
        moisture = read_soil_moisture()

        payload = {
            "deviceId":     DEVICE_ID,
            "label":        LABEL,
            "soilMoisture": moisture,
            "temperature":  temp,
            "humidity":     humidity,
            # Add pH, N, P, K if you have those sensors
        }
        headers = {
            "Authorization": f"Bearer {JWT_TOKEN}",
            "Content-Type":  "application/json",
        }
        r = requests.post(SERVER_URL, json=payload, headers=headers, timeout=10)
        print(f"Sent: {payload} → {r.status_code}")
        if r.status_code == 201:
            alerts = r.json().get("alerts", [])
            for a in alerts:
                print(f"  ⚠ ALERT: {a['message']}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("CropYield IoT Agent started. Sending every 60s…")
    while True:
        send_reading()
        time.sleep(60)`;

  const ARDUINO_CODE = `#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// ── Config ────────────────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL    = "http://YOUR_SERVER_IP:5001/api/sensor";
const char* JWT_TOKEN     = "YOUR_JWT_TOKEN_HERE";

#define SOIL_MOISTURE_PIN A0

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\\nConnected: " + WiFi.localIP().toString());
}

void loop() {
  int raw      = analogRead(SOIL_MOISTURE_PIN);
  float moist  = map(raw, 1023, 300, 0, 100); // calibrate!

  StaticJsonDocument<200> doc;
  doc["deviceId"]     = "arduino-field-1";
  doc["label"]        = "East Field";
  doc["soilMoisture"] = moist;
  doc["temperature"]  = 28.0; // add DHT11/DHT22 for real values
  doc["humidity"]     = 65.0;
  String body; serializeJson(doc, body);

  WiFiClient client;
  HTTPClient http;
  http.begin(client, SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + JWT_TOKEN);
  int code = http.POST(body);
  Serial.println("HTTP " + String(code));
  http.end();

  delay(60000); // every 60 seconds
}`;

  const CURL_CODE = `# Test from terminal (Linux/Mac/Windows WSL)
# Replace YOUR_TOKEN and YOUR_SERVER_IP

curl -X POST http://YOUR_SERVER_IP:5001/api/sensor \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "deviceId": "test-device",
    "label": "Test Field",
    "soilMoisture": 45.2,
    "soilPh": 6.8,
    "nitrogen": 120,
    "phosphorus": 45,
    "potassium": 60,
    "temperature": 28.5,
    "humidity": 72
  }'

# Expected response:
# {"reading": {...}, "alerts": [...]}`;

  const TABS = [
    { id:"esp32",   icon:"⚡", label:"ESP32",         code: ESP32_CODE,   lang:"cpp" },
    { id:"arduino", icon:"🔧", label:"Arduino+ESP8266",code: ARDUINO_CODE, lang:"cpp" },
    { id:"python",  icon:"🍓", label:"Raspberry Pi",   code: PYTHON_CODE,  lang:"python" },
    { id:"curl",    icon:"💻", label:"cURL / Test",    code: CURL_CODE,    lang:"bash" },
  ];

  const active = TABS.find(t => t.id === tab);

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-slate-700">
        <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
        <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm">💻 {t("Device Code — Copy & Flash")}</h3>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
        {TABS.map(tb => (
          <button key={tb.id} type="button" onClick={() => setTab(tb.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              tab === tb.id
                ? "border-green-600 text-green-700 dark:text-green-400 bg-white dark:bg-slate-800"
                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
            }`}>
            {tb.icon} {tb.label}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div className="relative">
        <pre className="bg-gray-900 text-green-300 text-xs p-5 overflow-x-auto max-h-96 leading-relaxed font-mono">
          {active?.code}
        </pre>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(active?.code || "")}
          className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
        >
          📋 Copy
        </button>
      </div>

      {/* Wiring guide */}
      <div className="p-5 border-t border-gray-100 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wide">
          🔌 {t("Recommended Sensors & Wiring")}
        </h4>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          {[
            { sensor:"Capacitive Soil Moisture v1.2", pin:"Analog (A0/GPIO34)", note:"₹150–300 on Amazon/Robu.in" },
            { sensor:"DHT22 Temperature + Humidity",  pin:"Digital (GPIO4)",    note:"₹200–400 — more accurate than DHT11" },
            { sensor:"Analog pH Sensor Module",       pin:"Analog (GPIO35)",    note:"₹500–800 — calibrate with pH 4 & 7 buffer" },
            { sensor:"NPK Soil Sensor (RS485)",       pin:"UART via MAX485",    note:"₹2000–4000 — measures N, P, K directly" },
          ].map(({ sensor, pin, note }) => (
            <div key={sensor} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 border border-gray-100 dark:border-slate-600">
              <div className="font-semibold text-gray-800 dark:text-slate-200">{sensor}</div>
              <div className="text-gray-500 dark:text-slate-400 mt-0.5">📌 {pin}</div>
              <div className="text-green-600 dark:text-green-400 mt-0.5">💰 {note}</div>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-3 text-xs text-blue-700 dark:text-blue-400">
          💡 {t("After flashing the code, the device sends readings every 60 seconds. This dashboard auto-refreshes every 30 seconds. You'll see live gauges and alerts appear within 2 minutes of first connection.")}
        </div>
      </div>
    </div>
  );
}

export default function IoTDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [readings,       setReadings]       = useState([]);
  const [history,        setHistory]        = useState([]);
  const [alerts,         setAlerts]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState(null);
  const [newAlerts,      setNewAlerts]      = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("default");
  const [autoRefresh,    setAutoRefresh]    = useState(true);
  const [showHistory,    setShowHistory]    = useState(false);

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

  useEffect(() => { fetchAll(); fetchHistory(selectedDevice); }, [fetchAll, fetchHistory, selectedDevice]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => { fetchAll(); fetchHistory(selectedDevice); }, 30000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchAll, fetchHistory, selectedDevice]);

  async function handleSubmit(form) {
    setSaving(true); setError(null); setNewAlerts([]);
    try {
      const res = await postSensorReading(form);
      setNewAlerts(res.data.alerts || []);
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

  async function loadDemoData() {
    await handleSubmit({
      deviceId: "demo-sensor", label: "Demo Field",
      soilMoisture: 18, soilPh: 5.2, nitrogen: 45, phosphorus: 8,
      potassium: 18, temperature: 32, humidity: 85, rainfall: 0,
    });
  }

  function handleDeleteHistory(id) {
    setHistory(h => h.filter(r => r._id !== id));
  }

  // Navigate to prediction with sensor data pre-filled
  function useForPrediction() {
    if (!latest) return;
    navigate("/prediction", {
      state: {
        prefill: {
          soilPh:     latest.soilPh,
          nitrogen:   latest.nitrogen,
          phosphorus: latest.phosphorus,
          potassium:  latest.potassium,
        }
      }
    });
  }

  const latest  = readings.find(r => r.deviceId === selectedDevice) || readings[0];
  const devices = [...new Set(readings.map(r => r.deviceId))];
  const activeAlerts = newAlerts.length ? newAlerts : alerts;
  const criticalCount = activeAlerts.filter(a => a.level === "critical").length;
  const warningCount  = activeAlerts.filter(a => a.level === "warning").length;
  const hasData = readings.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-[Outfit,system-ui,sans-serif]">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-800 to-green-700 text-white px-6 py-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-green-300 text-sm mb-1">📡 {t("IoT Monitoring")}</p>
            <h1 className="text-2xl md:text-3xl font-bold">{t("Live Sensor Dashboard")}</h1>
            <p className="text-green-200 text-sm mt-1">
              {t("Real-time soil and climate monitoring with instant alerts.")}
            </p>
            {hasData && (
              <div className="flex gap-3 mt-3 flex-wrap">
                {criticalCount > 0 && (
                  <span className="bg-red-500/20 border border-red-400/40 text-red-200 text-xs font-semibold px-3 py-1 rounded-full">
                    🔴 {criticalCount} {t("Critical")}
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold px-3 py-1 rounded-full">
                    🟡 {warningCount} {t("Warning")}
                  </span>
                )}
                {activeAlerts.length === 0 && (
                  <span className="bg-green-500/20 border border-green-400/40 text-green-200 text-xs font-semibold px-3 py-1 rounded-full">
                    ✅ {t("All Normal")}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {latest && (
              <button onClick={useForPrediction}
                className="bg-white text-green-800 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-green-50 transition shadow">
                🌾 {t("Use for Prediction")}
              </button>
            )}
            <button onClick={() => setAutoRefresh(v => !v)}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border transition ${
                autoRefresh ? "bg-green-600 border-green-500 text-white" : "bg-white/10 border-white/30 text-white"
              }`}>
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-white animate-pulse" : "bg-white/40"}`} />
              {autoRefresh ? t("Live") : t("Paused")}
            </button>
            <button onClick={() => { fetchAll(); fetchHistory(selectedDevice); }}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl transition">
              🔄 {t("Refresh")}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 space-y-8">

        {/* Alerts */}
        {activeAlerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {t("Active Alerts")} ({activeAlerts.length})
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {activeAlerts.map((a, i) => <AlertCard key={i} alert={a} t={t} />)}
            </div>
          </div>
        )}

        {/* All normal */}
        {activeAlerts.length === 0 && !loading && hasData && (
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
              <button key={d} type="button" onClick={() => { setSelectedDevice(d); fetchHistory(d); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  selectedDevice === d
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-green-300"
                }`}>
                📡 {readings.find(r => r.deviceId === d)?.label || d}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !hasData && <EmptyState t={t} onDemoData={loadDemoData} />}

        {/* Gauge grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 animate-pulse h-44" />
            ))}
          </div>
        ) : hasData && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                📊 {t("Live Readings")}
                {latest && (
                  <span className="ml-2 text-xs font-normal text-gray-400 dark:text-slate-500 normal-case">
                    · {t("Updated")} {new Date(latest.createdAt).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}
                    {latest.label && ` · ${latest.label}`}
                  </span>
                )}
              </h2>
              {latest && (
                <button onClick={useForPrediction}
                  className="text-xs font-semibold text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition">
                  🌾 {t("Use for Prediction")}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {GAUGES.map(g => (
                <Gauge key={g.key} value={latest?.[g.key]}
                  label={t(g.label)} icon={g.icon} unit={g.unit}
                  min={g.min} max={g.max} low={g.low} high={g.high} decimals={g.decimals} />
              ))}
            </div>
          </div>
        )}

        {/* Trend charts — all 7 series */}
        {history.length > 1 && (
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-4">
              📈 {t("Trend History")} ({history.length} {t("readings")})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {TREND_SERIES.map(({ key, label, color, unit }) => {
                const vals = history.map(r => r[key]).filter(v => v != null);
                if (!vals.length) return null;
                const last = vals[vals.length - 1];
                const mn = Math.min(...vals), mx = Math.max(...vals);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-600 dark:text-slate-400">{t(label)}</span>
                      <span className="font-bold text-gray-800 dark:text-slate-200">
                        {Number(last).toFixed(1)}{unit}
                      </span>
                    </div>
                    <Sparkline data={vals} color={color} />
                    <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500">
                      <span>↓ {mn.toFixed(1)}</span>
                      <span>↑ {mx.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History table toggle */}
        {history.length > 0 && (
          <div>
            <button type="button" onClick={() => setShowHistory(v => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition">
              🗂 {t("Reading History")} ({history.length}) {showHistory ? "▲" : "▼"}
            </button>
            {showHistory && (
              <div className="mt-3">
                <HistoryTable history={history} onDelete={handleDeleteHistory} t={t} />
              </div>
            )}
          </div>
        )}

        {/* Manual entry form */}
        <div id="entry-form">
          <ManualEntryForm onSubmit={handleSubmit} loading={saving} t={t} />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-4 text-red-700 dark:text-red-400 text-sm">
            ⚠ {error}
          </div>
        )}

        {/* IoT Device Connection Guide */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
            🔌 {t("How to Connect Your IoT Device")}
          </h2>

          {/* Step overview */}
          <div className="grid sm:grid-cols-4 gap-3">
            {[
              { step:"1", icon:"🔑", title:t("Get Your Token"),    desc:t("Copy your JWT token from browser storage") },
              { step:"2", icon:"🔧", title:t("Wire Your Sensors"), desc:t("Connect soil, temp, humidity sensors to your device") },
              { step:"3", icon:"💻", title:t("Upload Code"),       desc:t("Flash the code below to your device") },
              { step:"4", icon:"📊", title:t("See Live Data"),     desc:t("Readings appear on this dashboard automatically") },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-green-700 text-white text-sm font-bold flex items-center justify-center mx-auto mb-2">{step}</div>
                <div className="text-xl mb-1">{icon}</div>
                <div className="text-xs font-semibold text-gray-800 dark:text-slate-200">{title}</div>
                <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{desc}</div>
              </div>
            ))}
          </div>

          {/* Step 1 — Get token */}
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center">1</span>
              🔑 {t("Get Your JWT Token")}
            </h3>
            <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
              {t("Open your browser console (F12 → Console) and run this command to copy your token:")}
            </p>
            <div className="bg-gray-900 rounded-xl p-3 font-mono text-xs text-green-400 overflow-x-auto">
              <span className="text-gray-500">// Paste in browser console:</span>{"\n"}
              <span className="text-yellow-300">copy</span>(localStorage.<span className="text-blue-300">getItem</span>(<span className="text-green-300">'token'</span>))
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-3 py-2">
              ⚠ {t("Keep your token private. It expires when you log out. Re-copy after each login.")}
            </p>
          </div>

          {/* Step 2 — API endpoint */}
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center">2</span>
              🌐 {t("API Endpoint")}
            </h3>
            <div className="bg-gray-900 rounded-xl p-3 font-mono text-xs overflow-x-auto whitespace-pre">
              <span className="text-green-400">POST</span> <span className="text-blue-300">http://localhost:5001/api/sensor</span>{"\n"}
              <span className="text-yellow-300">Authorization:</span> <span className="text-white">Bearer YOUR_TOKEN_HERE</span>{"\n"}
              <span className="text-yellow-300">Content-Type:</span> <span className="text-white">application/json</span>{"\n\n"}
              <span className="text-gray-400">{"{"}</span>{"\n"}
              <span className="text-gray-400">{"  "}</span><span className="text-green-300">"deviceId"</span><span className="text-gray-400">: </span><span className="text-orange-300">"field-sensor-1"</span><span className="text-gray-400">,</span>{"\n"}
              <span className="text-gray-400">{"  "}</span><span className="text-green-300">"label"</span><span className="text-gray-400">: </span><span className="text-orange-300">"North Field"</span><span className="text-gray-400">,</span>{"\n"}
              <span className="text-gray-400">{"  "}</span><span className="text-green-300">"soilMoisture"</span><span className="text-gray-400">: </span><span className="text-blue-300">45.2</span><span className="text-gray-400">,</span>{"\n"}
              <span className="text-gray-400">{"  "}</span><span className="text-green-300">"soilPh"</span><span className="text-gray-400">: </span><span className="text-blue-300">6.8</span><span className="text-gray-400">,</span>{"\n"}
              <span className="text-gray-400">{"  "}</span><span className="text-green-300">"nitrogen"</span><span className="text-gray-400">: </span><span className="text-blue-300">120</span><span className="text-gray-400">,</span>{"\n"}
              <span className="text-gray-400">{"  "}</span><span className="text-green-300">"phosphorus"</span><span className="text-gray-400">: </span><span className="text-blue-300">45</span><span className="text-gray-400">,</span>{"\n"}
              <span className="text-gray-400">{"  "}</span><span className="text-green-300">"potassium"</span><span className="text-gray-400">: </span><span className="text-blue-300">60</span><span className="text-gray-400">,</span>{"\n"}
              <span className="text-gray-400">{"  "}</span><span className="text-green-300">"temperature"</span><span className="text-gray-400">: </span><span className="text-blue-300">28.5</span><span className="text-gray-400">,</span>{"\n"}
              <span className="text-gray-400">{"  "}</span><span className="text-green-300">"humidity"</span><span className="text-gray-400">: </span><span className="text-blue-300">72</span>{"\n"}
              <span className="text-gray-400">{"}"}</span>
            </div>
          </div>

          {/* Step 3 — Device code tabs */}
          <DeviceCodeTabs t={t} />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { to:"/prediction", icon:"🌾", label:t("Run Prediction") },
            { to:"/calendar",   icon:"📅", label:t("Crop Calendar") },
            { to:"/dashboard",  icon:"📊", label:t("Dashboard") },
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
