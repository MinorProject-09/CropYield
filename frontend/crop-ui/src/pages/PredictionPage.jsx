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
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function FieldLabel({ children, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-800">{children}</span>
      {hint ? <span className="mt-0.5 block text-xs font-normal text-gray-500">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200";

function parseGeocodeError(err) {
  if (!err.response) {
    return "Cannot reach the backend geocoding API. Start the server on port 5000 (npm run dev in /backend) and try again.";
  }
  const msg = err.response?.data?.message;
  if (typeof msg === "string" && msg.length > 0) return msg;
  if (err.response.status === 404) {
    return "No location found. Try a 6-digit PIN with state, or a clearer village / district / state.";
  }
  return "Could not look up coordinates.";
}

export default function PredictionPage() {
  const [locationMode, setLocationMode] = useState("map");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [mapFocusNonce, setMapFocusNonce] = useState(0);
  const [locationDetails, setLocationDetails] = useState("");
  /** details: free text vs structured India fields */
  const [addressDetailMode, setAddressDetailMode] = useState("free");
  const [structuredState, setStructuredState] = useState("");
  const [structuredDistrictSelect, setStructuredDistrictSelect] = useState("");
  const [structuredDistrictOther, setStructuredDistrictOther] = useState("");
  const [structuredDistrictText, setStructuredDistrictText] = useState("");
  const [structuredVillage, setStructuredVillage] = useState("");
  const [structuredPincode, setStructuredPincode] = useState("");
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [soilPh, setSoilPh] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [cropMonth, setCropMonth] = useState("6");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  /** details mode: idle | loading | success | error | short */
  const [geocodeStatus, setGeocodeStatus] = useState("idle");
  const [geocodeHint, setGeocodeHint] = useState("");
  const geocodeRequestId = useRef(0);

  useEffect(() => {
    getGeocodeStatus()
      .then(({ data }) => setGoogleConfigured(!!data.googleConfigured))
      .catch(() => setGoogleConfigured(false));
  }, []);

  function districtFinal() {
    const list = DISTRICTS_BY_STATE[structuredState];
    if (list?.length) {
      if (!structuredDistrictSelect) return "";
      if (structuredDistrictSelect === "__other__") return structuredDistrictOther.trim();
      return structuredDistrictSelect;
    }
    return structuredDistrictText.trim();
  }

  /** Current geocode search string, or null if not enough input yet */
  function buildGeocodeQuery() {
    if (locationMode !== "details") return null;
    if (addressDetailMode === "free") {
      const q = locationDetails.trim();
      if (q.length < 3) return null;
      return q;
    }
    const d = districtFinal();
    if (!structuredQueryReady(d, structuredVillage, structuredState, structuredPincode)) return null;
    const q = buildStructuredGeocodeQuery(structuredVillage, d, structuredState, structuredPincode);
    if (!q || q.trim().length < 3) return null;
    return q;
  }

  async function lookupCoordinatesNow() {
    setError(null);
    const q = buildGeocodeQuery();
    if (!q) {
      setGeocodeStatus("short");
      setGeocodeHint(
        "Add more detail: type at least 3 characters in the address box, or in structured mode choose state and a 6-digit PIN, or state + district, or state + village (3+ letters)."
      );
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
      setGeocodeHint(
        data.displayName ? `Matched (${provider}): ${data.displayName}` : `Resolved via ${provider}`
      );
    } catch (err) {
      setLatitude("");
      setLongitude("");
      setGeocodeStatus("error");
      setGeocodeHint(parseGeocodeError(err));
    }
  }

  useEffect(() => {
    setStructuredDistrictSelect("");
    setStructuredDistrictOther("");
    setStructuredDistrictText("");
  }, [structuredState]);

  useEffect(() => {
    if (locationMode !== "details" || addressDetailMode !== "free") return;

    const q = locationDetails.trim();
    if (q.length === 0) {
      setGeocodeStatus("idle");
      setGeocodeHint("");
      return;
    }
    if (q.length < 3) {
      setGeocodeStatus("short");
      setGeocodeHint("");
      return;
    }

    setGeocodeStatus("loading");
    setGeocodeHint("");

    const myId = ++geocodeRequestId.current;
    const timer = setTimeout(async () => {
      try {
        const { data } = await getGeocode(q);
        if (geocodeRequestId.current !== myId) return;
        setLatitude(String(Number(data.lat).toFixed(6)));
        setLongitude(String(Number(data.lng).toFixed(6)));
        setGeocodeStatus("success");
        const provider =
          data.provider === "google" ? "Google Maps" : "OpenStreetMap";
        setGeocodeHint(
          data.displayName ? `Matched (${provider}): ${data.displayName}` : `Resolved via ${provider}`
        );
      } catch (err) {
        if (geocodeRequestId.current !== myId) return;
        setLatitude("");
        setLongitude("");
        setGeocodeStatus("error");
        setGeocodeHint(parseGeocodeError(err));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [locationDetails, locationMode, addressDetailMode]);

  useEffect(() => {
    if (locationMode !== "details" || addressDetailMode !== "structured") return;

    const d = districtFinal();
    const q = buildStructuredGeocodeQuery(structuredVillage, d, structuredState, structuredPincode);

    if (!structuredQueryReady(d, structuredVillage, structuredState, structuredPincode)) {
      setGeocodeStatus("idle");
      setGeocodeHint("");
      return;
    }
    if (q.length < 3) {
      setGeocodeStatus("short");
      setGeocodeHint("");
      return;
    }

    setGeocodeStatus("loading");
    setGeocodeHint("");

    const myId = ++geocodeRequestId.current;
    const timer = setTimeout(async () => {
      try {
        const { data } = await getGeocode(q);
        if (geocodeRequestId.current !== myId) return;
        setLatitude(String(Number(data.lat).toFixed(6)));
        setLongitude(String(Number(data.lng).toFixed(6)));
        setGeocodeStatus("success");
        const provider =
          data.provider === "google" ? "Google Maps" : "OpenStreetMap";
        setGeocodeHint(
          data.displayName ? `Matched (${provider}): ${data.displayName}` : `Resolved via ${provider}`
        );
      } catch (err) {
        if (geocodeRequestId.current !== myId) return;
        setLatitude("");
        setLongitude("");
        setGeocodeStatus("error");
        setGeocodeHint(parseGeocodeError(err));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    locationMode,
    addressDetailMode,
    structuredState,
    structuredDistrictSelect,
    structuredDistrictOther,
    structuredDistrictText,
    structuredVillage,
    structuredPincode,
  ]);

  function handleMapChange({ latitude: lat, longitude: lng }) {
    setLatitude(lat);
    setLongitude(lng);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude.toFixed(6)));
        setLongitude(String(pos.coords.longitude.toFixed(6)));
        setMapFocusNonce((n) => n + 1);
      },
      () => setError("Could not read your location. Pick a point on the map instead."),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const ph = Number(soilPh);
    const n = Number(nitrogen);
    const p = Number(phosphorus);
    const k = Number(potassium);
    const month = Number(cropMonth);
    const dur = Number(duration);

    if (!Number.isFinite(ph) || ph < 0 || ph > 14) {
      setError("Soil pH must be between 0 and 14.");
      return;
    }
    if (!Number.isFinite(n) || n < 0) {
      setError("Nitrogen must be a non-negative number.");
      return;
    }
    if (!Number.isFinite(p) || p < 0) {
      setError("Phosphorus must be a non-negative number.");
      return;
    }
    if (!Number.isFinite(k) || k < 0) {
      setError("Potassium must be a non-negative number.");
      return;
    }
    if (!Number.isFinite(month) || month < 1 || month > 12) {
      setError("Select a valid crop month.");
      return;
    }
    if (!Number.isFinite(dur) || dur <= 0) {
      setError("Duration must be a positive number of days.");
      return;
    }

    let locationPayload;
    if (locationMode === "map") {
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setError("Pin a location on the map (or use your current location).");
        return;
      }
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError("Latitude must be −90…90 and longitude −180…180.");
        return;
      }
      locationPayload = { mode: "map", latitude: lat, longitude: lng, details: "" };
    } else {
      let trimmed = "";
      if (addressDetailMode === "structured") {
        const d = districtFinal();
        trimmed = buildStructuredDetailsLine(structuredVillage, d, structuredState, structuredPincode);
      } else {
        trimmed = locationDetails.trim();
      }
      if (!trimmed) {
        setError("Enter a location (free text or structured fields).");
        return;
      }
      let lat = Number(latitude);
      let lng = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        const q = buildGeocodeQuery();
        if (q) {
          try {
            const { data } = await getGeocode(q);
            lat = Number(data.lat);
            lng = Number(data.lng);
            setLatitude(String(lat.toFixed(6)));
            setLongitude(String(lng.toFixed(6)));
            setGeocodeStatus("success");
            const provider = data.provider === "google" ? "Google Maps" : "OpenStreetMap";
            setGeocodeHint(
              data.displayName
                ? `Matched (${provider}): ${data.displayName}`
                : `Resolved via ${provider}`
            );
          } catch (err) {
            setError(parseGeocodeError(err));
            return;
          }
        }
      }
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setError(
          "Coordinates are missing. Use “Look up coordinates”, or enter latitude & longitude, or add a 6-digit PIN with state."
        );
        return;
      }
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError("Latitude must be −90…90 and longitude −180…180.");
        return;
      }
      locationPayload = {
        mode: "details",
        latitude: lat,
        longitude: lng,
        details: trimmed,
      };
    }

    const payload = {
      location: locationPayload,
      soilPh: ph,
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      cropMonth: month,
      duration: dur,
    };

    setLoading(true);
    try {
      const { data } = await postMlPrediction(payload);
      setResult(data);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Prediction request failed. Is the API running?";
      setError(typeof msg === "string" ? msg : "Prediction request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-green-100 font-[Outfit,system-ui,sans-serif] text-gray-900">
      <Navbar />

      <div className="border-b border-green-200 bg-green-50 px-4 py-2 sm:px-10">
        <Link to="/" className="text-sm font-medium text-green-800 hover:text-green-900">
          ← Back to home
        </Link>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Crop yield prediction
          </h1>
          <p className="mt-2 text-base leading-relaxed text-gray-700">
            Enter soil data and timing. Location can be pinned on the map or described in text.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="space-y-8 rounded-2xl border border-green-200 bg-white p-6 shadow-lg sm:p-8"
          >
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-green-800">
                <HiOutlineMap className="h-5 w-5" />
                <h2 className="text-lg font-semibold text-gray-900">Location</h2>
              </div>
              <p className="text-sm text-gray-600">
                Use the map to pin your field, or switch to text details.
              </p>

              <div className="flex flex-wrap gap-2 rounded-xl border border-green-200 bg-green-50/80 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setLocationMode("map");
                    setGeocodeStatus("idle");
                    setGeocodeHint("");
                  }}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    locationMode === "map"
                      ? "bg-green-700 text-white shadow-sm"
                      : "text-gray-600 hover:bg-white/80 hover:text-gray-900"
                  }`}
                >
                  Map & pin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLocationMode("details");
                    setGeocodeStatus("idle");
                    setGeocodeHint("");
                  }}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    locationMode === "details"
                      ? "bg-green-700 text-white shadow-sm"
                      : "text-gray-600 hover:bg-white/80 hover:text-gray-900"
                  }`}
                >
                  Location details
                </button>
              </div>

              {locationMode === "map" ? (
                <div className="space-y-4">
                  <Suspense
                    fallback={
                      <div className="flex h-[min(420px,55vh)] min-h-[320px] items-center justify-center rounded-xl border border-green-200 bg-green-50 text-sm text-gray-600">
                        Loading map…
                      </div>
                    }
                  >
                    <LocationMapPicker
                      latitude={latitude}
                      longitude={longitude}
                      onChange={handleMapChange}
                      focusNonce={mapFocusNonce}
                    />
                  </Suspense>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel hint="Set automatically when you pin the map">Latitude</FieldLabel>
                      <input
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="Pin the map or enter manually"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel hint="Set automatically when you pin the map">Longitude</FieldLabel>
                      <input
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="Pin the map or enter manually"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={useMyLocation}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-green-300 bg-white px-4 py-3 text-sm font-medium text-green-900 shadow-sm transition hover:bg-green-50 sm:w-auto"
                  >
                    <HiOutlineMapPin className="h-4 w-4 text-green-700" />
                    Use my current location
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600">
                    {googleConfigured
                      ? "Geocoding uses Google Maps first, then OpenStreetMap if needed."
                      : "Set GOOGLE_MAPS_API_KEY in the backend .env for Google Maps geocoding; otherwise OpenStreetMap is used."}
                  </p>

                  <div className="flex flex-wrap gap-2 rounded-xl border border-green-200 bg-green-50/80 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAddressDetailMode("free");
                        setGeocodeStatus("idle");
                        setGeocodeHint("");
                      }}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        addressDetailMode === "free"
                          ? "bg-green-700 text-white shadow-sm"
                          : "text-gray-600 hover:bg-white/80"
                      }`}
                    >
                      Type address
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddressDetailMode("structured");
                        setGeocodeStatus("idle");
                        setGeocodeHint("");
                      }}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        addressDetailMode === "structured"
                          ? "bg-green-700 text-white shadow-sm"
                          : "text-gray-600 hover:bg-white/80"
                      }`}
                    >
                      State / district / village / PIN
                    </button>
                  </div>

                  {addressDetailMode === "free" ? (
                    <>
                      <FieldLabel hint="Village, district, state, or full address — coordinates update automatically">
                        Location description
                      </FieldLabel>
                      <textarea
                        rows={4}
                        value={locationDetails}
                        onChange={(e) => setLocationDetails(e.target.value)}
                        placeholder="e.g. Ludhiana district, Punjab — wheat belt near canal irrigation"
                        className={`${inputClass} resize-y`}
                      />
                      <p className="text-xs text-gray-500">
                        Pause typing to search. Results are best with Google Maps key on the server.
                      </p>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Choose state and district (or type district if your state has no list). Add a 6-digit
                        PIN code for the most accurate result, or use village + district with state.
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                          <FieldLabel>State / UT</FieldLabel>
                          <div className="relative">
                            <select
                              value={structuredState}
                              onChange={(e) => setStructuredState(e.target.value)}
                              className={`${inputClass} appearance-none pr-10`}
                            >
                              <option value="">Select state</option>
                              {INDIAN_STATES_AND_UTS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                              ▾
                            </span>
                          </div>
                        </div>
                        {DISTRICTS_BY_STATE[structuredState]?.length ? (
                          <div className="space-y-2 sm:col-span-2">
                            <FieldLabel>District</FieldLabel>
                            <div className="relative">
                              <select
                                value={structuredDistrictSelect}
                                onChange={(e) => setStructuredDistrictSelect(e.target.value)}
                                className={`${inputClass} appearance-none pr-10`}
                              >
                                <option value="">Select district</option>
                                {DISTRICTS_BY_STATE[structuredState].map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                                <option value="__other__">Other (type below)</option>
                              </select>
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                ▾
                              </span>
                            </div>
                            {structuredDistrictSelect === "__other__" ? (
                              <input
                                type="text"
                                value={structuredDistrictOther}
                                onChange={(e) => setStructuredDistrictOther(e.target.value)}
                                placeholder="District name"
                                className={inputClass}
                              />
                            ) : null}
                          </div>
                        ) : (
                          <div className="space-y-2 sm:col-span-2">
                            <FieldLabel hint="Required if PIN is not filled">District</FieldLabel>
                            <input
                              type="text"
                              value={structuredDistrictText}
                              onChange={(e) => setStructuredDistrictText(e.target.value)}
                              placeholder="District name"
                              className={inputClass}
                            />
                          </div>
                        )}
                        <div className="space-y-2 sm:col-span-2">
                          <FieldLabel hint="Village or locality">Village / locality</FieldLabel>
                          <input
                            type="text"
                            value={structuredVillage}
                            onChange={(e) => setStructuredVillage(e.target.value)}
                            placeholder="e.g. village or locality name"
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <FieldLabel hint="6-digit India PIN — strongly recommended for accurate coordinates">
                            PIN code
                          </FieldLabel>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={structuredPincode}
                            onChange={(e) =>
                              setStructuredPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                            }
                            placeholder="e.g. 141001"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {geocodeStatus === "loading" ? (
                    <p className="text-sm text-green-800">Looking up coordinates…</p>
                  ) : null}
                  {geocodeStatus === "short" &&
                  addressDetailMode === "free" &&
                  locationDetails.trim().length > 0 ? (
                    <p className="text-sm text-amber-800">Type at least 3 characters to geocode.</p>
                  ) : null}
                  {geocodeHint ? (
                    <p
                      className={`text-xs ${geocodeStatus === "error" ? "text-red-700" : "text-gray-600"}`}
                    >
                      {geocodeHint}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={lookupCoordinatesNow}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-green-600 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-900 shadow-sm transition hover:bg-green-100 sm:w-auto"
                  >
                    Look up coordinates now
                  </button>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel hint="Filled automatically (editable)">Latitude</FieldLabel>
                      <input
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="Appears after lookup"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel hint="Filled automatically (editable)">Longitude</FieldLabel>
                      <input
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="Appears after lookup"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-4 border-t border-green-100 pt-8">
              <div className="flex items-center gap-2 text-green-800">
                <HiOutlineBeaker className="h-5 w-5" />
                <h2 className="text-lg font-semibold text-gray-900">Soil & nutrients</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <FieldLabel hint="Typical range ~4–9">Soil pH</FieldLabel>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={soilPh}
                    onChange={(e) => setSoilPh(e.target.value)}
                    placeholder="e.g. 6.5"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel hint="kg/ha or lab units you use consistently">Nitrogen (N)</FieldLabel>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={nitrogen}
                    onChange={(e) => setNitrogen(e.target.value)}
                    placeholder="e.g. 120"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel hint="kg/ha or lab units you use consistently">Phosphorus (P)</FieldLabel>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(e.target.value)}
                    placeholder="e.g. 45"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <FieldLabel hint="kg/ha or lab units you use consistently">Potassium (K)</FieldLabel>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={potassium}
                    onChange={(e) => setPotassium(e.target.value)}
                    placeholder="e.g. 200"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t border-green-100 pt-8">
              <div className="flex items-center gap-2 text-green-800">
                <HiOutlineCalendarDays className="h-5 w-5" />
                <h2 className="text-lg font-semibold text-gray-900">Crop timing</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel>Month of crop</FieldLabel>
                  <div className="relative">
                    <select
                      value={cropMonth}
                      onChange={(e) => setCropMonth(e.target.value)}
                      className={`${inputClass} appearance-none pr-10`}
                    >
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      ▾
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <FieldLabel hint="Growing period in days">
                    <span className="inline-flex items-center gap-1.5">
                      <HiOutlineClock className="h-4 w-4 text-gray-500" />
                      Duration
                    </span>
                  </FieldLabel>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 90"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-green-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">All inputs are sent to your prediction API.</p>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-green-700 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Running prediction…" : "Run prediction"}
              </button>
            </div>
          </form>

          <aside className="space-y-4 rounded-2xl border border-green-200 bg-white p-6 shadow-lg lg:sticky lg:top-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Result</h3>
            {!result ? (
              <div className="rounded-xl border border-dashed border-green-200 bg-green-50/50 p-6 text-center text-sm text-gray-600">
                Submit the form to see the recommended crop from the API.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-green-300 bg-gradient-to-br from-green-50 to-emerald-50/80 p-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-green-800">
                    Recommended crop (model output)
                  </p>
                  <p className="mt-2 text-4xl font-semibold tabular-nums text-gray-900">
                    {result.recommendedCrop || "—"}
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    Confidence:{" "}
                    <span className="font-semibold tabular-nums text-gray-900">
                      {typeof result.confidence === "number"
                        ? `${Math.round(result.confidence * 100)}%`
                        : "—"}
                    </span>
                  </p>
                  <p className="mt-2 text-xs text-gray-600">{result.message || "Prediction generated"}</p>
                </div>
                {result.id ? (
                  <p className="break-all text-xs text-gray-500">
                    Record ID: <span className="text-gray-700">{String(result.id)}</span>
                  </p>
                ) : null}
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
