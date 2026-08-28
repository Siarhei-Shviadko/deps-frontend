
import { mockEnv } from '@/mocks/mockEnv'
import {
  storeTableEngines,
  fetchTableEngines,
  storeProcessingEngines,
  fetchProcessingEngines,
} from '@/actions/engines'
import { enginesApi } from '@/api/enginesApi'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { localize, Localization } from '@/localization/i18n'
import { Engine } from '@/models/Engine'

const mockEngines = [
  new Engine('TESSERACT', 'Tesseract'),
]

const mockProcessingEnginesResponse = {
  engines: [
    {
      code: KnownProcessingEngines.TESSERACT,
      name: 'Tesseract',
    },
    {
      code: KnownProcessingEngines.GCP_VISION,
      name: 'GCP Vision',
    },
  ],
}

const mockError = new Error('Mock Error Message')

jest.mock('@/api/enginesApi', () => ({
  enginesApi: {
    getTableEngines: jest.fn(() => Promise.resolve(mockEngines)),
    getProcessingEngines: jest.fn(() => Promise.resolve(mockProcessingEnginesResponse)),
  },
}))
jest.mock('@/utils/env', () => mockEnv)

describe('Action creator: getTableEngines', () => {
  let dispatch

  beforeEach(() => {
    dispatch = jest.fn()
  })

  it('should call getTableEngines once', async () => {
    await fetchTableEngines()(dispatch)
    expect(enginesApi.getTableEngines).toHaveBeenCalledTimes(1)
  })

  it('should call dispatch second time with fetchDetectEnginesSuccess from response in case of success', async () => {
    await fetchTableEngines()(dispatch)
    expect(dispatch).nthCalledWith(2, storeTableEngines(mockEngines))
  })

  it('should throw error', async () => {
    console.warn = jest.fn()
    console.error = jest.fn()
    enginesApi.getTableEngines.mockImplementationOnce(() => Promise.reject(mockError))
    await expect(fetchTableEngines()(dispatch)).rejects.toThrowError(mockError)
  })
})

describe('Action creator: fetchProcessingEngines', () => {
  let dispatch

  beforeEach(() => {
    dispatch = jest.fn()
    jest.clearAllMocks()
  })

  it('should call getProcessingEngines once', async () => {
    await fetchProcessingEngines()(dispatch)
    expect(enginesApi.getProcessingEngines).toHaveBeenCalledTimes(1)
  })

  it('should call dispatch with storeProcessingEngines with localized engine names', async () => {
    await fetchProcessingEngines()(dispatch)

    expect(dispatch).nthCalledWith(2, storeProcessingEngines([
      {
        code: KnownProcessingEngines.TESSERACT,
        name: localize(Localization.TESSERACT),
      },
      {
        code: KnownProcessingEngines.GCP_VISION,
        name: localize(Localization.GCP_DOCUMENT_AI),
      },
    ]))
  })

  it('should throw error', async () => {
    console.warn = jest.fn()
    console.error = jest.fn()
    enginesApi.getProcessingEngines.mockImplementationOnce(() => Promise.reject(mockError))
    await expect(fetchProcessingEngines()(dispatch)).rejects.toThrowError(mockError)
  })
})
