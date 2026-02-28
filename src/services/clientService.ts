import api from '../lib/api';

export const clientService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    const { data } = await api.get(`/clients?${queryParams.toString()}`);
    return data;
  },

  create: async (clientData: any) => {
    const { data } = await api.post('/clients', clientData);
    return data;
  },

  update: async (id: string, clientData: any) => {
    const { data } = await api.put(`/clients/${id}`, clientData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/clients/${id}`);
    return data;
  },

  export: async () => {
    const { data } = await api.get('/clients/export', { responseType: 'blob' });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/clients/${id}`);
    return data;
  },
};
