import api from '../lib/api';

export const notificationService = {
  getAll: async () => {
    const { data } = await api.get('/notifications');
    return data;
  },
};
