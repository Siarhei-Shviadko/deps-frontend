import { mockEnv } from '@/mocks/mockEnv'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Localization, localize } from '@/localization/i18n'
import { FileReference } from '@/models/File'
import { render } from '@/utils/rendererRTL'
import { FileReviewSplittingButtonGuard } from './FileReviewSplittingButtonGuard'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('./FileReviewSplittingButton', () => ({
  FileReviewSplittingButton: jest.fn(() => (
    <button data-testid="review-splitting-button" />
  )),
}))

jest.mock('@/containers/PdfSplitting/providers', () => ({
  PdfSegmentsProvider: jest.fn(({ children }) => (
    <div data-testid="pdf-segments-provider">{children}</div>
  )),
}))

const createMockFile = (name, reference = null) => ({
  id: 'test-file-id',
  tenantId: 'test-tenant-id',
  name,
  reference,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  labels: [],
})

const mockFilePdf = createMockFile('document.pdf')
const mockFileNonPdf = createMockFile('document.docx')
const mockFilePdfWithReference = createMockFile(
  'document.pdf',
  new FileReference({
    entityType: 'document',
    entityId: 'doc-123',
    entityName: 'Test Document',
  }),
)

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders disabled button for non-PDF files', () => {
  render(<FileReviewSplittingButtonGuard file={mockFileNonPdf} />)

  const disabledBtn = screen.getByRole('button')

  expect(disabledBtn).toBeInTheDocument()
  expect(disabledBtn).toBeDisabled()
})

test('renders FileReviewSplittingButton when file has PDF extension', () => {
  render(<FileReviewSplittingButtonGuard file={mockFilePdf} />)

  const reviewSplittingBtn = screen.getByTestId('review-splitting-button')

  expect(reviewSplittingBtn).toBeInTheDocument()
})

test('does not wrap with PdfSegmentsProvider for non-PDF files', () => {
  const { PdfSegmentsProvider } = jest.requireMock('@/containers/PdfSplitting/providers')

  render(<FileReviewSplittingButtonGuard file={mockFileNonPdf} />)

  expect(PdfSegmentsProvider).not.toHaveBeenCalled()
})

test('displays correct tooltip for non-PDF files', async () => {
  render(<FileReviewSplittingButtonGuard file={mockFileNonPdf} />)

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
  render(<FileReviewSplittingButtonGuard file={mockFilePdfWithReference} />)

  const button = screen.getByRole('button')

  expect(button).toBeDisabled()
})

test('shows tooltip with reference unavailable message when PDF file has reference', async () => {
  render(<FileReviewSplittingButtonGuard file={mockFilePdfWithReference} />)

  const button = screen.getByRole('button')

  await userEvent.hover(button)

  await waitFor(() => {
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent(
      localize(Localization.FILE_ACTION_UNAVAILABLE_REFERENCE_TOOLTIP),
    )
  })
})

test('renders FileReviewSplittingButton when PDF file has no reference', () => {
  render(<FileReviewSplittingButtonGuard file={mockFilePdf} />)

  const button = screen.getByTestId('review-splitting-button')

  expect(button).toBeInTheDocument()
})
