
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen } from '@testing-library/react'
import { EXPORTABLE_EXTRACTION_TYPES } from '@/constants/documentType'
import { ExtractionType, RESOURCE_EXTRACTION_TYPE } from '@/enums/ExtractionType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { DocumentType } from '@/models/DocumentType'
import { render } from '@/utils/rendererRTL'
import { DocumentTypeHeader } from './DocumentTypeHeader'

const mockTemplate = new DocumentType(
  'TestTemplate',
  'Test Template',
  KnownProcessingEngines.TESSERACT,
  KnownLanguage.ENGLISH,
  ExtractionType.TEMPLATE,
)

const EDITABLE_EXTRACTION_TYPES = [
  ExtractionType.TEMPLATE,
  ExtractionType.PROTOTYPE,
]

const DELETABLE_EXTRACTION_TYPES = [
  ExtractionType.TEMPLATE,
  ExtractionType.PROTOTYPE,
  ExtractionType.AI_PROMPTED,
  ExtractionType.AZURE_CLOUD_EXTRACTOR,
]

const READ_ONLY_EXTRACTION_TYPES = [
  ExtractionType.ML,
  ExtractionType.PLUGIN,
  ExtractionType.PULLABLE_ML,
]

const NON_EXPORTABLE_EXTRACTION_TYPES = [
  ExtractionType.TEMPLATE,
  ExtractionType.AZURE_CLOUD_EXTRACTOR,
  ExtractionType.ML,
  ExtractionType.PLUGIN,
  ExtractionType.PULLABLE_ML,
  ExtractionType.CUSTOM_MODEL,
]

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('@/utils/routerActions', () => ({
  goTo: jest.fn(),
}))
jest.mock('@/containers/DeleteDocumentTypeButton', () => ({
  DeleteDocumentTypeButton: () => <div data-testid='delete-button' />,
}))
jest.mock('@/containers/EditDocumentTypeButton', () => ({
  EditDocumentTypeButton: () => <div data-testid='edit-button' />,
}))
jest.mock('@/containers/EditAzureExtractorButton', () => ({
  EditAzureExtractorButton: () => <div data-testid='edit-azure-extractor-button' />,
}))
jest.mock('@/containers/DocumentTypeExportButton', () => ({
  DocumentTypeExportButton: () => <div data-testid='doc-type-export-button' />,
}))

test('show document type header', async () => {
  render(
    <DocumentTypeHeader
      documentType={mockTemplate}
    />,
  )
  const header = screen.getByRole('heading', {
    level: 2,
    name: mockTemplate.name,
  })

  expect(header).toBeInTheDocument()
})

test('show document type Extraction Type tag', async () => {
  render(
    <DocumentTypeHeader
      documentType={mockTemplate}
    />,
  )

  expect(screen.getByText(localize(Localization.TEMPLATE))).toBeInTheDocument()
})

test.each(Object.values(ExtractionType))(
  'shows correct extraction type title for %s', async (type) => {
    const mockDocumentType = new DocumentType(
      'TestTemplate',
      'Test Template',
      KnownProcessingEngines.TESSERACT,
      KnownLanguage.ENGLISH,
      type,
    )

    render(
      <DocumentTypeHeader
        documentType={mockDocumentType}
      />,
    )

    const title = screen.getByText(RESOURCE_EXTRACTION_TYPE[type])

    expect(title).toBeInTheDocument()
  },
)

test.each(EDITABLE_EXTRACTION_TYPES)(
  'shows Edit button for document type with extraction type %s', async (type) => {
    const mockDocumentType = new DocumentType(
      'TestTemplate',
      'Test Template',
      KnownProcessingEngines.TESSERACT,
      KnownLanguage.ENGLISH,
      type,
    )

    render(
      <DocumentTypeHeader
        documentType={mockDocumentType}
      />,
    )

    expect(screen.getByTestId('edit-button')).toBeInTheDocument()
  },
)

test('shows Edit button for Azure Extractor', async () => {
  const mockDocumentType = new DocumentType(
    'TestDocType',
    'Test Doc Type',
    null,
    KnownLanguage.ENGLISH,
    ExtractionType.AZURE_CLOUD_EXTRACTOR,
  )

  render(
    <DocumentTypeHeader
      documentType={mockDocumentType}
    />,
  )

  expect(screen.getByTestId('edit-azure-extractor-button')).toBeInTheDocument()
})

test('shows GoToAzureButton button for Azure Extractor', async () => {
  const mockDocumentType = new DocumentType(
    'TestDocType',
    'Test Doc Type',
    null,
    KnownLanguage.ENGLISH,
    ExtractionType.AZURE_CLOUD_EXTRACTOR,
  )

  render(
    <DocumentTypeHeader
      documentType={mockDocumentType}
    />,
  )

  const goToAzureButton = screen.getByRole('button', {
    name: localize(Localization.AZURE_STUDIO),
  })

  expect(goToAzureButton).toBeInTheDocument()
})

test.each(DELETABLE_EXTRACTION_TYPES)(
  'shows Delete button for document type with extraction type %s', async (type) => {
    const extractionType = type === ExtractionType.AI_PROMPTED ? null : type
    const mockDocumentType = new DocumentType(
      'TestTemplate',
      'Test Template',
      KnownProcessingEngines.TESSERACT,
      KnownLanguage.ENGLISH,
      extractionType,
    )

    render(
      <DocumentTypeHeader
        documentType={mockDocumentType}
      />,
    )

    expect(screen.getByTestId('delete-button')).toBeInTheDocument()
  },
)

test.each(READ_ONLY_EXTRACTION_TYPES)(
  'does not show Delete and Edit button for document type with extraction type %s', async (type) => {
    const mockDocumentType = new DocumentType(
      'TestTemplate',
      'Test Template',
      KnownProcessingEngines.TESSERACT,
      KnownLanguage.ENGLISH,
      type,
    )

    render(
      <DocumentTypeHeader
        documentType={mockDocumentType}
      />,
    )

    expect(screen.queryByRole('delete-button')).not.toBeInTheDocument()
    expect(screen.queryByRole('edit-button')).not.toBeInTheDocument()
  },
)

test.each(EXPORTABLE_EXTRACTION_TYPES)(
  'shows Export button for document type with extraction type %s', async (type) => {
    const extractionType = type === ExtractionType.AI_PROMPTED ? null : type
    const mockDocumentType = new DocumentType(
      'Test',
      'Test DocType',
      KnownProcessingEngines.TESSERACT,
      KnownLanguage.ENGLISH,
      extractionType,
    )

    render(
      <DocumentTypeHeader
        documentType={mockDocumentType}
      />,
    )

    expect(screen.getByTestId('doc-type-export-button')).toBeInTheDocument()
  },
)

test.each(NON_EXPORTABLE_EXTRACTION_TYPES)(
  'does not show Export button for document type with extraction type %s', async (type) => {
    const mockDocumentType = new DocumentType(
      'Test',
      'Test DocType',
      KnownProcessingEngines.TESSERACT,
      KnownLanguage.ENGLISH,
      type,
    )

    render(
      <DocumentTypeHeader
        documentType={mockDocumentType}
      />,
    )

    expect(screen.queryByRole('doc-type-export-button')).not.toBeInTheDocument()
    expect(screen.queryByRole('edit-button')).not.toBeInTheDocument()
  },
)
