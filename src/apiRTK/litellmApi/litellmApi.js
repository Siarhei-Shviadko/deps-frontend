
import { rootApi } from '@/apiRTK/rootApi'
import { apiMap } from '@/utils/apiMap'

export const litellmApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    fetchLiteLLMModels: builder.query({
      query: () => apiMap.apiGatewayV2.v5.litellm.models(),
      transformResponse: (response) => response.data,
    }),
  }),
})

export const {
  useFetchLiteLLMModelsQuery,
} = litellmApi
