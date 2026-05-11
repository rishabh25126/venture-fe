import axios from 'axios';
import { makeStore } from './store/store';
import { logout } from './features/auth/authSlice';

// We need a reference to the store to dispatch logout on 401
// In Next.js App Router, we'll access the Redux state via hooks in components,
// but for interceptors we might need a direct store reference if we export it, 
// or we let components handle the token.
// A common approach is passing the token in the interceptor:

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Send httpOnly cookies (refresh token) with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// We'll dynamically attach the token in components or via a Redux listener,
// but to keep it clean, we can inject a token via a function:
let currentToken: string | null = null;

export const setApiToken = (token: string | null) => {
  currentToken = token;
};

// Request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    if (currentToken && config.headers) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token using httpOnly cookie
        const res = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.data.accessToken;
        
        // Update the token in our variable
        setApiToken(newAccessToken);

        // Update the failed request and retry it
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (token expired or invalid)
        // We should dispatch logout here or let the UI handle it.
        // For now, clear token.
        setApiToken(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
