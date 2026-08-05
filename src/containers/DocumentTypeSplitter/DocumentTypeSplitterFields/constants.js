import { SelectOption } from '@/components/Select'
import { SplittingContextAttachments } from '@/enums/SplittingContextAttachments'
import { SPLITTING_MODE } from '@/enums/SplittingMode'
import { Localization, localize } from '@/localization/i18n'

export const QUERY_INPUT_AUTOSIZE_CONFIG = {
  minRows: 5,
  maxRows: 5,
}

export const SPLITTING_CONTEXT_ATTACHMENTS_OPTIONS = [
  new SelectOption(
    SplittingContextAttachments.FILE_LAYOUT,
    localize(Localization.SPLITTING_CONTEXT_ATTACHMENT_FILE_LAYOUT),
  ),
  new SelectOption(
    SplittingContextAttachments.FILE_IMAGES,
    localize(Localization.SPLITTING_CONTEXT_ATTACHMENT_FILE_IMAGES),
  ),
  new SelectOption(
    SplittingContextAttachments.ORIGINAL_FILE,
    localize(Localization.SPLITTING_CONTEXT_ATTACHMENT_ORIGINAL_FILE),
  ),
]

export const SPLITTING_MODE_OPTIONS = [
  new SelectOption(
    SPLITTING_MODE.PAGE_BASED,
    localize(Localization.SPLITTING_MODE_PAGE_BASED),
  ),
  new SelectOption(
    SPLITTING_MODE.SECTION_BASED,
    localize(Localization.SPLITTING_MODE_SECTION_BASED),
  ),
]
