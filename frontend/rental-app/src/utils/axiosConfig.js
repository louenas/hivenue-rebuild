// frontend/src/utils/axiosConfig.js
// frontend/rental-app/src/utils/axiosConfig.js

import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Adjust based on where you store the token

    if (token) {
      // Alternatively: 'Authorization' header
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;