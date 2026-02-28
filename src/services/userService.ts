import api from '../lib/api';
import { User } from '../types';

export const userService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    const { data } = await api.get(`/users?${queryParams.toString()}`);
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (userData: { name: string; email: string; password: string; roles: string[]; isActive: boolean }) => {
    const { data } = await api.post('/users', userData);
    return data;
  },

  update: async (id: string, userData: Partial<User>) => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },

  toggleStatus: async (id: string, isActive: boolean) => {
    const { data } = await api.put(`/users/${id}`, { isActive });
    return data;
  },

  getByRole: async (roleCode: string) => {
    const { data } = await api.get(`/users/role/${roleCode}`);
    return data;
  },

  export: async () => {
    const { data } = await api.get('/users/export', { responseType: 'blob' });
    return data;
  },

  downloadTemplate: async () => {
    const { data } = await api.get('/users/template', { responseType: 'blob' });
    return data;
  },

  uploadBulk: async (files: FormData) => {
    const { data } = await api.post('/users/upload', files, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
