import axios from 'axios';
import { getApiUrl } from './environment';

// Create axios instance with dynamic baseURL
const createApiInstance = () => {
  const apiUrl = getApiUrl();
  
  const instance = axios.create({
    baseURL: apiUrl,
    timeout: 10000, // 10 second timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token if available
  instance.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Debug logging for development
      if (import.meta.env.DEV) {
        console.log('API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullUrl: `${config.baseURL}${config.url}`
        });
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle common errors
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('authToken');
        localStorage.removeItem('userLoggedIn');
        // Optionally redirect to login
        // window.location.href = '/login';
      }
      
      // Log errors in development
      if (import.meta.env.DEV) {
        console.error('API Error:', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
          baseURL: error.config?.baseURL
        });
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create and export the API instance
const api = createApiInstance();

export default api;

// Also export a function to recreate the instance if needed
export const recreateApiInstance = () => {
  return createApiInstance();
};

// Convenience methods for common API calls
export const apiMethods = {
  // User endpoints
  user: {
    login: (data) => api.post('/api/user/login', data),
    signup: (data) => api.post('/api/user/signup', data),
    getProfile: (email) => api.get(`/api/user/profile?email=${encodeURIComponent(email)}`),
    updateProfile: (data) => api.put('/api/user/profile', data),
    markPreferencesCompleted: (email) => api.put('/api/user/preferences-completed', { email }),
    getPreferencesStatus: (email) => api.get(`/api/user/preferences-status/${encodeURIComponent(email)}`),
    getConnections: (email) => api.get(`/api/user/connections?email=${encodeURIComponent(email)}`),
    removeConnection: (email, removeId) => api.delete('/api/user/connections', { data: { email, remove: removeId } })
  },
  
  // Flatmate endpoints
  flatmate: {
    createProfile: (userId, data) => api.post(`/api/flatmates/profile/${userId}`, data),
    getProfile: (userId) => api.get(`/api/flatmates/profile/${userId}`),
    getFullProfile: (userId) => api.get(`/api/flatmates/profile/full/${userId}`),
    getMatches: (userId, userEmail) => api.get(`/api/flatmates/matches/${userId}?userEmail=${encodeURIComponent(userEmail)}`)
  },
  
  // Flat listing endpoints
  flats: {
    create: (data) => api.post('/api/flats', data),
    getAll: () => api.get('/api/flats'),
    getById: (id) => api.get(`/api/flats/${id}`),
    update: (id, data) => api.put(`/api/flats/${id}`, data),
    delete: (id) => api.delete(`/api/flats/${id}`),
    getReviews: (id) => api.get(`/api/flats/${id}/reviews`),
    addReview: (id, data) => api.post(`/api/flats/${id}/reviews`, data)
  },
  
  // Connection endpoints  
  connection: {
    getStatus: (userEmail, targetUserId) => api.get(`/api/connection/connection-status?userEmail=${encodeURIComponent(userEmail)}&targetUserId=${encodeURIComponent(targetUserId)}`),
    acceptRequest: (data) => api.post('/api/connection/accept-request', data),
    declineRequest: (data) => api.post('/api/connection/decline-request', data)
  },
  
  // Health check
  health: () => api.get('/health')
};