import api from '../lib/api';

export const analyticsService = {
  getDashboard: async () => {
    const { data } = await api.get('/analytics/dashboard');
    return data;
  },
};
