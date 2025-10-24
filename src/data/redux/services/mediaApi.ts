import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery,
  tagTypes: ['Media', 'Dashboard', 'Trending', 'Featured'],
  endpoints: (builder) => ({
    // Dashboard
    getDashboard: builder.query<any, void>({
      query: () => '/mobile/dashboard',
      providesTags: ['Dashboard'],
    }),
    
    // Media by category
    getCategoryMedia: builder.query<any, { categoryId: string; type?: string; page?: number; limit?: number }>({
      query: ({ categoryId, type = 'audio', page = 1, limit = 10 }) => 
        `/mobile/categories/${categoryId}/media?type=${type}&page=${page}&limit=${limit}`,
      providesTags: ['Media'],
    }),
    
    // Media by subcategory
    getSubcategoryMedia: builder.query<any, { subcategoryId: string; type?: string }>({
      query: ({ subcategoryId, type = 'audio' }) => 
        `/mobile/subcategories/${subcategoryId}/media?type=${type}`,
      providesTags: ['Media'],
    }),
    
    // Trending content
    getTrending: builder.query<any, { type?: string; days?: number; limit?: number }>({
      query: ({ type, days = 7, limit = 20 }) => {
        const params = new URLSearchParams({ days: days.toString(), limit: limit.toString() });
        if (type) params.append('type', type);
        return `/mobile/trending?${params}`;
      },
      providesTags: ['Trending'],
    }),
    
    // Featured content
    getFeatured: builder.query<any, { type?: string; limit?: number }>({
      query: ({ type, limit = 20 }) => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (type) params.append('type', type);
        return `/mobile/featured?${params}`;
      },
      providesTags: ['Featured'],
    }),
    
    // Search
    searchContent: builder.query<any, { q: string; type?: string; page?: number; limit?: number }>({
      query: ({ q, type, page = 1, limit = 20 }) => {
        const params = new URLSearchParams({ q, page: page.toString(), limit: limit.toString() });
        if (type) params.append('type', type);
        return `/mobile/search?${params}`;
      },
    }),
    
    // Stream media
    streamMedia: builder.query<any, string>({
      query: (mediaId) => `/mobile/media/${mediaId}/stream`,
    }),
    
    // Azure blob file
    getAzureFile: builder.query<any, string>({
      query: (blobUrl) => `/azure-blob/file?blobUrl=${encodeURIComponent(blobUrl)}`,
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetCategoryMediaQuery,
  useGetSubcategoryMediaQuery,
  useGetTrendingQuery,
  useGetFeaturedQuery,
  useSearchContentQuery,
  useStreamMediaQuery,
  useGetAzureFileQuery,
} = mediaApi;