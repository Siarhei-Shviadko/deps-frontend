import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useContext } from 'react'
import { render } from '@/utils/rendererRTL'
import { AreaCreateContext, AreaCreateProvider } from './AreaCreateProvider'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/containers/AreaSelector/hooks', () => ({
  useCreateArea: jest.fn(() => ({
    isCreating: false,
    previewCoords: null,
    startCreating: mockStartCreating,
    onPointerDown: mockOnPointerDown,
    onPointerMove: mockOnPointerMove,
    onPointerUp: mockOnPointerUp,
  })),
}))

const mockOnChange = jest.fn()
const mockStartCreating = jest.fn()
const mockOnPointerDown = jest.fn()
const mockOnPointerMove = jest.fn()
const mockOnPointerUp = jest.fn()

const Consumer = () => {
  const {
    isCreating,
    previewCoords,
    startCreating,
    deleteArea,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } = useContext(AreaCreateContext)

  return (
    <div>
      <span data-testid="is-creating">{String(isCreating)}</span>
      <span data-testid="preview-coords">{String(previewCoords)}</span>
      <button
        onClick={startCreating}
        type="button"
      >
        Start creating
      </button>
      <button
        onClick={deleteArea}
        type="button"
      >
        Delete area
      </button>
      <button
        onClick={onPointerDown}
        type="button"
      >
        Pointer down
      </button>
      <button
        onClick={onPointerMove}
        type="button"
      >
        Pointer move
      </button>
      <button
        onClick={onPointerUp}
        type="button"
      >
        Pointer up
      </button>
    </div>
  )
}

const defaultProps = {
  onChange: mockOnChange,
  children: <Consumer />,
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('provides create area context values to children', () => {
  render(<AreaCreateProvider {...defaultProps} />)

  expect(screen.getByTestId('is-creating')).toHaveTextContent('false')
  expect(screen.getByTestId('preview-coords')).toHaveTextContent('null')
})

test('calls startCreating from context when start creating button is clicked', async () => {
  render(<AreaCreateProvider {...defaultProps} />)

  await userEvent.click(screen.getByRole('button', { name: 'Start creating' }))

  expect(mockStartCreating).toHaveBeenCalledTimes(1)
})

test('calls onChange with null when delete area is clicked', async () => {
  render(<AreaCreateProvider {...defaultProps} />)

  await userEvent.click(screen.getByRole('button', { name: 'Delete area' }))

  expect(mockOnChange).toHaveBeenNthCalledWith(1, null)
})

test('exposes pointer handlers from useCreateArea through context', async () => {
  render(<AreaCreateProvider {...defaultProps} />)

  await userEvent.click(screen.getByRole('button', { name: 'Pointer down' }))
  await userEvent.click(screen.getByRole('button', { name: 'Pointer move' }))
  await userEvent.click(screen.getByRole('button', { name: 'Pointer up' }))

  expect(mockOnPointerDown).toHaveBeenCalledTimes(1)
  expect(mockOnPointerMove).toHaveBeenCalledTimes(1)
  expect(mockOnPointerUp).toHaveBeenCalledTimes(1)
})
