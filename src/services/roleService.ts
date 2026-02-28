import api from '../lib/api';
import { Role } from '../types';

export const roleService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    const { data } = await api.get(`/roles?${queryParams.toString()}`);
    return data;
  },

  create: async (roleData: { name: string; code: string; permissions: any }) => {
    const { data } = await api.post('/roles', roleData);
    return data;
  },

  update: async (id: string, roleData: Partial<Role>) => {
    const { data } = await api.put(`/roles/${id}`, roleData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/roles/${id}`);
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/roles/${id}`);
    return data;
  },

  export: async () => {
    const { data } = await api.get('/roles/export', { responseType: 'blob' });
    return data;
  },
};
