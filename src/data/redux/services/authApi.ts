import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  endpoints: builder => ({
    getRegisterUser: builder.mutation<any, any>({
      query: () => '/auth/register',
    }),
    getLoginUser: builder.mutation<any, { email: string; password: string }>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
    }),
    getForgotPassword: builder.mutation<any, any>({
      query: () => `/auth/forgot-password`,
    }),
    getResetPassword: builder.mutation<any, any>({
      query: () => `/auth/reset-password`,
    }),
    getAccess: builder.mutation<any, any>({
      query: () => `/auth/getAccess`,
    }),
  }),
});

export const {
  useGetRegisterUserMutation,
  useGetLoginUserMutation,
  useGetForgotPasswordMutation,
  useGetResetPasswordMutation,
  useGetAccessMutation
} = authApi;
