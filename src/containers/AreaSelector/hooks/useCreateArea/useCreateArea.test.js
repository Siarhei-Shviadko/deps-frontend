import { mockEnv } from '@/mocks/mockEnv'
import { act, renderHook } from '@testing-library/react-hooks'
import { FULL_WIDTH_COORDS, MIN_HEIGHT } from '../../constants'
import { useCreateArea } from './useCreateArea'

jest.mock('@/utils/env', () => mockEnv)

const mockOnChange = jest.fn()

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

test('returns initial creating state as false', () => {
  const { result } = renderHook(() => useCreateArea(createContainerRef(), mockOnChange))

  expect(result.current.isCreating).toBe(false)
  expect(result.current.previewCoords).toBeNull()
})

test('sets isCreating to true when startCreating is called', () => {
  const { result } = renderHook(() => useCreateArea(createContainerRef(), mockOnChange))

  act(() => {
    result.current.startCreating()
  })

  expect(result.current.isCreating).toBe(true)
})

test('does not start drawing when isCreating is false', () => {
  const containerRef = createContainerRef()
  const target = createPointerTarget()
  const { result } = renderHook(() => useCreateArea(containerRef, mockOnChange))

  act(() => {
    result.current.onPointerDown(createPointerEvent(target, { clientY: 20 }))
  })

  expect(result.current.previewCoords).toBeNull()
  expect(target.setPointerCapture).not.toHaveBeenCalled()
})

test('sets preview coordinates when pointer down after startCreating', () => {
  const containerRef = createContainerRef()
  const target = createPointerTarget()
  const { result } = renderHook(() => useCreateArea(containerRef, mockOnChange))

  act(() => {
    result.current.startCreating()
  })

  act(() => {
    result.current.onPointerDown(createPointerEvent(target, { clientY: 20 }))
  })

  expect(target.setPointerCapture).toHaveBeenCalledTimes(1)
  expect(result.current.previewCoords).toEqual({
    ...FULL_WIDTH_COORDS,
    y: 0.2,
    height: 0,
  })
})

test('updates preview height when pointer moves after capture', () => {
  const containerRef = createContainerRef()
  const target = createPointerTarget()
  const { result } = renderHook(() => useCreateArea(containerRef, mockOnChange))

  act(() => {
    result.current.startCreating()
  })

  act(() => {
    result.current.onPointerDown(createPointerEvent(target, { clientY: 20 }))
  })

  act(() => {
    result.current.onPointerMove(createPointerEvent(target, { clientY: 70 }))
  })

  expect(result.current.previewCoords).toEqual({
    ...FULL_WIDTH_COORDS,
    y: 0.2,
    height: expect.closeTo(0.5),
  })
})

test('calls onChange and resets state when pointer up with height above min', () => {
  const containerRef = createContainerRef()
  const target = createPointerTarget()
  const { result } = renderHook(() => useCreateArea(containerRef, mockOnChange))

  act(() => {
    result.current.startCreating()
  })

  act(() => {
    result.current.onPointerDown(createPointerEvent(target, { clientY: 20 }))
  })

  act(() => {
    result.current.onPointerMove(createPointerEvent(target, { clientY: 70 }))
  })

  act(() => {
    result.current.onPointerUp(createPointerEvent(target))
  })

  expect(mockOnChange).toHaveBeenCalledTimes(1)
  expect(mockOnChange).toHaveBeenNthCalledWith(1, {
    ...FULL_WIDTH_COORDS,
    y: 0.2,
    height: expect.closeTo(0.5),
  })
  expect(result.current.previewCoords).toBeNull()
  expect(result.current.isCreating).toBe(false)
})

test('does not call onChange when pointer up with height below min', () => {
  const containerRef = createContainerRef()
  const target = createPointerTarget()
  const { result } = renderHook(() => useCreateArea(containerRef, mockOnChange))

  act(() => {
    result.current.startCreating()
  })

  act(() => {
    result.current.onPointerDown(createPointerEvent(target, { clientY: 20 }))
  })

  act(() => {
    result.current.onPointerMove(createPointerEvent(target, {
      clientY: 20 + (MIN_HEIGHT * 100) / 2,
    }))
  })

  act(() => {
    result.current.onPointerUp(createPointerEvent(target))
  })

  expect(mockOnChange).not.toHaveBeenCalled()
  expect(result.current.isCreating).toBe(false)
  expect(result.current.previewCoords).toBeNull()
})
