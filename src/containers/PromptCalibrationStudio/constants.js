
import { RadioOption } from '@/components/Radio/RadioOption'
import { Localization, localize } from '@/localization/i18n'
import { ENV } from '@/utils/env'
import { Extractor } from './viewModels'

export const CALIBRATION_MODE = {
  BASE: 'base',
  ADVANCED: 'advanced',
}

export const CheckmarkOption = {
  [localize(Localization.TRUE)]: true,
  [localize(Localization.FALSE)]: false,
}

export const RadioGroupOptions = Object.entries(CheckmarkOption).map(([text, val]) => (
  new RadioOption({
    value: val,
    text,
  })),
)

const DEFAULT_CONTEXT_ATTACHMENTS = ''
const DEFAULT_MAX_TOKENS = 4096
const DEFAULT_SEED = 1
const DEFAULT_LOGPROBS = false
const DEFAULT_STOP = []
const DEFAULT_GROUPING_FACTOR = 5
const DEFAULT_TEMPERATURE = 1
const DEFAULT_TOP_P = 1

export const DEFAULT_EXTRACTOR = new Extractor({
  id: 'default',
  customInstruction: localize(Localization.LLM_MODEL_CUSTOM_INSTRUCTION),
  groupingFactor: ENV.FEATURE_PROMPT_CALIBRATION_STUDIO_GROUPING_FACTOR ?? DEFAULT_GROUPING_FACTOR,
  model: ENV.FEATURE_PROMPT_CALIBRATION_STUDIO_MODEL,
  name: localize(Localization.DEFAULT),
  temperature: ENV.FEATURE_PROMPT_CALIBRATION_STUDIO_TEMPERATURE ?? DEFAULT_TEMPERATURE,
  topP: ENV.FEATURE_PROMPT_CALIBRATION_STUDIO_TOP_P ?? DEFAULT_TOP_P,
  stop: DEFAULT_STOP,
  contextAttachments: DEFAULT_CONTEXT_ATTACHMENTS,
  maxTokens: ENV.FEATURE_PROMPT_CALIBRATION_STUDIO_MAX_TOKENS ?? DEFAULT_MAX_TOKENS,
  seed: ENV.FEATURE_PROMPT_CALIBRATION_STUDIO_SEED ?? DEFAULT_SEED,
  logprobs: ENV.FEATURE_PROMPT_CALIBRATION_STUDIO_LOGPROBS ?? DEFAULT_LOGPROBS,
})
