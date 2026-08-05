import { FileExtension } from '@/enums/FileExtension'
import { FileStatus } from '@/enums/FileStatus'
import { Localization, localize } from '@/localization/i18n'
import { getFileExtension } from '@/utils/getFileExtension'

export const FIELD_CODE = {
  GROUP: 'group',
  ENGINE: 'engine',
  LANGUAGE: 'language',
  LLM_TYPE: 'llmType',
  PARSING_FEATURES: 'parsingFeatures',
  NEEDS_SPLITTING_PROPOSAL_REVIEW: 'needsSplittingProposalReview',
}

const SPLITTING_AVAILABLE_STATUSES = [
  FileStatus.COMPLETED,
  FileStatus.FAILED,
]

export const TOOLTIP_TITLE_RULES = [
  {
    when: (file) => getFileExtension(file.name) !== FileExtension.PDF,
    title: localize(Localization.SPLITTING_AVAILABLE_FOR_PDF_FILE),
  },
  {
    when: (file) => !!file.reference,
    title: localize(Localization.FILE_ACTION_UNAVAILABLE_REFERENCE_TOOLTIP),
  },
  {
    when: (file) => !SPLITTING_AVAILABLE_STATUSES.includes(file.state.status),
    title: localize(Localization.SPLITTING_AVAILABLE_STATUSES, { statuses: SPLITTING_AVAILABLE_STATUSES.join(', ') }),
  },
]
