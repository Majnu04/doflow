import axios from 'axios';

// Prefer a relative '/api' default so Vite's dev server proxy (configured in vite.config.ts)
// can forward requests to the backend during development. If you need to target a
// different backend in production, set VITE_API_URL in your environment.
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Helpful debug output while developing to verify which base URL is used.
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.info('[api] baseURL =', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

export default api;
