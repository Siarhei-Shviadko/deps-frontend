
import { Localization, localize } from '@/localization/i18n'

export const ExtractorSettings = {
  MODEL: 'model',
  TEMPERATURE: 'temperature',
  GROUPING_FACTOR: 'groupingFactor',
  PAGE_SPAN: 'pageSpan',
  TOP_P: 'topP',
  MAX_TOKENS: 'maxTokens',
  CONTEXT_ATTACHMENTS: 'contextAttachments',
  LOGPROBS: 'logprobs',
  SEED: 'seed',
  STOP: 'stop',
  CUSTOM_INSTRUCTION: 'customInstruction',
}

export const EXTRACTOR_SETTINGS_TO_LABEL = {
  [ExtractorSettings.MODEL]: localize(Localization.LLM_MODEL),
  [ExtractorSettings.TEMPERATURE]: localize(Localization.TEMPERATURE),
  [ExtractorSettings.GROUPING_FACTOR]: localize(Localization.GROUPING_FACTOR),
  [ExtractorSettings.PAGE_SPAN]: localize(Localization.PAGE_SPAN),
  [ExtractorSettings.TOP_P]: localize(Localization.TOP_P),
  [ExtractorSettings.MAX_TOKENS]: localize(Localization.MAX_TOKENS),
  [ExtractorSettings.CONTEXT_ATTACHMENTS]: localize(Localization.CONTEXT_FOR_EXTRACTION),
  [ExtractorSettings.LOGPROBS]: localize(Localization.LOG_PROBS),
  [ExtractorSettings.SEED]: localize(Localization.SEED),
  [ExtractorSettings.STOP]: localize(Localization.STOP_WORDS),
  [ExtractorSettings.CUSTOM_INSTRUCTION]: localize(Localization.CUSTOM_INSTRUCTION),
}

export const EMPTY_VALUE = '-'
