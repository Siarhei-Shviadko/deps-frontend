import { SplittingContextAttachments } from '@/enums/SplittingContextAttachments'
import { SPLITTING_MODE } from '@/enums/SplittingMode'

export const FIELD_CODE = {
  DOCUMENT_TYPE_ID: 'documentTypeId',
  NAME: 'name',
  LLM_TYPE: 'llmType',
  SPLITTING_CONTEXT_ATTACHMENTS: 'splittingContextAttachments',
  QUERY: 'query',
  DESCRIPTION: 'description',
  SPLITTING_MODE: 'splittingMode',
}

export const FORM_FIELD_PREFIX = 'splitter'

export const DEFAULT_VALUES = {
  [FIELD_CODE.NAME]: '',
  [FIELD_CODE.LLM_TYPE]: null,
  [FIELD_CODE.SPLITTING_CONTEXT_ATTACHMENTS]: [SplittingContextAttachments.FILE_LAYOUT],
  [FIELD_CODE.QUERY]: '',
  [FIELD_CODE.DESCRIPTION]: '',
  [FIELD_CODE.SPLITTING_MODE]: SPLITTING_MODE.PAGE_BASED,
}
