import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
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

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const userService = {
  createUser: (userData) => apiClient.post('/users', userData),
  getUsers: (params) => apiClient.get('/users', { params }),
  getUserById: (id) => apiClient.get(`/users/${id}`),
};

export const storeService = {
  createStore: (storeData) => apiClient.post('/stores', storeData),
  getStores: (params) => apiClient.get('/stores', { params }),
  getStoreById: (id) => apiClient.get(`/stores/${id}`),
};

export const ratingService = {
  submitRating: (storeId, ratingData) => apiClient.post(`/ratings/${storeId}`, ratingData),
  updateRating: (storeId, ratingData) => apiClient.put(`/ratings/${storeId}`, ratingData),
  getUserRating: (storeId) => apiClient.get(`/ratings/${storeId}`),
  deleteRating: (storeId) => apiClient.delete(`/ratings/${storeId}`),
};

export const dashboardService = {
  getAdminDashboard: () => apiClient.get('/dashboard/admin'),
  getOwnerDashboard: () => apiClient.get('/dashboard/owner'),
};

export default apiClient;
