
import { mockEnv } from '@/mocks/mockEnv'
import {
  enginesSelector,
  processingEnginesSelector,
  tableEnginesSelector,
} from './engines'

jest.mock('@/utils/env', () => mockEnv)

describe('Selectors: engines', () => {
  let state

  beforeEach(() => {
    state = {
      engines: {
        table: 'mockTable',
        processing: 'mockProcessing',
      },
    }
  })

  it('selector: enginesSelector', () => {
    expect(enginesSelector(state)).toBe(state.engines)
  })

  it('selector: tableEnginesSelector', () => {
    expect(tableEnginesSelector(state)).toBe(state.engines.table)
  })

  it('selector: processingEnginesSelector', () => {
    expect(processingEnginesSelector(state)).toBe(state.engines.processing)
  })
})
