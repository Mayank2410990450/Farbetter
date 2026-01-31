import axios from "axios";
import { apiRateLimiter } from "@/lib/rateLimiter";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/api`,
  withCredentials: true, // Enable sending cookies with requests
  timeout: 20000, // 20 seconds (Reduced for faster feedback)
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
  }
  // Ensure withCredentials is set
  config.withCredentials = true;

  // Add Idempotency-Key for POST/PUT requests to prevent duplicate operations
  if ((config.method === 'post' || config.method === 'put') && !config.headers['Idempotency-Key']) {
    config.headers['Idempotency-Key'] = crypto.randomUUID();
  }

  return config;
});

// Retry logic and Error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Reject if no config (rare) or if we've already retried max times
    if (!config || config._retryCount >= 3) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
      }
      return Promise.reject(error);
    }

    // Check if we should retry
    // Retry on: Network Error, 5xx Server Errors, 429 Too Many Requests
    const shouldRetry =
      !error.response || // Network error (no response)
      (error.response.status >= 500 && error.response.status <= 599) ||
      error.response.status === 429;

    if (shouldRetry) {
      config._retryCount = (config._retryCount || 0) + 1;

      // Amazon/Flipkart style: Exponential backoff (1s, 2s, 4s)
      const backoffDelay = 1000 * Math.pow(2, config._retryCount - 1);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, backoffDelay));

      return api(config);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;
