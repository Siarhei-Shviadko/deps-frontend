import { useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormFieldType, RequiredValidator } from '@/components/Form/ReactHookForm'
import {
  CustomSelect,
  SelectMode,
  SelectOption,
} from '@/components/Select'
import { Switch } from '@/components/Switch'
import { KnownContextAttachments } from '@/containers/LLMExtractorModal/KnownContextAttachments'
import { ComponentSize } from '@/enums/ComponentSize'
import { Localization, localize } from '@/localization/i18n'
import {
  FIELDS_CODE,
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
  StyledPageSpanSection,
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
  const { setValue } = useFormContext()

  const handleStopChange = useCallback((value) => {
    if (value.length <= MAX_STOP_WORDS_COUNT) {
      setValue(FIELDS_CODE.STOP, value)
      return
    }

    setValue(FIELDS_CODE.STOP, value.slice(0, MAX_STOP_WORDS_COUNT), { shouldValidate: true })
  }, [setValue])

  const advancedFields = useMemo(() => [
    {
      code: FIELDS_CODE.GROUPING_FACTOR,
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
      code: FIELDS_CODE.MAX_TOKENS,
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
      code: FIELDS_CODE.CONTEXT_ATTACHMENTS,
      label: localize(Localization.CONTEXT_FOR_EXTRACTION),
      render: (props) => (
        <CustomSelect
          {...props}
          options={CONTEXT_ATTACHMENTS_OPTIONS}
        />
      ),
    },
    {
      code: FIELDS_CODE.SEED,
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
      code: FIELDS_CODE.STOP,
      label: localize(Localization.STOP_WORDS),
      hint: localize(Localization.STOP_WORDS_HINT, { maxCount: MAX_STOP_WORDS_COUNT }),
      render: (props) => (
        <CustomSelect
          {...props}
          mode={SelectMode.TAGS}
          onChange={handleStopChange}
          open={false}
          options={[]}
        />
      ),
    },
    {
      code: FIELDS_CODE.PAGE_SPAN,
      label: localize(Localization.PAGE_SPAN),
      render: (props) => (
        <StyledPageSpanSection
          {...props}
        />
      ),
    },
  ], [handleStopChange])

  const logprobsField = useMemo(() => ({
    code: FIELDS_CODE.LOGPROBS,
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
    code: FIELDS_CODE.COORDINATES_ENABLED,
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
    fields.map(({ label, requiredMark, ...field }) => (
      <StyledFormItem
        key={field.code}
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
