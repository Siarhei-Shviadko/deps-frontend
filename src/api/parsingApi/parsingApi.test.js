
import { mockEnv } from '@/mocks/mockEnv'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { apiMap } from '@/utils/apiMap'
import { apiRequest } from '@/utils/apiRequest'
import { getTabularLayout } from './parsingApi'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/apiRequest')
jest.mock('@/utils/apiMap')

const FAKE_API_URI = 'FAKE_API_URI'
const MOCK_DOCUMENT_ID = 'id'
const mockResponse = {
  parsingFeatures: {
    [KnownProcessingEngines.TESSERACT]: [],
  },
  pages: [],
}

describe('Service: parsing', () => {
  it('should call to the apiRequest.get with correct url in case of calling getTabularLayout', async () => {
    apiMap.apiGatewayV2.v5.documents.document.tabularLayout.mockImplementation(() => FAKE_API_URI)
    apiRequest.get.mockImplementation(() => Promise.resolve(mockResponse))

    const mockRequestData = 'mockRequestData'
    const data = await getTabularLayout(MOCK_DOCUMENT_ID, mockRequestData)

    expect(apiMap.apiGatewayV2.v5.documents.document.tabularLayout).nthCalledWith(1, MOCK_DOCUMENT_ID, mockRequestData)
    expect(apiRequest.get).nthCalledWith(1, FAKE_API_URI)
    expect(data).toEqual(mockResponse)
  })
})
