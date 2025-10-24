import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export interface Category {
  _id: string;
  title: string;
  subtitle?: string;
  description1?: string;
  description2?: string;
  headerImage?: string;
  mainImage?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  video?: string;
  sectionId?: {
    _id: string;
    title: string;
  };
  order?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  azureFolder?: {
    id: string;
    name: string;
    webViewLink: string;
  };
  driveFolder?: {
    id: string;
    name: string;
    webViewLink: string;
  };
  collegeFrame?: {
    type: number;
    files: string[];
  };
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  message: string;
}

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: baseQuery,
  tagTypes: ['Categories'],
  endpoints: (builder) => ({
    // Get all categories
    getAllCategories: builder.query<CategoriesResponse, void>({
      query: () => ({
        url: '/categories/list/all',
        method: 'GET',
      }),
      providesTags: ['Categories'],
    }),
    
    // Get recent categories (top 6 for carousel)
    getRecentCategories: builder.query<Category[], { limit?: number }>({
      query: ({ limit = 6 } = {}) => ({
        url: '/categories/list/all',
        method: 'GET',
      }),
      transformResponse: (response: CategoriesResponse) => {
        if (response.success && response.data) {
          // Sort by createdAt descending and take the limit
          return response.data
            .filter(category => category.title && category._id) // Filter out invalid categories
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 6);
        }
        return [];
      },
      providesTags: ['Categories'],
    }),
    
    // Get category by ID
    getCategoryById: builder.query<Category, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Categories', id }],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useGetRecentCategoriesQuery,
  useGetCategoryByIdQuery,
} = categoriesApi;