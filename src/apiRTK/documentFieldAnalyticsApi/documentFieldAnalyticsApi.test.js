import { mockEnv } from '@/mocks/mockEnv'
import { waitFor } from '@testing-library/dom'
import { renderHook } from '@testing-library/react-hooks'
import { RequestMethod } from '@/enums/RequestMethod'
import { apiMap } from '@/utils/apiMap'
import { useGetMostActiveFieldsQuery } from './documentFieldAnalyticsApi'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/apiRTK/rootApi', () => ({
  rootApi: {
    injectEndpoints: (args) => {
      const res = args.endpoints({
        query: (arg) => arg.query,
      })

      return {
        useGetMostActiveFieldsQuery: jest.fn(() => (args) => res.getMostActiveFields(args)),
      }
    },
  },
}))

test('useGetMostActiveFieldsQuery calls correct endpoint with limit param', async () => {
  const queryParams = { limit: 10 }

  const { result } = renderHook(() => useGetMostActiveFieldsQuery())

  await waitFor(() => {
    expect(result.current(queryParams)).toEqual({
      url: apiMap.apiGatewayV2.v5.documentFieldAnalytics.mostActiveFields(queryParams),
      method: RequestMethod.GET,
    })
  })
})
