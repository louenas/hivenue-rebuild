// frontend/src/utils/axiosConfig.js
// frontend/rental-app/src/utils/axiosConfig.js

import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Adjust based on where you store the token

    if (token) {
      // Primary: 'x-auth-token'
      config.headers['x-auth-token'] = token;

      // Alternatively: 'Authorization' header
      // config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;