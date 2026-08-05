
import { rootApi } from '@/apiRTK/rootApi'
import { RequestMethod } from '@/enums/RequestMethod'
import { apiMap } from '@/utils/apiMap'

const defaultTags = ['DocumentFieldAnalytics']

export const documentFieldAnalyticsApi = rootApi.injectEndpoints({
  tagTypes: defaultTags,
  endpoints: (builder) => ({
    getMostActiveFields: builder.query({
      query: (queryParams) => ({
        url: apiMap.apiGatewayV2.v5.documentFieldAnalytics.mostActiveFields(queryParams),
        method: RequestMethod.GET,
      }),
    }),
  }),
})

export const {
  useGetMostActiveFieldsQuery,
} = documentFieldAnalyticsApi
