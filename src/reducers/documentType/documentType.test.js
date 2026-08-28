
import { mockEnv } from '@/mocks/mockEnv'
import {
  clearDocumentTypeStore,
  storeDocumentType,
} from '@/actions/documentType'
import { ExtractionType } from '@/enums/ExtractionType'
import { FieldType } from '@/enums/FieldType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { DocumentTypeField } from '@/models/DocumentTypeField'
import { DocumentTypeFieldMeta } from '@/models/DocumentTypeFieldMeta'
import { ExtendedDocumentType } from '@/models/ExtendedDocumentType'
import { documentTypeReducer } from '@/reducers/documentType'

jest.mock('@/utils/env', () => mockEnv)

const field1 = new DocumentTypeField(
  'MOCK_FIELD_1',
  'MOCK_FIELD_1',
  new DocumentTypeFieldMeta('a', 'q'),
  FieldType.STRING,
  false,
  1,
)
const field2 = new DocumentTypeField(
  'MOCK_FIELD_2',
  'MOCK_FIELD_2',
  new DocumentTypeFieldMeta('a', 'q'),
  FieldType.STRING,
  false,
  2,
)

const mockDocumentType = new ExtendedDocumentType({
  code: 'mockDocumentTypeCode',
  name: 'mockDocumentTypeName',
  engine: KnownProcessingEngines.TESSERACT,
  language: KnownLanguage.ENGLISH,
  extractionType: ExtractionType.ML,
  fields: [
    field1,
    field2,
  ],
})

const initialState = null

test('action handler clearDocumentTypeStore should set initial state', () => {
  const action = clearDocumentTypeStore()

  expect(documentTypeReducer(mockDocumentType, action)).toEqual(initialState)
})

test('action handler storeDocumentType should store document type to the state', () => {
  const action = storeDocumentType(mockDocumentType)
  const newState = documentTypeReducer(initialState, action)

  expect(newState).toEqual(mockDocumentType)
})
