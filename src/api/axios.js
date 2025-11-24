import axios from "axios";

// 🟢 ENV variable (Vite)
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// 🟢 Token interceptor (same as before)
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("currentUser");
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
