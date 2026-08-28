
import { mockEnv } from '@/mocks/mockEnv'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { getPage2Text } from '../OCRGrid/tests/conftest'
import { extractDataAreaWithAlgorithm } from './extractDataAreaWithAlgorithm'

const mockPage2text = getPage2Text()
const page = '1'
const language = KnownLanguage.ENGLISH
const engine = KnownProcessingEngines.TESSERACT
const blobName = 'test.png'

jest.mock('./getOCRTextLines', () => ({
  getOCRTextLines: jest.fn(() => Promise.resolve(mockPage2text[page])),
}))

jest.mock('@/utils/env', () => mockEnv)

describe('OCRTextExtractor: extractDataAreaWithAlgorithm', () => {
  it('should return correct content when call extractDataAreaWithAlgorithm', async () => {
    const { content, confidence, bbox } = mockPage2text[page][0].wordBoxes[0]

    const labelContent = await extractDataAreaWithAlgorithm({
      language,
      engine,
      blobName,
      labelCoords: bbox,
    })

    expect(labelContent).toEqual({
      content,
      confidence,
    })
  })
})
