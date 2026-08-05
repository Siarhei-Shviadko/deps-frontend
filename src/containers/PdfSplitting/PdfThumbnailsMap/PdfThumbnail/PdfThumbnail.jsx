
import PropTypes from 'prop-types'
import { useMemo, useCallback } from 'react'
import { SlashedEyeIcon } from '@/components/Icons/SlashedEyeIcon'
import { usePdfSegments } from '@/containers/PdfSplitting/hooks'
import { PdfSegment, userPageShape } from '@/containers/PdfSplitting/models'
import { ComponentSize } from '@/enums/ComponentSize'
import { Localization, localize } from '@/localization/i18n'
import { Controls } from '../Controls'
import {
  BoundingBoxOverlay,
  PageNumberCorner,
  Thumbnail,
  ThumbnailContainer,
  ThumbnailWrapper,
  IconButton,
  StyledInView,
} from './PdfThumbnail.styles'

const THUMB_NAIL_WIDTH_PX = 110

export const PdfThumbnail = ({
  userPage,
  isActive,
  isSelected,
}) => {
  const {
    segments,
    setSegments,
    setActiveUserPage,
    setIsDraggable,
  } = usePdfSegments()

  const onClickHandler = () => {
    !userPage.isExcluded && setActiveUserPage(userPage)
  }

  const toggleThumbnail = useCallback((e) => {
    e.stopPropagation()

    const segment = segments.find((s) => s.userPages.includes(userPage))
    const newSegments = segments.map((s) => (
      s === segment
        ? PdfSegment.togglesExcluded(segment, userPage)
        : s
    ))

    setSegments(newSegments)
  }, [
    segments,
    setSegments,
    userPage,
  ])

  const enableDragging = useCallback(() => {
    setIsDraggable(true)
  }, [setIsDraggable])

  const ThumbnailControls = useMemo(() => {
    if (userPage.isExcluded) {
      return (
        <IconButton
          icon={<SlashedEyeIcon />}
          onClick={toggleThumbnail}
        />
      )
    }

    return (
      <Controls
        isVertical
        onEnableDragging={enableDragging}
        size={ComponentSize.SMALL}
        userPage={userPage}
        {...(PdfSegment.isPageDragDisabled(segments, userPage) && {
          disabledTooltip: localize(Localization.PAGE_CANNOT_BE_MOVED),
        })}
      />
    )
  }, [
    enableDragging,
    segments,
    toggleThumbnail,
    userPage,
  ])

  return (
    <StyledInView id={userPage.id}>
      <ThumbnailWrapper
        $isActive={isActive}
        $isExcluded={userPage.isExcluded}
        $isSelected={isSelected}
        onClick={onClickHandler}
      >
        {ThumbnailControls}
        <PageNumberCorner>{userPage.page + 1}</PageNumberCorner>
        <ThumbnailContainer>
          <Thumbnail
            pageIndex={userPage.page}
            width={THUMB_NAIL_WIDTH_PX}
          />
          {
            userPage.coordinates && (
              <BoundingBoxOverlay $coords={userPage.coordinates} />
            )
          }
        </ThumbnailContainer>
      </ThumbnailWrapper>
    </StyledInView>
  )
}

PdfThumbnail.propTypes = {
  userPage: userPageShape.isRequired,
  isActive: PropTypes.bool,
  isSelected: PropTypes.bool,
}
