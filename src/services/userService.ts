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
    const { data } = await api.put(`/users/${id}`, { isActive });
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

  // Bulk-upload users from one or more Excel files. Matches elora-web's
  // POST /users/upload with a `files` (plural) field — mobile previously posted a
  // single `file` to a different endpoint (/users/bulk-upload), which doesn't match
  // what the deployed backend actually serves.
  uploadBulk: async (files: Array<{ uri: string; name: string; type: string }>) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file as any);
    });

    const { data } = await api.post('/users/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Download the bulk-upload Excel template (same endpoint web's Users page uses).
  getTemplate: async () => {
    const response = await api.get('/users/template', { responseType: 'blob' });
    return response.data;
  },

  // Bulk-assign stores to a user from one or more Excel files (matches web's
  // POST /users/:id/bulk-assign-stores).
  bulkAssignStores: async (userId: string, files: Array<{ uri: string; name: string; type: string }>) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file as any);
    });

    const { data } = await api.post(`/users/${userId}/bulk-assign-stores`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // User detail/stats page data (matches web's GET /users/:id/stats).
  getStats: async (userId: string) => {
    const { data } = await api.get(`/users/${userId}/stats`);
    return data;
  },

  getByRole: async (roleCode: string) => {
    const { data } = await api.get(`/users/role/${roleCode}`);
    return data;
  },
};