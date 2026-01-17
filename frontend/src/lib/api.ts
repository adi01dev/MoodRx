import axios from "axios";
import { env } from "./env";


export const api = axios.create({
  baseURL: env.API_URL || "https://moodrx-backend.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});


export const aiApi = axios.create({
  baseURL: "https://adi01dev-moodrx-ai.hf.space",
  headers: {
    "Content-Type": "application/json",
  },
});

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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    
    if (env.DEMO_MODE && !error.response) {
      console.warn("API request failed in demo mode:", error.message);
      
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
    
    
    if (response && response.status === 401) {
      localStorage.removeItem("token");
      
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);


aiApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("AI Service error:", error);
    return Promise.reject(error);
  }
);
