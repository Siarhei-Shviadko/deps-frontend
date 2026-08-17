import { mockEnv } from '@/mocks/mockEnv'
import { waitFor } from '@testing-library/dom'
import { renderHook } from '@testing-library/react-hooks'
import { apiMap } from '@/utils/apiMap'
import { useFetchSemanticLayoutQuery } from './semanticLayoutApi'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/apiRTK/rootApi', () => ({
  rootApi: {
    injectEndpoints: (args) => {
      const res = args.endpoints({
        query: (arg) => arg.query,
      })

      return {
        useFetchSemanticLayoutQuery: jest.fn((args) => res.fetchSemanticLayout(args)),
      }
    },
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
})

test('useFetchSemanticLayoutQuery calls correct endpoint with layoutId', async () => {
  const layoutId = 'mockLayoutId'

  const { result } = renderHook(() => useFetchSemanticLayoutQuery({ layoutId }))

  await waitFor(() => {
    expect(result.current).toEqual(
      apiMap.apiGatewayV2.v5.semanticLayout(layoutId),
    )
  })
})
