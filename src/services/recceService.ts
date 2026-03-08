import api from '../lib/api';

export const recceService = {
  // Get recce assignments with proper filtering
  getAssignments: async (params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    status?: string; 
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'ALL') {
      queryParams.append('status', params.status);
    } else {
      // Default to recce-related statuses
      queryParams.append('status', 'RECCE_ASSIGNED,RECCE_SUBMITTED,RECCE_APPROVED,RECCE_REJECTED');
    }
    
    const { data } = await api.get(`/stores?${queryParams.toString()}`);
    return data;
  },

  // Get single recce assignment
  getById: async (id: string) => {
    const { data } = await api.get(`/stores/${id}`);
    return data;
  },

  // Submit recce data
  submit: async (id: string, formData: FormData) => {
    const { data } = await api.post(`/stores/${id}/recce`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Review recce (approve/reject)
  review: async (id: string, status: 'APPROVED' | 'REJECTED', remarks?: string) => {
    const { data } = await api.post(`/stores/${id}/recce/review`, { 
      status, 
      remarks 
    });
    return data;
  },

  // Export recce data
  export: async () => {
    const { data } = await api.get('/stores/export/recce', { 
      responseType: 'blob' 
    });
    return data;
  },

  // Bulk download PPT
  bulkPpt: async (storeIds: string[]) => {
    const { data } = await api.post('/stores/ppt/bulk', { 
      storeIds, 
      type: 'recce' 
    }, { 
      responseType: 'blob' 
    });
    return data;
  },

  // Bulk download PDF
  bulkPdf: async (storeIds: string[]) => {
    const { data } = await api.post('/stores/pdf/bulk', { 
      storeIds, 
      type: 'recce' 
    }, { 
      responseType: 'blob' 
    });
    return data;
  },
};