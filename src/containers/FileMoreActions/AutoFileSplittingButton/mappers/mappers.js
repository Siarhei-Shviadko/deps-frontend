import { KnownParsingFeature } from '@/enums/KnownParsingFeature'

export const mapProcessingParamsToFormValues = ({
  group,
  workflowParams,
}) => ({
  group: group ?? null,
  engine: workflowParams?.engine ?? null,
  llmType: workflowParams?.llmType ?? null,
  parsingFeatures: workflowParams?.parsingFeatures ?? [KnownParsingFeature.TEXT],
  needsSplittingProposalReview: true,
})
