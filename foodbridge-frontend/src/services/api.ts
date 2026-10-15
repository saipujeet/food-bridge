import axios from 'axios';
import { storage } from '../utils';

// Configure Axios Instance for Java Spring Boot Backend REST APIs
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 6000,
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized Error Normalization
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        // Auto logout on unauthorized
        storage.clear();
      }
      const message = error.response.data?.message || 'A server error occurred. Please try again.';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Unable to connect to the server. Please check your network connection.'));
    }
    return Promise.reject(new Error(error.message || 'An unexpected error occurred.'));
  }
);

export default api;
