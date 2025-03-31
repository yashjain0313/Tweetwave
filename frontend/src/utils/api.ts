import axios from "axios";

// Create axios instance with proper cross-domain configuration
const api = axios.create({
  baseURL:
    import.meta.env.MODE === "production"
      ? "https://tweetwavee.onrender.com/api"
      : "/api",
  withCredentials: true, // Important for sending cookies with cross-domain requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized, you might want to redirect to login
      console.log("Authentication failed - redirecting to login");
    }
    return Promise.reject(error);
  }
);

export default api;
