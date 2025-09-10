import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { AuthResponse, LoginUserRequest } from './types/auth';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  endpoints: (builder) => ({
    getRegisterUser: builder.mutation<any, any>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    getLoginUser: builder.mutation<AuthResponse, LoginUserRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    getForgotPassword: builder.mutation<any, any>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    getResetPassword: builder.mutation<any, any>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    getAccess: builder.mutation<any, any>({
      query: () => ({
        url: '/auth/getAccess',
        method: 'GET',
      }),
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
