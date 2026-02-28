import api from '../lib/api';

export const rfqService = {
  generate: async (storeIds: string[]) => {
    const { data } = await api.post('/rfq/generate', { storeIds }, { responseType: 'blob' });
    return data;
  },
};
