
import PropTypes from 'prop-types'
import {
  useEffect,
  useState,
} from 'react'
import { NoData } from '@/components/NoData'
import { useHighlightCoords } from '@/containers/ParsingLayout/EntityLayout/hooks'
import { DOCUMENT_LAYOUT_FEATURE, DOCUMENT_LAYOUT_PARSING_TYPE } from '@/enums/DocumentLayoutType'
import { Localization, localize } from '@/localization/i18n'
import { usePaginatedLayout } from '../hooks'
import { LocalErrorBoundary } from '../LocalErrorBoundary'
import { ImageField } from './ImageField'
import { ImagesFieldContainer, Spinner } from './ImageLayout.styles'

const ImageLayout = ({ batchIndex, parsingType }) => {
  const [expandedImageId, setExpandedImageId] = useState(null)

  const { highlightCoords, unhighlightCoords } = useHighlightCoords()

  const { layoutData, isFetching } = usePaginatedLayout({
    batchIndex,
    parsingFeature: DOCUMENT_LAYOUT_FEATURE.IMAGES,
    parsingType,
  })

  useEffect(() => {
    setExpandedImageId(null)
    unhighlightCoords()
  }, [batchIndex, unhighlightCoords])

  const highlightImageCoords = (polygon, page) => {
    highlightCoords({
      field: [polygon],
      page,
    })
  }

  const handleImageClick = (imageId, polygon, page) => {
    const newExpandedId = expandedImageId === imageId ? null : imageId
    const shouldExpand = newExpandedId === imageId

    setExpandedImageId(newExpandedId)
    shouldExpand ? highlightImageCoords(polygon, page) : unhighlightCoords()
  }

  if (isFetching) {
    return <Spinner spinning />
  }

  if (!layoutData.length) {
    return <NoData description={localize(Localization.NO_DATA)} />
  }

  return (
    <ImagesFieldContainer>
      {
        layoutData.map(({ page, pageId, layout }) => {
          const { id, polygon } = layout
          return (
            <LocalErrorBoundary key={id}>
              <ImageField
                imageLayout={layout}
                isExpanded={expandedImageId === id}
                onClick={() => handleImageClick(id, polygon, page)}
                pageId={pageId}
                parsingType={parsingType}
              />
            </LocalErrorBoundary>
          )
        })
      }
    </ImagesFieldContainer>
  )
}

ImageLayout.propTypes = {
  batchIndex: PropTypes.number.isRequired,
  parsingType: PropTypes.oneOf(
    Object.values(DOCUMENT_LAYOUT_PARSING_TYPE),
  ).isRequired,
}

export { ImageLayout }
