import api from '../lib/api';

export const rfqService = {
  generate: async (storeIds: string[]) => {
    const response = await api.post('/rfq/generate', { storeIds }, {
      responseType: 'blob'
    });
    return response.data;
  },

  getAll: async (params?: any) => {
    const { data } = await api.get('/rfq', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/rfq/${id}`);
    return data;
  },

  update: async (id: string, updateData: any) => {
    const { data } = await api.put(`/rfq/${id}`, updateData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/rfq/${id}`);
    return data;
  },

  export: async (params?: any) => {
    const response = await api.get('/rfq/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};