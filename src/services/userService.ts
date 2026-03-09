import api from '../lib/api';

export const userService = {
  getAll: async (params?: any) => {
    const { data } = await api.get('/users', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (userData: any) => {
    const { data } = await api.post('/users', userData);
    return data;
  },

  update: async (id: string, userData: any) => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },

  toggleStatus: async (id: string, isActive: boolean) => {
    const { data } = await api.patch(`/users/${id}/status`, { isActive });
    return data;
  },

  bulkUpdate: async (userIds: string[], updateData: any) => {
    const { data } = await api.put('/users/bulk', { userIds, updateData });
    return data;
  },

  bulkDelete: async (userIds: string[]) => {
    const { data } = await api.delete('/users/bulk', { data: { userIds } });
    return data;
  },

  export: async (params?: any) => {
    const response = await api.get('/users/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  uploadBulk: async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await api.post('/users/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  getByRole: async (roleCode: string) => {
    const { data } = await api.get(`/users/role/${roleCode}`);
    return data;
  },
};