import { Fragment } from 'react'
import { Localization, localize } from '@/localization/i18n'
import {
  EXTRACTION_PARAMS_KEYS,
  EXTRACTION_PARAMS_KEYS_TO_LABELS,
} from '@/models/LLMExtractor'
import { ExtractionParam, VerticalDivider } from './LLMExtractorCard.styles'

const formatPageRange = (range) => {
  if (!range) {
    return localize(Localization.ALL_PAGES)
  }

  return `${range.start} — ${range.end}`
}

export const getExtractionParameter = (code, value, showDivider = true) => {
  const displayedValue = code === EXTRACTION_PARAMS_KEYS.PAGE_SPAN
    ? formatPageRange(value)
    : value

  if (displayedValue == null) {
    return null
  }

  return (
    <Fragment key={code}>
      <ExtractionParam>
        {EXTRACTION_PARAMS_KEYS_TO_LABELS[code]}
        <span>{displayedValue}</span>
      </ExtractionParam>
      { showDivider && <VerticalDivider /> }
    </Fragment>
  )
}
