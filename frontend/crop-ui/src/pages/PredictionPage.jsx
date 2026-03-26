import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineBeaker,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineMap,
  HiOutlineMapPin,
} from "react-icons/hi2";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import LanguageSwitcher from "../components/LanguageSwitcher";
import VoiceInput from "../components/VoiceInput";
import VoiceSpeaker from "../components/VoiceSpeaker";
import { useLanguage } from "../i18n/LanguageContext";
import { getGeocode, getGeocodeStatus, postMlPrediction } from "../api/api";
import { DISTRICTS_BY_STATE } from "../data/indiaDistrictsByState";
import { INDIAN_STATES_AND_UTS } from "../data/indiaStates";
import {
  buildStructuredDetailsLine,
  buildStructuredGeocodeQuery,
  structuredQueryReady,
} from "../utils/addressUtils";

const LocationMapPicker = lazy(() => import("../components/LocationMapPicker.jsx"));

const MONTHS = [
  { value: 1,  labelKey: "January"   },
  { value: 2,  labelKey: "February"  },
  { value: 3,  labelKey: "March"     },
  { value: 4,  labelKey: "April"     },
  { value: 5,  labelKey: "May"       },
  { value: 6,  labelKey: "June"      },
  { value: 7,  labelKey: "July"      },
  { value: 8,  labelKey: "August"    },
  { value: 9,  labelKey: "September" },
  { value: 10, labelKey: "October"   },
  { value: 11, labelKey: "November"  },
  { value: 12, labelKey: "December"  },
];

/* ── Reusable labelled field row with optional mic button ─────────────── */
function FieldRow({ label, hint, children, voiceProps }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      {hint && <span className="mt-0.5 block text-xs font-normal text-gray-500">{hint}</span>}
      <div className="mt-1.5 flex items-center gap-2">
        <div className="flex-1">{children}</div>
        {voiceProps && <VoiceInput {...voiceProps} />}
      </div>
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200";

function parseGeocodeError(err) {
  if (!err.response)
    return "Cannot reach the backend geocoding API. Start the server on port 5000 (npm run dev in /backend) and try again.";
  const msg = err.response?.data?.message;
  if (typeof msg === "string" && msg.length > 0) return msg;
  if (err.response.status === 404)
    return "No location found. Try a 6-digit PIN with state, or a clearer village / district / state.";
  return "Could not look up coordinates.";
}

async function checkGeoPermission() {
  if (!navigator.permissions) return "unknown";
  try {
    const r = await navigator.permissions.query({ name: "geolocation" });
    return r.state; // "granted" | "denied" | "prompt"
  } catch {
    return "unknown";
  }
}

export default function PredictionPage() {
  const { t, speechCode } = useLanguage();

  /* ── location ── */
  const [locationMode,   setLocationMode]   = useState("map");
  const [latitude,       setLatitude]       = useState("");
  const [longitude,      setLongitude]      = useState("");
  const [mapFocusNonce,  setMapFocusNonce]  = useState(0);
  const [geoStatus,      setGeoStatus]      = useState("idle");

  /* ── address detail ── */
  const [locationDetails,          setLocationDetails]          = useState("");
  const [addressDetailMode,        setAddressDetailMode]        = useState("free");
  const [structuredState,          setStructuredState]          = useState("");
  const [structuredDistrictSelect, setStructuredDistrictSelect] = useState("");
  const [structuredDistrictOther,  setStructuredDistrictOther]  = useState("");
  const [structuredDistrictText,   setStructuredDistrictText]   = useState("");
  const [structuredVillage,        setStructuredVillage]        = useState("");
  const [structuredPincode,        setStructuredPincode]        = useState("");
  const [googleConfigured,         setGoogleConfigured]         = useState(false);

  /* ── soil ── */
  const [soilPh,     setSoilPh]     = useState("");
  const [nitrogen,   setNitrogen]   = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium,  setPotassium]  = useState("");

  /* ── timing ── */
  const [cropMonth, setCropMonth] = useState("6");
  const [duration,  setDuration]  = useState("");

  /* ── submission ── */
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [result,  setResult]  = useState(null);

  /* ── geocode status ── */
  const [geocodeStatus, setGeocodeStatus] = useState("idle");
  const [geocodeHint,   setGeocodeHint]   = useState("");
  const geocodeRequestId = useRef(0);

  /* ── 1. Check backend geocode status ─────────────────────────────── */
  useEffect(() => {
    getGeocodeStatus()
      .then(({ data }) => setGoogleConfigured(!!data.googleConfigured))
      .catch(() => setGoogleConfigured(false));
  }, []);

  /* ── 2. Auto-geolocation on mount ────────────────────────────────── */
  useEffect(() => {
    if (!navigator.geolocation) { setGeoStatus("unsupported"); return; }

    checkGeoPermission().then((state) => {
      if (state === "denied") { setGeoStatus("denied"); return; }
      setGeoStatus("requesting");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(6));
          setLongitude(pos.coords.longitude.toFixed(6));
          setMapFocusNonce((n) => n + 1);
          setGeoStatus("granted");
        },
        (err) => {
          setGeoStatus(err.code === 1 ? "denied" : "idle");
        },
        { enableHighAccuracy: true, timeout: 12000 }
      );
    });
  }, []);

  /* ── helpers ─────────────────────────────────────────────────────── */
  function districtFinal() {
    const list = DISTRICTS_BY_STATE[structuredState];
    if (list?.length) {
      if (!structuredDistrictSelect) return "";
      if (structuredDistrictSelect === "__other__") return structuredDistrictOther.trim();
      return structuredDistrictSelect;
    }
    return structuredDistrictText.trim();
  }

  function buildGeocodeQuery() {
    if (locationMode !== "details") return null;
    if (addressDetailMode === "free") {
      const q = locationDetails.trim();
      return q.length >= 3 ? q : null;
    }
    const d = districtFinal();
    if (!structuredQueryReady(d, structuredVillage, structuredState, structuredPincode)) return null;
    const q = buildStructuredGeocodeQuery(structuredVillage, d, structuredState, structuredPincode);
    return q && q.trim().length >= 3 ? q : null;
  }

  async function lookupCoordinatesNow() {
    setError(null);
    const q = buildGeocodeQuery();
    if (!q) {
      setGeocodeStatus("short");
      setGeocodeHint("Add more detail: at least 3 characters, or choose state + PIN / district.");
      return;
    }
    setGeocodeStatus("loading");
    setGeocodeHint("");
    try {
      const { data } = await getGeocode(q);
      setLatitude(String(Number(data.lat).toFixed(6)));
      setLongitude(String(Number(data.lng).toFixed(6)));
      setGeocodeStatus("success");
      const provider = data.provider === "google" ? "Google Maps" : "OpenStreetMap";
      setGeocodeHint(data.displayName ? `Matched (${provider}): ${data.displayName}` : `Resolved via ${provider}`);
    } catch (err) {
      setLatitude(""); setLongitude("");
      setGeocodeStatus("error");
      setGeocodeHint(parseGeocodeError(err));
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) { setError("Geolocation is not supported in this browser."); return; }
    setError(null);
    checkGeoPermission().then((state) => {
      if (state === "denied") {
        setGeoStatus("denied");
        setError(t("geoDenied"));
        return;
      }
      setGeoStatus("requesting");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(6));
          setLongitude(pos.coords.longitude.toFixed(6));
          setMapFocusNonce((n) => n + 1);
          setGeoStatus("granted");
        },
        (err) => {
          setGeoStatus(err.code === 1 ? "denied" : "idle");
          setError(t("geoDenied"));
        },
        { enableHighAccuracy: true, timeout: 12000 }
      );
    });
  }

  /* ── reset district on state change ─────────────────────────────── */
  useEffect(() => {
    setStructuredDistrictSelect("");
    setStructuredDistrictOther("");
    setStructuredDistrictText("");
  }, [structuredState]);

  /* ── auto-geocode: free text ─────────────────────────────────────── */
  useEffect(() => {
    if (locationMode !== "details" || addressDetailMode !== "free") return;
    const q = locationDetails.trim();
    if (!q)       { setGeocodeStatus("idle");  setGeocodeHint(""); return; }
    if (q.length < 3) { setGeocodeStatus("short"); setGeocodeHint(""); return; }
    setGeocodeStatus("loading"); setGeocodeHint("");
    const myId = ++geocodeRequestId.current;
    const timer = setTimeout(async () => {
      try {
        const { data } = await getGeocode(q);
        if (geocodeRequestId.current !== myId) return;
        setLatitude(String(Number(data.lat).toFixed(6)));
        setLongitude(String(Number(data.lng).toFixed(6)));
        setGeocodeStatus("success");
        const provider = data.provider === "google" ? "Google Maps" : "OpenStreetMap";
        setGeocodeHint(data.displayName ? `Matched (${provider}): ${data.displayName}` : `Resolved via ${provider}`);
      } catch (err) {
        if (geocodeRequestId.current !== myId) return;
        setLatitude(""); setLongitude(""); setGeocodeStatus("error"); setGeocodeHint(parseGeocodeError(err));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [locationDetails, locationMode, addressDetailMode]);

  /* ── auto-geocode: structured ────────────────────────────────────── */
  useEffect(() => {
    if (locationMode !== "details" || addressDetailMode !== "structured") return;
    const d = districtFinal();
    const q = buildStructuredGeocodeQuery(structuredVillage, d, structuredState, structuredPincode);
    if (!structuredQueryReady(d, structuredVillage, structuredState, structuredPincode)) {
      setGeocodeStatus("idle"); setGeocodeHint(""); return;
    }
    if (q.length < 3) { setGeocodeStatus("short"); setGeocodeHint(""); return; }
    setGeocodeStatus("loading"); setGeocodeHint("");
    const myId = ++geocodeRequestId.current;
    const timer = setTimeout(async () => {
      try {
        const { data } = await getGeocode(q);
        if (geocodeRequestId.current !== myId) return;
        setLatitude(String(Number(data.lat).toFixed(6)));
        setLongitude(String(Number(data.lng).toFixed(6)));
        setGeocodeStatus("success");
        const provider = data.provider === "google" ? "Google Maps" : "OpenStreetMap";
        setGeocodeHint(data.displayName ? `Matched (${provider}): ${data.displayName}` : `Resolved via ${provider}`);
      } catch (err) {
        if (geocodeRequestId.current !== myId) return;
        setLatitude(""); setLongitude(""); setGeocodeStatus("error"); setGeocodeHint(parseGeocodeError(err));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [locationMode, addressDetailMode, structuredState, structuredDistrictSelect, structuredDistrictOther, structuredDistrictText, structuredVillage, structuredPincode]);

  /* ── map ─────────────────────────────────────────────────────────── */
  function handleMapChange({ latitude: lat, longitude: lng }) {
    setLatitude(lat); setLongitude(lng);
  }

  /* ── voice: parse spoken number ──────────────────────────────────── */
  function spokenToNumber(text) {
    // Strip common spoken words, keep digits and decimal
    return text.replace(/[^\d.]/g, "");
  }

  /* ── submit ──────────────────────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null); setResult(null);

    const ph  = Number(soilPh);
    const n   = Number(nitrogen);
    const p   = Number(phosphorus);
    const k   = Number(potassium);
    const mon = Number(cropMonth);
    const dur = Number(duration);

    if (!Number.isFinite(ph) || ph < 0 || ph > 14) { setError("Soil pH must be between 0 and 14."); return; }
    if (!Number.isFinite(n)  || n < 0)              { setError("Nitrogen must be a non-negative number."); return; }
    if (!Number.isFinite(p)  || p < 0)              { setError("Phosphorus must be a non-negative number."); return; }
    if (!Number.isFinite(k)  || k < 0)              { setError("Potassium must be a non-negative number."); return; }
    if (!Number.isFinite(mon) || mon < 1 || mon > 12) { setError("Select a valid crop month."); return; }
    if (!Number.isFinite(dur) || dur <= 0)           { setError("Duration must be a positive number of days."); return; }

    let locationPayload;
    if (locationMode === "map") {
      const lat = Number(latitude), lng = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setError('Pin a location on the map, or click "Use my current location".');
        return;
      }
      locationPayload = { mode: "map", latitude: lat, longitude: lng, details: "" };
    } else {
      let trimmed = addressDetailMode === "structured"
        ? buildStructuredDetailsLine(structuredVillage, districtFinal(), structuredState, structuredPincode)
        : locationDetails.trim();
      if (!trimmed) { setError("Enter a location."); return; }
      let lat = Number(latitude), lng = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        const q = buildGeocodeQuery();
        if (q) {
          try {
            const { data } = await getGeocode(q);
            lat = Number(data.lat); lng = Number(data.lng);
            setLatitude(String(lat.toFixed(6))); setLongitude(String(lng.toFixed(6)));
          } catch (err) { setError(parseGeocodeError(err)); return; }
        }
      }
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setError('Coordinates missing. Use "Look up coordinates" or enter lat/lng manually.');
        return;
      }
      locationPayload = { mode: "details", latitude: lat, longitude: lng, details: trimmed };
    }

    setLoading(true);
    try {
      const { data } = await postMlPrediction({ location: locationPayload, soilPh: ph, nitrogen: n, phosphorus: p, potassium: k, cropMonth: mon, duration: dur });
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Prediction request failed.";
      setError(typeof msg === "string" ? msg : "Prediction request failed.");
    } finally {
      setLoading(false);
    }
  }

  /* ── geo banner ──────────────────────────────────────────────────── */
  const geoBannerText =
    geoStatus === "requesting"  ? t("geoRequesting") :
    geoStatus === "granted"     ? t("geoGranted")    :
    geoStatus === "denied"      ? t("geoDenied")     :
    null;

  const geoBannerColor =
    geoStatus === "granted"    ? "bg-green-50 border-green-300 text-green-800" :
    geoStatus === "denied"     ? "bg-amber-50 border-amber-300 text-amber-800" :
    geoStatus === "requesting" ? "bg-blue-50  border-blue-200  text-blue-800"  :
    "bg-gray-50 border-gray-200 text-gray-700";

  /* ── result speech text ──────────────────────────────────────────── */
  const resultSpeechText = result
    ? t("resultSpeech", result.recommendedCrop || "—", typeof result.confidence === "number" ? Math.round(result.confidence * 100) : "—")
    : "";

  /* ── voice props factory ─────────────────────────────────────────── */
  const vp = (setter) => ({
    speechCode,
    label: t("tapToSpeak"),
    listeningLabel: t("listening"),
    onResult: (txt) => setter(spokenToNumber(txt) || txt),
  });

  /* ════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-green-100 font-[Outfit,system-ui,sans-serif] text-gray-900">
      <Navbar />

      {/* ── top bar ── */}
      <div className="border-b border-green-200 bg-green-50 px-4 py-2 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm font-medium text-green-800 hover:text-green-900">
            {t("backHome")}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t("pageTitle")}
          </h1>
          <p className="mt-2 text-base leading-relaxed text-gray-700">
            {t("pageSubtitle")}
          </p>
        </div>

        {/* Geo banner */}
        {geoBannerText && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${geoBannerColor}`}>
            {geoBannerText}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">

          {/* ══ FORM ══════════════════════════════════════════════════════ */}
          <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-green-200 bg-white p-6 shadow-lg sm:p-8">

            {/* ── Location ── */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <HiOutlineMap className="h-5 w-5 text-green-700" />
                <h2 className="text-lg font-semibold text-gray-900">{t("locationTitle")}</h2>
              </div>
              <p className="text-sm text-gray-600">{t("locationSubtitle")}</p>

              {/* Mode toggle */}
              <div className="flex flex-wrap gap-2 rounded-xl border border-green-200 bg-green-50/80 p-1">
                {["map", "details"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setLocationMode(mode); setGeocodeStatus("idle"); setGeocodeHint(""); }}
                    className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      locationMode === mode
                        ? "bg-green-700 text-white shadow-sm"
                        : "text-gray-600 hover:bg-white/80 hover:text-gray-900"
                    }`}
                  >
                    {mode === "map" ? t("mapPin") : t("locationDetails")}
                  </button>
                ))}
              </div>

              {/* Use my location — always visible */}
              <button
                type="button"
                onClick={useMyLocation}
                disabled={geoStatus === "requesting"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-green-400 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900 shadow-sm transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <HiOutlineMapPin className="h-4 w-4 text-green-700" />
                {geoStatus === "requesting" ? t("detectingLocation") : t("useMyLocation")}
              </button>

              {locationMode === "map" ? (
                <div className="space-y-4">
                  <Suspense fallback={
                    <div className="flex h-[min(420px,55vh)] min-h-[320px] items-center justify-center rounded-xl border border-green-200 bg-green-50 text-sm text-gray-600">
                      Loading map…
                    </div>
                  }>
                    <LocationMapPicker latitude={latitude} longitude={longitude} onChange={handleMapChange} focusNonce={mapFocusNonce} />
                  </Suspense>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <FieldRow label={t("latitude")} hint="Auto-filled or pin the map">
                        <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="—" className={inputClass} />
                      </FieldRow>
                    </div>
                    <div className="space-y-2">
                      <FieldRow label={t("longitude")} hint="Auto-filled or pin the map">
                        <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="—" className={inputClass} />
                      </FieldRow>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Sub-mode toggle */}
                  <div className="flex flex-wrap gap-2 rounded-xl border border-green-200 bg-green-50/80 p-1">
                    {["free", "structured"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => { setAddressDetailMode(mode); setGeocodeStatus("idle"); setGeocodeHint(""); }}
                        className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                          addressDetailMode === mode ? "bg-green-700 text-white shadow-sm" : "text-gray-600 hover:bg-white/80"
                        }`}
                      >
                        {mode === "free" ? "Type address" : "State / district / village / PIN"}
                      </button>
                    ))}
                  </div>

                  {addressDetailMode === "free" ? (
                    <FieldRow
                      label="Location description"
                      hint="Village, district, state — coordinates update automatically"
                      voiceProps={{ ...vp((v) => setLocationDetails(v)), onResult: (v) => setLocationDetails(v) }}
                    >
                      <textarea
                        rows={3}
                        value={locationDetails}
                        onChange={(e) => setLocationDetails(e.target.value)}
                        placeholder="e.g. Ludhiana district, Punjab"
                        className={`${inputClass} resize-y`}
                      />
                    </FieldRow>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">State / UT</label>
                        <div className="relative">
                          <select value={structuredState} onChange={(e) => setStructuredState(e.target.value)} className={`${inputClass} appearance-none pr-10`}>
                            <option value="">Select state</option>
                            {INDIAN_STATES_AND_UTS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
                        </div>
                      </div>

                      {DISTRICTS_BY_STATE[structuredState]?.length ? (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-800">District</label>
                          <div className="relative">
                            <select value={structuredDistrictSelect} onChange={(e) => setStructuredDistrictSelect(e.target.value)} className={`${inputClass} appearance-none pr-10`}>
                              <option value="">Select district</option>
                              {DISTRICTS_BY_STATE[structuredState].map((d) => <option key={d} value={d}>{d}</option>)}
                              <option value="__other__">Other (type below)</option>
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
                          </div>
                          {structuredDistrictSelect === "__other__" && (
                            <input type="text" value={structuredDistrictOther} onChange={(e) => setStructuredDistrictOther(e.target.value)} placeholder="District name" className={inputClass} />
                          )}
                        </div>
                      ) : (
                        <FieldRow label="District" hint="Required if PIN is not filled" voiceProps={{ ...vp(() => {}), onResult: (v) => setStructuredDistrictText(v) }}>
                          <input type="text" value={structuredDistrictText} onChange={(e) => setStructuredDistrictText(e.target.value)} placeholder="District name" className={inputClass} />
                        </FieldRow>
                      )}

                      <FieldRow label="Village / locality" voiceProps={{ ...vp(() => {}), onResult: (v) => setStructuredVillage(v) }}>
                        <input type="text" value={structuredVillage} onChange={(e) => setStructuredVillage(e.target.value)} placeholder="e.g. village or locality name" className={inputClass} />
                      </FieldRow>

                      <FieldRow label="PIN code" hint="6-digit India PIN — strongly recommended">
                        <input type="text" inputMode="numeric" maxLength={6} value={structuredPincode} onChange={(e) => setStructuredPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="e.g. 141001" className={inputClass} />
                      </FieldRow>
                    </div>
                  )}

                  {geocodeStatus === "loading" && <p className="text-sm text-green-800">{t("detectingLocation")}</p>}
                  {geocodeHint && <p className={`text-xs ${geocodeStatus === "error" ? "text-red-700" : "text-gray-600"}`}>{geocodeHint}</p>}

                  <button type="button" onClick={lookupCoordinatesNow} className="inline-flex w-full items-center justify-center rounded-xl border border-green-600 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-900 shadow-sm transition hover:bg-green-100 sm:w-auto">
                    {t("lookupCoordinates")}
                  </button>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldRow label={t("latitude")} hint="Filled automatically (editable)">
                      <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="After lookup" className={inputClass} />
                    </FieldRow>
                    <FieldRow label={t("longitude")} hint="Filled automatically (editable)">
                      <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="After lookup" className={inputClass} />
                    </FieldRow>
                  </div>
                </div>
              )}
            </section>

            {/* ── Soil & Nutrients ── */}
            <section className="space-y-4 border-t border-green-100 pt-8">
              <div className="flex items-center gap-2">
                <HiOutlineBeaker className="h-5 w-5 text-green-700" />
                <h2 className="text-lg font-semibold text-gray-900">{t("soilNutrientsTitle")}</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FieldRow label={t("soilPh")} hint={t("soilPhHint")} voiceProps={vp(setSoilPh)}>
                    <input type="number" step="0.1" min="0" max="14" value={soilPh} onChange={(e) => setSoilPh(e.target.value)} placeholder="e.g. 6.5" className={inputClass} />
                  </FieldRow>
                </div>
                <FieldRow label={t("nitrogen")} hint={t("kgHaHint")} voiceProps={vp(setNitrogen)}>
                  <input type="number" step="0.1" min="0" value={nitrogen} onChange={(e) => setNitrogen(e.target.value)} placeholder="e.g. 120" className={inputClass} />
                </FieldRow>
                <FieldRow label={t("phosphorus")} hint={t("kgHaHint")} voiceProps={vp(setPhosphorus)}>
                  <input type="number" step="0.1" min="0" value={phosphorus} onChange={(e) => setPhosphorus(e.target.value)} placeholder="e.g. 45" className={inputClass} />
                </FieldRow>
                <div className="sm:col-span-2">
                  <FieldRow label={t("potassium")} hint={t("kgHaHint")} voiceProps={vp(setPotassium)}>
                    <input type="number" step="0.1" min="0" value={potassium} onChange={(e) => setPotassium(e.target.value)} placeholder="e.g. 200" className={inputClass} />
                  </FieldRow>
                </div>
              </div>
            </section>

            {/* ── Crop Timing ── */}
            <section className="space-y-4 border-t border-green-100 pt-8">
              <div className="flex items-center gap-2">
                <HiOutlineCalendarDays className="h-5 w-5 text-green-700" />
                <h2 className="text-lg font-semibold text-gray-900">{t("cropTimingTitle")}</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-800">{t("cropMonth")}</label>
                  <div className="relative">
                    <select value={cropMonth} onChange={(e) => setCropMonth(e.target.value)} className={`${inputClass} appearance-none pr-10`}>
                      {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.labelKey}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
                  </div>
                </div>
                <FieldRow
                  label={<span className="inline-flex items-center gap-1.5"><HiOutlineClock className="h-4 w-4 text-gray-500" />{t("duration")}</span>}
                  hint={t("durationHint")}
                  voiceProps={vp(setDuration)}
                >
                  <input type="number" step="1" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 90" className={inputClass} />
                </FieldRow>
              </div>
            </section>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-green-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">All inputs are sent to your prediction API.</p>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-green-700 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t("runningPrediction") : t("runPrediction")}
              </button>
            </div>
          </form>

          {/* ══ RESULT SIDEBAR ══════════════════════════════════════════════ */}
          <aside className="space-y-4 rounded-2xl border border-green-200 bg-white p-6 shadow-lg lg:sticky lg:top-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">{t("resultTitle")}</h3>
            {!result ? (
              <div className="rounded-xl border border-dashed border-green-200 bg-green-50/50 p-6 text-center text-sm text-gray-600">
                {t("resultPlaceholder")}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-green-300 bg-gradient-to-br from-green-50 to-emerald-50/80 p-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-green-800">
                    {t("recommendedCrop")}
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-gray-900">
                    {result.recommendedCrop || "—"}
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    {t("confidence")}:{" "}
                    <span className="font-semibold text-gray-900">
                      {typeof result.confidence === "number" ? `${Math.round(result.confidence * 100)}%` : "—"}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-gray-600">{result.message || "Prediction generated"}</p>
                </div>

                {/* 🔊 Read result aloud button */}
                <VoiceSpeaker
                  text={resultSpeechText}
                  label={t("speakResult")}
                  speechCode={speechCode}
                />

                {result.id && (
                  <p className="break-all text-xs text-gray-500">
                    Record ID: <span className="text-gray-700">{String(result.id)}</span>
                  </p>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}