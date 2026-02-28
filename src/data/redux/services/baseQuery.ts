import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { _log, colorLog } from '../../../utils/logger'
import { USER_KEY } from '../../../constants/storageKeys'

const BASE_URL = __DEV__ 
  ? 'https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api'
  : 'https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  timeout: 120000, // 2 minute timeout
  prepareHeaders: async (headers) => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_KEY)
      if (storedUser) {
        const user = JSON.parse(storedUser)
        if (user.token) {
          headers.set('Authorization', `Bearer ${user.token}`)
        }
      }
    } catch (error) {
      console.error('Error getting token from storage:', error)
    }
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    return headers
  },
})

// ✅ Helper: extract readable error messages from API/RTK errors
const getErrorMessage = (error: unknown): string => {
  if (!error) return 'Unknown error occurred.'

  // RTK FetchBaseQueryError shape
  if (typeof error === 'object' && error && 'data' in error) {
    const err = error as FetchBaseQueryError
    if (typeof err.data === 'string') return err.data
    if (err.data && typeof err.data === 'object' && 'message' in err.data) {
      return String((err.data as any).message)
    }
  }

  // SerializedError or plain Error
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message)
  }

  return 'Something went wrong. Please try again.'
}

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const path = typeof args === 'string' ? args : args.url
  const method = typeof args === 'string' ? 'GET' : args.method ?? 'GET'
  const body = typeof args === 'string' ? undefined : args.body
  const fullUrl = `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`

  const result = await rawBaseQuery(args, api, extraOptions)

  // ✅ Log requests/responses in development
  if (__DEV__) {
    colorLog('cyan', '[API CALL] --->', { url: fullUrl, method, body })

    if (result.error) {
      const message = getErrorMessage(result.error)
      colorLog('red', '[API ERROR] <---', { status: result.error.status, message, fullError: result.error })
    } else {
      colorLog('green', '[API RESPONSE] <---', result.data)
    }

    _log(result, body)
  }

  // ✅ Optional: global error handling (e.g. logout on 401)
  if (result.error?.status === 401) {
    // api.dispatch(logoutUser())
  }

  // Optionally attach readable message to the result for easier use
  if (result.error) {
    ; (result.error as any).readableMessage = getErrorMessage(result.error)
  }

  return result
}

export { getErrorMessage } // ✅ export for reuse in UI too
