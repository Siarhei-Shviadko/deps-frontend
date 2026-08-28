
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { render, screen } from '@testing-library/react'
import { useParams } from 'react-router'
import { clearFileStore } from '@/actions/fileReviewPage'
import { useFetchFileQuery } from '@/apiRTK/filesApi'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { KnownBusinessEvent } from '@/hooks/useEventSource'
import { ENV } from '@/utils/env'
import { goBack } from '@/utils/routerActions'
import { FileReviewPage } from './FileReviewPage'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('react-redux', () => mockReactRedux)

jest.mock('react-router', () => ({
  useParams: jest.fn(),
}))

const mockRefetchFile = jest.fn()

jest.mock('@/apiRTK/filesApi', () => ({
  useFetchFileQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    refetch: mockRefetchFile,
  })),
}))

const mockAddEvent = jest.fn()
jest.mock('@/hooks/useEventSource', () => ({
  useEventSource: jest.fn(() => mockAddEvent),
  KnownBusinessEvent: {
    FILE_STATE_UPDATED: 'FileStateUpdated',
  },
}))

jest.mock('@/utils/routerActions', () => ({
  goBack: jest.fn(),
}))

jest.mock('@/actions/fileReviewPage', () => ({
  clearFileStore: jest.fn(() => ({ type: 'mockType' })),
}))

jest.mock('@/containers/FileReview', () => ({
  FileReview: () => (
    <div data-testid="file-review">
      FileReview Component
    </div>
  ),
}))

const mockFile = {
  id: 'test-file-id',
  tenantId: 'test-tenant',
  name: 'test-file.pdf',
  path: 'test-path.pdf',
  state: {
    status: 'completed',
    errorMessage: null,
  },
  processingParams: {
    groupId: null,
    splittingEnabled: false,
    classificationEnabled: false,
    workflowParams: {
      documentTypeId: 'test-doc-type',
      engine: KnownProcessingEngines.TESSERACT,
      language: 'en',
      llmType: null,
      parsingFeatures: [],
      needsUnifier: true,
      needsExtraction: false,
      assignedToMe: true,
      metadata: null,
    },
  },
  labels: [],
  reference: null,
  createdAt: '2025-10-24T11:31:19.859875',
  updatedAt: '2025-10-24T11:31:19.859875',
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('should show spinner when file is loading', () => {
  mockReactRedux.useSelector.mockReturnValue({
    activePage: 1,
    activeSourceId: null,
  })

  useParams.mockReturnValue({ fileId: 'test-file-id' })
  useFetchFileQuery.mockReturnValue({
    data: undefined,
    isLoading: true,
    refetch: mockRefetchFile,
  })

  render(<FileReviewPage />)

  expect(screen.getByTestId('spin')).toBeInTheDocument()
  expect(screen.queryByTestId('file-review')).not.toBeInTheDocument()
})

test('should render FileReview when file is loaded', () => {
  mockReactRedux.useSelector.mockReturnValue({
    activePage: 1,
    activeSourceId: null,
  })

  useParams.mockReturnValue({ fileId: 'test-file-id' })
  useFetchFileQuery.mockReturnValue({
    data: mockFile,
    isLoading: false,
    refetch: mockRefetchFile,
  })

  render(<FileReviewPage />)

  expect(screen.getByTestId('file-review')).toBeInTheDocument()
  expect(screen.queryByTestId('spin')).not.toBeInTheDocument()
})

test('should call goBack when fileId is not provided', () => {
  mockReactRedux.useSelector.mockReturnValue({
    activePage: 1,
    activeSourceId: null,
  })

  useParams.mockReturnValue({ fileId: undefined })
  useFetchFileQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
    refetch: mockRefetchFile,
  })

  render(<FileReviewPage />)

  expect(goBack).toHaveBeenCalledTimes(1)
})

test('should skip query when fileId is not provided', () => {
  mockReactRedux.useSelector.mockReturnValue({
    activePage: 1,
    activeSourceId: null,
  })

  useParams.mockReturnValue({ fileId: undefined })
  useFetchFileQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
    refetch: mockRefetchFile,
  })

  render(<FileReviewPage />)

  expect(useFetchFileQuery).toHaveBeenCalledWith(undefined, {
    skip: true,
  })
})

test('should dispatch clearFileStore when component unmounts', () => {
  mockReactRedux.useSelector.mockReturnValue({
    activePage: 1,
    activeSourceId: null,
  })

  useParams.mockReturnValue({ fileId: 'test-file-id' })
  useFetchFileQuery.mockReturnValue({
    data: mockFile,
    isLoading: false,
    refetch: mockRefetchFile,
  })

  const { unmount } = render(<FileReviewPage />)

  unmount()

  expect(clearFileStore).toHaveBeenCalled()
})

test('calls addEvent from useEventSource with correct arguments when feature SSE is enabled', () => {
  mockReactRedux.useSelector.mockReturnValue({
    activePage: 1,
    activeSourceId: null,
  })

  useParams.mockReturnValue({ fileId: 'test-file-id' })
  useFetchFileQuery.mockReturnValue({
    data: mockFile,
    isLoading: false,
    refetch: mockRefetchFile,
  })

  render(<FileReviewPage />)

  expect(mockAddEvent).toHaveBeenCalledWith(
    KnownBusinessEvent.FILE_STATE_UPDATED,
    expect.any(Function),
  )
})

test('should not call addEvent from useEventSource when feature SSE is false', () => {
  jest.clearAllMocks()
  ENV.FEATURE_SERVER_SENT_EVENTS = false

  mockReactRedux.useSelector.mockReturnValue({
    activePage: 1,
    activeSourceId: null,
  })
  useParams.mockReturnValue({ fileId: 'test-file-id' })
  useFetchFileQuery.mockReturnValue({
    data: mockFile,
    isLoading: false,
    refetch: mockRefetchFile,
  })

  render(<FileReviewPage />)

  expect(mockAddEvent).not.toHaveBeenCalled()

  ENV.FEATURE_SERVER_SENT_EVENTS = true
})
