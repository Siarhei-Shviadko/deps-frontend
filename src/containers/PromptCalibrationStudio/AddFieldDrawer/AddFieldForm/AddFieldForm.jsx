
import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  Form,
  FormFieldType,
  FormItem,
  MaxLengthValidator,
  PatternValidator,
  RequiredValidator,
} from '@/components/Form'
import { stringsToOptions } from '@/components/Select'
import { Switch } from '@/components/Switch'
import { FORBIDDEN_WHITE_SPACE_BEFORE_TEXT } from '@/constants/regexp'
import { ManageDisplayModeFormSection } from '@/containers/ManageDisplayModeFormSection'
import { useFieldCalibration } from '@/containers/PromptCalibrationStudio/hooks'
import { MULTIPLICITY, SUPPORTED_BASE_FIELD_TYPES } from '@/containers/PromptCalibrationStudio/viewModels'
import { ComponentSize } from '@/enums/ComponentSize'
import { FieldType, RESOURCE_FIELD_TYPE } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import { ENV } from '@/utils/env'
import { FIELD_FORM_CODE } from '../constants'
import { MultiplicitySwitcher } from '../MultiplicitySwitcher'
import { StyledCollapse, SwitchFormItem, Title, Wrapper } from './AddFieldForm.styles'

const isUniqueName = (value, fields) => {
  const trimmedName = value?.trim()?.toLowerCase()

  return !fields.some(
    (field) => field.name.toLowerCase() === trimmedName,
  )
}

const FIELD_TYPES_WITH_DISABLED_MASKING = [
  FieldType.CHECKMARK,
]

export const AddFieldForm = () => {
  const { control } = useFormContext()
  const { fields } = useFieldCalibration()

  const fieldType = useWatch({
    control,
    name: FIELD_FORM_CODE.FIELD_TYPE,
  })

  const multiplicity = useWatch({
    control,
    name: FIELD_FORM_CODE.MULTIPLICITY,
  })

  const nameField = useMemo(() => ({
    code: FIELD_FORM_CODE.NAME,
    label: localize(Localization.NAME),
    type: FormFieldType.STRING,
    requiredMark: true,
    placeholder: localize(Localization.FIELD_NAME_PLACEHOLDER),
    rules: {
      ...new RequiredValidator(),
      ...new PatternValidator(
        FORBIDDEN_WHITE_SPACE_BEFORE_TEXT,
        localize(Localization.WHITE_SPACE_VALIDATOR_ERROR_MESSAGE),
      ),
      ...new MaxLengthValidator(),
      validate: (value) => isUniqueName(value, fields) || localize(Localization.FIELD_NAME_DUPLICATE),
    },
  }), [fields])

  const NameField = useMemo(() => (
    <FormItem
      key={nameField.code}
      field={nameField}
      label={localize(Localization.NAME)}
      requiredMark={true}
    />
  ), [nameField])

  const additionalFields = useMemo(() => [
    {
      code: FIELD_FORM_CODE.FIELD_TYPE,
      type: FormFieldType.ENUM,
      options: stringsToOptions(SUPPORTED_BASE_FIELD_TYPES, RESOURCE_FIELD_TYPE),
      placeholder: localize(Localization.FILED_TYPE_PLACEHOLDER),
    },
    {
      code: FIELD_FORM_CODE.MULTIPLICITY,
      render: MultiplicitySwitcher,
    },
    ...(multiplicity === MULTIPLICITY.MULTIPLE ? [{
      code: FIELD_FORM_CODE.ALIASES,
      label: localize(Localization.ALIASES),
      type: FormFieldType.CHECKMARK,
    }] : []),
  ], [multiplicity])

  const AdditionalOptions = useMemo(() => (
    <Wrapper>
      <Title>
        {localize(Localization.FIELD_TYPE)}
      </Title>
      {
        additionalFields.map(({ label, ...field }) => (
          <FormItem
            key={field.code}
            field={field}
            label={label}
          />
        ))
      }
    </Wrapper>
  ), [additionalFields])

  const requiredField = useMemo(() => ({
    code: FIELD_FORM_CODE.REQUIRED,
    label: localize(Localization.REQUIRED_FIELD),
    defaultValue: false,
    type: FormFieldType.CHECKMARK,
    render: ({ value, onChange, onBlur }) => (
      <Switch
        checked={!!value}
        data-testid={FIELD_FORM_CODE.REQUIRED}
        onBlur={onBlur}
        onChange={onChange}
        size={ComponentSize.SMALL}
      />
    ),
  }), [])

  const RequiredFieldItem = useMemo(() => (
    <SwitchFormItem
      key={requiredField.code}
      field={requiredField}
      label={requiredField.label}
    />
  ), [requiredField])

  const AdvancedSettings = useMemo(() => (
    <StyledCollapse
      collapseId={Localization.ADVANCED_SETTINGS}
      ghost
      header={localize(Localization.ADVANCED_SETTINGS)}
    >
      { AdditionalOptions }
      { RequiredFieldItem }
      {
        ENV.FEATURE_FIELDS_DISPLAY_MODE && (
          <ManageDisplayModeFormSection
            displayCharLimit={10}
            fieldType={fieldType}
            isEditMode={true}
            isMaskingModeDisabled={FIELD_TYPES_WITH_DISABLED_MASKING.includes(fieldType)}
            isReadOnlyField={false}
          />
        )
      }
    </StyledCollapse>
  ), [
    AdditionalOptions,
    RequiredFieldItem,
    fieldType,
  ])

  return (
    <Form>
      { NameField }
      { AdvancedSettings }
    </Form>
  )
}
