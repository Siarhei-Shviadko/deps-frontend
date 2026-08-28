
import { mockEnv } from '@/mocks/mockEnv'
import { documentsApi } from '@/api/documentsApi'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { getPage2Text } from '../OCRGrid/tests/conftest'
import { getOCRTextLines, getHash } from './getOCRTextLines'
import { OCRGridCache } from './OCRGridCache'

const page2text = getPage2Text()
const engine = KnownProcessingEngines.TESSERACT
const language = KnownLanguage.ENGLISH
const blobName = 'test.png'
const page = '1'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/api/documentsApi', () => ({
  documentsApi: {
    extractImagePage: jest.fn(() => ({
      textLines: {},
    })),
  },
}))

describe('OCRTextExtractor: getOCRTextLines', () => {
  afterEach(() => {
    jest.clearAllMocks()

    OCRGridCache.clear()
  })

  it('should call extractImagePage if no textLines in OCRGridCache', async () => {
    await getOCRTextLines(language, engine, blobName)

    expect(documentsApi.extractImagePage).nthCalledWith(1, {
      language,
      engine,
      blobName,
    })
  })

  it('should set textLines to OCRGridCache if no such page in cache', async () => {
    jest.spyOn(OCRGridCache, 'set')
    documentsApi.extractImagePage.mockImplementationOnce(() => page2text[page])

    const hash = getHash(language, engine, blobName)
    const textLines = await getOCRTextLines(language, engine, blobName)

    expect(OCRGridCache.set).nthCalledWith(1, hash, textLines)
  })

  it('should not call extractImagePage if textLines are in OCRGridCache', async () => {
    jest.spyOn(OCRGridCache, 'get')
    const hash = getHash(language, engine, blobName)
    OCRGridCache.set(hash, page2text[page])

    await getOCRTextLines(language, engine, blobName)

    expect(OCRGridCache.get).nthCalledWith(1, hash)
    expect(documentsApi.extractImagePage).not.toHaveBeenCalled()
  })
})
