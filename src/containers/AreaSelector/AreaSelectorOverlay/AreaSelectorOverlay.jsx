import { RESIZE_EDGE } from '../constants'
import { useAreaCreate, useAreaResize } from '../hooks'
import { DrawingOverlay, Handle, Overlay } from './AreaSelectorOverlay.styles'

const RESIZE_EDGES = [RESIZE_EDGE.TOP, RESIZE_EDGE.BOTTOM]

export const AreaSelectorOverlay = () => {
  const { previewCoords } = useAreaCreate()

  const {
    workingCoords,
    startResize,
    resize,
    stopResize,
  } = useAreaResize()

  if (previewCoords) {
    return <DrawingOverlay $coords={previewCoords} />
  }

  if (!workingCoords) {
    return null
  }

  const handlePointerMove = (edge) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    resize(e, edge)
  }

  return (
    <Overlay $coords={workingCoords}>
      {
        RESIZE_EDGES.map((edge) => (
          <Handle
            key={edge}
            $position={edge}
            onPointerDown={startResize}
            onPointerMove={handlePointerMove(edge)}
            onPointerUp={stopResize}
          />
        ))
      }
    </Overlay>
  )
}
