import { mockEnv } from '@/mocks/mockEnv'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileStatus } from '@/enums/FileStatus'
import { Localization, localize } from '@/localization/i18n'
import { File, FileReference } from '@/models/File'
import { render } from '@/utils/rendererRTL'
import { AutoFileSplittingGuard } from './AutoFileSplittingGuard'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('../AutoFileSplittingButton', () => ({
  AutoFileSplittingButton: ({ file }) => (
    <button
      data-file-id={file.id}
      data-testid="auto-file-splitting-button"
    />
  ),
}))

const createMockFile = ({
  name = 'document.pdf',
  reference = null,
  status = FileStatus.COMPLETED,
} = {}) => new File({
  id: 'test-file-id',
  tenantId: 'test-tenant-id',
  name,
  reference,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  labels: [],
  state: {
    status,
  },
})

const mockFilePdf = createMockFile()
const mockFileNonPdf = createMockFile({ name: 'document.docx' })
const mockFilePdfWithReference = createMockFile({
  reference: new FileReference({
    entityType: 'document',
    entityId: 'doc-123',
    entityName: 'Test Document',
  }),
})
const mockFileProcessing = createMockFile({ status: FileStatus.PROCESSING })

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders disabled button with tooltip for non-PDF files', () => {
  render(<AutoFileSplittingGuard file={mockFileNonPdf} />)

  const disabledBtn = screen.getByRole('button')

  expect(disabledBtn).toBeInTheDocument()
  expect(disabledBtn).toBeDisabled()
  expect(disabledBtn).toHaveTextContent(localize(Localization.AUTOMATIC_FILE_SPLITTING))
})

test('displays correct tooltip for non-PDF files', async () => {
  render(<AutoFileSplittingGuard file={mockFileNonPdf} />)

  const button = screen.getByRole('button')

  await userEvent.hover(button)

  await waitFor(() => {
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent(
      localize(Localization.SPLITTING_AVAILABLE_FOR_PDF_FILE),
    )
  })
})

test('renders disabled button when PDF file has reference', () => {
  render(<AutoFileSplittingGuard file={mockFilePdfWithReference} />)

  const button = screen.getByRole('button')
  expect(button).toBeDisabled()
  expect(button).toHaveTextContent(localize(Localization.AUTOMATIC_FILE_SPLITTING))
})

test('shows tooltip with reference unavailable message when PDF file has reference', async () => {
  render(<AutoFileSplittingGuard file={mockFilePdfWithReference} />)

  const button = screen.getByRole('button')

  await userEvent.hover(button)

  await waitFor(() => {
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent(
      localize(Localization.FILE_ACTION_UNAVAILABLE_REFERENCE_TOOLTIP),
    )
  })
})

test('renders disabled button when file status is not completed or failed', () => {
  render(<AutoFileSplittingGuard file={mockFileProcessing} />)

  const button = screen.getByRole('button')
  expect(button).toBeDisabled()
  expect(button).toHaveTextContent(localize(Localization.AUTOMATIC_FILE_SPLITTING))
})

test('shows tooltip with available statuses when file status is not completed or failed', async () => {
  render(<AutoFileSplittingGuard file={mockFileProcessing} />)

  const button = screen.getByRole('button')

  await userEvent.hover(button)

  await waitFor(() => {
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent(
      localize(Localization.SPLITTING_AVAILABLE_STATUSES, {
        statuses: `${FileStatus.COMPLETED}, ${FileStatus.FAILED}`,
      }),
    )
  })
})

test('renders AutoFileSplittingButton when file is eligible for auto splitting', () => {
  render(<AutoFileSplittingGuard file={mockFilePdf} />)

  const button = screen.getByTestId('auto-file-splitting-button')
  expect(button).toBeInTheDocument()
  expect(button).toHaveAttribute('data-file-id', mockFilePdf.id)
})

test('renders AutoFileSplittingButton when file status is failed', () => {
  const props = {
    file: createMockFile({ status: FileStatus.FAILED }),
  }

  render(<AutoFileSplittingGuard {...props} />)

  expect(screen.getByTestId('auto-file-splitting-button')).toBeInTheDocument()
})
