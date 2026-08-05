
import PropTypes from 'prop-types'
import { NoData } from '@/components/NoData'
import { DOCUMENT_LAYOUT_FEATURE, DOCUMENT_LAYOUT_PARSING_TYPE } from '@/enums/DocumentLayoutType'
import { Localization, localize } from '@/localization/i18n'
import { usePaginatedLayout } from '../hooks'
import { LocalErrorBoundary } from '../LocalErrorBoundary'
import { KeyValuePairField } from './KeyValuePairField'
import { Spinner, Wrapper } from './KeyValuePairLayout.styles'

const KeyValuePairLayout = ({ batchIndex, parsingType }) => {
  const { layoutData, isFetching } = usePaginatedLayout({
    batchIndex,
    parsingFeature: DOCUMENT_LAYOUT_FEATURE.KEY_VALUE_PAIRS,
    parsingType,
  })

  if (isFetching) {
    return <Spinner spinning />
  }

  if (!layoutData.length) {
    return <NoData description={localize(Localization.NO_DATA)} />
  }

  return (
    <Wrapper>
      {
        layoutData.map(({ page, pageId, layout }, index) => (
          <LocalErrorBoundary key={index}>
            <KeyValuePairField
              keyData={layout.key}
              keyValuePairId={layout.id}
              page={page}
              pageId={pageId}
              parsingType={parsingType}
              valueData={layout.value}
            />
          </LocalErrorBoundary>
        ))
      }
    </Wrapper>
  )
}

KeyValuePairLayout.propTypes = {
  batchIndex: PropTypes.number.isRequired,
  parsingType: PropTypes.oneOf(
    Object.values(DOCUMENT_LAYOUT_PARSING_TYPE),
  ).isRequired,
}

export {
  KeyValuePairLayout,
}
