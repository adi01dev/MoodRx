import axios from "axios";
import { env } from "./env";

// Create API instances
export const api = axios.create({
  baseURL: env.API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Create AI service API instance
export const aiApi = axios.create({
  baseURL: "http://localhost:8000",
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

// Also add token to AI service requests (if needed for your architecture)
aiApi.interceptors.request.use(
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

// AI service error handling
aiApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("AI Service error:", error);
    return Promise.reject(error);
  }
);
