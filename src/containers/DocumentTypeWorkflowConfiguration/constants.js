
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { ReviewPolicy } from '@/enums/ReviewPolicy'

export const WORKFLOW_FORM_FIELD_CODES = {
  ENGINE: 'engine',
  PARSING_FEATURES: 'parsingFeatures',
  NEEDS_EXTRACTION: 'needsExtraction',
  NEEDS_REVIEW: 'needsReview',
  NEEDS_VALIDATION: 'needsValidation',
  NEEDS_OUTPUT_EXPORTING: 'needsOutputExporting',
}

export const DEFAULT_FORM_VALUES = {
  [WORKFLOW_FORM_FIELD_CODES.ENGINE]: KnownProcessingEngines.TESSERACT,
  [WORKFLOW_FORM_FIELD_CODES.PARSING_FEATURES]: [KnownParsingFeature.TEXT],
  [WORKFLOW_FORM_FIELD_CODES.NEEDS_EXTRACTION]: true,
  [WORKFLOW_FORM_FIELD_CODES.NEEDS_REVIEW]: ReviewPolicy.ALWAYS_REVIEW,
  [WORKFLOW_FORM_FIELD_CODES.NEEDS_VALIDATION]: false,
  [WORKFLOW_FORM_FIELD_CODES.NEEDS_OUTPUT_EXPORTING]: false,
}
