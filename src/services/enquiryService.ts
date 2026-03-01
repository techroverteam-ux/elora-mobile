import api from '../lib/api';

export const enquiryService = {
  getAll: async () => {
    const { data } = await api.get('/enquiries');
    return data;
  },

  updateRemark: async (id: string, remark: string, status: string) => {
    const { data } = await api.put(`/enquiries/${id}`, { remark, status });
    return data;
  },

  create: async (enquiryData: any) => {
    const { data } = await api.post('/enquiries', enquiryData);
    return data;
  },
};
