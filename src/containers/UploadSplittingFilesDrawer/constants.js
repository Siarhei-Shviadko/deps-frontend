
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'

export const DRAWER_WIDTH_DEFAULT = '60%'

export const MAX_FILES_COUNT_FOR_ONE_BATCH = 50

export const BATCH_TYPE = {
  ONE_BATCH: 'oneBatch',
  MULTI_BATCHES: 'multiBatches',
}

export const FIELD_FORM_CODE = {
  AUTOMATIC_SPLITTING: 'automaticSplitting',
  NEEDS_SPLITTING_PROPOSAL_REVIEW: 'needsSplittingProposalReview',
  GROUP: 'group',
  BATCH_TYPE: 'batchType',
  BATCH_NAME: 'batchName',
  LLM_TYPE: 'llmType',
  ENGINE: 'engine',
  PARSING_FEATURES: 'parsingFeatures',
  FILES: 'files',
}

export const DefaultFormValues = {
  [FIELD_FORM_CODE.AUTOMATIC_SPLITTING]: false,
  [FIELD_FORM_CODE.NEEDS_SPLITTING_PROPOSAL_REVIEW]: true,
  [FIELD_FORM_CODE.GROUP]: null,
  [FIELD_FORM_CODE.BATCH_TYPE]: BATCH_TYPE.ONE_BATCH,
  [FIELD_FORM_CODE.BATCH_NAME]: '',
  [FIELD_FORM_CODE.LLM_TYPE]: null,
  [FIELD_FORM_CODE.ENGINE]: null,
  [FIELD_FORM_CODE.PARSING_FEATURES]: [KnownParsingFeature.TEXT],
}
