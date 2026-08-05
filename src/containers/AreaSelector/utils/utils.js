import {
  FULL_WIDTH_COORDS,
  MIN_HEIGHT,
  PAGE_BOTTOM,
  PAGE_TOP,
  RESIZE_EDGE,
} from '@/containers/AreaSelector/constants'

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export const getNormalizedY = (clientY, container) => {
  const { top, height } = container.getBoundingClientRect()
  return (clientY - top) / height
}

export const resizeVertical = (edge, normalizedY, coords) => {
  const { y, height } = coords
  const bottom = y + height

  if (edge === RESIZE_EDGE.TOP) {
    const newTop = clamp(normalizedY, PAGE_TOP, bottom - MIN_HEIGHT)
    return {
      ...FULL_WIDTH_COORDS,
      y: newTop,
      height: bottom - newTop,
    }
  }

  const newBottom = clamp(normalizedY, y + MIN_HEIGHT, PAGE_BOTTOM)

  return {
    ...FULL_WIDTH_COORDS,
    y,
    height: newBottom - y,
  }
}
