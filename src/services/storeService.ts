import api from '../lib/api';

export const storeService = {
  getAll: async (params?: any) => {
    const { data } = await api.get('/stores', { params });
    return data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/stores/${id}`);
    return response.data;
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

  // Recce Operations
  submitRecce: async (storeId: string, formData: FormData) => {
    const { data } = await api.post(`/stores/${storeId}/recce`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  updateReccePhotoStatus: async (storeId: string, photoIndex: number, statusData: any) => {
    const { data } = await api.post(`/stores/${storeId}/recce/photos/${photoIndex}/review`, statusData);
    return data;
  },

  getElements: async () => {
    const { data } = await api.get('/elements');
    return data;
  },

  // Installation Operations
  submitInstallation: async (storeId: string, formData: FormData) => {
    const { data } = await api.post(`/stores/${storeId}/installation`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Bulk Operations
  bulkPpt: async (storeIds: string[], type: string = 'recce') => {
    const response = await api.post('/stores/ppt/bulk', {
      storeIds,
      type
    }, { responseType: 'blob' });
    return response.data;
  },

  bulkPdf: async (storeIds: string[], type: string = 'recce') => {
    const response = await api.post('/stores/pdf/bulk', {
      storeIds,
      type
    }, { responseType: 'blob' });
    return response.data;
  },

  exportRecce: async () => {
    const response = await api.get('/stores/export/recce', { responseType: 'blob' });
    return response.data;
  },

  exportInstallation: async () => {
    const response = await api.get('/stores/export/installation', { responseType: 'blob' });
    return response.data;
  },

  // Client Operations
  getClients: async (params?: any) => {
    const { data } = await api.get('/clients', { params });
    return data;
  },

  // Assignment Operations
  assign: async (storeIds: string[], userId: string, stage: 'RECCE' | 'INSTALLATION') => {
    const { data } = await api.post('/stores/assign', {
      storeIds,
      userId,
      stage
    });
    return data;
  },

  // Approval Operations
  approveRecce: async (storeId: string) => {
    const { data } = await api.post(`/stores/${storeId}/recce/review`, { status: 'APPROVED' });
    return data;
  },

  rejectRecce: async (storeId: string) => {
    const { data } = await api.post(`/stores/${storeId}/recce/review`, { status: 'REJECTED' });
    return data;
  },

  // Template and Upload
  getTemplate: async () => {
    const response = await api.get('/stores/template', { responseType: 'blob' });
    return response.data;
  },

  upload: async (formData: FormData) => {
    const { data } = await api.post('/stores/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Download Operations
  getPdf: async (storeId: string, type: 'recce' | 'installation') => {
    const response = await api.get(`/stores/${storeId}/pdf/${type}`, { responseType: 'blob' });
    return response.data;
  },

  getPpt: async (storeId: string, type: 'recce' | 'installation') => {
    const response = await api.get(`/stores/${storeId}/ppt/${type}`, { responseType: 'blob' });
    return response.data;
  },

  getExcel: async (storeId: string, type: 'recce' | 'installation') => {
    const response = await api.get(`/stores/${storeId}/excel/${type}`, { responseType: 'blob' });
    return response.data;
  },

  // Unassign Operations
  unassign: async (storeIds: string[], stage: 'RECCE' | 'INSTALLATION') => {
    const { data } = await api.post('/stores/unassign', {
      storeIds,
      stage
    });
    return data;
  },

  // Store Details
  getStoreDetails: async (storeId: string) => {
    const { data } = await api.get(`/stores/${storeId}`);
    return data;
  },

  // Client Elements
  getClientElements: async (clientId: string) => {
    const { data } = await api.get(`/clients/${clientId}`);
    return data;
  },

  // File Download Helper
  downloadFile: async (url: string, filename: string) => {
    const response = await api.get(url, { responseType: 'blob' });
    return { blob: response.data, filename };
  },

  // Bulk Export Operations
  exportStores: async (params?: any) => {
    const response = await api.get('/stores/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Store Statistics
  getStats: async () => {
    const { data } = await api.get('/stores/stats');
    return data;
  },
};