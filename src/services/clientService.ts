import api from '../lib/api';

export interface ClientLocationConfig {
  enableLocationOverlay: boolean;
  mapSize?: number;
  showAddress?: boolean;
  showCoordinates?: boolean;
  showTimestamp?: boolean;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

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

  exportClients: async (params?: { search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    const { data } = await api.get(`/clients/export?${queryParams.toString()}`, { responseType: 'blob' });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/clients/${id}`);
    return data;
  },

  getLocationConfig: async (id: string): Promise<ClientLocationConfig> => {
    try {
      const { data } = await api.get(`/clients/${id}`);
      const client = data.client || data;
      return {
        enableLocationOverlay: client.enableLocationMapping || false,
        mapSize: client.locationConfig?.mapSize,
        showAddress: client.locationConfig?.showAddress,
        showCoordinates: client.locationConfig?.showCoordinates,
        showTimestamp: client.locationConfig?.showTimestamp,
        position: client.locationConfig?.position,
      };
    } catch (error) {
      console.error('Error fetching client location config:', error);
      // Return safe default config instead of throwing
      return { 
        enableLocationOverlay: false,
        mapSize: 150,
        showAddress: false,
        showCoordinates: false,
        showTimestamp: true,
        position: 'bottom-right'
      };
    }
  },

  updateLocationConfig: async (id: string, config: ClientLocationConfig) => {
    const { data } = await api.put(`/clients/${id}`, { 
      enableLocationMapping: config.enableLocationOverlay,
      locationConfig: {
        mapSize: config.mapSize,
        showAddress: config.showAddress,
        showCoordinates: config.showCoordinates,
        showTimestamp: config.showTimestamp,
        position: config.position,
      }
    });
    return data;
  },
};
