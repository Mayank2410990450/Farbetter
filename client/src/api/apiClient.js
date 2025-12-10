import axios from "axios";
import { apiRateLimiter } from "@/lib/rateLimiter";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/api`,
  withCredentials: true, // Enable sending cookies with requests
});

// Rate limiting interceptor
api.interceptors.request.use((config) => {
  const key = `${config.method}:${config.url}`;
  if (!apiRateLimiter.isAllowed(key)) {
    const error = new Error('Too many requests. Please try again later.');
    error.config = config;
    return Promise.reject(error);
  }
  return config;
});

// Attach token automatically on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");


  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
  }
  // Ensure withCredentials is set
  config.withCredentials = true;
  return config;
});

// Handle 401 errors by clearing token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;
