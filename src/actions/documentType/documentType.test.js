
import { mockEnv } from '@/mocks/mockEnv'
import {
  storeDocumentType,
  fetchDocumentType,
} from '@/actions/documentType'
import { documentTypesApi } from '@/api/documentTypesApi'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { ExtractionType } from '@/enums/ExtractionType'
import { FILE_EXTENSION_TO_DOWNLOAD_FORMAT, FileExtension } from '@/enums/FileExtension'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { DocumentTypeExtraField } from '@/models/DocumentTypeExtraField'
import { ExtendedDocumentType } from '@/models/ExtendedDocumentType'
import { ExportingType, ExtractedDataSchema, OutputProfile } from '@/models/OutputProfile'
import { WorkflowConfiguration } from '@/models/WorkflowConfiguration'
import { documentTypeStateSelector } from '@/selectors/documentType'

const mockDocumentTypeCode = 'mockDocumentTypeCode'

const mockDocumentType = new ExtendedDocumentType({
  code: 'mockDocumentTypeCode',
  name: 'mockDocumentTypeName',
  engine: KnownProcessingEngines.TESSERACT,
  language: KnownLanguage.ENGLISH,
  extractionType: ExtractionType.ML,
  extraFields: [
    new DocumentTypeExtraField({
      code: 'mockExtraFieldCode',
      name: 'mockExtraFieldName',
      order: 0,
    }),
  ],
})

jest.mock('@/api/documentTypesApi', () => ({
  documentTypesApi: {
    fetchDocumentType: jest.fn(() => mockDocumentType),
  },
}))
jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/selectors/documentType')

describe('Action creator: fetchDocumentType', () => {
  let dispatch, getState

  const mockCurrentDocumentType = new ExtendedDocumentType({
    code: mockDocumentTypeCode,
    name: 'Document Type',
    workflowConfiguration: new WorkflowConfiguration(),
    profiles: [
      new OutputProfile({
        id: 'id',
        name: 'name',
        creationDate: '12-12-2000',
        version: '1.0.0',
        schema: new ExtractedDataSchema({
          fields: [],
          needsValidationResults: false,
        }),
        format: FILE_EXTENSION_TO_DOWNLOAD_FORMAT[FileExtension.JSON],
        exportingType: ExportingType.BUILT_IN,
      }),
    ],
  })

  beforeEach(() => {
    dispatch = jest.fn()
    getState = jest.fn()

    documentTypeStateSelector.mockReturnValue(mockCurrentDocumentType)
  })

  it('should call documentTypesApi.fetchDocumentType with correct arguments', async () => {
    const extras = [
      DocumentTypeExtras.EXTRACTION_FIELDS,
      DocumentTypeExtras.PROFILES,
    ]

    await fetchDocumentType(mockDocumentTypeCode, extras)(dispatch, getState)
    expect(documentTypesApi.fetchDocumentType).nthCalledWith(
      1,
      mockDocumentTypeCode,
      extras,
    )
  })

  it('should merge extras correctly and dispatch storeDocumentType', async () => {
    const extras = [DocumentTypeExtras.EXTRA_FIELDS]

    await fetchDocumentType(mockDocumentTypeCode, extras)(dispatch, getState)

    const expectedPayload = {
      ...mockDocumentType,
      [DocumentTypeExtras.EXTRACTION_FIELDS]: mockCurrentDocumentType[DocumentTypeExtras.EXTRACTION_FIELDS],
      [DocumentTypeExtras.VALIDATORS]: mockCurrentDocumentType[DocumentTypeExtras.VALIDATORS],
      [DocumentTypeExtras.EXTRA_FIELDS]: mockDocumentType[DocumentTypeExtras.EXTRA_FIELDS],
      [DocumentTypeExtras.PROFILES]: mockCurrentDocumentType[DocumentTypeExtras.PROFILES],
      [DocumentTypeExtras.LLM_EXTRACTORS]: mockCurrentDocumentType[DocumentTypeExtras.LLM_EXTRACTORS],
      [DocumentTypeExtras.WORKFLOW_CONFIGURATIONS]: mockCurrentDocumentType[DocumentTypeExtras.WORKFLOW_CONFIGURATIONS],
    }

    expect(dispatch).toHaveBeenCalledWith(storeDocumentType(expectedPayload))
  })
})
