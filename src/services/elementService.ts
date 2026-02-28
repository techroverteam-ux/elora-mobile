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

  create: async (elementData: { name: string; standardRate: number }) => {
    const { data } = await api.post('/elements', elementData);
    return data;
  },

  update: async (id: string, elementData: { name: string; standardRate: number }) => {
    const { data } = await api.put(`/elements/${id}`, elementData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/elements/${id}`);
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/elements/${id}`);
    return data;
  },

  getAllElements: async () => {
    const { data } = await api.get('/elements/all');
    return data;
  },
};
