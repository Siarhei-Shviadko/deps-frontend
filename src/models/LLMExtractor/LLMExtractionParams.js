
import PropTypes from 'prop-types'
import { Localization, localize } from '@/localization/i18n'

class LLMExtractionParams {
  constructor ({
    customInstruction,
    groupingFactor,
    temperature,
    topP,
    pageSpan,
    contextAttachments,
    maxTokens,
    stop,
    seed,
    logprobs,
  }) {
    this.customInstruction = customInstruction
    this.groupingFactor = groupingFactor
    this.temperature = temperature
    this.topP = topP
    this.pageSpan = pageSpan
    this.contextAttachments = contextAttachments
    this.maxTokens = maxTokens
    this.stop = stop
    this.seed = seed
    this.logprobs = logprobs
  }
}

class LLMExtractorPageSpan {
  constructor ({ start, end }) {
    this.start = start
    this.end = end
  }
}

const llmExtractionPageSpanShape = PropTypes.shape({
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
})

const EXTRACTION_PARAMS_KEYS = {
  GROUPING_FACTOR: 'groupingFactor',
  TEMPERATURE: 'temperature',
  TOP_P: 'topP',
  PAGE_SPAN: 'pageSpan',
}

const EXTRACTION_PARAMS_KEYS_TO_LABELS = {
  [EXTRACTION_PARAMS_KEYS.GROUPING_FACTOR]: localize(Localization.GROUPING_FACTOR),
  [EXTRACTION_PARAMS_KEYS.TEMPERATURE]: localize(Localization.TEMPERATURE),
  [EXTRACTION_PARAMS_KEYS.TOP_P]: localize(Localization.TOP_P),
  [EXTRACTION_PARAMS_KEYS.PAGE_SPAN]: localize(Localization.PAGE_SPAN),
}

const llmExtractionParamsShape = PropTypes.shape({
  customInstruction: PropTypes.string,
  groupingFactor: PropTypes.number.isRequired,
  temperature: PropTypes.number.isRequired,
  topP: PropTypes.number.isRequired,
  pageSpan: llmExtractionPageSpanShape,
  contextAttachments: PropTypes.string,
  maxTokens: PropTypes.number,
  stop: PropTypes.arrayOf(PropTypes.string),
  seed: PropTypes.number,
  logprobs: PropTypes.bool,
})

export {
  LLMExtractionParams,
  EXTRACTION_PARAMS_KEYS,
  EXTRACTION_PARAMS_KEYS_TO_LABELS,
  llmExtractionParamsShape,
  LLMExtractorPageSpan,
  llmExtractionPageSpanShape,
}
