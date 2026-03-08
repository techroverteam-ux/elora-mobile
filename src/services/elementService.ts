// src/services/elementService.ts
import api from '../lib/api';

export const elementService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    const { data } = await api.get(`/elements?${queryParams.toString()}`);
    return data;
  },

  create: async (elementData: any) => {
    const { data } = await api.post('/elements', elementData);
    return data;
  },

  update: async (id: string, elementData: any) => {
    const { data } = await api.put(`/elements/${id}`, elementData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/elements/${id}`);
    return data;
  },

  getByClient: async (clientId: string) => {
    const { data } = await api.get(`/clients/${clientId}/elements`);
    return data;
  },

  assignToClient: async (clientId: string, elementIds: string[]) => {
    const { data } = await api.post(`/clients/${clientId}/elements`, { elementIds });
    return data;
  },

  updateClientElement: async (clientId: string, elementId: string, customRate: number) => {
    const { data } = await api.put(`/clients/${clientId}/elements/${elementId}`, { customRate });
    return data;
  },
};