
import { mockEnv } from '@/mocks/mockEnv'
import { storeProcessingEngines, storeTableEngines } from '@/actions/engines'
import { Engine } from '@/models/Engine'
import { enginesReducer } from './engines'

jest.mock('@/utils/env', () => mockEnv)

const unknownAction = {
  type: 'UNKNOWN_ACTION_TYPE',
}

describe('Reducer: engines', () => {
  let state

  beforeAll(() => {
    state = {
      table: [],
      processing: [],
    }
  })

  it('should return correct initial state', () => {
    expect(enginesReducer(undefined, unknownAction)).toEqual(state)
  })

  it('should correctly handle unknown action', () => {
    expect(enginesReducer(state, unknownAction)).toEqual(state)
  })

  it('should correctly handle fetchTableEnginesSuccess action', () => {
    const mockEngines = [
      new Engine('GCP_VISION', 'AI Vision'),
      new Engine('TESSERACT', 'TESSERACT'),
    ]
    const action = storeTableEngines(mockEngines)
    expect(enginesReducer(state, action)).toEqual({
      ...state,
      table: mockEngines,
    })
  })

  it('should correctly handle storeProcessingEngines action', () => {
    const mockEngines = [
      new Engine('GCP_VISION', 'AI Vision'),
      new Engine('TESSERACT', 'TESSERACT'),
    ]
    const action = storeProcessingEngines(mockEngines)
    expect(enginesReducer(state, action)).toEqual({
      ...state,
      processing: mockEngines,
    })
  })
})
