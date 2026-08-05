
import PropTypes from 'prop-types'
import { NoData } from '@/components/NoData'
import { DOCUMENT_LAYOUT_FEATURE, DOCUMENT_LAYOUT_PARSING_TYPE } from '@/enums/DocumentLayoutType'
import { Localization, localize } from '@/localization/i18n'
import { usePaginatedLayout } from '../hooks'
import { LocalErrorBoundary } from '../LocalErrorBoundary'
import { ParagraphField } from './ParagraphField'
import { Spinner } from './ParagraphLayout.styles'

const ParagraphLayout = ({ batchIndex, parsingType }) => {
  const { layoutData, isFetching } = usePaginatedLayout({
    batchIndex,
    parsingFeature: DOCUMENT_LAYOUT_FEATURE.TEXT,
    parsingType,
  })

  if (isFetching) {
    return <Spinner spinning />
  }

  if (!layoutData.length) {
    return <NoData description={localize(Localization.NO_DATA)} />
  }

  return layoutData.map(({ page, pageId, layout }, index) => (
    <LocalErrorBoundary key={index}>
      <ParagraphField
        page={page}
        pageId={pageId}
        paragraph={layout}
        parsingType={parsingType}
      />
    </LocalErrorBoundary>
  ))
}

ParagraphLayout.propTypes = {
  batchIndex: PropTypes.number.isRequired,
  parsingType: PropTypes.oneOf(
    Object.values(DOCUMENT_LAYOUT_PARSING_TYPE),
  ).isRequired,
}

export { ParagraphLayout }
