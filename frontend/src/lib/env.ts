
// Default environment variables
const defaultEnv = {
  API_URL: "http://localhost:5000/api",
  DEMO_MODE: true, // Add this flag to indicate we're in demo mode
};

// Export environment variables
export const env = {
  API_URL: import.meta.env.VITE_API_URL || defaultEnv.API_URL,
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE !== undefined 
    ? import.meta.env.VITE_DEMO_MODE === "true" 
    : defaultEnv.DEMO_MODE,
};
