
import { mockEnv } from '@/mocks/mockEnv'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFetchFileQuery } from '@/apiRTK/filesApi'
import { FileStatus } from '@/enums/FileStatus'
import { File, FileState } from '@/models/File'
import { ENV } from '@/utils/env'
import { FileReviewControls } from './FileReviewControls'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('react-router', () => ({
  useParams: jest.fn(() => ({ fileId: 'test-file-id' })),
}))

jest.mock('@/apiRTK/filesApi', () => ({
  useFetchFileQuery: jest.fn(),
}))

jest.mock('@/components/Button', () => ({
  Button: {
    Secondary: ({ icon, ...props }) => (
      <button
        data-testid="secondary-button"
        {...props}
      >
        {icon}
      </button>
    ),
  },
}))

jest.mock('@/components/Icons/ArrowDownSolidIcon', () => ({
  ArrowDownSolidIcon: () => <span data-testid="download-icon">Download</span>,
}))
jest.mock('@/containers/DownloadLink', () => ({
  DownloadLink: ({ children, apiUrl, fileName }) => (
    <div
      data-apiurl={apiUrl}
      data-filename={fileName}
      data-testid="download-link"
    >
      {children}
    </div>
  ),
}))

jest.mock('@/containers/FileGenAIModalButton', () => ({
  FileGenAIModalButton: ({ isModalVisible, toggleModal }) => (
    <button
      data-is-modal-visible={String(isModalVisible)}
      data-testid="gen-ai-button"
      onClick={toggleModal}
    >
      Gen AI Chat
    </button>
  ),
}))

jest.mock('@/containers/FileMoreActions', () => ({
  FileMoreActions: ({ file }) => (
    <div
      data-file-id={file.id}
      data-testid="file-more-actions"
    >
      More Actions
    </div>
  ),
}))

jest.mock('./FileReviewControls.styles', () => ({
  Controls: ({ children }) => <div data-testid="controls">{children}</div>,
}))

jest.mock('./FileReviewSplittingButton', () => ({
  FileReviewSplittingButton: ({ file }) => (
    <div
      data-file-id={file.id}
      data-testid="review-splitting-button"
    >
      Review Splitting
    </div>
  ),
}))

const mockFile = new File({
  id: 'test-file-id',
  tenantId: 'test-tenant-id',
  name: 'test-file.pdf',
  path: 'files/test-file.pdf',
  state: new FileState({
    status: FileStatus.COMPLETED,
    errorMessage: null,
  }),
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  labels: [],
})

beforeEach(() => {
  jest.clearAllMocks()
  ENV.FEATURE_PDF_SPLITTING = false
  mockEnv.ENV.FEATURE_GEN_AI_CHAT = false
  useFetchFileQuery.mockReturnValue({
    data: mockFile,
  })
})

test('renders download button with icon', () => {
  render(<FileReviewControls />)

  const downloadButton = screen.getByTestId('secondary-button')
  expect(downloadButton).toBeInTheDocument()

  const downloadIcon = screen.getByTestId('download-icon')
  expect(downloadIcon).toBeInTheDocument()
})

test('renders FileMoreActions with correct file prop', () => {
  render(<FileReviewControls />)

  const moreActions = screen.getByTestId('file-more-actions')
  expect(moreActions).toBeInTheDocument()
  expect(moreActions).toHaveAttribute('data-file-id', 'test-file-id')
})

test('renders FileReviewSplittingButton when feature flag is enabled and file status is SPLITTING_REVIEW', () => {
  ENV.FEATURE_PDF_SPLITTING = true

  const splittingReviewFile = new File({
    ...mockFile,
    state: new FileState({
      status: FileStatus.SPLITTING_REVIEW,
      errorMessage: null,
    }),
  })

  useFetchFileQuery.mockReturnValue({
    data: splittingReviewFile,
  })

  render(<FileReviewControls />)

  const reviewSplittingButton = screen.getByTestId('review-splitting-button')

  expect(reviewSplittingButton).toBeInTheDocument()
  expect(reviewSplittingButton).toHaveAttribute('data-file-id', 'test-file-id')
})

test('does not render FileReviewSplittingButton when file status is not SPLITTING_REVIEW', () => {
  ENV.FEATURE_PDF_SPLITTING = true

  render(<FileReviewControls />)

  const reviewSplittingButton = screen.queryByTestId('review-splitting-button')

  expect(reviewSplittingButton).not.toBeInTheDocument()
})

test('renders GenAI button when feature flag is enabled', () => {
  mockEnv.ENV.FEATURE_GEN_AI_CHAT = true

  render(<FileReviewControls />)

  expect(screen.getByTestId('gen-ai-button')).toBeInTheDocument()
})

test('toggles chat visibility when GenAI button is clicked', async () => {
  mockEnv.ENV.FEATURE_GEN_AI_CHAT = true
  const user = userEvent.setup()

  render(<FileReviewControls />)

  const genAiButton = screen.getByTestId('gen-ai-button')

  expect(genAiButton).toHaveAttribute('data-is-modal-visible', 'false')

  await user.click(genAiButton)

  await waitFor(() => {
    expect(screen.getByTestId('gen-ai-button')).toHaveAttribute(
      'data-is-modal-visible',
      'true',
    )
  })
})
