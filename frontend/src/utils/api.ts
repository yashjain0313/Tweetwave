import axios from "axios";

// Create axios instance with environment-aware base URL
const api = axios.create({
  baseURL: "/api", // This works with our Vite proxy configuration
  withCredentials: true, // Important for cookies/authentication
});

export default api;
