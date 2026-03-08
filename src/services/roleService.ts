import api from '../lib/api';

export const roleService = {
  getAll: async (params?: any) => {
    const { data } = await api.get('/roles', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/roles/${id}`);
    return data;
  },

  create: async (roleData: any) => {
    const { data } = await api.post('/roles', roleData);
    return data;
  },

  update: async (id: string, roleData: any) => {
    const { data } = await api.put(`/roles/${id}`, roleData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/roles/${id}`);
    return data;
  },

  export: async (params?: any) => {
    const response = await api.get('/roles/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};