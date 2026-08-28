
import { mockEnv } from '@/mocks/mockEnv'
import { screen, waitFor } from '@testing-library/react'
import { ExtractionType } from '@/enums/ExtractionType'
import { FILE_EXTENSION_TO_DOWNLOAD_FORMAT, FileExtension } from '@/enums/FileExtension'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { ExtendedDocumentType } from '@/models/ExtendedDocumentType'
import { ExtractedDataSchema, OutputProfile, ExportingType } from '@/models/OutputProfile'
import { documentTypeStateSelector } from '@/selectors/documentType'
import { render } from '@/utils/rendererRTL'
import { DocumentTypeOutputProfilesList } from './DocumentTypeOutputProfilesList'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/selectors/documentType')
jest.mock('@/selectors/requests')
jest.mock('@/actions/documentType', () => ({
  fetchDocumentType: jest.fn(),
}))
jest.mock('@/containers/InfoPanel', () => ({
  InfoPanel: ({ renderActions }) => <div data-testid={infoPanelTestId}>{renderActions()}</div>,
}))
jest.mock('@/containers/AddOutputProfileModalButton', () => ({
  AddOutputProfileModalButton: () => <div data-testid={addOutputProfileModalButtonTestId} />,
}))

const infoPanelTestId = 'info-panel'
const addOutputProfileModalButtonTestId = 'add-output-profile-modal-button'

const mockProfiles = [
  new OutputProfile({
    id: '1',
    name: 'Profile 1',
    creationDate: '12-12-2000',
    version: '1.0.0',
    schema: new ExtractedDataSchema({
      fields: [],
      needsValidationResults: false,
    }),
    format: FILE_EXTENSION_TO_DOWNLOAD_FORMAT[FileExtension.JSON],
    exportingType: ExportingType.BUILT_IN,
  }),
]

const mockDocumentType = new ExtendedDocumentType({
  code: 'DocType1',
  name: 'Doc Type 1',
  engine: KnownProcessingEngines.TESSERACT,
  extractionType: ExtractionType.TEMPLATE,
  profiles: mockProfiles,
})

beforeEach(() => {
  jest.clearAllMocks()
  documentTypeStateSelector.mockReturnValue(mockDocumentType)
})

test('shows document type info panel', async () => {
  render(
    <DocumentTypeOutputProfilesList />,
  )

  const documentTypeInfoPanel = screen.getByTestId(infoPanelTestId)
  const addOutputProfileModalButton = screen.getByTestId(addOutputProfileModalButtonTestId)

  expect(documentTypeInfoPanel).toBeInTheDocument()
  expect(addOutputProfileModalButton).toBeInTheDocument()
})

test('shows table with correct columns', async () => {
  render(<DocumentTypeOutputProfilesList />)

  await waitFor(() => {
    expect(screen.getByText(localize(Localization.NAME))).toBeInTheDocument()
  })
  await waitFor(() => {
    expect(screen.getByText(localize(Localization.TYPE))).toBeInTheDocument()
  })
})

test('shows corresponding message if output profiles were not found', async () => {
  documentTypeStateSelector.mockReturnValue({
    ...mockDocumentType,
    profiles: [],
  })

  render(<DocumentTypeOutputProfilesList />)

  await waitFor(() => {
    expect(screen.getByText(localize(Localization.OUTPUT_PROFILES_WERE_NOT_FOUND))).toBeInTheDocument()
  })
})
