import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useContext } from 'react'
import { render } from '@/utils/rendererRTL'
import { AreaResizeContext, AreaResizeProvider } from './AreaResizeProvider'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/containers/AreaSelector/hooks', () => ({
  useResizableOverlay: jest.fn(() => ({
    workingCoords: mockWorkingCoords,
    startResize: mockStartResize,
    resize: mockResize,
    stopResize: mockStopResize,
  })),
}))

const mockOnChange = jest.fn()
const mockStartResize = jest.fn()
const mockResize = jest.fn()
const mockStopResize = jest.fn()

const mockCoordinates = {
  x: 0,
  y: 0.2,
  width: 1,
  height: 0.4,
}

const mockWorkingCoords = {
  x: 0,
  y: 0.3,
  width: 1,
  height: 0.3,
}

const Consumer = () => {
  const {
    coordinates,
    workingCoords,
    startResize,
    resize,
    stopResize,
  } = useContext(AreaResizeContext)

  return (
    <div>
      <span data-testid="coordinates-y">{coordinates?.y}</span>
      <span data-testid="working-coords-y">{workingCoords?.y}</span>
      <button
        onClick={startResize}
        type="button"
      >
        Start resize
      </button>
      <button
        onClick={resize}
        type="button"
      >
        Resize
      </button>
      <button
        onClick={stopResize}
        type="button"
      >
        Stop resize
      </button>
    </div>
  )
}

const defaultProps = {
  coordinates: mockCoordinates,
  onChange: mockOnChange,
  children: <Consumer />,
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('provides resize context values to children', () => {
  render(<AreaResizeProvider {...defaultProps} />)

  expect(screen.getByTestId('coordinates-y')).toHaveTextContent(String(mockCoordinates.y))
  expect(screen.getByTestId('working-coords-y')).toHaveTextContent(String(mockWorkingCoords.y))
})

test('exposes resize handlers from useResizableOverlay through context', async () => {
  render(<AreaResizeProvider {...defaultProps} />)

  await userEvent.click(screen.getByRole('button', { name: 'Start resize' }))
  await userEvent.click(screen.getByRole('button', { name: 'Resize' }))
  await userEvent.click(screen.getByRole('button', { name: 'Stop resize' }))

  expect(mockStartResize).toHaveBeenCalledTimes(1)
  expect(mockResize).toHaveBeenCalledTimes(1)
  expect(mockStopResize).toHaveBeenCalledTimes(1)
})
