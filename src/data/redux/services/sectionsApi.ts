import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const sectionsApi = createApi({
  reducerPath: 'sectionsApi',
  baseQuery,
  endpoints: (builder) => ({
    getSections: builder.mutation<any, any>({
      query: () => ({
        url: '/sections',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetSectionsMutation,
} = sectionsApi;
