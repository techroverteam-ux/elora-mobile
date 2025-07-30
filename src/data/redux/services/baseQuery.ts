import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError
} from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    // headers.set('Authorization', `Bearer token`);
    return headers;
  },
});

export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const path = typeof args === 'string' ? args : args.url;
  const method = typeof args === 'string' ? 'GET' : args.method ?? 'GET';
  const body = typeof args === 'string' ? undefined : args.body;

  const fullUrl = `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  if (process.env.NODE_ENV === 'development') {
    const logLines = [
      '%c[API CALL] --->',
      'color: green; font-weight: bold;',
      `  Full URL: ${fullUrl}`,
      `  Method: ${method}`,
    ];

    if (body) {
      logLines.push(`  Payload:\n${JSON.stringify(body, null, 2)}`);
    }

    // First argument: styled line, second: style, rest: normal
    console.log(
      [logLines[0], ...logLines.slice(2)].join('\n'),
      logLines[1]
    );
  }

  const result = await rawBaseQuery(args, api, extraOptions);

  if (process.env.NODE_ENV === 'development') {
    if (result.error) {
      console.error('%c[API ERROR] <---', 'color: red; font-weight: bold;');
      console.error('  Status:', result.error.status);
      console.error('  Message:');
      console.dir(result.error.data, { depth: null });
    } else {
      console.log('%c[API RESPONSE] <---', 'color: green; font-weight: bold;');
      console.dir(result.data, { depth: null });
    }
  }


  return result;
};
