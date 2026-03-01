import api from '../lib/api';
import { Store } from '../types';

export const storeService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; city?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'ALL') queryParams.append('status', params.status);
    if (params?.city) queryParams.append('city', params.city);
    const { data } = await api.get(`/stores?${queryParams.toString()}`);
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/stores/${id}`);
    return data;
  },

  create: async (storeData: any) => {
    const { data } = await api.post('/stores', storeData);
    return data;
  },

  update: async (id: string, storeData: Partial<Store>) => {
    const { data } = await api.put(`/stores/${id}`, storeData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/stores/${id}`);
    return data;
  },

  assign: async (storeIds: string[], userId: string, stage: 'RECCE' | 'INSTALLATION') => {
    const { data } = await api.post('/stores/assign', { storeIds, userId, stage });
    return data;
  },

  unassign: async (storeIds: string[], stage: 'RECCE' | 'INSTALLATION') => {
    const { data } = await api.post('/stores/unassign', { storeIds, stage });
    return data;
  },

  approveRecce: async (id: string) => {
    const { data } = await api.post(`/stores/${id}/recce/review`, { status: 'APPROVED' });
    return data;
  },

  rejectRecce: async (id: string) => {
    const { data } = await api.post(`/stores/${id}/recce/review`, { status: 'REJECTED' });
    return data;
  },

  // File Export APIs
  export: async (params?: any) => {
    const queryParams = new URLSearchParams();
    if (params) Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });
    const { data } = await api.get(`/stores/export?${queryParams.toString()}`, { responseType: 'blob' });
    return data;
  },

  exportRecce: async () => {
    const { data } = await api.get('/stores/export/recce', { responseType: 'blob' });
    return data;
  },

  exportInstallation: async () => {
    const { data } = await api.get('/stores/export/installation', { responseType: 'blob' });
    return data;
  },

  getTemplate: async () => {
    const { data } = await api.get('/stores/template', { responseType: 'blob' });
    return data;
  },

  getExcel: async (storeId: string, type: string) => {
    const { data } = await api.get(`/stores/${storeId}/excel/${type}`, { responseType: 'blob' });
    return data;
  },

  getPdf: async (storeId: string, type: string) => {
    const { data } = await api.get(`/stores/${storeId}/pdf/${type}`, { responseType: 'blob' });
    return data;
  },

  getPpt: async (storeId: string, type: string) => {
    const { data } = await api.get(`/stores/${storeId}/ppt/${type}`, { responseType: 'blob' });
    return data;
  },

  bulkPdf: async (storeIds: string[], type: string) => {
    const { data } = await api.post('/stores/pdf/bulk', { storeIds, type }, { responseType: 'blob' });
    return data;
  },

  bulkPpt: async (storeIds: string[], type: string) => {
    const { data } = await api.post('/stores/ppt/bulk', { storeIds, type }, { responseType: 'blob' });
    return data;
  },

  upload: async (formData: FormData) => {
    const { data } = await api.post('/stores/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  submitRecce: async (id: string, formData: FormData) => {
    const { data } = await api.post(`/stores/${id}/recce`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  submitInstallation: async (id: string, formData: FormData) => {
    const { data } = await api.post(`/stores/${id}/installation`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
