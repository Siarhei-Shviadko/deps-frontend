/* eslint-disable no-undef */

import { mockEnv } from '@/mocks/mockEnv'
import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { RequestMethod } from '@/enums/RequestMethod'
import { apiMap } from '@/utils/apiMap'
import {
  useFetchFilesQuery,
  useFetchFileQuery,
  useUploadRawFileMutation,
  useClassifyFileMutation,
  useDeleteFilesMutation,
  useCreateDocumentFromFileMutation,
  useFetchFileUnifiedDataQuery,
  useFetchFileUnifiedDataTableCellsQuery,
  useRestartFileMutation,
  useSplitFileMutation,
  useSplitExistingFileMutation,
} from './filesApi'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/apiRTK/rootApi', () => ({
  rootApi: {
    injectEndpoints: (args) => {
      const res = args.endpoints({
        query: (arg) => arg.query,
        mutation: (arg) => arg.query,
      })

      return {
        useFetchFilesQuery: jest.fn(() => (args) => res.fetchFiles(args)),
        useFetchFileQuery: jest.fn(() => (args) => res.fetchFile(args)),
        useUploadRawFileMutation: jest.fn(() => (args) => res.uploadRawFile(args)),
        useClassifyFileMutation: jest.fn(() => (args) => res.classifyFile(args)),
        useDeleteFilesMutation: jest.fn(() => (args) => res.deleteFiles(args)),
        useCreateDocumentFromFileMutation: jest.fn(() => (args) => res.createDocumentFromFile(args)),
        useFetchFileUnifiedDataQuery: jest.fn(() => (args) => res.fetchFileUnifiedData(args)),
        useFetchFileUnifiedDataTableCellsQuery: jest.fn(() => (args) => res.fetchFileUnifiedDataTableCells(args)),
        useRestartFileMutation: jest.fn(() => (args) => res.restartFile(args)),
        useSplitFileMutation: jest.fn(() => (args) => res.splitFile(args)),
        useSplitExistingFileMutation: jest.fn(() => (args) => res.splitExistingFile(args)),
      }
    },
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
})

test('useFetchFilesQuery calls correct endpoint with correct args', async () => {
  const id = 'mockId'

  const { result } = renderHook(() => useFetchFilesQuery())

  await waitFor(() => {
    expect(result.current(id)).toEqual(
      apiMap.apiGatewayV2.v5.files(id),
    )
  })
})

test('useFetchFileQuery calls correct endpoint with correct args', async () => {
  const fileId = 'mockFileId'

  const { result } = renderHook(() => useFetchFileQuery())

  await waitFor(() => {
    expect(result.current(fileId)).toEqual(
      apiMap.apiGatewayV2.v5.files.file(fileId),
    )
  })
})

test('useUploadRawFileMutation calls correct endpoint with correct args', async () => {
  const file = {}

  const mockData = {
    labels: [],
    engine: 'engine',
    parsingFeatures: 'parsingFeatures',
    file: file,
  }

  const mockFormData = {
    append: jest.fn((key, value) => {
      mockFormData[key] = value
    }),
  }

  global.FormData = jest.fn(() => mockFormData)

  const { result } = renderHook(() => useUploadRawFileMutation())

  await waitFor(() => {
    expect(result.current(mockData)).toEqual(
      {
        method: RequestMethod.POST,
        url: apiMap.apiGatewayV2.v5.files.process(),
        body: mockFormData,
      },
    )
  })
})

test('useClassifyFileMutation calls correct endpoint with correct args', async () => {
  const file = {}

  const mockData = {
    labels: [],
    engine: 'engine',
    parsingFeatures: 'parsingFeatures',
    file: file,
  }

  const mockFormData = {
    append: jest.fn((key, value) => {
      mockFormData[key] = value
    }),
  }

  global.FormData = jest.fn(() => mockFormData)

  const { result } = renderHook(() => useClassifyFileMutation())

  await waitFor(() => {
    expect(result.current(mockData)).toEqual(
      {
        method: 'post',
        url: apiMap.apiGatewayV2.v5.files.classify(),
        body: mockFormData,
      },
    )
  })
})

test('useDeleteFilesMutation returns correct config', async () => {
  const fileIds = ['mockFileId']

  const { result } = renderHook(() => useDeleteFilesMutation())

  await waitFor(() => {
    expect(result.current(fileIds)).toEqual(
      {
        method: RequestMethod.DELETE,
        url: apiMap.apiGatewayV2.v5.files({ ids: fileIds }),
      },
    )
  })
})

test('useCreateDocumentFromFileMutation returns correct config', async () => {
  const fileId = 'mockFileId'
  const documentTypeId = 'invoice'

  const mockData = {
    fileId,
    documentTypeId,
  }

  const { result } = renderHook(() => useCreateDocumentFromFileMutation())

  await waitFor(() => {
    expect(result.current(mockData)).toEqual(
      {
        method: RequestMethod.POST,
        url: apiMap.apiGatewayV2.v5.files.file.createDocument(fileId),
        body: {
          documentTypeId,
        },
      },
    )
  })
})

test('useFetchFileUnifiedDataQuery calls correct endpoint with correct args', async () => {
  const fileId = 'mockFileId'

  const { result } = renderHook(() => useFetchFileUnifiedDataQuery())

  await waitFor(() => {
    expect(result.current(fileId)).toEqual(
      apiMap.apiGatewayV2.v5.files.file.unifiedData(fileId),
    )
  })
})

test('useFetchFileUnifiedDataTableCellsQuery calls correct endpoint with correct args', async () => {
  const fileId = 'mockFileId'
  const tableId = 'mockTableId'
  const maxRow = 10
  const maxColumn = 5

  const mockParams = {
    fileId,
    tableId,
    maxRow,
    maxColumn,
  }

  const expectedConfig = {
    firstRow: 0,
    firstColumn: 0,
    lastRow: maxRow,
    lastColumn: maxColumn,
  }

  const { result } = renderHook(() => useFetchFileUnifiedDataTableCellsQuery())

  await waitFor(() => {
    expect(result.current(mockParams)).toEqual(
      apiMap.apiGatewayV2.v5.files.file.unifiedData.tables.table.cells(fileId, tableId, expectedConfig),
    )
  })
})

test('useRestartFileMutation calls correct endpoint with correct method and fileId', async () => {
  const fileId = 'mockFileId'

  const { result } = renderHook(() => useRestartFileMutation())

  await waitFor(() => {
    expect(result.current(fileId)).toEqual(
      {
        method: RequestMethod.POST,
        url: apiMap.apiGatewayV2.v5.files.file.restart(fileId),
      },
    )
  })
})

test('useSplitFileMutation calls correct endpoint with correct args', async () => {
  const mockData = {
    file: {},
    groupId: 'group-1',
    parsingFeatures: [],
  }

  const mockFormData = {
    append: jest.fn((key, value) => {
      mockFormData[key] = value
    }),
  }

  global.FormData = jest.fn(() => mockFormData)

  const { result } = renderHook(() => useSplitFileMutation())

  await waitFor(() => {
    expect(result.current(mockData)).toEqual(
      {
        method: RequestMethod.POST,
        url: apiMap.apiGatewayV2.v5.files.split(),
        body: mockFormData,
      },
    )
  })
})

test('useSplitExistingFileMutation calls correct endpoint with correct args', async () => {
  const fileId = 'mockFileId'
  const mockData = {
    fileId,
    groupId: 'group-1',
    parsingFeatures: [],
    needsSplittingProposalReview: true,
  }

  const { result } = renderHook(() => useSplitExistingFileMutation())

  await waitFor(() => {
    expect(result.current(mockData)).toEqual(
      {
        method: RequestMethod.PATCH,
        url: apiMap.apiGatewayV2.v5.files.file.split(fileId),
        body: {
          documentTypeId: null,
          classificationEnabled: true,
          engine: null,
          language: null,
          llmType: null,
          parsingFeatures: null,
          needsUnifier: true,
          needsExtraction: true,
          assignedToMe: true,
          labels: null,
          groupId: mockData.groupId,
          needsSplittingProposalReview: true,
        },
      },
    )
  })
})
