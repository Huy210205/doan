import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const sessionStr = localStorage.getItem('websec_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.token) {
          config.headers['Authorization'] = `Bearer ${session.token}`;
        }
      } catch (err) {
        console.error('Failed to parse session from localStorage', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Add a response interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Only clear if we actually have a session, to prevent infinite loops on login
      if (localStorage.getItem('websec_session')) {
        localStorage.removeItem('websec_session');
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
