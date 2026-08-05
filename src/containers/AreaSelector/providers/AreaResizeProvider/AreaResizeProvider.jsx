import PropTypes from 'prop-types'
import {
  useRef,
  useMemo,
  createContext,
} from 'react'
import { useResizableOverlay } from '@/containers/AreaSelector/hooks'
import { boundingBoxShape } from '@/models/SplittingProposal'

export const AreaResizeContext = createContext({})

export const AreaResizeProvider = ({ coordinates, onChange, children }) => {
  const containerRef = useRef(null)

  const {
    workingCoords,
    startResize,
    resize,
    stopResize,
  } = useResizableOverlay(
    containerRef,
    coordinates,
    onChange,
  )

  const value = useMemo(() => ({
    coordinates,
    workingCoords,
    containerRef,
    startResize,
    resize,
    stopResize,
  }), [
    coordinates,
    workingCoords,
    startResize,
    resize,
    stopResize,
  ])

  return (
    <AreaResizeContext.Provider value={value}>
      {children}
    </AreaResizeContext.Provider>
  )
}

AreaResizeProvider.propTypes = {
  coordinates: boundingBoxShape,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}
