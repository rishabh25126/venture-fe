import axios from 'axios';
import {
  beginNetworkRequest,
  endNetworkRequest,
} from "@/lib/ui/request-feedback-store";

const DEFAULT_PRODUCTION_API_URL = 'https://venture-be.vercel.app/api';

function getApiBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (explicit) {
    return explicit.replace(/\/$/, '');
  }

  const isDev =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_APP_ENV === 'development';

  if (isDev) {
    return '/backend';
  }

  return DEFAULT_PRODUCTION_API_URL;
}

export const apiBaseUrl = getApiBaseUrl();

function isRetryableRefreshFailure(status?: number) {
  return status === 429 || (status !== undefined && status >= 500);
}

// We need a reference to the store to dispatch logout on 401
// In Next.js App Router, we'll access the Redux state via hooks in components,
// but for interceptors we might need a direct store reference if we export it, 
// or we let components handle the token.
// A common approach is passing the token in the interceptor:

const api = axios.create({
  baseURL: apiBaseUrl,
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

let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

function trackRefreshRequest<T>(request: Promise<T>) {
  beginNetworkRequest();
  return request.finally(() => {
    endNetworkRequest();
  });
}

// Request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    if (currentToken && config.headers) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    if (!config.headers?.["x-skip-global-loader"]) {
      beginNetworkRequest();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and token refresh
api.interceptors.response.use(
  (response) => {
    if (!response.config.headers?.["x-skip-global-loader"]) {
      endNetworkRequest();
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest?.headers?.["x-skip-global-loader"]) {
      endNetworkRequest();
    }

    // If error is 401, not on an auth route, and we haven't retried yet
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token using httpOnly cookie
        const res = await trackRefreshRequest(
          axios.post(
            `${apiBaseUrl}/auth/refresh`,
            {},
            { withCredentials: true }
          )
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
        const status = axios.isAxiosError(refreshError)
          ? refreshError.response?.status
          : undefined;

        if (!isRetryableRefreshFailure(status) && onUnauthorized) {
          setApiToken(null);
          onUnauthorized();
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
