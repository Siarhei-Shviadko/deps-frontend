import {
  FormFieldType,
  FormItem,
  PatternValidator,
  RequiredValidator,
} from '@/components/Form/ReactHookForm'
import { Input } from '@/components/Input'
import {
  CustomSelect,
  SelectMode,
} from '@/components/Select'
import { GEN_AI_PROMPT_MAX_LENGTH } from '@/constants/common'
import { FORBIDDEN_WHITE_SPACE_BEFORE_TEXT } from '@/constants/regexp'
import { SplittingContextAttachments } from '@/enums/SplittingContextAttachments'
import { SPLITTING_MODE } from '@/enums/SplittingMode'
import { Localization, localize } from '@/localization/i18n'
import { splitterShape } from '@/models/Splitter'
import { FORM_FIELD_PREFIX, FIELD_CODE } from '../shared/constants'
import {
  QUERY_INPUT_AUTOSIZE_CONFIG,
  SPLITTING_CONTEXT_ATTACHMENTS_OPTIONS,
  SPLITTING_MODE_OPTIONS,
} from './constants'
import { ExtractionLLMSelect } from './ExtractionLLMSelect'

export const DocumentTypeSplitterFields = ({ splitter }) => {
  const fields = [
    {
      code: `${FORM_FIELD_PREFIX}.${FIELD_CODE.NAME}`,
      label: localize(Localization.NAME),
      requiredMark: true,
      type: FormFieldType.STRING,
      placeholder: localize(Localization.NAME_PLACEHOLDER),
      defaultValue: splitter?.name,
      rules: {
        ...new RequiredValidator(),
        ...new PatternValidator(
          FORBIDDEN_WHITE_SPACE_BEFORE_TEXT,
          localize(Localization.WHITE_SPACE_VALIDATOR_ERROR_MESSAGE),
        ),
      },
    },
    {
      code: `${FORM_FIELD_PREFIX}.${FIELD_CODE.LLM_TYPE}`,
      requiredMark: true,
      label: localize(Localization.LLM_TYPE),
      placeholder: localize(Localization.SELECT_LLM_TYPE),
      defaultValue: splitter?.llmType,
      rules: {
        ...new RequiredValidator(),
      },
      render: (props) => (
        <ExtractionLLMSelect
          {...props}
          allowClear
          allowSearch
        />
      ),
    },
    {
      code: `${FORM_FIELD_PREFIX}.${FIELD_CODE.SPLITTING_CONTEXT_ATTACHMENTS}`,
      label: localize(Localization.SPLITTING_CONTEXT_ATTACHMENTS),
      defaultValue: splitter?.splittingContextAttachments ?? [SplittingContextAttachments.FILE_LAYOUT],
      requiredMark: true,
      rules: {
        ...new RequiredValidator(),
      },
      render: (props) => (
        <CustomSelect
          {...props}
          allowClear
          mode={SelectMode.MULTIPLE}
          options={SPLITTING_CONTEXT_ATTACHMENTS_OPTIONS}
        />
      ),
    },
    {
      code: `${FORM_FIELD_PREFIX}.${FIELD_CODE.SPLITTING_MODE}`,
      label: localize(Localization.SPLITTING_MODE),
      defaultValue: splitter?.splittingMode ?? SPLITTING_MODE.PAGE_BASED,
      disabled: !!splitter,
      render: (props) => (
        <CustomSelect
          {...props}
          options={SPLITTING_MODE_OPTIONS}
        />
      ),
    },
    {
      code: `${FORM_FIELD_PREFIX}.${FIELD_CODE.QUERY}`,
      label: localize(Localization.PROMPT),
      requiredMark: true,
      placeholder: localize(Localization.PROMPT_PLACEHOLDER),
      defaultValue: splitter?.splittingQuery,
      rules: {
        ...new RequiredValidator(),
        ...new PatternValidator(
          FORBIDDEN_WHITE_SPACE_BEFORE_TEXT,
          localize(Localization.WHITE_SPACE_VALIDATOR_ERROR_MESSAGE),
        ),
      },
      render: (props) => (
        <Input.TextArea
          {...props}
          autoSize={QUERY_INPUT_AUTOSIZE_CONFIG}
          maxLength={GEN_AI_PROMPT_MAX_LENGTH}
          showCount
        />
      ),
    },
    {
      code: `${FORM_FIELD_PREFIX}.${FIELD_CODE.DESCRIPTION}`,
      label: localize(Localization.DESCRIPTION),
      type: FormFieldType.STRING,
      placeholder: localize(Localization.ENTER_DESCRIPTION),
      defaultValue: splitter?.description,
      render: (props) => (
        <Input.TextArea
          {...props}
          autoSize={QUERY_INPUT_AUTOSIZE_CONFIG}
          maxLength={GEN_AI_PROMPT_MAX_LENGTH}
          showCount
        />
      ),
    },
  ]

  return fields.map(({ label, requiredMark, ...field }) => (
    <FormItem
      key={field.code}
      field={field}
      label={label}
      requiredMark={requiredMark}
    />
  ))
}

DocumentTypeSplitterFields.propTypes = {
  splitter: splitterShape,
}
