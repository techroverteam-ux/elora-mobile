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
};
