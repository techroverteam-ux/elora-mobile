import api from '../lib/api';

export const dashboardService = {
  getStats: async () => {
    const { data } = await api.get('/dashboard/stats');
    return data;
  },
};
