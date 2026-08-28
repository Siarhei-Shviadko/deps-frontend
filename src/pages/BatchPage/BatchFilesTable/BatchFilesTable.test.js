import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import { BatchFileStatus } from '@/enums/BatchFileStatus'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { KnownBusinessEvent } from '@/hooks/useEventSource'
import {
  Batch as MockBatchModel,
  BatchFile as MockBatchFileModel,
} from '@/models/Batch'
import { ENV } from '@/utils/env'
import { navigationMap } from '@/utils/navigationMap'
import { render } from '@/utils/rendererRTL'
import { openInNewTarget } from '@/utils/window'
import { BatchFilesFilterConfig } from './BatchFilesFilterConfig'
import { BatchFilesTable } from './BatchFilesTable'

var MockTable

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/selectors/documentTypesListPage')

jest.mock('@/utils/window', () => ({
  openInNewTarget: jest.fn(),
}))

const mockAddEvent = jest.fn()
jest.mock('@/hooks/useEventSource', () => ({
  useEventSource: () => mockAddEvent,
  KnownBusinessEvent: {
    BATCH_FILE_STATUS_UPDATED: 'BATCH_FILE_STATUS_UPDATED',
  },
}))

jest.mock('@/apiRTK/batchesApi', () => ({
  useFetchBatchQuery: jest.fn(() => ({
    data: new MockBatchModel({
      id: 'mockBatchId',
      name: 'mockBatchName',
      status: 'new',
      groupId: 'mockGroupId',
      createdAt: '2023-10-01T00:00:00Z',
      files: [
        new MockBatchFileModel({
          id: 'mockFileId',
          documentId: '123',
          name: 'File Name',
          documentTypeId: 'mockDocumentId',
          status: 'new',
          engine: 'TESSERACT',
          llmType: 'gpt-4',
          parsingFeatures: null,
        }),
      ],
      isFetching: false,
    }),
    isFetching: false,
  })),
}))

jest.mock('@/components/Table', () => {
  const mock = mockShallowComponent('Table')
  MockTable = mock.Table
  return mock
})

jest.mock('@/hocs/withParentSize', () => ({
  withParentSize: () => () => MockTable,
}))

jest.mock('react-router', () => ({
  useParams: jest.fn(() => ({
    id: 'mockBatchId',
  })),
}))

const mockSetQueryParams = jest.fn()

const mockFilterConfig = new BatchFilesFilterConfig({
  name: 'hola',
  documentType: 'man',
  status: [BatchFileStatus.NEW],
  engine: KnownProcessingEngines.AWS_TEXTRACT,
  llmModel: 'gpt-4',
  parsingFeatures: [KnownParsingFeature.KEY_VALUE_PAIRS, KnownParsingFeature.TABLES],
  sortField: 'name',
  sortDirect: 'ascend',
})

jest.mock('@/hooks/useQueryParams', () => ({
  useQueryParams: jest.fn(() => ({
    queryParams: mockFilterConfig,
    setQueryParams: mockSetQueryParams,
  })),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders table with correct props', () => {
  render(<BatchFilesTable />)

  expect(screen.getByTestId('Table')).toBeInTheDocument()

  expect(MockTable.getProps()).toEqual({
    columns: expect.any(Array),
    data: [],
    fetching: false,
    onFilter: expect.any(Function),
    pagination: false,
    onRow: expect.any(Function),
    rowKey: expect.any(Function),
    rowSelection: {
      selectedRowKeys: [],
      onChange: expect.any(Function),
    },
  })
})

test('calls setQueryParams when Table props.onFilter is triggered', () => {
  render(<BatchFilesTable />)

  MockTable.getProps().onFilter(
    null,
    { name: 'new Name' },
    {
      column: { key: 'documentType' },
      order: 'descend',
    })

  expect(mockSetQueryParams).nthCalledWith(
    1,
    new BatchFilesFilterConfig({
      name: 'new Name',
      sortField: 'documentType',
      sortDirect: 'descend',
    }),
  )
})

test('calls openInNewTarget when Table props.onRow.onClick is triggered', () => {
  render(<BatchFilesTable />)

  const mockEvent = {
    target: {
      classList: {
        contains: jest.fn(() => false),
      },
    },
  }

  const mockDocumentId = 'mockDocumentId'

  MockTable.getProps().onRow({
    documentId: mockDocumentId,
  }).onClick(mockEvent)

  expect(openInNewTarget).nthCalledWith(
    1,
    mockEvent,
    navigationMap.documents.document(mockDocumentId),
    expect.any(Function),
  )
})

test('not calls openInNewTarget when Table props.onRow.onClick is triggered in case there is no documentId', () => {
  render(<BatchFilesTable />)

  const mockEvent = {
    target: {
      classList: {
        contains: jest.fn(() => false),
      },
    },
  }

  MockTable.getProps().onRow({
    documentId: null,
  }).onClick(mockEvent)

  expect(openInNewTarget).not.toHaveBeenCalled()
})

test('not call openInNewTarget when Table props.onRow.onClick is triggered and it contains checkbox class name', () => {
  render(<BatchFilesTable />)

  const mockEvent = {
    target: {
      classList: {
        contains: jest.fn(() => true),
      },
    },
  }

  const mockDocumentId = 'mockDocumentId'

  MockTable.getProps().onRow({
    documentId: mockDocumentId,
  }).onClick(mockEvent)

  expect(openInNewTarget).not.toHaveBeenCalled()
})

test('should call addEvent from useEventSource with correct arguments when container is mounted', async () => {
  render(<BatchFilesTable />)

  expect(mockAddEvent).toHaveBeenCalledWith(
    KnownBusinessEvent.BATCH_FILE_STATUS_UPDATED,
    expect.any(Function),
  )
})

test('should not call addEvent from useEventSource when feature SSE is false', () => {
  ENV.FEATURE_SERVER_SENT_EVENTS = false
  render(<BatchFilesTable />)

  expect(mockAddEvent).not.toHaveBeenCalled()

  ENV.FEATURE_SERVER_SENT_EVENTS = true
})
