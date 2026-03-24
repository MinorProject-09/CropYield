import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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