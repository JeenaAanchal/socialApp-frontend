import axios from "axios";

// ✅ Use Vite environment variables automatically
// Vite injects import.meta.env.MODE ("development" or "production")
const API_URL = import.meta.env[`VITE_API_URL_${import.meta.env.MODE.toUpperCase()}`];

if (!API_URL) {
  throw new Error(`Backend API URL not defined for mode: ${import.meta.env.MODE}`);
}

// ✅ Create Axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`, // append /api since ENV doesn't include it
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send cookies if needed
});

// 🟢 Attach token automatically
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try {
        const { token } = JSON.parse(stored);
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.error("Error parsing stored user token:", err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🟢 Global response interceptor for logging/debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios request failed:", error);
    return Promise.reject(error);
  }
);

export default api;
