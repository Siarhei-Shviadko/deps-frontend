import PropTypes from 'prop-types'
import {
  useRef,
  useCallback,
  useMemo,
  createContext,
} from 'react'
import { useCreateArea } from '@/containers/AreaSelector/hooks'

export const AreaCreateContext = createContext({})

export const AreaCreateProvider = ({ onChange, children }) => {
  const containerRef = useRef(null)

  const {
    isCreating,
    previewCoords,
    startCreating,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } = useCreateArea(
    containerRef,
    onChange,
  )

  const deleteArea = useCallback(() => {
    onChange(null)
  }, [onChange])

  const value = useMemo(() => ({
    isCreating,
    previewCoords,
    containerRef,
    startCreating,
    deleteArea,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }), [
    isCreating,
    previewCoords,
    startCreating,
    deleteArea,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  ])

  return (
    <AreaCreateContext.Provider value={value}>
      {children}
    </AreaCreateContext.Provider>
  )
}

AreaCreateProvider.propTypes = {
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}
