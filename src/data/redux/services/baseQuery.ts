import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseQuery = fetchBaseQuery({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  prepareHeaders: (headers) => {
    // Example if you want to add auth token later
    // headers.set('Authorization', `Bearer token`);
    return headers;
  },
});