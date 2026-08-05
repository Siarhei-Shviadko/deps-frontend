import { mockEnv } from '@/mocks/mockEnv'
import {
  FULL_WIDTH_COORDS,
  MIN_HEIGHT,
  PAGE_BOTTOM,
  PAGE_TOP,
  RESIZE_EDGE,
} from '../constants'
import { clamp, getNormalizedY, resizeVertical } from './utils'

jest.mock('@/utils/env', () => mockEnv)

const mockCoords = {
  x: 0,
  y: 0.2,
  width: 1,
  height: 0.4,
}

test('clamps value to min when value is below min', () => {
  expect(clamp(-1, 0, 1)).toBe(0)
})

test('clamps value to max when value is above max', () => {
  expect(clamp(2, 0, 1)).toBe(1)
})

test('returns value when value is within min and max', () => {
  expect(clamp(0.5, 0, 1)).toBe(0.5)
})

test('returns normalized Y relative to container bounds', () => {
  const container = {
    getBoundingClientRect: () => ({
      top: 100,
      height: 200,
    }),
  }

  expect(getNormalizedY(150, container)).toBe(0.25)
})

test('resizes top edge and keeps full width coordinates', () => {
  const result = resizeVertical(RESIZE_EDGE.TOP, 0.1, mockCoords)

  expect(result).toEqual({
    ...FULL_WIDTH_COORDS,
    y: 0.1,
    height: expect.closeTo(0.5),
  })
})

test('clamps top edge above page top', () => {
  const result = resizeVertical(RESIZE_EDGE.TOP, -0.5, mockCoords)

  expect(result).toEqual({
    ...FULL_WIDTH_COORDS,
    y: PAGE_TOP,
    height: expect.closeTo(0.6),
  })
})

test('clamps top edge below bottom minus min height', () => {
  const result = resizeVertical(RESIZE_EDGE.TOP, 0.9, mockCoords)

  expect(result).toEqual({
    ...FULL_WIDTH_COORDS,
    y: expect.closeTo(0.6 - MIN_HEIGHT),
    height: expect.closeTo(MIN_HEIGHT),
  })
})

test('resizes bottom edge and keeps full width coordinates', () => {
  const result = resizeVertical(RESIZE_EDGE.BOTTOM, 0.8, mockCoords)

  expect(result).toEqual({
    ...FULL_WIDTH_COORDS,
    y: 0.2,
    height: expect.closeTo(0.6),
  })
})

test('clamps bottom edge below page bottom', () => {
  const result = resizeVertical(RESIZE_EDGE.BOTTOM, 1.5, mockCoords)

  expect(result).toEqual({
    ...FULL_WIDTH_COORDS,
    y: 0.2,
    height: expect.closeTo(PAGE_BOTTOM - 0.2),
  })
})

test('clamps bottom edge above top plus min height', () => {
  const result = resizeVertical(RESIZE_EDGE.BOTTOM, 0, mockCoords)

  expect(result).toEqual({
    ...FULL_WIDTH_COORDS,
    y: 0.2,
    height: expect.closeTo(MIN_HEIGHT),
  })
})
