// src/services/elementService.ts
import api from '../lib/api';

export const elementService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.search) queryParams.append('search', params.search);
      
      console.log('Fetching elements from API with params:', params);
      const response = await api.get(`/elements?${queryParams.toString()}`);
      console.log('Elements API raw response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Element service getAll error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  create: async (elementData: any) => {
    try {
      console.log('Creating element with data:', elementData);
      const response = await api.post('/elements', elementData);
      console.log('Create element response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Element service create error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  update: async (id: string, elementData: any) => {
    try {
      console.log('Updating element', id, 'with data:', elementData);
      const response = await api.put(`/elements/${id}`, elementData);
      console.log('Update element response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Element service update error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      console.log('Deleting element:', id);
      const response = await api.delete(`/elements/${id}`);
      console.log('Delete element response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Element service delete error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  getByClient: async (clientId: string) => {
    try {
      console.log('Fetching elements for client:', clientId);
      const response = await api.get(`/clients/${clientId}/elements`);
      console.log('Client elements response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Element service getByClient error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  assignToClient: async (clientId: string, elementIds: string[]) => {
    try {
      console.log('Assigning elements to client:', { clientId, elementIds });
      const response = await api.post(`/clients/${clientId}/elements`, { elementIds });
      console.log('Assign elements response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Element service assignToClient error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  updateClientElement: async (clientId: string, elementId: string, customRate: number) => {
    try {
      console.log('Updating client element:', { clientId, elementId, customRate });
      const response = await api.put(`/clients/${clientId}/elements/${elementId}`, { customRate });
      console.log('Update client element response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Element service updateClientElement error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },
};