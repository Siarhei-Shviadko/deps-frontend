
import { LongText } from '@/components/LongText'
import { DocumentLLMType } from '@/containers/DocumentLLMType'
import { RESOURCE_PARSING_FEATURE } from '@/enums/KnownParsingFeature'
import { RESOURCE_PROCESSING_ENGINE } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'

const parsingFeaturesToString = (parsingFeatures) => (
  parsingFeatures.map((feature) => RESOURCE_PARSING_FEATURE[feature]).join('; ')
)

export const BatchSettings = {
  GROUP: 'group',
  LLM_TYPE: 'llmType',
  ENGINE: 'engine',
  PARSING_FEATURES: 'parsingFeatures',
}

export const BATCH_SETTINGS_TO_LABEL = {
  [BatchSettings.GROUP]: localize(Localization.GROUP),
  [BatchSettings.LLM_TYPE]: localize(Localization.LLM_TYPE),
  [BatchSettings.ENGINE]: localize(Localization.ENGINE),
  [BatchSettings.PARSING_FEATURES]: localize(Localization.PARSING_FEATURES),
}

export const BATCH_SETTINGS_TO_CONTENT = {
  [BatchSettings.GROUP]: (group) => !!group && <LongText text={group?.name} />,
  [BatchSettings.LLM_TYPE]: (llmType) => !!llmType && <DocumentLLMType llmType={llmType} />,
  [BatchSettings.ENGINE]: (engine) => !!engine && <LongText text={RESOURCE_PROCESSING_ENGINE[engine]} />,
  [BatchSettings.PARSING_FEATURES]: (parsingFeatures) => (
    !!parsingFeatures.length && <LongText text={parsingFeaturesToString(parsingFeatures)} />
  ),
}
