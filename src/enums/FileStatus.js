import { localize, Localization } from '@/localization/i18n'

export const FileStatus = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  NEEDS_REVIEW: 'needsReview',
  IN_REVIEW: 'inReview',
  FAILED: 'failed',
  SPLITTING_REVIEW: 'splittingReview',
}

export const RESOURCE_FILE_STATUS = {
  [FileStatus.PROCESSING]: localize(Localization.PROCESSING),
  [FileStatus.COMPLETED]: localize(Localization.COMPLETED),
  [FileStatus.NEEDS_REVIEW]: localize(Localization.NEEDS_REVIEW),
  [FileStatus.IN_REVIEW]: localize(Localization.IN_REVIEW),
  [FileStatus.FAILED]: localize(Localization.FAILED),
  [FileStatus.SPLITTING_REVIEW]: localize(Localization.SPLITTING_REVIEW),
}
