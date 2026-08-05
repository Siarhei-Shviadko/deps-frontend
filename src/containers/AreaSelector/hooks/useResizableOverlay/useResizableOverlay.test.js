import { mockEnv } from '@/mocks/mockEnv'
import { act, renderHook } from '@testing-library/react-hooks'
import { RESIZE_EDGE } from '../../constants'
import { useResizableOverlay } from './useResizableOverlay'

jest.mock('@/utils/env', () => mockEnv)

const mockOnChange = jest.fn()

const mockCoordinates = {
  x: 0,
  y: 0.2,
  width: 1,
  height: 0.4,
}

const createContainerRef = () => {
  const element = document.createElement('div')

  element.getBoundingClientRect = jest.fn(() => ({
    top: 0,
    left: 0,
    height: 100,
    width: 100,
    bottom: 100,
    right: 100,
  }))

  return { current: element }
}

const createPointerTarget = () => {
  const target = {
    capturedPointerId: null,
    setPointerCapture: jest.fn(function setPointerCapture (pointerId) {
      this.capturedPointerId = pointerId
    }),
    hasPointerCapture: jest.fn(function hasPointerCapture (pointerId) {
      return this.capturedPointerId === pointerId
    }),
    releasePointerCapture: jest.fn(function releasePointerCapture (pointerId) {
      if (this.capturedPointerId === pointerId) {
        this.capturedPointerId = null
      }
    }),
  }

  return target
}

const createPointerEvent = (target, overrides = {}) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  pointerId: 1,
  clientY: 0,
  currentTarget: target,
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
})

test('returns initial working coordinates from coordinates param', () => {
  const { result } = renderHook(() => useResizableOverlay(createContainerRef(), mockCoordinates, mockOnChange))

  expect(result.current.workingCoords).toEqual(mockCoordinates)
})

test('updates working coordinates when resizing top edge after pointer capture', () => {
  const containerRef = createContainerRef()
  const target = createPointerTarget()
  const { result } = renderHook(() => useResizableOverlay(containerRef, mockCoordinates, mockOnChange))

  act(() => {
    result.current.startResize(createPointerEvent(target))
  })

  act(() => {
    result.current.resize(createPointerEvent(target, { clientY: 10 }), RESIZE_EDGE.TOP)
  })

  expect(result.current.workingCoords).toEqual({
    x: 0,
    y: 0.1,
    width: 1,
    height: expect.closeTo(0.5),
  })
})

test('updates working coordinates when resizing bottom edge after pointer capture', () => {
  const containerRef = createContainerRef()
  const target = createPointerTarget()
  const { result } = renderHook(() => useResizableOverlay(containerRef, mockCoordinates, mockOnChange))

  act(() => {
    result.current.startResize(createPointerEvent(target))
  })

  act(() => {
    result.current.resize(createPointerEvent(target, { clientY: 80 }), RESIZE_EDGE.BOTTOM)
  })

  expect(result.current.workingCoords).toEqual({
    x: 0,
    y: 0.2,
    width: 1,
    height: expect.closeTo(0.6),
  })
})

test('does not update working coordinates when pointer is not captured', () => {
  const containerRef = createContainerRef()
  const target = createPointerTarget()
  const { result } = renderHook(() => useResizableOverlay(containerRef, mockCoordinates, mockOnChange))

  act(() => {
    result.current.resize(createPointerEvent(target, { clientY: 10 }), RESIZE_EDGE.TOP)
  })

  expect(result.current.workingCoords).toEqual(mockCoordinates)
})

test('calls onChange with updated coordinates when resize stops', () => {
  const containerRef = createContainerRef()
  const target = createPointerTarget()
  const { result } = renderHook(() => useResizableOverlay(containerRef, mockCoordinates, mockOnChange))

  act(() => {
    result.current.startResize(createPointerEvent(target))
  })

  act(() => {
    result.current.resize(createPointerEvent(target, { clientY: 10 }), RESIZE_EDGE.TOP)
  })

  act(() => {
    result.current.stopResize(createPointerEvent(target))
  })

  expect(target.releasePointerCapture).toHaveBeenCalledTimes(1)
  expect(target.releasePointerCapture).toHaveBeenNthCalledWith(1, 1)
  expect(mockOnChange).toHaveBeenCalledTimes(1)
  expect(mockOnChange).toHaveBeenNthCalledWith(1, {
    x: 0,
    y: 0.1,
    width: 1,
    height: expect.closeTo(0.5),
  })
})

test('does not call onChange when pointer is not captured on stop', () => {
  const containerRef = createContainerRef()
  const target = createPointerTarget()
  const { result } = renderHook(() => useResizableOverlay(containerRef, mockCoordinates, mockOnChange))

  act(() => {
    result.current.stopResize(createPointerEvent(target))
  })

  expect(mockOnChange).not.toHaveBeenCalled()
})
