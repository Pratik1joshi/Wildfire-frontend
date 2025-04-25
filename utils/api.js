import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://livefire-api.onrender.com', // Adjust to match your backend URL
  withCredentials: true, // Include credentials in requests
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use((config) => {
  // Get token from local storage
  const token = localStorage.getItem('livefire_token');
  
  // If token exists, add it to the headers
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
