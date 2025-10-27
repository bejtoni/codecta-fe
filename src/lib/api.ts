import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BE_BASE || "http://localhost:5000",
  timeout: 20000,
});

// Request interceptor to add Authorization header with ID token
api.interceptors.request.use(
  (config) => {
    const idToken = localStorage.getItem("idToken");
    if (idToken) {
      config.headers.Authorization = `Bearer ${idToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("idToken");
      window.location.href = "/login";
    }

    // Global error interceptor
    const msg =
      error?.response?.data?.message || error.message || "Request failed";
    return Promise.reject(new Error(msg));
  }
);
