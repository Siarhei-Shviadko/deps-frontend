import {
  DEFAULT_VALUES,
  FORM_FIELD_PREFIX,
  FIELD_CODE,
} from '@/containers/DocumentTypeSplitter/shared/constants'
import { SplittingContextAttachments } from '@/enums/SplittingContextAttachments'

const getSplitterFieldCode = (code) => `${FORM_FIELD_PREFIX}.${code}`

export const mapSplitterToFormValues = ({
  documentTypeId,
  name,
  llmType,
  splittingQuery,
  description,
  splittingContextAttachments,
  splittingMode,
}) => ({
  [getSplitterFieldCode(FIELD_CODE.DOCUMENT_TYPE_ID)]: documentTypeId,
  [getSplitterFieldCode(FIELD_CODE.NAME)]: name,
  [getSplitterFieldCode(FIELD_CODE.LLM_TYPE)]: llmType,
  [getSplitterFieldCode(FIELD_CODE.QUERY)]: splittingQuery,
  [getSplitterFieldCode(FIELD_CODE.DESCRIPTION)]: description,
  [getSplitterFieldCode(FIELD_CODE.SPLITTING_CONTEXT_ATTACHMENTS)]: (
    splittingContextAttachments ?? [SplittingContextAttachments.FILE_LAYOUT]
  ),
  [getSplitterFieldCode(FIELD_CODE.SPLITTING_MODE)]: splittingMode,
})

export const getFormDefaultValues = (splitter, documentTypeId) => {
  if (splitter) {
    return {
      [FORM_FIELD_PREFIX]: mapSplitterToFormValues(splitter),
    }
  }

  return {
    [FORM_FIELD_PREFIX]: {
      ...DEFAULT_VALUES,
      [getSplitterFieldCode(FIELD_CODE.DOCUMENT_TYPE_ID)]: documentTypeId,
    },
  }
}
