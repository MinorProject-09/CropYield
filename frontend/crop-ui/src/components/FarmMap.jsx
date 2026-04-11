import { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { saveFields } from "../api/api";
import { getCropInfo } from "../data/cropInfo";

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CROP_COLORS = [
  "#22c55e","#3b82f6","#f59e0b","#ec4899","#8b5cf6","#f97316","#06b6d4","#ef4444",
];

function makeIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function MapClickHandler({ onAdd }) {
  useMapEvents({ click: e => onAdd(e.latlng.lat, e.latlng.lng) });
  return null;
}

const CROPS_LIST = [
  "","rice","wheat","maize","chickpea","kidney beans","pigeon peas","moth beans",
  "mung bean","black gram","lentil","pomegranate","banana","mango","grapes",
  "watermelon","muskmelon","apple","orange","papaya","coconut","cotton","jute","coffee",
];

export default function FarmMap({ user, onFieldsSaved }) {
  const [fields,  setFields]  = useState(user?.fields || []);
  const [saving,  setSaving]  = useState(false);
  const [editing, setEditing] = useState(null); // index of field being edited
  const [open,    setOpen]    = useState(false);

  const center = fields.length > 0
    ? [fields[0].lat || 20.5937, fields[0].lng || 78.9629]
    : [20.5937, 78.9629];

  const handleAdd = useCallback((lat, lng) => {
    const newField = {
      name: `Field ${fields.length + 1}`,
      crop: "",
      areaHa: 1,
      lat, lng,
      sowDate: "",
      color: CROP_COLORS[fields.length % CROP_COLORS.length],
    };
    setFields(prev => [...prev, newField]);
    setEditing(fields.length);
  }, [fields.length]);

  function updateField(i, key, val) {
    setFields(prev => prev.map((f, idx) => idx === i ? { ...f, [key]: val } : f));
  }

  function removeField(i) {
    setFields(prev => prev.filter((_, idx) => idx !== i));
    if (editing === i) setEditing(null);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveFields(fields);
      onFieldsSaved?.(fields);
    } catch {}
    finally { setSaving(false); }
  }

  const inp = "w-full border border-gray-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:border-emerald-500";

  return (
    <div className="bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🗺️</span>
          <div>
            <p className="font-bold text-gray-900 dark:text-slate-100 text-sm">Farm Map</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
              {fields.length > 0 ? `${fields.length} field${fields.length > 1 ? "s" : ""} marked` : "Click the map to mark your fields"}
            </p>
          </div>
        </div>
        <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-slate-700/60">
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-800/30">
            <p className="text-xs text-emerald-700 dark:text-emerald-400">📍 Click anywhere on the map to add a field marker</p>
          </div>

          {/* Map */}
          <div className="h-72">
            <MapContainer center={center} zoom={5} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors'
              />
              <MapClickHandler onAdd={handleAdd} />
              {fields.map((f, i) => f.lat && f.lng ? (
                <Marker key={i} position={[f.lat, f.lng]} icon={makeIcon(f.color)}>
                  <Popup>
                    <div className="text-xs space-y-1 min-w-[120px]">
                      <p className="font-bold">{f.name}</p>
                      {f.crop && <p>{getCropInfo(f.crop)?.emoji || "🌾"} {f.crop}</p>}
                      <p>📐 {f.areaHa} ha</p>
                      {f.sowDate && <p>📅 Sown: {f.sowDate}</p>}
                      <button onClick={() => removeField(i)}
                        className="text-red-500 hover:text-red-700 text-xs mt-1">🗑 Remove</button>
                    </div>
                  </Popup>
                </Marker>
              ) : null)}
            </MapContainer>
          </div>

          {/* Field list */}
          {fields.length > 0 && (
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto border-t border-gray-100 dark:border-slate-700/60">
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Your Fields</p>
              {fields.map((f, i) => (
                <div key={i} className="border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button type="button" onClick={() => setEditing(editing === i ? null : i)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: f.color }} />
                    <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 flex-1">{f.name}</span>
                    {f.crop && <span className="text-xs text-gray-400">{getCropInfo(f.crop)?.emoji} {f.crop}</span>}
                    <span className="text-xs text-gray-400">{f.areaHa} ha</span>
                    <button type="button" onClick={e => { e.stopPropagation(); removeField(i); }}
                      className="text-red-400 hover:text-red-600 text-xs ml-1">×</button>
                  </button>

                  {editing === i && (
                    <div className="px-3 pb-3 pt-1 grid grid-cols-2 gap-2 border-t border-gray-50 dark:border-slate-700/40 bg-gray-50/50 dark:bg-slate-800/50">
                      <div>
                        <label className="text-xs text-gray-400 mb-0.5 block">Field Name</label>
                        <input value={f.name} onChange={e => updateField(i, "name", e.target.value)} className={inp} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-0.5 block">Area (ha)</label>
                        <input type="number" step="0.1" value={f.areaHa} onChange={e => updateField(i, "areaHa", e.target.value)} className={inp} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-0.5 block">Crop</label>
                        <select value={f.crop} onChange={e => updateField(i, "crop", e.target.value)} className={`${inp} appearance-none`}>
                          {CROPS_LIST.map(c => <option key={c} value={c}>{c ? `${getCropInfo(c)?.emoji || "🌾"} ${c}` : "Select crop"}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-0.5 block">Sow Date</label>
                        <input type="date" value={f.sowDate} onChange={e => updateField(i, "sowDate", e.target.value)} className={inp} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-0.5 block">Marker Color</label>
                        <input type="color" value={f.color} onChange={e => updateField(i, "color", e.target.value)}
                          className="w-full h-8 rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Save button */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400 dark:text-slate-500">
              {fields.length === 0 ? "Click the map to add fields" : `${fields.length} field${fields.length > 1 ? "s" : ""} — click Save to store`}
            </p>
            <button onClick={handleSave} disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition disabled:opacity-60 flex items-center gap-1.5">
              {saving ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</> : "💾 Save Fields"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
