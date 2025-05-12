import { BASE_URL } from "@/consts";
import axios from "axios";

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the auth token to requests
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't override Content-Type if it's already set (for multipart/form-data)
    if (config.headers["Content-Type"] === "multipart/form-data") {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await axios.post("/api/accounts/token/refresh/", {
          refresh: refreshToken,
        });

        // If successful, save the new token and retry the original request
        if (response.data.access) {
          localStorage.setItem("access_token", response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // For network errors, add a more user-friendly message
    if (!error.response) {
      error.message = "Network error. Please check your connection.";
    }

    return Promise.reject(error);
  }
);

export default apiClient;
