import axios from 'react';

const api = axios.create({
  baseURL: 'http://localhost:5050/api',
});

// Interceptor to automatically add the Bearer token to all outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
