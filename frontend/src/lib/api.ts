
import axios from "axios";
import { env } from "./env";

// Create an axios instance
export const api = axios.create({
  baseURL: env.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If we're in demo mode and this is a real API call (not mocked),
    // we might get connection errors - let's handle them gracefully
    if (env.DEMO_MODE && !error.response) {
      console.warn("API request failed in demo mode:", error.message);
      // Return a mock response structure to prevent app crashes
      return Promise.reject({
        response: {
          status: 503,
          data: {
            message: "Service unavailable in demo mode"
          }
        }
      });
    }
    
    const { response } = error;
    
    // Handle token expiration
    if (response && response.status === 401) {
      localStorage.removeItem("token");
      // Redirect to login page if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);
