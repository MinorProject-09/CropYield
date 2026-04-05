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
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

export function postMlPrediction(payload) {
  return api.post("/api/ml/prediction", payload);
}

export function getProfitRank(payload) {
  return api.post("/api/ml/prediction/profit-rank", payload);
}

export function getPredictionHistory() {
  return api.get("/api/ml/prediction/history");
}

export function updateProfile(data) {
  return api.put("/api/auth/profile", data);
}

export function deletePrediction(id) {
  return api.delete(`/api/ml/prediction/${id}`);
}

/** q = address / place text; backend uses Google (if configured) then OSM */
export function getGeocode(q) {
  return api.get("/api/geocode", { params: { q } });
}

export function getGeocodeStatus() {
  return api.get("/api/geocode/status");
}

export default api;