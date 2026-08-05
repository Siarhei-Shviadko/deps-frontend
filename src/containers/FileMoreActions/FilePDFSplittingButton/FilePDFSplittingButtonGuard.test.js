
import { mockEnv } from '@/mocks/mockEnv'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Localization, localize } from '@/localization/i18n'
import { FileReference } from '@/models/File'
import { render } from '@/utils/rendererRTL'
import { FilePDFSplittingButtonGuard } from './FilePDFSplittingButtonGuard'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('./FilePDFSplittingButton', () => ({
  FilePDFSplittingButton: jest.fn(({ children, disabled }) => (
    <button
      data-testid="pdf-splitting-button"
      disabled={disabled}
    >
      {children}
    </button>
  )),
}))

jest.mock('@/containers/PdfSplitting/providers', () => ({
  PdfSegmentsProvider: jest.fn(({ children }) => <div data-testid="pdf-segments-provider">{children}</div>),
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
  }))

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders disabled button with tooltip for non-PDF files', () => {
  render(<FilePDFSplittingButtonGuard file={mockFileNonPdf} />)

  const disabledBtn = screen.getByRole('button')

  expect(disabledBtn).toBeInTheDocument()
  expect(disabledBtn).toBeDisabled()
  expect(disabledBtn).toHaveTextContent(localize(Localization.MANUAL_FILE_SPLITTING))
})

test('renders FilePDFSplittingButton if file has PDF extension', () => {
  render(<FilePDFSplittingButtonGuard file={mockFilePdf} />)

  const splitFileBtn = screen.getByText(localize(Localization.MANUAL_FILE_SPLITTING))

  expect(splitFileBtn).toBeInTheDocument()
})

test('does not wrap with PdfSegmentsProvider for non-PDF files', () => {
  const { PdfSegmentsProvider } = require('@/containers/PdfSplitting/providers')

  render(<FilePDFSplittingButtonGuard file={mockFileNonPdf} />)

  expect(PdfSegmentsProvider).not.toHaveBeenCalled()
})

test('displays correct tooltip for non-PDF files', async () => {
  render(<FilePDFSplittingButtonGuard file={mockFileNonPdf} />)

  const button = screen.getByRole('button')

  expect(button).toBeInTheDocument()
  expect(button).toBeDisabled()

  await userEvent.hover(button)

  await waitFor(() => {
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent(
      localize(Localization.SPLITTING_AVAILABLE_FOR_PDF_FILE),
    )
  })
})

test('renders disabled PDF splitting button when file has reference', () => {
  render(<FilePDFSplittingButtonGuard file={mockFilePdfWithReference} />)

  const button = screen.getByRole('button')
  expect(button).toBeDisabled()
  expect(button).toHaveTextContent(localize(Localization.MANUAL_FILE_SPLITTING))
})

test('shows tooltip with reference unavailable message when PDF file has reference', async () => {
  render(<FilePDFSplittingButtonGuard file={mockFilePdfWithReference} />)

  const button = screen.getByRole('button')

  await userEvent.hover(button)

  await waitFor(() => {
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent(
      localize(Localization.FILE_ACTION_UNAVAILABLE_REFERENCE_TOOLTIP),
    )
  })
})

test('renders enabled PDF splitting button when file has no reference', () => {
  render(<FilePDFSplittingButtonGuard file={mockFilePdf} />)

  const button = screen.getByTestId('pdf-splitting-button')
  expect(button).not.toBeDisabled()
})
