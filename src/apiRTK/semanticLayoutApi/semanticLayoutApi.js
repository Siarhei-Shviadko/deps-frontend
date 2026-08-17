import { rootApi } from '@/apiRTK/rootApi'
import { apiMap } from '@/utils/apiMap'

const semanticLayoutApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    fetchSemanticLayout: builder.query({
      query: ({ layoutId }) => apiMap.apiGatewayV2.v5.semanticLayout(layoutId),
    }),
  }),
})

export const {
  useFetchSemanticLayoutQuery,
} = semanticLayoutApi
