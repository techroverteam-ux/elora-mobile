import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const sectionsApi = createApi({
  reducerPath: 'sectionsApi',
  baseQuery,
  endpoints: (builder) => ({
    getSections: builder.mutation<any, any>({
      query: () => ({
        url: '/mobile/sections',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          // Sort sections by order field (ascending)
          const sortedData = [...response.data].sort((a, b) => (a.order || 0) - (b.order || 0));
          return { ...response, data: sortedData };
        }
        return response;
      },
    }),
    getCategories: builder.mutation<any, any>({
      query: (id) => ({
        url: `/mobile/sections/${id}/categories`,
        method: 'GET',
      }),
    }),
    getSubcategories: builder.mutation<any, any>({
      query: (id) => ({
        url: `/mobile/categories/${id}/subcategories`,
        method: 'GET',
      }),
    }),
    getSubcategoriesByActionButton: builder.mutation<any, any>({
      query: ({ sectionId, categoryId, buttonType }) => ({
        url: `/mobile/subcategories/by-action-button?sectionId=${sectionId}&categoryId=${categoryId}&buttonType=${buttonType}`,
        method: 'GET',
      }),
    }),
    getCategoryDetails: builder.mutation<any, any>({
      query: (categoryId) => ({
        url: `/mobile/categories/${categoryId}`,
        method: 'GET',
      }),
    }),
    getAzureBlob: builder.mutation<any, any>({
      query: (url) => ({
        url: `/mobile/azure-blob/file?blobUrl=${url}`,
        method: 'GET',
      }),
    }),
    getDashboard: builder.mutation<any, any>({
      query: () => ({
        url: '/mobile/dashboard',
        method: 'GET',
      }),
    })
  }),
});

export const {
  useGetSectionsMutation,
  useGetCategoriesMutation,
  useGetSubcategoriesMutation,
  useGetSubcategoriesByActionButtonMutation,
  useGetCategoryDetailsMutation,
  useGetAzureBlobMutation,
  useGetDashboardMutation
} = sectionsApi;
