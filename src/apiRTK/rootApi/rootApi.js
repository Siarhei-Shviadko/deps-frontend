
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { authenticationProvider } from '@/authentication'
import { AuthType } from '@/enums/AuthType'
import { MimeType } from '@/enums/MimeType'
import { RequestHeader } from '@/enums/RequestHeader'
import { RequestMethod } from '@/enums/RequestMethod'
import { StatusCode } from '@/enums/StatusCode'
import { ENV } from '@/utils/env'
import { getCSRFToken } from '@/utils/getCSRFToken'

const RequestType = {
  QUERY: 'query',
  MUTATION: 'mutation',
}

const getAuthHeaders = async () => {
  const authHeaders = {}
  const token = await authenticationProvider.getAccessToken()
  if (token) {
    authHeaders[RequestHeader.AUTHORIZATION] = `Bearer ${token}`
  }

  return authHeaders
}

const getCSRFHeaders = async (api) => {
  const CSRFHeaders = {}
  if (api.type !== RequestType.QUERY && ENV.WTF_CSRF_ENABLED) {
    CSRFHeaders[RequestHeader.X_CSRF_TOKEN] = await getCSRFToken()
  }

  return CSRFHeaders
}

const baseQuery = fetchBaseQuery({
  baseUrl: '/',
  prepareHeaders: async (headers, api) => {
    const requestHeaders = {
      [RequestHeader.ACCEPT]: MimeType.APPLICATION_JSON,
      ...await getAuthHeaders(),
      ...await getCSRFHeaders(api),
    }
    Object.entries(requestHeaders).forEach((header) => {
      headers.set(...header)
    })

    return headers
  },
})

const apiGet = async (url, ...rest) => {
  const { data } = await baseQuery(
    {
      method: RequestMethod.GET,
      url,
    },
    ...rest,
  )

  return data
}

const query = async (args, api, extraOptions) => {
  if (api.type !== RequestType.QUERY && ENV.WTF_CSRF_ENABLED) {
    await getCSRFToken((url) => apiGet(url, api, extraOptions))
  }

  const result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === StatusCode.UNAUTHORIZED && ENV.AUTH_TYPE !== AuthType.NO_AUTH) {
    await authenticationProvider.signIn()
  }

  return result
}

export const rootApi = createApi({
  baseQuery: query,
  endpoints: () => ({}),
})
