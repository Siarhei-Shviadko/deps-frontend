
import { mockEnv } from '@/mocks/mockEnv'
import { documentsApi } from '@/api/documentsApi'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { ENV } from '@/utils/env'
import { mapMarkupToExtractedData } from './mapMarkupToExtractedData'
import { mockDocumentType, mockDocumentType1 } from './mocks/validDocumentType'
import { mockExtractedData, mockExtractedData1 } from './mocks/validExtractedData'
import { mockMarkup, mockMarkup1 } from './mocks/validMarkup'

jest.mock('@/api/documentsApi')
jest.mock('@/utils/env', () => mockEnv)

const mockProcessingDocuments = {
  1: {
    blobName: 'id123/processing/0.png',
    url: 'http://localhost:8003/api/v1/storage/file/id123/processing/0.png',
  },
  2: {
    blobName: 'id123/processing/1.png',
    url: 'http://localhost:8003/api/v1/storage/file/id123/processing/1.png',
  },
}

const mockLanguage = KnownLanguage.CHINESE_SIMPLIFIED
const mockEngine = KnownProcessingEngines.TESSERACT

describe('Mapper: mapMarkupToExtractedData', () => {
  afterEach(() => {
    ENV.FEATURE_OCR_INTERSECTION_ALGORITHM = false
  })

  it('should return empty extracted data in case no markup', async () => {
    const newExtractedData = await mapMarkupToExtractedData(
      null,
      mockDocumentType,
      mockProcessingDocuments,
      mockLanguage,
      mockEngine,
      false,
      null,
      mockExtractedData,
    )

    expect(newExtractedData).toEqual([])
  })

  it('should map markup to extracted data correctly', async () => {
    documentsApi.extractDataArea.mockImplementationOnce(() => Promise.resolve({ content: 'api data' }))

    const newExtractedData = await mapMarkupToExtractedData(
      mockMarkup,
      mockDocumentType,
      mockProcessingDocuments,
      mockLanguage,
      mockEngine,
      false,
      null,
      mockExtractedData,
    )

    for (const newEdField of newExtractedData) {
      const validEdField = mockExtractedData.find((f) => f.fieldPk === newEdField.fieldPk)
      expect(validEdField).toEqual(newEdField)
    }
    expect(newExtractedData.length).toEqual(mockExtractedData.length)
  })

  it('should trigger extractTableData if content is same', async () => {
    documentsApi.extractDataArea.mockImplementationOnce(() => Promise.reject(new Error()))
    documentsApi.extractTableData.mockImplementationOnce(() => Promise.reject(new Error()))

    const newExtractedData = await mapMarkupToExtractedData(
      mockMarkup1,
      mockDocumentType1,
      mockProcessingDocuments,
      mockLanguage,
      mockEngine,
      false,
      null,
      mockExtractedData1,
    )

    for (const newEdField of newExtractedData) {
      const validEdField = mockExtractedData1.find((f) => f.fieldPk === newEdField.fieldPk)
      expect(validEdField).toEqual(newEdField)
    }
    expect(newExtractedData.length).toEqual(mockExtractedData1.length)
  })

  it('should map markup to empty array in case empty document type fields', async () => {
    const mockDocumentType = { fields: [] }
    const newExtractedData = await mapMarkupToExtractedData(
      mockMarkup,
      mockDocumentType,
      mockProcessingDocuments,
      mockLanguage,
      mockEngine,
      false,
      null,
      mockExtractedData,
    )

    expect(newExtractedData).toEqual([])
  })
})
