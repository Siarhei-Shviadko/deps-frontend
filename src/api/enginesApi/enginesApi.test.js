
import { mockEnv } from '@/mocks/mockEnv'
import { Engine } from '@/models/Engine'
import { apiMap } from '@/utils/apiMap'
import { apiRequest } from '@/utils/apiRequest'
import { getTableEngines, getProcessingEngines } from './enginesApi'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/utils/apiRequest')

jest.mock('@/utils/apiMap')

describe('Service: engines', () => {
  it('should call to the apiRequest.get with correct url in case of calling getTableEngines', async () => {
    const FAKE_API_URI = 'FAKE_API_URI'

    const MOCK_API_RESPONSE = [new Engine('MOCK_CODE', 'MOCK_NAME')]

    apiMap.tables.v1.tableEngines.mockImplementation(() => FAKE_API_URI)
    apiRequest.get.mockImplementation(() => Promise.resolve(MOCK_API_RESPONSE))

    const engines = await getTableEngines()

    expect(apiMap.tables.v1.tableEngines).toHaveBeenCalled()
    expect(apiRequest.get).toHaveBeenCalledWith(FAKE_API_URI)
    expect(engines).toBe(MOCK_API_RESPONSE)
  })

  it('should call to the apiRequest.get with correct url in case of calling getProcessingEngines', async () => {
    const FAKE_API_URI = 'FAKE_PROCESSING_ENGINES_URI'

    const MOCK_API_RESPONSE = { engines: [new Engine('MOCK_CODE', 'MOCK_NAME')] }

    apiMap.apiGatewayV2.v5.tools.parsing.engines.mockImplementation(() => FAKE_API_URI)
    apiRequest.get.mockImplementation(() => Promise.resolve(MOCK_API_RESPONSE))

    const engines = await getProcessingEngines()

    expect(apiMap.apiGatewayV2.v5.tools.parsing.engines).toHaveBeenCalled()
    expect(apiRequest.get).toHaveBeenCalledWith(FAKE_API_URI)
    expect(engines).toBe(MOCK_API_RESPONSE)
  })
})
