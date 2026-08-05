
import PropTypes from 'prop-types'
import { useFormContext, useWatch } from 'react-hook-form'
import { FormFieldType } from '@/components/Form/ReactHookForm'
import { RadioOption } from '@/components/Radio/RadioOption'
import { stringsToOptions } from '@/components/Select'
import { FIELD_TYPES_WITH_DISABLED_MASKING, FORM_FIELD_CODES } from '@/containers/GenAIDrivenFieldModal/constants'
import { FieldType, RESOURCE_FIELD_TYPE } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import { LLMQueryCardinality, llmExtractionQueryFormatShape } from '@/models/LLMExtractor'
import {
  DualToggle,
  FormItem,
  SectionTitle,
  TypeWrapper,
  Wrapper,
} from './FieldTypeSection.styles'

const SUPPORTED_FIELD_TYPES = [
  FieldType.STRING,
  FieldType.DICTIONARY,
  FieldType.CHECKMARK,
]

const cardinalityOptions = [
  new RadioOption({
    value: LLMQueryCardinality.SCALAR,
    text: localize(Localization.SINGLE),
  }),
  new RadioOption({
    value: LLMQueryCardinality.LIST,
    text: localize(Localization.LIST),
  }),
]

const fieldTypeOptions = stringsToOptions(SUPPORTED_FIELD_TYPES, RESOURCE_FIELD_TYPE)

const FieldTypeSection = ({
  disabled,
  value,
  shape,
}) => {
  const { setValue } = useFormContext()

  const cardinality = useWatch({
    name: FORM_FIELD_CODES.CARDINALITY,
    defaultValue: LLMQueryCardinality.SCALAR,
  })

  const setConfidentialFieldValue = (newType) => {
    if (FIELD_TYPES_WITH_DISABLED_MASKING.includes(newType)) {
      setValue(FORM_FIELD_CODES.CONFIDENTIAL, false)
    }
  }

  const handleCardinalityChange = (cardinality) => {
    if (cardinality === LLMQueryCardinality.SCALAR) {
      setValue(FORM_FIELD_CODES.INCLUDE_ALIASES, false)
    }
  }

  const typeFields = [
    {
      code: FORM_FIELD_CODES.FIELD_TYPE,
      defaultValue: value || FieldType.STRING,
      disabled,
      type: FormFieldType.ENUM,
      options: fieldTypeOptions,
      handler: {
        onChange: setConfidentialFieldValue,
      },
    },
    {
      code: FORM_FIELD_CODES.CARDINALITY,
      defaultValue: shape?.cardinality || LLMQueryCardinality.SCALAR,
      handler: {
        onChange: handleCardinalityChange,
      },
      render: (props) => (
        <DualToggle
          {...props}
          disabled={disabled}
          options={cardinalityOptions}
        />
      ),
    },
  ]

  const aliasesFields = [
    {
      code: FORM_FIELD_CODES.INCLUDE_ALIASES,
      disabled: disabled || cardinality === LLMQueryCardinality.SCALAR,
      label: localize(Localization.ALIASES),
      defaultValue: !!shape?.includeAliases,
      type: FormFieldType.CHECKMARK,
    },
  ]

  const renderFields = (fields) => fields.map(({ label, requiredMark, ...field }) => (
    <FormItem
      key={field.code}
      field={field}
      label={label}
      requiredMark={requiredMark}
    />
  ))

  return (
    <Wrapper>
      <SectionTitle>
        {localize(Localization.FIELD_TYPE)}
      </SectionTitle>
      <TypeWrapper>
        {renderFields(typeFields)}
      </TypeWrapper>
      {renderFields(aliasesFields)}
    </Wrapper>
  )
}

FieldTypeSection.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.oneOf(Object.values(FieldType)),
  shape: llmExtractionQueryFormatShape,
}

export {
  FieldTypeSection,
}
