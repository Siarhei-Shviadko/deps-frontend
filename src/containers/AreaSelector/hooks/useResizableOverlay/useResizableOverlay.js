import { useState, useCallback, useEffect, useRef } from 'react'
import { getNormalizedY, resizeVertical } from '@/containers/AreaSelector/utils'

export const useResizableOverlay = (containerRef, coordinates, onChange) => {
  const [workingCoords, setWorkingCoords] = useState(coordinates)
  const workingCoordsRef = useRef(workingCoords)

  useEffect(() => {
    setWorkingCoords(coordinates)
    workingCoordsRef.current = coordinates
  }, [coordinates])

  const startResize = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const resize = useCallback((e, edge) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId) || !containerRef.current) {
      return
    }

    const normalizedY = getNormalizedY(e.clientY, containerRef.current)

    setWorkingCoords((coords) => {
      const next = coords ? resizeVertical(edge, normalizedY, coords) : coords
      workingCoordsRef.current = next

      return next
    })
  }, [containerRef])

  const stopResize = useCallback((e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
      return
    }

    e.currentTarget.releasePointerCapture(e.pointerId)

    if (workingCoordsRef.current) {
      onChange(workingCoordsRef.current)
    }
  }, [onChange])

  return {
    workingCoords,
    startResize,
    resize,
    stopResize,
  }
}
