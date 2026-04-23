// ============================================================
// api/axios.js - Axios Instance with JWT Interceptor
// Automatically attaches the JWT token to every request
// ============================================================

import axios from 'axios';

/**
 * Create a custom Axios instance.
 * Set VITE_API_BASE_URL in the frontend Render service.
 * Example: https://student-grievance-pjww.onrender.com
 */
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const normalizedApiBaseUrl = rawApiBaseUrl
  ? (rawApiBaseUrl.endsWith('/api') ? rawApiBaseUrl : `${rawApiBaseUrl.replace(/\/+$/, '')}/api`)
  : 'https://student-grievance-pjww.onrender.com/api';

const api = axios.create({
  baseURL: normalizedApiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('grievance_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized globally (token expired / invalid)
// Only redirect if not already on a public page.
const PUBLIC_PATHS = ['/login', '/register'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const onPublicPage = PUBLIC_PATHS.some((path) =>
        window.location.pathname.startsWith(path)
      );
      if (!onPublicPage) {
        // Clear stale auth data and redirect to login
        localStorage.removeItem('grievance_user');
        localStorage.removeItem('grievance_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
