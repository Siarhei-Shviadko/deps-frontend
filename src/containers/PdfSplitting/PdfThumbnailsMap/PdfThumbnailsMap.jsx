
import PropTypes from 'prop-types'
import { useCallback, Fragment } from 'react'
import { NoData } from '@/components/NoData'
import { Localization, localize } from '@/localization/i18n'
import { clone } from '@/utils/clone'
import { usePdfSegments, useUserPageDnD } from '../hooks'
import { PdfSegment } from '../models'
import { initPdfWorker } from './initPdfWorker'
import { PageViewer } from './PageViewer'
import { PdfThumbnail } from './PdfThumbnail'
import {
  Document,
  DraggableItem,
  ThumbnailsWrapper,
  Title,
  ContentWrapper,
} from './PdfThumbnailsMap.styles'
import { SegmentsSeparator } from './SegmentsSeparator'

initPdfWorker()

export const PdfThumbnailsMap = ({ pdfFile, withTitle, fillMissingPages }) => {
  const {
    segments,
    setSegments,
    setInitialSegment,
    activeUserPage,
    isDraggable,
    setIsDraggable,
  } = usePdfSegments()

  const { onUserPageDnD } = useUserPageDnD()

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    const segment = PdfSegment.fromPagesCount(numPages)
    !segments.length && setSegments([segment])
    fillMissingPages && setSegments(PdfSegment.withMissingPages(segments, numPages))
    setInitialSegment(clone(segment))
  }, [
    setSegments,
    segments,
    setInitialSegment,
    fillMissingPages,
  ],
  )

  const isActivePageViewer = activeUserPage !== null

  const onThumbnailDrop = () => {
    setIsDraggable(false)
  }

  const onThumbnailMove = useCallback((fromIndex, toIndex) => {
    onUserPageDnD(fromIndex, toIndex)
  }, [onUserPageDnD])

  return (
    <Document
      file={pdfFile}
      noData={<NoData />}
      onLoadSuccess={onDocumentLoadSuccess}
    >
      {
        withTitle && (
          <Title>
            {localize(Localization.PAGES_TO_SPLIT)}
          </Title>
        )
      }
      <ContentWrapper>
        {
          isActivePageViewer && (
            <PageViewer />
          )
        }
        <ThumbnailsWrapper $isActivePageViewer={isActivePageViewer}>
          {
            segments
              .reduce((acc, segment) => {
                const userPagesConfig = segment.userPages.map((uP) => ({
                  isSelected: segment.isSelected,
                  userPage: uP,
                }))

                return [...acc, ...userPagesConfig]
              }, [])
              .map(({ isSelected, userPage }, index) => (
                <Fragment key={userPage.id}>
                  {
                    index !== 0 && (
                      <SegmentsSeparator userPage={userPage} />
                    )
                  }
                  <DraggableItem
                    index={index}
                    isDraggable={isDraggable}
                    onDrop={onThumbnailDrop}
                    onMove={onThumbnailMove}
                  >
                    <PdfThumbnail
                      isActive={activeUserPage === userPage.page}
                      isSelected={isSelected}
                      userPage={userPage}
                    />
                  </DraggableItem>
                </Fragment>
              ))
          }
        </ThumbnailsWrapper>
      </ContentWrapper>
    </Document>
  )
}

PdfThumbnailsMap.propTypes = {
  pdfFile: PropTypes.instanceOf(Blob),
  withTitle: PropTypes.bool,
  fillMissingPages: PropTypes.bool,
}
