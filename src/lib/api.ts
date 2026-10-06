import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

const API_BASE_URL = 'https://elora-api-smoky.vercel.app/api/v1';

// Dedicated unauthenticated client for token refresh to avoid sending expired Bearer tokens


// ---------------------------------------------------------------------------
// Dev-only request logging (RN 0.80's DevTools has no Network tab).
// Filter the Console by "[API]" to see every call:
//   [API] → GET /stores?page=1&limit=20
//   [API] ← 200 GET /stores?page=1&limit=20 (412ms) {stores: Array(20), pagination: {…}}
//   [API] ✕ 400 POST /stores (230ms) {message: "A store with this Dealer Code already exists"}
// ---------------------------------------------------------------------------
const describeRequest = (config: any) => {
  const method = String(config?.method || 'GET').toUpperCase();
  const url = String(config?.url || '');
  const params = config?.params
    ? Object.entries(config.params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';
  return `${method} ${url}${params ? (url.includes('?') ? '&' : '?') + params : ''}`;
};

// Successful responses: log the FULL body so it can be expanded in DevTools.
// console.log is not routed through LogBox, so big payloads are fine here.
// Only binary bodies are summarised.
const loggableBody = (data: any): any => {
  if (data == null) return '';
  if (typeof Blob !== 'undefined' && data instanceof Blob) return `(blob ${data.size} bytes)`;
  return data;
};

// Errors go through console.error → LogBox, which can choke on huge objects,
// so error bodies stay summarised. Keep logged bodies small: big arrays become "Array(n)" previews, blobs are
// summarised, so the console (and LogBox) never chokes on a huge payload.
const summarizeBody = (data: any): any => {
  if (data == null) return '';
  if (typeof Blob !== 'undefined' && data instanceof Blob) return `(blob ${data.size} bytes)`;
  if (typeof data !== 'object') return typeof data === 'string' && data.length > 300 ? data.slice(0, 300) + '…' : data;
  if (Array.isArray(data)) return `Array(${data.length})`;
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) out[k] = `Array(${v.length})`;
    else if (v && typeof v === 'object') out[k] = '{…}';
    else out[k] = v;
  }
  return out;
};

// ---------------------------------------------------------------------------
// Axios errors carry the whole XMLHttpRequest (`request`) and request
// `config` (adapters, transforms, headers…). When any screen does
// `console.error('...', error)`, LogBox tries to render that object and Hermes
// throws "RangeError: Property storage exceeds 196607 properties".
// Making those fields non-enumerable keeps them fully usable in code
// (error.config, error.request still work — the retry logic below relies on
// error.config) but loggers no longer walk into them.
// ---------------------------------------------------------------------------
const hideHeavyErrorFields = (err: any) => {
  if (!err || typeof err !== 'object') return err;
  const hide = (obj: any, key: string) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      try {
        Object.defineProperty(obj, key, { value: obj[key], enumerable: false, writable: true, configurable: true });
      } catch {}
    }
  };
  hide(err, 'request');
  hide(err, 'config');
  if (err.response && typeof err.response === 'object') {
    hide(err.response, 'request');
    hide(err.response, 'config');
  }
  return err;
};

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to extract cookie values from Set-Cookie headers
export const extractCookieValue = (cookies: string | string[] | undefined, name: string): string | null => {
  if (!cookies) return null;
  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
  for (const c of cookieArray) {
    const match = c.match(new RegExp(`${name}=([^;]+)`));
    if (match && match[1]) {
      return decodeURIComponent(match[1].trim());
    }
  }
  return null;
};

// Activity tracker for continuous usage
let lastActiveTimestamp = Date.now();
export const recordUserActivity = () => {
  lastActiveTimestamp = Date.now();
};
export const getLastUserActivity = () => lastActiveTimestamp;

// Standalone function to perform token refresh using cookie and body fallback
refreshClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(hideHeavyErrorFields(error)),
);

export const performTokenRefresh = async (): Promise<string | null> => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await refreshClient.post(
      '/auth/refresh',
      { refreshToken, refresh_token: refreshToken },
      {
        headers: {
          Cookie: `refresh_token=${refreshToken}`,
        },
      }
    );

    const newToken =
      response.data?.token ||
      response.data?.accessToken ||
      response.data?.data?.token ||
      response.data?.data?.accessToken;

    if (newToken) {
      await AsyncStorage.setItem('authToken', newToken);
      await AsyncStorage.setItem('access_token', newToken);

      // Check if server rotated the refresh token in Set-Cookie or body
      const newRefreshTokenFromCookie = extractCookieValue(
        response.headers?.['set-cookie'],
        'refresh_token'
      );
      const newRefreshToken =
        newRefreshTokenFromCookie ||
        response.data?.refreshToken ||
        response.data?.refresh_token ||
        response.data?.data?.refreshToken;

      if (newRefreshToken) {
        await AsyncStorage.setItem('refreshToken', newRefreshToken);
      }

      recordUserActivity();
      return newToken;
    }
    return null;
  } catch (error: any) {
    console.warn('performTokenRefresh failed:', error?.response?.status, error?.message);
    throw error;
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token and session cookies to requests
api.interceptors.request.use(async (config) => {
  recordUserActivity();

  // Check both possible token storage keys for compatibility
  let token = await AsyncStorage.getItem('authToken');
  if (!token) {
    token = await AsyncStorage.getItem('access_token');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (refreshToken && !config.headers.Cookie) {
    config.headers.Cookie = `refresh_token=${refreshToken}`;
  }

  if (__DEV__) {
    (config as any).__startedAt = Date.now();
    const isAuthCall = String(config.url || '').includes('/auth/');
    const body = isAuthCall ? '(hidden)' : config.data instanceof FormData ? '(multipart form-data)' : config.data ?? '';
    console.log(`[API] → ${describeRequest(config)}`, body);
  }

  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    recordUserActivity();

    // If any response sets/updates refresh_token cookie, persist it
    const rt = extractCookieValue(response.headers?.['set-cookie'], 'refresh_token');
    if (rt) {
      AsyncStorage.setItem('refreshToken', rt).catch(() => {});
    }
    if (__DEV__) {
      const ms = Date.now() - ((response.config as any)?.__startedAt || Date.now());
      const isAuthCall = String(response.config?.url || '').includes('/auth/');
      console.log(`[API] ← ${response.status} ${describeRequest(response.config)} (${ms}ms)`, isAuthCall ? '(hidden)' : loggableBody(response.data));
    }
    return response;
  },
  async (error) => {
    hideHeavyErrorFields(error);
    const originalRequest = error.config;

    // Dev-only: surface every failed API call in the DevTools console.
    // (Most screens catch errors and only show a Toast, so without this
    // nothing ever reached the console.)
    if (__DEV__) {
      const status = error?.response?.status ?? 'NETWORK';
      const ms = Date.now() - (originalRequest?.__startedAt || Date.now());
      console.error(`[API] ✕ ${status} ${describeRequest(originalRequest || {})} (${ms}ms)`, summarizeBody(error?.response?.data ?? error?.message));
    }

    // Never intercept auth endpoints (login, refresh, logout) to prevent loops
    const requestUrl = originalRequest?.url || '';
    if (
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await performTokenRefresh();
        if (newToken) {
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          processQueue(error, null);
          return Promise.reject(error);
        }
      } catch (refreshError: any) {
        processQueue(refreshError, null);

        // ONLY log out if the refresh token was explicitly rejected by the server (401 or 403)
        // If it was a network timeout or offline connectivity issue, DO NOT log out the user!
        if (refreshError?.response?.status === 401 || refreshError?.response?.status === 403) {
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('access_token');
          await AsyncStorage.removeItem('refreshToken');
          await AsyncStorage.removeItem('user');

          DeviceEventEmitter.emit('tokenExpired');
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Store API endpoints
export const storeAPI = {
  // Get all stores with filters and pagination
  getStores: (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    city?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status && params.status !== 'ALL') queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.city) queryParams.append('city', params.city);
    
    return api.get(`/stores?${queryParams.toString()}`);
  },

  // Get single store by ID
  getStore: (id: string) => api.get(`/stores/${id}`),
  getStoreById: (id: string) => api.get(`/stores/${id}`),

  // Create new store
  createStore: (storeData: any) => api.post('/stores', storeData),

  // Update store
  updateStore: (id: string, storeData: any) => api.put(`/stores/${id}`, storeData),

  // Delete store
  deleteStore: (id: string) => api.delete(`/stores/${id}`),

  // Bulk upload stores
  uploadStores: (formData: FormData) => api.post('/stores/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Download template
  downloadTemplate: () => api.get('/stores/template', { responseType: 'blob' }),

  // Assign stores to users
  assignStores: (data: {
    storeIds: string[];
    userId: string;
    stage: 'RECCE' | 'INSTALLATION';
  }) => api.post('/stores/assign', data),

  // Unassign stores
  unassignStores: (data: {
    storeIds: string[];
    stage: 'RECCE' | 'INSTALLATION';
  }) => api.post('/stores/unassign', data),

  // Review recce (approve/reject)
  reviewRecce: (storeId: string, status: 'APPROVED' | 'REJECTED') => 
    api.post(`/stores/${storeId}/recce/review`, { status }),

  // Submit recce
  submitRecce: (id: string, recceData: any) => api.post(`/stores/${id}/recce`, recceData),

  // Submit installation (matches web portal API)
  submitInstallation: (id: string, formData: FormData) => 
    api.post(`/stores/${id}/installation`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Complete installation
  completeInstallation: (id: string, installationData?: any) => {
    if (installationData) {
      return api.post(`/stores/${id}/installation/complete`, installationData);
    }
    return api.post(`/stores/${id}/installation/complete`);
  },

  downloadInstallationReport: (storeId: string, format: 'pdf' | 'ppt') => 
    api.get(`/stores/${storeId}/ppt/installation`, { responseType: 'blob' }),

  // Get users by role
  getUsersByRole: (role: 'RECCE' | 'INSTALLATION') => 
    api.get(`/users/role/${role}`),
};

// User API endpoints
export const userAPI = {
  // Get current user
  getCurrentUser: () => api.get('/users/me'),

  // Get all users
  getUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    return api.get(`/users?${queryParams.toString()}`);
  },

  // Create user
  createUser: (userData: any) => api.post('/users', userData),

  // Update user
  updateUser: (id: string, userData: any) => api.put(`/users/${id}`, userData),

  // Delete user
  deleteUser: (id: string) => api.delete(`/users/${id}`),

  // Get users by role
  getUsersByRole: (role: string) => api.get(`/users/role/${role}`),
};

// Auth API endpoints
export const authAPI = {
  // Login
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),

  // Register
  register: (userData: any) => api.post('/auth/register', userData),

  // Refresh token
  refreshToken: (refreshToken?: string) => 
    performTokenRefresh(),

  // Logout
  logout: () => api.post('/auth/logout'),

  // Forgot password
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),

  // Reset password
  resetPassword: (token: string, password: string) => 
    api.post('/auth/reset-password', { token, password }),
};

// Recce API endpoints
export const recceAPI = {
  // Get recce assignments
  getRecceAssignments: (params?: { page?: number; limit?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    return api.get(`/recce?${queryParams.toString()}`);
  },

  // Get single recce
  getRecce: (id: string) => api.get(`/recce/${id}`),

  // Submit recce
  submitRecce: (id: string, recceData: any) => api.post(`/recce/${id}/submit`, recceData),

  // Upload recce images
  uploadRecceImages: (id: string, formData: FormData) => 
    api.post(`/recce/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Installation API endpoints
export const installationAPI = {
  // Get installation assignments
  getInstallationAssignments: (params?: { page?: number; limit?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    return api.get(`/installation?${queryParams.toString()}`);
  },

  // Get single installation
  getInstallation: (id: string) => api.get(`/installation/${id}`),

  // Submit installation
  submitInstallation: (id: string, installationData: any) => 
    api.post(`/installation/${id}/submit`, installationData),

  // Upload installation images
  uploadInstallationImages: (id: string, formData: FormData) => 
    api.post(`/installation/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Reports API endpoints
export const reportsAPI = {
  // Get dashboard stats
  getDashboardStats: () => api.get('/dashboard/stats'),

  // Get store reports
  getStoreReports: (params?: { 
    startDate?: string; 
    endDate?: string; 
    status?: string; 
    city?: string; 
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.city) queryParams.append('city', params.city);
    
    return api.get(`/reports/stores?${queryParams.toString()}`);
  },

  // Export reports
  exportReport: (type: 'stores' | 'recce' | 'installation', format: 'excel' | 'pdf') => 
    api.get(`/reports/export/${type}/${format}`, { responseType: 'blob' }),
};

// Client API endpoints
export const clientAPI = {
  // Get all clients
  getClients: (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    return api.get(`/clients?${queryParams.toString()}`);
  },

  // Create client
  createClient: (clientData: any) => api.post('/clients', clientData),

  // Update client
  updateClient: (id: string, clientData: any) => api.put(`/clients/${id}`, clientData),

  // Delete client
  deleteClient: (id: string) => api.delete(`/clients/${id}`),
};

// Elements API endpoints
export const elementsAPI = {
  // Get all elements
  getElements: () => api.get('/elements'),

  // Create element
  createElement: (elementData: any) => api.post('/elements', elementData),

  // Update element
  updateElement: (id: string, elementData: any) => api.put(`/elements/${id}`, elementData),

  // Delete element
  deleteElement: (id: string) => api.delete(`/elements/${id}`),
};

// Enquiry API endpoints
export const enquiryAPI = {
  // Get all enquiries
  getEnquiries: (params?: { page?: number; limit?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    return api.get(`/enquiries?${queryParams.toString()}`);
  },

  // Create enquiry
  createEnquiry: (enquiryData: any) => api.post('/enquiries', enquiryData),

  // Update enquiry
  updateEnquiry: (id: string, enquiryData: any) => api.put(`/enquiries/${id}`, enquiryData),

  // Delete enquiry
  deleteEnquiry: (id: string) => api.delete(`/enquiries/${id}`),
};

// RFQ API endpoints
export const rfqAPI = {
  // Get all RFQs
  getRFQs: (params?: { page?: number; limit?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    return api.get(`/rfq?${queryParams.toString()}`);
  },

  // Create RFQ
  createRFQ: (rfqData: any) => api.post('/rfq', rfqData),

  // Update RFQ
  updateRFQ: (id: string, rfqData: any) => api.put(`/rfq/${id}`, rfqData),

  // Delete RFQ
  deleteRFQ: (id: string) => api.delete(`/rfq/${id}`),
};