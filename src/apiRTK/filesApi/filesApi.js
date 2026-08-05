
import { rootApi } from '@/apiRTK/rootApi'
import { RequestMethod } from '@/enums/RequestMethod'
import { apiMap } from '@/utils/apiMap'
import {
  mapFileDataToDto,
  mapSplitFileDataToDto,
  mapSplittedFileDataToDto,
} from './mappers'

export const FILES_TAG = 'Files'
const FILE_UNIFIED_DATA_TAG = 'FileUnifiedData'
const FILE_TABLE_CELLS_TAG = 'FileTableCells'

const defaultTags = [
  FILES_TAG,
  FILE_UNIFIED_DATA_TAG,
  FILE_TABLE_CELLS_TAG,
]

export const filesApi = rootApi.injectEndpoints({
  tagTypes: defaultTags,
  endpoints: (builder) => ({
    fetchFiles: builder.query({
      query: (filters) => apiMap.apiGatewayV2.v5.files(filters),
      providesTags: [FILES_TAG],
    }),
    fetchFile: builder.query({
      query: (fileId) => apiMap.apiGatewayV2.v5.files.file(fileId),
      providesTags: [FILES_TAG],
    }),
    uploadRawFile: builder.mutation({
      query: (fileData) => ({
        url: apiMap.apiGatewayV2.v5.files.process(),
        method: RequestMethod.POST,
        body: mapFileDataToDto(fileData),
      }),
      invalidatesTags: [FILES_TAG],
    }),
    classifyFile: builder.mutation({
      query: (fileData) => ({
        url: apiMap.apiGatewayV2.v5.files.classify(),
        method: RequestMethod.POST,
        body: mapFileDataToDto(fileData),
      }),
      invalidatesTags: [FILES_TAG],
    }),
    deleteFiles: builder.mutation({
      query: (filesIds) => ({
        url: apiMap.apiGatewayV2.v5.files({ ids: filesIds }),
        method: RequestMethod.DELETE,
      }),
      invalidatesTags: [FILES_TAG],
    }),
    createDocumentFromFile: builder.mutation({
      query: ({ fileId, documentTypeId }) => ({
        url: apiMap.apiGatewayV2.v5.files.file.createDocument(fileId),
        method: RequestMethod.POST,
        body: {
          documentTypeId,
        },
      }),
      invalidatesTags: [FILES_TAG],
    }),
    fetchFileUnifiedData: builder.query({
      query: (fileId) => apiMap.apiGatewayV2.v5.files.file.unifiedData(fileId),
      transformResponse: (response) => {
        const unifiedData = response.elements.reduce((acc, d) => {
          acc[d.page]
            ? acc[d.page] = [...acc[d.page], d]
            : acc[d.page] = [d]
          return acc
        }, {})
        return unifiedData
      },
      providesTags: (result, error, fileId) => [
        {
          type: FILE_UNIFIED_DATA_TAG,
          id: fileId,
        },
      ],
    }),
    fetchFileUnifiedDataTableCells: builder.query({
      query: ({ fileId, tableId, maxRow, maxColumn }) => {
        const config = {
          firstRow: 0,
          firstColumn: 0,
          lastRow: maxRow,
          lastColumn: maxColumn,
        }
        return apiMap.apiGatewayV2.v5.files.file.unifiedData.tables.table.cells(fileId, tableId, config)
      },
      providesTags: (result, error, { tableId }) => [
        {
          type: FILE_TABLE_CELLS_TAG,
          id: tableId,
        },
      ],
    }),
    createBatchFromFile: builder.mutation({
      query: ({ fileId, data }) => ({
        url: apiMap.apiGatewayV2.v5.files.file.createBatch(fileId),
        method: RequestMethod.POST,
        body: data,
      }),
      invalidatesTags: [FILES_TAG],
    }),
    restartFile: builder.mutation({
      query: (fileId) => ({
        url: apiMap.apiGatewayV2.v5.files.file.restart(fileId),
        method: RequestMethod.POST,
      }),
      invalidatesTags: [FILES_TAG],
    }),
    splitFile: builder.mutation({
      query: (fileData) => ({
        url: apiMap.apiGatewayV2.v5.files.split(),
        method: RequestMethod.POST,
        body: mapSplitFileDataToDto(fileData),
      }),
      invalidatesTags: [FILES_TAG],
    }),
    splitExistingFile: builder.mutation({
      query: ({ fileId, ...data }) => ({
        url: apiMap.apiGatewayV2.v5.files.file.split(fileId),
        method: RequestMethod.PATCH,
        body: mapSplittedFileDataToDto(data),
      }),
      invalidatesTags: [FILES_TAG],
    }),
  }),
})

export const {
  useFetchFilesQuery,
  useFetchFileQuery,
  useUploadRawFileMutation,
  useClassifyFileMutation,
  useDeleteFilesMutation,
  useCreateDocumentFromFileMutation,
  useFetchFileUnifiedDataQuery,
  useFetchFileUnifiedDataTableCellsQuery,
  useLazyFetchFileUnifiedDataTableCellsQuery,
  useCreateBatchFromFileMutation,
  useRestartFileMutation,
  useSplitFileMutation,
  useSplitExistingFileMutation,
} = filesApi
