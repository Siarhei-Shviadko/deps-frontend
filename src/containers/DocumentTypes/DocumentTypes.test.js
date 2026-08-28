
import { mockEnv } from '@/mocks/mockEnv'
import { waitFor } from '@testing-library/react'
import { EXTRACTION_TYPE_FILTER_KEY } from '@/constants/navigation'
import { DocumentTypesListView } from '@/containers/DocumentTypesListView'
import { ExtractionType } from '@/enums/ExtractionType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { DocumentType } from '@/models/DocumentType'
import { filterSelector } from '@/selectors/navigation'
import { render } from '@/utils/rendererRTL'
import { DocumentTypes } from './DocumentTypes'

jest.mock('@/selectors/navigation', () => ({
  filterSelector: jest.fn(() => ({})),
}))

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/containers/DocumentTypesListView', () => ({
  DocumentTypesListView: jest.fn(() => 'DocumentTypesListView'),
}))

const engLanguageDocumentType = new DocumentType(
  'DocType1',
  'Doc Type 1',
  KnownProcessingEngines.TESSERACT,
  KnownLanguage.ENGLISH,
  ExtractionType.TEMPLATE,
)

const mockDocumentTypes = [
  engLanguageDocumentType,
  new DocumentType(
    'DocType2',
    'Doc Type 2',
    KnownProcessingEngines.TESSERACT,
    KnownLanguage.DEUTSCH,
    ExtractionType.TEMPLATE,
  ),
]

test('should call filterSelector', async () => {
  jest.clearAllMocks()

  render(
    <DocumentTypes
      documentTypes={mockDocumentTypes}
      documentTypesExtractor={EXTRACTION_TYPE_FILTER_KEY.templates}
    />,
  )

  await waitFor(() => {
    expect(filterSelector).toHaveBeenCalled()
  })
})

it('should render DocumentTypesListView with defined document types', async () => {
  render(
    <DocumentTypes
      documentTypes={mockDocumentTypes}
      documentTypesExtractor={EXTRACTION_TYPE_FILTER_KEY.templates}
    />,
  )

  await waitFor(async () => {
    expect(DocumentTypesListView).nthCalledWith(
      1,
      {
        documentTypes: mockDocumentTypes,
        documentTypesExtractor: EXTRACTION_TYPE_FILTER_KEY.templates,
      },
      {},
    )
  })
})

it('should render DocumentTypesListView with filtered document types if filter was set', async () => {
  jest.clearAllMocks()
  filterSelector.mockImplementationOnce(() => ({ language: KnownLanguage.ENGLISH }))

  render(
    <DocumentTypes
      documentTypes={mockDocumentTypes}
      documentTypesExtractor={EXTRACTION_TYPE_FILTER_KEY.templates}
    />,
  )

  await waitFor(async () => {
    expect(DocumentTypesListView).nthCalledWith(
      1,
      {
        documentTypes: [engLanguageDocumentType],
        documentTypesExtractor: EXTRACTION_TYPE_FILTER_KEY.templates,
      },
      {},
    )
  })
})
