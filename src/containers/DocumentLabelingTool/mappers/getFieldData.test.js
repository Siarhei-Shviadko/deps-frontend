
import { mockEnv } from '@/mocks/mockEnv'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { FieldData } from '@/models/ExtractedData'
import { Rect } from '@/models/Rect'
import { ENV } from '@/utils/env'
import { getFieldData } from './getFieldData'

const language = KnownLanguage.ENGLISH
const engine = KnownProcessingEngines.TESSERACT
const blobName = 'test.png'
const mockExtractedData = {
  content: 'test',
  confidence: 0.1,
}
const mockWithAlgorithmCallback = jest.fn(() => Promise.resolve(mockExtractedData))
const mockExtractAreaCallback = jest.fn(() => Promise.resolve(mockExtractedData))

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/services/OCRExtractionService', () => ({
  extractDataAreaWithAlgorithm: jest.fn((args) => mockWithAlgorithmCallback(args)),
}))

const label = {
  content: 'test',
  confidence: 0,
}

const sourceBboxCoordinates = {}

const labelCoords = new Rect(1, 1, 1, 1)

describe('Mappers: getFieldData', () => {
  afterEach(() => {
    ENV.FEATURE_OCR_INTERSECTION_ALGORITHM = false
  })

  it('should return correct content when call getFieldData', async () => {
    await getFieldData({
      labelCoords,
      engine,
      language,
      blobName,
      label,
      setIndex: null,
      sourceBboxCoordinates,
      extractDataArea: mockExtractAreaCallback,
    })

    expect(mockExtractAreaCallback).nthCalledWith(1,
      labelCoords,
      blobName,
      engine,
      language,
    )
  })

  it('should call extractDataAreaWithAlgorithm if FEATURE_OCR_INTERSECTION_ALGORITHM is enabled', async () => {
    ENV.FEATURE_OCR_INTERSECTION_ALGORITHM = true

    await getFieldData({
      labelCoords,
      engine,
      language,
      blobName,
      label,
      setIndex: null,
      sourceBboxCoordinates,
      extractDataArea: mockExtractAreaCallback,
    })

    expect(mockWithAlgorithmCallback).nthCalledWith(1, {
      language,
      engine,
      blobName,
      labelCoords,
    })
  })

  it('should return FieldData if catch an error during request', async () => {
    const data = await getFieldData({
      labelCoords,
      engine,
      language,
      blobName,
      label,
      setIndex: null,
      sourceBboxCoordinates,
      extractDataArea: () => Promise.reject(new Error('test')),
    })

    expect(data).toEqual(
      new FieldData(
        label.content,
        labelCoords,
        label.confidence,
        null,
        undefined,
        null,
        sourceBboxCoordinates,
        undefined,
        null,
      ),
    )
  })
})
