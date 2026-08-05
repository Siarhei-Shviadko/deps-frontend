import { mockEnv } from '@/mocks/mockEnv'
import { fireEvent, screen } from '@testing-library/react'
import { render } from '@/utils/rendererRTL'
import { AreaCreateContext, AreaResizeContext } from '../providers'
import { AreaSelectorContainer } from './AreaSelectorContainer'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('./AreaSelectorContainer.styles', () => {
  const { forwardRef } = jest.requireActual('react')

  return {
    Container: forwardRef(({
      children,
      className,
      onPointerDown,
      onPointerMove,
      onPointerUp,
    }, ref) => (
      <div
        ref={ref}
        className={className}
        data-testid="area-selector-container"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {children}
      </div>
    )),
  }
})

const mockOnPointerDown = jest.fn()
const mockOnPointerMove = jest.fn()
const mockOnPointerUp = jest.fn()
const createContainerRef = { current: null }
const resizeContainerRef = { current: null }

const defaultCreateValue = {
  containerRef: createContainerRef,
  isCreating: false,
  onPointerDown: mockOnPointerDown,
  onPointerMove: mockOnPointerMove,
  onPointerUp: mockOnPointerUp,
}

const defaultResizeValue = {
  containerRef: resizeContainerRef,
}

const defaultProps = {
  children: <div data-testid="child" />,
}

const renderContainer = (
  props = defaultProps,
  createValue = defaultCreateValue,
  resizeValue = defaultResizeValue,
) => render(
  <AreaCreateContext.Provider value={createValue}>
    <AreaResizeContext.Provider value={resizeValue}>
      <AreaSelectorContainer {...props} />
    </AreaResizeContext.Provider>
  </AreaCreateContext.Provider>,
)

beforeEach(() => {
  jest.clearAllMocks()
  createContainerRef.current = null
  resizeContainerRef.current = null
})

test('renders children inside container', () => {
  renderContainer()

  expect(screen.getByTestId('child')).toBeInTheDocument()
  expect(screen.getByTestId('area-selector-container')).toBeInTheDocument()
})

test('assigns container node to create and resize refs', () => {
  renderContainer()

  const container = screen.getByTestId('area-selector-container')

  expect(createContainerRef.current).toBe(container)
  expect(resizeContainerRef.current).toBe(container)
})

test('calls create pointer handlers when pointer events fire on container', () => {
  renderContainer()

  const container = screen.getByTestId('area-selector-container')

  fireEvent.pointerDown(container)
  fireEvent.pointerMove(container)
  fireEvent.pointerUp(container)

  expect(mockOnPointerDown).toHaveBeenCalledTimes(1)
  expect(mockOnPointerMove).toHaveBeenCalledTimes(1)
  expect(mockOnPointerUp).toHaveBeenCalledTimes(1)
})
