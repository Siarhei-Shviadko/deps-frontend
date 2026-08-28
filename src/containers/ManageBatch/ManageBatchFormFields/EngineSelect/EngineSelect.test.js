
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import { fetchProcessingEngines } from '@/actions/engines'
import { processingEnginesSelector } from '@/selectors/engines'
import { render } from '@/utils/rendererRTL'
import { EngineSelect } from './EngineSelect'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/selectors/requests')
jest.mock('@/selectors/engines')

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/actions/engines', () => ({
  fetchProcessingEngines: jest.fn(),
}))

const mockDispatch = jest.fn()

test('should render select with options', () => {
  render(
    <EngineSelect
      fetching={false}
      onChange={jest.fn()}
    />,
  )

  expect(screen.getByTestId('CustomSelect')).toBeInTheDocument()
})

test('calls fetchProcessingEngines when select is rendered if engines are empty', () => {
  processingEnginesSelector.mockReturnValueOnce([])

  render(
    <EngineSelect
      fetching={false}
      onChange={jest.fn()}
    />,
  )

  expect(mockDispatch).toHaveBeenCalledWith(fetchProcessingEngines())
})
