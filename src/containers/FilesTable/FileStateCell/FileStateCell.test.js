
import { mockEnv } from '@/mocks/mockEnv'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorCode } from '@/enums/Errors'
import { FileStatus, RESOURCE_FILE_STATUS } from '@/enums/FileStatus'
import { Localization, localize } from '@/localization/i18n'
import { File, FileState } from '@/models/File'
import { render } from '@/utils/rendererRTL'
import { FileStateCell } from './FileStateCell'

jest.mock('@/utils/env', () => mockEnv)

beforeEach(() => {
  jest.clearAllMocks()
})

const mockErrorIconId = 'Error-icon'
const mockRestartButtonId = 'restart-button'

jest.mock('./FileStateCell.styles', () => ({
  ...jest.requireActual('./FileStateCell.styles'),
  StyledFileRestartButton: ({ file }) => (
    <button
      data-file-id={file.id}
      data-testid={mockRestartButtonId}
    >
      Restart
    </button>
  ),
  WarningTriangleIcon: () => <span data-testid={mockErrorIconId} />,
}))

const createMockFile = (status, errorMessage = null) => new File({
  id: 'test-file-id',
  name: 'test-file.pdf',
  tenantId: 'test-tenant-id',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  labels: [],
  state: {
    status,
    errorMessage,
  },
})

const STATUSES_WITH_COLOR = [
  FileStatus.PROCESSING,
  FileStatus.COMPLETED,
  FileStatus.FAILED,
]

STATUSES_WITH_COLOR.forEach((status) => {
  test(`renders correct localized status text for ${status} status`, () => {
    const mockFile = createMockFile(status)

    render(<FileStateCell file={mockFile} />)

    const expectedText = RESOURCE_FILE_STATUS[status]
    expect(screen.getByText(expectedText)).toBeInTheDocument()
  })
})

test('renders component for NEEDS_REVIEW status', () => {
  const mockFile = createMockFile(FileStatus.NEEDS_REVIEW)

  render(<FileStateCell file={mockFile} />)

  const badge = screen.getByText(RESOURCE_FILE_STATUS[FileStatus.NEEDS_REVIEW])
  expect(badge).toBeInTheDocument()
})

test('renders component for IN_REVIEW status', () => {
  const mockFile = createMockFile(FileStatus.IN_REVIEW)

  render(<FileStateCell file={mockFile} />)

  const badge = screen.getByText(RESOURCE_FILE_STATUS[FileStatus.IN_REVIEW])
  expect(badge).toBeInTheDocument()
})

test('renders component for SPLITTING_REVIEW status', () => {
  const mockFile = createMockFile(FileStatus.SPLITTING_REVIEW)

  render(<FileStateCell file={mockFile} />)

  const badge = screen.getByText(RESOURCE_FILE_STATUS[FileStatus.SPLITTING_REVIEW])
  expect(badge).toBeInTheDocument()
})

test('renders badge with correct color for PROCESSING status', () => {
  const mockFile = createMockFile(FileStatus.PROCESSING)

  render(<FileStateCell file={mockFile} />)

  const badge = screen.getByText(RESOURCE_FILE_STATUS[FileStatus.PROCESSING])
  expect(badge).toBeInTheDocument()
})

test('renders badge with correct color for COMPLETED status', () => {
  const mockFile = createMockFile(FileStatus.COMPLETED)

  render(<FileStateCell file={mockFile} />)

  const badge = screen.getByText(RESOURCE_FILE_STATUS[FileStatus.COMPLETED])
  expect(badge).toBeInTheDocument()
})

test('renders badge with correct color for FAILED status', () => {
  const mockFile = createMockFile(FileStatus.FAILED)

  render(<FileStateCell file={mockFile} />)

  const badge = screen.getByText(RESOURCE_FILE_STATUS[FileStatus.FAILED])
  expect(badge).toBeInTheDocument()
})

test('renders error icon when errorMessage is provided', () => {
  const mockErrorMessage = 'error message'
  const mockFile = createMockFile(FileStatus.FAILED, mockErrorMessage)

  render(<FileStateCell file={mockFile} />)

  const errorIcon = screen.getByTestId(mockErrorIconId)
  expect(errorIcon).toBeInTheDocument()
})

test('does not render error icon when errorMessage is not provided', () => {
  const mockFile = createMockFile(FileStatus.FAILED, null)

  render(<FileStateCell file={mockFile} />)

  const errorIcon = screen.queryByTestId(mockErrorIconId)
  expect(errorIcon).not.toBeInTheDocument()
})

test('renders tooltip with error message when error icon is hovered', async () => {
  const mockErrorMessage = 'error message'
  const mockFile = createMockFile(FileStatus.FAILED, mockErrorMessage)

  render(<FileStateCell file={mockFile} />)

  const errorIcon = screen.getByTestId(mockErrorIconId)
  await userEvent.hover(errorIcon)

  await waitFor(() => {
    const tooltip = screen.getByText(mockErrorMessage)
    expect(tooltip).toBeInTheDocument()
  })
})

test('renders FileRestartButton when status is FAILED', () => {
  const mockFile = createMockFile(FileStatus.FAILED)

  render(<FileStateCell file={mockFile} />)

  const restartButton = screen.getByTestId(mockRestartButtonId)
  expect(restartButton).toBeInTheDocument()
  expect(restartButton).toHaveAttribute('data-file-id', mockFile.id)
})

test('does not render FileRestartButton when status is not FAILED', () => {
  const mockFile = createMockFile(FileStatus.COMPLETED)

  render(<FileStateCell file={mockFile} />)

  const restartButton = screen.queryByTestId(mockRestartButtonId)
  expect(restartButton).not.toBeInTheDocument()
})

test('renders human-readable message for error_during_processing error code', async () => {
  const mockFile = new File({
    id: 'test-file-id',
    name: 'test-file.pdf',
    tenantId: 'test-tenant-id',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    labels: [],
    state: new FileState({
      status: FileStatus.FAILED,
      errorCode: ErrorCode.errorDuringProcessing,
      errorMessage: 'Technical error message',
    }),
  })

  render(<FileStateCell file={mockFile} />)

  const errorIcon = screen.getByTestId(mockErrorIconId)
  await userEvent.hover(errorIcon)

  await waitFor(() => {
    const tooltip = screen.getByText(localize(Localization.ERROR_DURING_PROCESSING))
    expect(tooltip).toBeInTheDocument()
  })
})

test('renders human-readable message for error_during_classification error code', async () => {
  const mockFile = new File({
    id: 'test-file-id',
    name: 'test-file.pdf',
    tenantId: 'test-tenant-id',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    labels: [],
    state: new FileState({
      status: FileStatus.FAILED,
      errorCode: ErrorCode.errorDuringClassification,
      errorMessage: 'Technical error message',
    }),
  })

  render(<FileStateCell file={mockFile} />)

  const errorIcon = screen.getByTestId(mockErrorIconId)
  await userEvent.hover(errorIcon)

  await waitFor(() => {
    const tooltip = screen.getByText(localize(Localization.ERROR_DURING_CLASSIFICATION))
    expect(tooltip).toBeInTheDocument()
  })
})

test('renders human-readable message for error_during_splitting error code', async () => {
  const mockFile = new File({
    id: 'test-file-id',
    name: 'test-file.pdf',
    tenantId: 'test-tenant-id',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    labels: [],
    state: new FileState({
      status: FileStatus.FAILED,
      errorCode: ErrorCode.errorDuringSplitting,
      errorMessage: 'Technical error message',
    }),
  })

  render(<FileStateCell file={mockFile} />)

  const errorIcon = screen.getByTestId(mockErrorIconId)
  await userEvent.hover(errorIcon)

  await waitFor(() => {
    const tooltip = screen.getByText(localize(Localization.ERROR_DURING_SPLITTING))
    expect(tooltip).toBeInTheDocument()
  })
})
