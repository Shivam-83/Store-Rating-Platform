import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const authService = {
  login: (email, password) => {
    return axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
  },

  signup: (userData) => {
    return axios.post(`${API_BASE_URL}/auth/signup`, userData);
  },

  updatePassword: (currentPassword, newPassword, token) => {
    return axios.put(`${API_BASE_URL}/users/password`, {
      currentPassword,
      newPassword
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

export { authService };
