
import { useState, useCallback } from 'react'
import { Page } from 'react-pdf'
import { AreaSelector } from '@/containers/AreaSelector'
import { usePdfSegments } from '@/containers/PdfSplitting/hooks'
import { PdfSegment } from '@/containers/PdfSplitting/models'
import { Controls } from '../Controls'
import {
  Header,
  PageNumberCorner,
  PageWrapper,
} from './PageViewer.styles'

const MAX_SCALE = 3
const MIN_SCALE = 0.5
const SCALE_STEP = 0.1

export const PageViewer = () => {
  const [scale, setScale] = useState(1)

  const {
    activeUserPage,
    allowAreaSelection,
    segments,
    setSegments,
    updateActiveUserPage,
  } = usePdfSegments()

  const handleCoordinatesChange = useCallback((coordinates) => {
    const updatedSegments = PdfSegment.setUserPageCoordinates(segments, activeUserPage, coordinates)
    setSegments(updatedSegments)
    updateActiveUserPage(updatedSegments.flatMap((s) => s.userPages))
  }, [segments, activeUserPage, setSegments, updateActiveUserPage])

  const onWheelHandler = (e) => {
    if (!e.altKey) {
      return
    }

    if (e.deltaY > 0) {
      setScale((prevScale) => Math.min(prevScale + SCALE_STEP, MAX_SCALE))
    }

    if (e.deltaY < 0) {
      setScale((prevScale) => Math.max(prevScale - SCALE_STEP, MIN_SCALE))
    }
  }

  return (
    <AreaSelector.Provider
      key={activeUserPage.id}
      coordinates={activeUserPage.coordinates}
      onChange={handleCoordinatesChange}
    >
      <Header>
        <PageNumberCorner>{activeUserPage.page + 1}</PageNumberCorner>
        <Controls
          closable
          showAreaControls={allowAreaSelection}
          userPage={activeUserPage}
        />
      </Header>
      <PageWrapper onWheel={onWheelHandler}>
        <AreaSelector.Container>
          <Page
            pageIndex={activeUserPage.page}
            renderAnnotationLayer={false}
            renderForms={false}
            renderTextLayer={false}
            scale={scale}
          />
          <AreaSelector.Overlay />
        </AreaSelector.Container>
      </PageWrapper>
    </AreaSelector.Provider>
  )
}
