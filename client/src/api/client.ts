import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bb_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired/invalid
      if (localStorage.getItem('bb_auth_token')) {
        localStorage.removeItem('bb_auth_token');
        localStorage.removeItem('bb_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
