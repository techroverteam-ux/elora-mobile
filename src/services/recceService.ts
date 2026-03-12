import api from '../lib/api';

export const recceService = {
  // Get recce assignments
  getAssignments: async (params?: any) => {
    const { data } = await api.get('/stores', { params });
    return data;
  },

  // Submit recce
  submitRecce: async (storeId: string, formData: FormData) => {
    const { data } = await api.post(`/stores/${storeId}/recce`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Update photo status
  updatePhotoStatus: async (storeId: string, photoIndex: number, statusData: any) => {
    const { data } = await api.post(`/stores/${storeId}/recce/photos/${photoIndex}/review`, statusData);
    return data;
  },

  // Bulk PPT download
  bulkPpt: async (storeIds: string[]) => {
    const response = await api.post('/stores/ppt/bulk', {
      storeIds,
      type: 'recce'
    }, { responseType: 'blob' });
    return response.data;
  },

  // Bulk PDF download
  bulkPdf: async (storeIds: string[]) => {
    const response = await api.post('/stores/pdf/bulk', {
      storeIds,
      type: 'recce'
    }, { responseType: 'blob' });
    return response.data;
  },

  // Individual PPT download (using bulk endpoint with single store)
  downloadPpt: async (storeId: string, type: 'recce' | 'installation' = 'recce') => {
    const response = await api.post('/stores/ppt/bulk', {
      storeIds: [storeId],
      type
    }, { responseType: 'blob' });
    return response.data;
  },

  // Individual PDF download (using bulk endpoint with single store)
  downloadPdf: async (storeId: string, type: 'recce' | 'installation' = 'recce') => {
    const response = await api.post('/stores/pdf/bulk', {
      storeIds: [storeId],
      type
    }, { responseType: 'blob' });
    return response.data;
  },

  // Export recce data
  exportRecce: async () => {
    const response = await api.get('/stores/export/recce', { responseType: 'blob' });
    return response.data;
  },

  // Get store details
  getStoreDetails: async (storeId: string) => {
    const { data } = await api.get(`/stores/${storeId}`);
    return data;
  },

  // Get client elements
  getClientElements: async (clientId: string) => {
    const { data } = await api.get(`/clients/${clientId}`);
    return data;
  },
};