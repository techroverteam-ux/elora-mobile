import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://elora-api-smoky.vercel.app/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  // Check both possible token storage keys for compatibility
  let token = await AsyncStorage.getItem('authToken');
  if (!token) {
    token = await AsyncStorage.getItem('access_token');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refreshToken });
          const newToken = response.data.token;
          
          // Store token with both keys for compatibility
          await AsyncStorage.setItem('authToken', newToken);
          await AsyncStorage.setItem('access_token', newToken);
          
          // Update refresh token if provided
          if (response.data.refreshToken) {
            await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
          }
          
          processQueue(null, newToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear all token storage keys
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refreshToken');
        
        // Notify the app that user needs to re-authenticate using React Native events
        const { DeviceEventEmitter } = require('react-native');
        DeviceEventEmitter.emit('tokenExpired');
        
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
  refreshToken: (refreshToken: string) => 
    api.post('/auth/refresh', { refreshToken }),

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