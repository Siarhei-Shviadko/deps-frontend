
import { rootApi } from '@/apiRTK/rootApi'
import { RequestMethod } from '@/enums/RequestMethod'
import { apiMap } from '@/utils/apiMap'
import { GROUP_TAG, GROUPS_TAG } from './sharedTags'

const defaultTags = [GROUPS_TAG, GROUP_TAG]

export const documentTypesGroupsApi = rootApi.injectEndpoints({
  tagTypes: defaultTags,
  endpoints: (builder) => ({
    fetchDocumentTypesGroups: builder.query({
      query: (filters) => apiMap.apiGatewayV2.v5.documentTypesGroups(filters),
      providesTags: [GROUPS_TAG],
    }),
    fetchDocumentTypesGroup: builder.query({
      query: ({ groupId, extras }) => (
        apiMap.apiGatewayV2.v5.documentTypesGroups.documentTypesGroup.extras(groupId, extras)
      ),
      providesTags: [GROUP_TAG],
    }),
    createDocumentTypesGroup: builder.mutation({
      query: (group) => ({
        url: apiMap.apiGatewayV2.v5.documentTypesGroups(),
        method: RequestMethod.POST,
        body: group,
      }),
      invalidatesTags: defaultTags,
    }),
    deleteDocumentTypesGroup: builder.mutation({
      query: (groupIds) => ({
        url: apiMap.apiGatewayV2.v5.documentTypesGroups(groupIds),
        method: RequestMethod.DELETE,
      }),
      invalidatesTags: defaultTags,
    }),
    addDocumentTypesToGroup: builder.mutation({
      query: ({ groupId, documentTypeIds }) => ({
        url: apiMap.apiGatewayV2.v5.documentTypesGroups.documentTypesGroup.documentTypes(groupId),
        method: RequestMethod.PATCH,
        body: { documentTypeIds },
      }),
      invalidatesTags: defaultTags,
    }),
    updateDocumentTypesGroup: builder.mutation({
      query: ({ groupId, groupInfo }) => ({
        url: apiMap.apiGatewayV2.v5.documentTypesGroups.documentTypesGroup(groupId),
        method: RequestMethod.PATCH,
        body: groupInfo,
      }),
      invalidatesTags: defaultTags,
    }),
    deleteDocumentTypesFromGroup: builder.mutation({
      query: ({ groupId, id }) => ({
        url: apiMap.apiGatewayV2.v5.documentTypesGroups.documentTypesGroup.documentTypes(groupId, { id }),
        method: RequestMethod.DELETE,
      }),
      invalidatesTags: defaultTags,
    }),
  }),
})

export const useFetchDocumentTypesGroupState = documentTypesGroupsApi.endpoints.fetchDocumentTypesGroup.useQueryState

export const {
  useFetchDocumentTypesGroupsQuery,
  useFetchDocumentTypesGroupQuery,
  useLazyFetchDocumentTypesGroupQuery,
  useCreateDocumentTypesGroupMutation,
  useDeleteDocumentTypesGroupMutation,
  useAddDocumentTypesToGroupMutation,
  useUpdateDocumentTypesGroupMutation,
  useDeleteDocumentTypesFromGroupMutation,
} = documentTypesGroupsApi
