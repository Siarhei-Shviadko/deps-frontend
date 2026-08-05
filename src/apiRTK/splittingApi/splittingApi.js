
import { rootApi } from '@/apiRTK/rootApi'
import { RequestMethod } from '@/enums/RequestMethod'
import { apiMap } from '@/utils/apiMap'
import { GROUP_TAG, GROUPS_TAG } from '../documentTypesGroupsApi'
import { FILES_TAG } from '../filesApi'

const SPLITTING_PROPOSALS_TAG = 'SplittingProposals'

export const splittingApi = rootApi.injectEndpoints({
  tagTypes: [FILES_TAG, SPLITTING_PROPOSALS_TAG, GROUPS_TAG, GROUP_TAG],
  endpoints: (builder) => ({
    fetchSplittingProposals: builder.query({
      query: (fileId) => apiMap.apiGatewayV2.v5.splitting.proposals(fileId),
      providesTags: [SPLITTING_PROPOSALS_TAG],
    }),
    updateSplittingProposals: builder.mutation({
      query: ({ fileId, segments, batchName }) => ({
        url: apiMap.apiGatewayV2.v5.splitting.proposals(fileId),
        method: RequestMethod.PATCH,
        body: {
          segments,
          batchName,
        },
      }),
      invalidatesTags: [SPLITTING_PROPOSALS_TAG],
    }),
    confirmSplittingProposals: builder.mutation({
      query: (fileId) => ({
        url: apiMap.apiGatewayV2.v5.splitting.proposals.confirm(fileId),
        method: RequestMethod.POST,
      }),
      invalidatesTags: [FILES_TAG],
    }),
    createSplitter: builder.mutation({
      query: (splitterData) => ({
        url: apiMap.apiGatewayV2.v5.splitting.splitters(),
        method: RequestMethod.POST,
        body: splitterData,
      }),
      invalidatesTags: [GROUPS_TAG, GROUP_TAG],
    }),
    updateSplitter: builder.mutation({
      query: ({ id, ...body }) => ({
        url: apiMap.apiGatewayV2.v5.splitting.splitter(id),
        method: RequestMethod.PATCH,
        body,
      }),
      invalidatesTags: [GROUPS_TAG, GROUP_TAG],
    }),
    deleteSplitter: builder.mutation({
      query: (splitterId) => ({
        url: apiMap.apiGatewayV2.v5.splitting.splitter(splitterId),
        method: RequestMethod.DELETE,
      }),
      invalidatesTags: [GROUPS_TAG, GROUP_TAG],
    }),
  }),
})

export const {
  useLazyFetchSplittingProposalsQuery,
  useUpdateSplittingProposalsMutation,
  useConfirmSplittingProposalsMutation,
  useCreateSplitterMutation,
  useUpdateSplitterMutation,
  useDeleteSplitterMutation,
} = splittingApi
