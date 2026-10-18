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
    // Only auto-redirect on 401 if a token was sent and failed (expired/invalid token),
    // and don't redirect when already on login, register, or public discovery pages
    if (error.response && error.response.status === 401) {
      const hadToken = Boolean(localStorage.getItem('token') || localStorage.getItem('authToken'));
      if (hadToken && error.config && error.config.headers && error.config.headers.Authorization) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
