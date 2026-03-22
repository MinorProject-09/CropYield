// api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true  // ← add this
});

export function postMlPrediction(payload) {
  return api.post("/api/ml/prediction", payload);
}

/** q = address / place text; backend uses Google (if configured) then OSM */
export function getGeocode(q) {
  return api.get("/api/geocode", { params: { q } });
}

export function getGeocodeStatus() {
  return api.get("/api/geocode/status");
}

export default api;