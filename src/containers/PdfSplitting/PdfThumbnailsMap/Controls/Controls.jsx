
import PropTypes from 'prop-types'
import { useMemo, useCallback } from 'react'
import { AlternativeArrowsIcon } from '@/components/Icons/AlternativeArrowsIcon'
import { CopyIcon } from '@/components/Icons/CopyIcon'
import { OpenedEyeIcon } from '@/components/Icons/OpenedEyeIcon'
import { PenToSquareIcon } from '@/components/Icons/PenToSquareIcon'
import { TrashIcon } from '@/components/Icons/TrashIcon'
import { XMarkIcon } from '@/components/Icons/XMarkIcon'
import { useAreaCreate } from '@/containers/AreaSelector'
import { usePdfSegments } from '@/containers/PdfSplitting/hooks'
import { PdfSegment, userPageShape } from '@/containers/PdfSplitting/models'
import { ComponentSize } from '@/enums/ComponentSize'
import { Localization, localize } from '@/localization/i18n'
import { StyledCommandBar, StyledIconButton } from './Controls.styles'

export const Controls = ({
  isVertical,
  size = ComponentSize.DEFAULT,
  userPage,
  closable,
  showAreaControls,
  onEnableDragging,
  disabledTooltip,
}) => {
  const {
    segments,
    setSegments,
    setActiveUserPage,
  } = usePdfSegments()

  const {
    isCreating,
    startCreating,
    deleteArea,
  } = useAreaCreate()

  const duplicateThumbnail = useCallback((e) => {
    e.stopPropagation()

    const segment = segments.find((s) => s.userPages.includes(userPage))
    const newSegments = segments.map((s) => (
      s === segment
        ? PdfSegment.duplicate(segment, userPage)
        : s
    ))

    setSegments(newSegments)
  }, [
    segments,
    setSegments,
    userPage,
  ])

  const clearActiveUserPage = useCallback(() => {
    setActiveUserPage(null)
  }, [setActiveUserPage])

  const toggleThumbnail = useCallback((e) => {
    e.stopPropagation()

    const segment = segments.find((s) => s.userPages.includes(userPage))

    const newSegments = segments.map((s) => (
      s === segment
        ? PdfSegment.togglesExcluded(segment, userPage)
        : s
    ))

    setSegments(newSegments)
    setActiveUserPage(null)
  }, [
    segments,
    setActiveUserPage,
    setSegments,
    userPage,
  ])

  const onClickStub = (e) => {
    e.stopPropagation()
  }

  const commands = useMemo(() => [
    ...(onEnableDragging ? [{
      renderComponent: () => (
        <StyledIconButton
          $size={size}
          disabled={!!disabledTooltip}
          icon={<AlternativeArrowsIcon />}
          onClick={onClickStub}
          onMouseDown={onEnableDragging}
          {...(disabledTooltip && {
            tooltip: {
              title: disabledTooltip,
            },
          })}
        />
      ),
    }] : []),
    {
      renderComponent: () => {
        const isDisabled = PdfSegment.isPageExcludeDisabled(segments, userPage)

        return (
          <StyledIconButton
            $size={size}
            disabled={isDisabled}
            icon={<OpenedEyeIcon />}
            onClick={toggleThumbnail}
            {...(isDisabled && {
              tooltip: {
                title: localize(Localization.PAGE_CANNOT_BE_EXCLUDED),
              },
            })}
          />
        )
      },
    },
    {
      renderComponent: () => (
        <StyledIconButton
          $size={size}
          icon={<CopyIcon />}
          onClick={duplicateThumbnail}
        />
      ),
    },
    ...(showAreaControls && !userPage.coordinates && !isCreating ? [{
      renderComponent: () => (
        <StyledIconButton
          $size={size}
          icon={<PenToSquareIcon />}
          onClick={startCreating}
          tooltip={{ title: localize(Localization.SELECT_AREA) }}
        />
      ),
    }] : []),
    ...(showAreaControls && userPage.coordinates ? [{
      renderComponent: () => (
        <StyledIconButton
          $size={size}
          icon={<TrashIcon />}
          onClick={deleteArea}
          tooltip={{ title: localize(Localization.DELETE_AREA) }}
        />
      ),
    }] : []),
    ...(closable ? [{
      renderComponent: () => (
        <StyledIconButton
          $size={size}
          icon={<XMarkIcon />}
          onClick={clearActiveUserPage}
        />
      ),
    }] : []),
  ], [
    onEnableDragging,
    isCreating,
    startCreating,
    deleteArea,
    closable,
    showAreaControls,
    size,
    disabledTooltip,
    segments,
    userPage,
    toggleThumbnail,
    duplicateThumbnail,
    clearActiveUserPage,
  ])

  return (
    <StyledCommandBar
      $isVertical={isVertical}
      $size={size}
      commands={commands}
    />
  )
}

Controls.propTypes = {
  closable: PropTypes.bool,
  onEnableDragging: PropTypes.func,
  showAreaControls: PropTypes.bool,
  userPage: userPageShape.isRequired,
  isVertical: PropTypes.bool,
  size: PropTypes.oneOf([
    ComponentSize.SMALL,
    ComponentSize.DEFAULT,
  ]),
  disabledTooltip: PropTypes.string,
}
