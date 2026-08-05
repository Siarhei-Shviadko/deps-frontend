import { useState, useCallback } from 'react'
import {
  FULL_WIDTH_COORDS,
  MIN_HEIGHT,
  PAGE_BOTTOM,
  PAGE_TOP,
} from '@/containers/AreaSelector/constants'
import { clamp, getNormalizedY } from '@/containers/AreaSelector/utils'

export const useCreateArea = (containerRef, onChange) => {
  const [isCreating, setIsCreating] = useState(false)
  const [drawStartY, setDrawStartY] = useState(null)
  const [previewCoords, setPreviewCoords] = useState(null)

  const startCreating = useCallback(() => {
    setIsCreating(true)
  }, [])

  const onPointerDown = useCallback((e) => {
    if (!isCreating || !containerRef.current) {
      return
    }

    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)

    const y = clamp(getNormalizedY(e.clientY, containerRef.current), PAGE_TOP, PAGE_BOTTOM)

    setDrawStartY(y)
    setPreviewCoords({
      ...FULL_WIDTH_COORDS,
      y,
      height: 0,
    })
  }, [isCreating, containerRef])

  const onPointerMove = useCallback((e) => {
    if (!isCreating || drawStartY === null || !containerRef.current) {
      return
    }

    if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
      return
    }

    e.preventDefault()

    const currentY = clamp(getNormalizedY(e.clientY, containerRef.current), PAGE_TOP, PAGE_BOTTOM)

    setPreviewCoords({
      ...FULL_WIDTH_COORDS,
      y: Math.min(drawStartY, currentY),
      height: Math.abs(currentY - drawStartY),
    })
  }, [isCreating, drawStartY, containerRef])

  const onPointerUp = useCallback((e) => {
    if (!isCreating || drawStartY === null) {
      return
    }

    if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
      return
    }

    e.currentTarget.releasePointerCapture(e.pointerId)

    if (previewCoords && previewCoords.height >= MIN_HEIGHT) {
      onChange(previewCoords)
    }

    setPreviewCoords(null)
    setIsCreating(false)
    setDrawStartY(null)
  }, [isCreating, drawStartY, previewCoords, onChange])

  return {
    isCreating,
    previewCoords,
    startCreating,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}
