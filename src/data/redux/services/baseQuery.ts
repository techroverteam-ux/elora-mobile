import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError
} from '@reduxjs/toolkit/query/react';
import { _log, colorLog } from '../../../utils/logger';

// const BASE_URL = 'https://jsonplaceholder.typicode.com';
const BASE_URL = 'https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth?.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const path = typeof args === 'string' ? args : args.url;
  const method = typeof args === 'string' ? 'GET' : args.method ?? 'GET';
  const body = typeof args === 'string' ? undefined : args.body;
  const fullUrl = `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  const result = await rawBaseQuery(args, api, extraOptions);

  // Response log
  if (process.env.NODE_ENV === 'development') {
    //! un-comment this if needed
    // colorLog("cyan", "[API CALL] --->", { url: fullUrl, method, body });
    // if (result.error) {
    //   colorLog("red", "[API ERROR] <---", result.error);
    // } else {
    //   colorLog("green", "[API RESPONSE] <---", result.data);
    // }

    // Extra detailed log block
    _log(result, body);
  }

  return result;
};
