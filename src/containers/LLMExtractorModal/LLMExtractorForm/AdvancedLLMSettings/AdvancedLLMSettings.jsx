import { useCallback, useMemo } from 'react'
import { FormFieldType, RequiredValidator } from '@/components/Form/ReactHookForm'
import {
  CustomSelect,
  SelectMode,
  SelectOption,
} from '@/components/Select'
import { Switch } from '@/components/Switch'
import { KnownContextAttachments } from '@/containers/LLMExtractorModal/KnownContextAttachments'
import { PageSpanSection } from '@/containers/PageSpanSection'
import { ComponentSize } from '@/enums/ComponentSize'
import { Localization, localize } from '@/localization/i18n'
import {
  FIELD_CODE,
  MIN_GROUPING_FACTOR_VALUE,
  MIN_MAX_TOKENS_VALUE,
  MIN_SEED_VALUE,
  MAX_SEED_VALUE,
  MAX_STOP_WORDS_COUNT,
} from '../constants'
import {
  StyledInputNumber,
  Wrapper,
  StyledFormItem,
  StyledCollapse,
  SwitchFormItem,
} from './AdvancedLLMSettings.styles'

const CONTEXT_ATTACHMENTS_OPTIONS = [
  new SelectOption(
    KnownContextAttachments.DOCUMENT_IMAGES,
    localize(Localization.AI_CONTEXT_TEXT_AND_IMAGES),
    { title: localize(Localization.AI_CONTEXT_TEXT_AND_IMAGES_TOOLTIP) },
  ),
  new SelectOption(
    '',
    localize(Localization.AI_CONTEXT_TEXT_ONLY),
    { title: localize(Localization.AI_CONTEXT_TEXT_ONLY_TOOLTIP) },
  ),
]

export const AdvancedLLMSettings = () => {
  const handleStopChange = useCallback((value, onChange) => {
    if (value?.length <= MAX_STOP_WORDS_COUNT) {
      onChange(value)
      return
    }

    onChange(value.slice(0, MAX_STOP_WORDS_COUNT))
  }, [])

  const advancedFields = useMemo(() => [
    {
      code: FIELD_CODE.GROUPING_FACTOR,
      label: localize(Localization.GROUPING_FACTOR),
      requiredMark: true,
      rules: {
        ...new RequiredValidator(),
      },
      render: (props) => (
        <StyledInputNumber
          {...props}
          min={MIN_GROUPING_FACTOR_VALUE}
          placeholder={localize(Localization.GROUPING_FACTOR_PLACEHOLDER)}
        />
      ),
    },
    {
      code: FIELD_CODE.MAX_TOKENS,
      label: localize(Localization.MAX_TOKENS),
      render: (props) => (
        <StyledInputNumber
          {...props}
          min={MIN_MAX_TOKENS_VALUE}
          placeholder={localize(Localization.MAX_TOKENS_PLACEHOLDER)}
        />
      ),
    },
    {
      code: FIELD_CODE.CONTEXT_ATTACHMENTS,
      label: localize(Localization.CONTEXT_FOR_EXTRACTION),
      render: (props) => (
        <CustomSelect
          {...props}
          options={CONTEXT_ATTACHMENTS_OPTIONS}
        />
      ),
    },
    {
      code: FIELD_CODE.SEED,
      label: localize(Localization.SEED),
      render: (props) => (
        <StyledInputNumber
          {...props}
          max={MAX_SEED_VALUE}
          min={MIN_SEED_VALUE}
          placeholder={localize(Localization.SEED_PLACEHOLDER)}
        />
      ),
    },
    {
      code: FIELD_CODE.STOP,
      label: localize(Localization.STOP_WORDS),
      fullWidth: true,
      hint: localize(Localization.STOP_WORDS_HINT, { maxCount: MAX_STOP_WORDS_COUNT }),
      render: ({ onChange, ...props }) => (
        <CustomSelect
          {...props}
          mode={SelectMode.TAGS}
          onChange={(value) => handleStopChange(value, onChange)}
          open={false}
          options={[]}
        />
      ),
    },
    {
      code: FIELD_CODE.PAGE_SPAN,
      label: localize(Localization.PAGE_SPAN),
      fullWidth: true,
      render: PageSpanSection,
    },
  ], [handleStopChange])

  const logprobsField = useMemo(() => ({
    code: FIELD_CODE.LOGPROBS,
    label: localize(Localization.LOGARITHMIC_PROBABILITIES),
    type: FormFieldType.CHECKMARK,
    render: ({ value, ...rest }) => (
      <Switch
        {...rest}
        checked={!!value}
        size={ComponentSize.SMALL}
      />
    ),
  }), [])

  const coordinatesField = useMemo(() => ({
    code: FIELD_CODE.COORDINATES_ENABLED,
    label: localize(Localization.DETERMINE_FIELD_COORDINATES),
    type: FormFieldType.CHECKMARK,
    render: ({ value, ...rest }) => (
      <Switch
        {...rest}
        checked={!!value}
        size={ComponentSize.SMALL}
      />
    ),
  }), [])

  const renderFields = (fields) => (
    fields.map(({
      fullWidth,
      label,
      requiredMark,
      ...field
    }) => (
      <StyledFormItem
        key={field.code}
        $fullWidth={fullWidth}
        field={field}
        label={label}
        requiredMark={requiredMark}
      />
    ))
  )

  return (
    <StyledCollapse
      collapseId={Localization.ADVANCED_SETTINGS}
      ghost
      header={localize(Localization.ADVANCED_SETTINGS)}
    >
      <Wrapper>
        {renderFields(advancedFields)}
        <SwitchFormItem
          key={logprobsField.code}
          field={logprobsField}
          label={logprobsField.label}
        />
        <SwitchFormItem
          key={coordinatesField.code}
          field={coordinatesField}
          label={coordinatesField.label}
        />
      </Wrapper>
    </StyledCollapse>
  )
}
