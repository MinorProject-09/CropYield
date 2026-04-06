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

// ── Sensor / IoT API ──────────────────────────────────────────────────────────
export const postSensorReading = (data)           => api.post("/api/sensor", data);
export const getSensorLatest   = ()               => api.get("/api/sensor/latest");
export const getSensorHistory  = (deviceId, limit)=> api.get("/api/sensor/history", { params: { deviceId, limit } });
export const getSensorAlerts   = ()               => api.get("/api/sensor/alerts");
export const deleteSensorReading = (id)           => api.delete(`/api/sensor/${id}`);

// ── Weather API ───────────────────────────────────────────────────────────────
export const getWeatherForecast = (lat, lng) =>
  api.get("/api/weather", { params: { lat, lng } });

// ── Market Intelligence API ───────────────────────────────────────────────────
export const getMarketPrices   = (commodity, state) => api.get("/api/market/prices",    { params: { commodity, state } });
export const getMarketBestTime = (commodity)         => api.get("/api/market/best-time", { params: { commodity } });

// ── Community API ─────────────────────────────────────────────────────────────
export const getCommunityPosts    = (params)       => api.get("/api/community/posts", { params });
export const getCommunityPost     = (id)           => api.get(`/api/community/posts/${id}`);
export const createCommunityPost  = (data)         => api.post("/api/community/posts", data);
export const upvoteCommunityPost  = (id)           => api.post(`/api/community/posts/${id}/upvote`);
export const addCommunityAnswer   = (id, body)     => api.post(`/api/community/posts/${id}/answers`, { body });
export const upvoteCommunityAnswer= (id, aid)      => api.post(`/api/community/posts/${id}/answers/${aid}/upvote`);
export const deleteCommunityPost  = (id)           => api.delete(`/api/community/posts/${id}`);
