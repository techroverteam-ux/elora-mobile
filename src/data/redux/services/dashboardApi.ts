import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery,
  endpoints: (builder) => ({
    getDashboard: builder.mutation<any, any>({
      query: () => ({
        url: '/mobile/dashboard',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetDashboardMutation
} = dashboardApi;