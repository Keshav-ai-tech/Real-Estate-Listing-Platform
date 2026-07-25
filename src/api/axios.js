import axios from 'axios';

// Create Axios instance with base configuration
const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach auth header automatically
api.interceptors.request.use(
  (config) => {
    const token = 
      localStorage.getItem('token') || 
      localStorage.getItem('authToken') || 
      localStorage.getItem('jwt') ||
      (localStorage.getItem('isLoggedIn') === 'true' ? 'mock-jwt-token' : null);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
