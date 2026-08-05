import { mockEnv } from '@/mocks/mockEnv'
import { fireEvent, screen } from '@testing-library/react'
import { render } from '@/utils/rendererRTL'
import { RESIZE_EDGE } from '../constants'
import { AreaCreateContext, AreaResizeContext } from '../providers'
import { AreaSelectorOverlay } from './AreaSelectorOverlay'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('./AreaSelectorOverlay.styles', () => ({
  DrawingOverlay: () => <div data-testid="drawing-overlay" />,
  Overlay: ({ children }) => <div data-testid="resizable-overlay">{children}</div>,
  Handle: ({
    onPointerDown,
    onPointerMove,
    onPointerUp,
    $position,
  }) => (
    <div
      data-testid={`handle-${$position}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  ),
}))

const mockStartResize = jest.fn()
const mockResize = jest.fn()
const mockStopResize = jest.fn()

const mockCoordinates = {
  x: 0,
  y: 0.2,
  width: 1,
  height: 0.4,
}

const defaultCreateValue = {
  previewCoords: null,
}

const defaultResizeValue = {
  workingCoords: mockCoordinates,
  startResize: mockStartResize,
  resize: mockResize,
  stopResize: mockStopResize,
}

const renderOverlay = (
  createValue = defaultCreateValue,
  resizeValue = defaultResizeValue,
) => render(
  <AreaCreateContext.Provider value={createValue}>
    <AreaResizeContext.Provider value={resizeValue}>
      <AreaSelectorOverlay />
    </AreaResizeContext.Provider>
  </AreaCreateContext.Provider>,
)

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders overlay with handles when working coordinates exist', () => {
  renderOverlay()

  expect(screen.getByTestId('resizable-overlay')).toBeInTheDocument()
  expect(screen.getByTestId('handle-top')).toBeInTheDocument()
  expect(screen.getByTestId('handle-bottom')).toBeInTheDocument()
})

test('does not render overlay when working coordinates are missing', () => {
  renderOverlay(defaultCreateValue, {
    ...defaultResizeValue,
    workingCoords: null,
  })

  expect(screen.queryByTestId('resizable-overlay')).not.toBeInTheDocument()
})

test('renders drawing overlay when preview coordinates exist', () => {
  renderOverlay({
    previewCoords: mockCoordinates,
  })

  expect(screen.getByTestId('drawing-overlay')).toBeInTheDocument()
  expect(screen.queryByTestId('resizable-overlay')).not.toBeInTheDocument()
})

test('calls startResize when pointer is pressed on handle', () => {
  renderOverlay()

  fireEvent.pointerDown(screen.getByTestId('handle-top'))

  expect(mockStartResize).toHaveBeenCalledTimes(1)
})

test('calls resize with top edge when pointer moves on top handle', () => {
  renderOverlay()

  fireEvent.pointerMove(screen.getByTestId('handle-top'))

  expect(mockResize).toHaveBeenCalledTimes(1)
  expect(mockResize).toHaveBeenNthCalledWith(1, expect.any(Object), RESIZE_EDGE.TOP)
})

test('calls resize with bottom edge when pointer moves on bottom handle', () => {
  renderOverlay()

  fireEvent.pointerMove(screen.getByTestId('handle-bottom'))

  expect(mockResize).toHaveBeenCalledTimes(1)
  expect(mockResize).toHaveBeenNthCalledWith(1, expect.any(Object), RESIZE_EDGE.BOTTOM)
})

test('calls stopResize when pointer is released on handle', () => {
  renderOverlay()

  fireEvent.pointerUp(screen.getByTestId('handle-bottom'))

  expect(mockStopResize).toHaveBeenCalledTimes(1)
})
