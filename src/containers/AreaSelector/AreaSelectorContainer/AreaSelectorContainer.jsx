import PropTypes from 'prop-types'
import { useCallback } from 'react'
import { useAreaCreate, useAreaResize } from '../hooks'
import { Container } from './AreaSelectorContainer.styles'

export const AreaSelectorContainer = ({ children, className }) => {
  const {
    containerRef,
    isCreating,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } = useAreaCreate()

  const { containerRef: resizeContainerRef } = useAreaResize()

  const setContainerRef = useCallback((node) => {
    containerRef.current = node
    resizeContainerRef.current = node
  }, [containerRef, resizeContainerRef])

  return (
    <Container
      ref={setContainerRef}
      $isCreating={isCreating}
      className={className}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {children}
    </Container>
  )
}

AreaSelectorContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}
