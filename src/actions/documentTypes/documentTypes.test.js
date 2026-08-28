
import { mockEnv } from '@/mocks/mockEnv'
import {
  storeDocumentTypes,
  fetchDocumentTypes,
} from '@/actions/documentTypes'
import { documentTypesApi } from '@/api/documentTypesApi'
import { ExtractionType } from '@/enums/ExtractionType'
import { FieldType } from '@/enums/FieldType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { DocumentType } from '@/models/DocumentType'
import { DocumentTypeField } from '@/models/DocumentTypeField'

const mockDocumentType = new DocumentType(
  'MarketingContract',
  '',
  KnownProcessingEngines.TESSERACT,
  KnownLanguage.ENGLISH,
  ExtractionType.ML,
  [
    new DocumentTypeField(
      'MarketingClause',
      'Marketing Clause',
      {},
      FieldType.LIST,
      false,
      0,
      'MarketingContract',
      1021,
    ),
  ],
)

const mockDocumentTypes = [mockDocumentType]

jest.mock('@/api/documentTypesApi', () => ({
  documentTypesApi: {
    fetchDocumentTypes: jest.fn(() => mockDocumentTypes),
  },
}))
jest.mock('@/utils/env', () => mockEnv)

describe('Action creator: fetchDocumentTypes', () => {
  let dispatch, getState

  beforeEach(() => {
    dispatch = jest.fn()
    getState = jest.fn()
  })

  it('should call documentTypesApi.fetchDocumentType once with correct argument', async () => {
    await fetchDocumentTypes()(dispatch, getState)
    expect(documentTypesApi.fetchDocumentTypes).toHaveBeenCalledTimes(1)
    expect(documentTypesApi.fetchDocumentTypes).nthCalledWith(1)
  })

  it('should call dispatch with storeDocumentTypes action in case of request was successful', async () => {
    await fetchDocumentTypes()(dispatch, getState)
    expect(dispatch).nthCalledWith(2, storeDocumentTypes(mockDocumentTypes))
  })
})
