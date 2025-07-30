import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

// Define response types
export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export const dummyApi = createApi({
  reducerPath: 'dummyApi',
  baseQuery,
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
    }),
    getPostById: builder.query<Post, number>({
      query: (id) => `/posts/${id}`,
    }),
  }),
});

export const { useGetPostsQuery, useGetPostByIdQuery } = dummyApi;