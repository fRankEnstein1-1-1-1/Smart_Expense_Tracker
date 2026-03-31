import axios from 'axios';

const API = axios.create({
  baseURL: 'https://smart-expense-tracker-1-unwm.onrender.com/api',   // Your backend base URL
});

// Add token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;