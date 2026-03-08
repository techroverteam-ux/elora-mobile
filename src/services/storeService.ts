import api from '../lib/api';

export const storeService = {
  getAll: async (params?: any) => {
    const { data } = await api.get('/stores', { params });
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

  update: async (id: string, storeData: any) => {
    const { data } = await api.put(`/stores/${id}`, storeData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/stores/${id}`);
    return data;
  },

  bulkUpdate: async (storeIds: string[], updateData: any) => {
    const { data } = await api.put('/stores/bulk', { storeIds, updateData });
    return data;
  },

  bulkDelete: async (storeIds: string[]) => {
    const { data } = await api.delete('/stores/bulk', { data: { storeIds } });
    return data;
  },

  export: async (params?: any) => {
    const response = await api.get('/stores/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  uploadBulk: async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await api.post('/stores/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  assignRecce: async (storeId: string, userId: string) => {
    const { data } = await api.post(`/stores/${storeId}/assign-recce`, { userId });
    return data;
  },

  assignInstallation: async (storeId: string, userId: string) => {
    const { data } = await api.post(`/stores/${storeId}/assign-installation`, { userId });
    return data;
  },

  reviewReccePhoto: async (storeId: string, photoIndex: number, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    const { data } = await api.put(`/stores/${storeId}/recce-photos/${photoIndex}/review`, { status, reason });
    return data;
  },
};