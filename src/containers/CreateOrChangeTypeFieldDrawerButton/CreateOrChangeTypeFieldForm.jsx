
import PropTypes from 'prop-types'
import { useMemo, useCallback } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { ExpandIconPosition } from '@/components/Collapse'
import { FormFieldType, FormItem, MaxLengthValidator, PatternValidator, RequiredValidator } from '@/components/Form/ReactHookForm'
import {
  CustomSelect,
  SelectMode,
  stringsToOptions,
} from '@/components/Select'
import { ALLOWED_FIELD_TYPES_FOR_DISPLAY_MODE_FEATURE } from '@/constants/field'
import { FORBIDDEN_SPECIAL_SYMBOLS, FORBIDDEN_WHITE_SPACE_BEFORE_TEXT } from '@/constants/regexp'
import { ManageDisplayModeFormSection } from '@/containers/ManageDisplayModeFormSection'
import { FieldType, RESOURCE_FIELD_TYPE } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import { documentTypeFieldShape } from '@/models/DocumentTypeField'
import { ENV } from '@/utils/env'
import { Collapse, Form } from './CreateOrChangeTypeFieldDrawerButton.styles'
import { DictionaryFieldTypeFormSection } from './DictionaryFieldTypeFormSection'
import { ListFieldTypeFormSection } from './ListFieldTypeFormSection'
import { TableFieldTypeFormSection } from './TableFieldTypeFormSection'

const SUPPORTED_FIELD_TYPES = [
  FieldType.STRING,
  FieldType.DICTIONARY,
  FieldType.TABLE,
  FieldType.LIST,
  FieldType.CHECKMARK,
  FieldType.ENUM,
  FieldType.DATE,
]

const SUPPORTED_BASE_FIELD_TYPES = [
  FieldType.ENUM,
  FieldType.TABLE,
  FieldType.STRING,
  FieldType.DICTIONARY,
  FieldType.CHECKMARK,
]

const BASE_TYPE_FIELD_CODE = 'baseType'

const FIELDS_CODE = {
  code: 'code',
  name: 'name',
  required: 'required',
  fieldType: 'fieldType',
  options: 'options',
}

const FIELD_TYPE_TO_FORM_SECTION = ({
  [FieldType.DICTIONARY]: (field) => <DictionaryFieldTypeFormSection field={field} />,
  [FieldType.TABLE]: (field) => <TableFieldTypeFormSection field={field} />,
  [FieldType.LIST]: (field, baseType) => (
    <ListFieldTypeFormSection
      baseType={baseType}
      field={field}
    />
  ),
})

const HIDDEN_ADDITIONAL_BASE_TYPES = [
  FieldType.CHECKMARK,
  FieldType.ENUM,
  FieldType.STRING,
  FieldType.TABLE,
]

const CreateOrChangeTypeFieldForm = ({
  field,
  allowedFieldTypes,
}) => {
  const { control, setValue } = useFormContext()

  const fieldType = useWatch({
    control,
    name: FIELDS_CODE.fieldType,
    defaultValue: field?.fieldType || FieldType.STRING,
  })

  const baseType = useWatch({
    control,
    name: BASE_TYPE_FIELD_CODE,
    defaultValue: field?.fieldMeta?.baseType,
  })

  const setCodeFieldValue = useCallback((e) => {
    const validCode = e.target.value.replace(FORBIDDEN_SPECIAL_SYMBOLS, '')
    setValue(FIELDS_CODE.code, validCode, { shouldValidate: true })
  }, [setValue])

  const baseTypeField = useMemo(() => [
    {
      code: BASE_TYPE_FIELD_CODE,
      label: localize(Localization.BASE_TYPE_FIELD),
      defaultValue: baseType,
      type: FormFieldType.ENUM,
      disabled: !!field,
      options: stringsToOptions(SUPPORTED_BASE_FIELD_TYPES, RESOURCE_FIELD_TYPE),
      placeholder: localize(Localization.BASE_TYPE_FIELD_PLACEHOLDER),
    },
  ], [
    baseType,
    field,
  ])

  const enumOptionsField = useMemo(() => {
    const defaultValue = (
      field?.fieldMeta?.options ||
      field?.fieldMeta?.baseTypeMeta?.options ||
      []
    )

    return ([
      {
        code: FIELDS_CODE.options,
        label: localize(Localization.OPTIONS),
        defaultValue,
        requiredMark: true,
        rules: new RequiredValidator(),
        render: (props) => (
          <CustomSelect
            mode={SelectMode.TAGS}
            open={false}
            options={[]}
            {...props}
          />
        ),
      },
    ])
  }, [field?.fieldMeta])

  const showAdditionalOptions = useMemo(() => {
    if (
      !allowedFieldTypes?.includes(fieldType) ||
      !FIELD_TYPE_TO_FORM_SECTION[fieldType]
    ) {
      return
    }

    if (fieldType === FieldType.LIST) {
      return !!baseType && !HIDDEN_ADDITIONAL_BASE_TYPES.includes(baseType)
    }

    return true
  }, [
    allowedFieldTypes,
    baseType,
    fieldType,
  ])

  const shouldShowEnumOptionsField = (
    fieldType === FieldType.ENUM &&
    allowedFieldTypes?.includes(FieldType.ENUM)
  )

  const fieldTypeOptions = (
    (!field && allowedFieldTypes)
      ? stringsToOptions(allowedFieldTypes, RESOURCE_FIELD_TYPE)
      : stringsToOptions(SUPPORTED_FIELD_TYPES, RESOURCE_FIELD_TYPE)
  )

  const fields = useMemo(() => [
    {
      code: FIELDS_CODE.name,
      label: localize(Localization.NAME),
      ...(!field && {
        handler: {
          onChange: setCodeFieldValue,
        },
      }),
      defaultValue: field?.name,
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
      },
    },
    ...(!field ? [{
      code: FIELDS_CODE.code,
      name: FIELDS_CODE.code,
      label: localize(Localization.CODE),
      type: FormFieldType.STRING,
      requiredMark: true,
      placeholder: localize(Localization.FIELD_CODE_PLACEHOLDER),
      disabled: true,
      rules: new RequiredValidator(),
    }] : []),
    {
      code: FIELDS_CODE.required,
      label: localize(Localization.REQUIRED_FIELD),
      defaultValue: field?.required || false,
      type: FormFieldType.CHECKMARK,
    },
    {
      code: FIELDS_CODE.fieldType,
      label: localize(Localization.FIELD_TYPE),
      defaultValue: field?.fieldType || FieldType.STRING,
      type: FormFieldType.ENUM,
      options: fieldTypeOptions,
      placeholder: localize(Localization.FILED_TYPE_PLACEHOLDER),
      disabled: allowedFieldTypes?.length === 1 || !!field,
    },
    ...(fieldType === FieldType.LIST ? baseTypeField : []),
    ...(shouldShowEnumOptionsField ? enumOptionsField : []),
  ], [
    allowedFieldTypes,
    field,
    fieldTypeOptions,
    shouldShowEnumOptionsField,
    setCodeFieldValue,
    fieldType,
    baseTypeField,
    enumOptionsField,
  ])

  const BaseFormSection = useMemo(() => (
    fields.map(({ label, requiredMark, ...field }) => (
      <FormItem
        key={field.code}
        field={field}
        label={label}
        requiredMark={requiredMark}
      />
    ))
  ), [fields])

  const AdditionalOptions = useMemo(() => {
    if (
      fieldType === FieldType.LIST &&
      baseType === FieldType.ENUM
    ) {
      return enumOptionsField.map(({ label, requiredMark, ...field }) => (
        <FormItem
          key={field.code}
          field={field}
          label={label}
          requiredMark={requiredMark}
        />
      ))
    }

    if (showAdditionalOptions) {
      return (
        <Collapse
          collapseId={Localization.ADDITIONAL_OPTIONS}
          expandIconPosition={ExpandIconPosition.END}
          ghost
          header={localize(Localization.ADDITIONAL_OPTIONS)}
        >
          {FIELD_TYPE_TO_FORM_SECTION[fieldType](field, baseType)}
        </Collapse>
      )
    }
  }, [
    baseType,
    enumOptionsField,
    field,
    fieldType,
    showAdditionalOptions,
  ])

  const showDisplayModeFormSection = (
    ENV.FEATURE_FIELDS_DISPLAY_MODE && (
      ALLOWED_FIELD_TYPES_FOR_DISPLAY_MODE_FEATURE.includes(fieldType) ||
      ALLOWED_FIELD_TYPES_FOR_DISPLAY_MODE_FEATURE.includes(baseType)
    )
  )

  const charLimit = (
    field?.fieldMeta?.displayCharLimit ??
    field?.fieldMeta?.valueMeta?.displayCharLimit ??
    field?.fieldMeta?.baseTypeMeta?.displayCharLimit ??
    field?.fieldMeta?.baseTypeMeta?.valueMeta?.displayCharLimit
  )

  return (
    <Form>
      { BaseFormSection }
      {
        showDisplayModeFormSection && (
          <ManageDisplayModeFormSection
            displayCharLimit={charLimit}
            fieldType={fieldType}
            isConfidentialField={field?.confidential}
            isEditMode={true}
            isReadOnlyField={field?.readOnly}
          />
        )
      }
      { AdditionalOptions }
    </Form>
  )
}

CreateOrChangeTypeFieldForm.propTypes = {
  field: documentTypeFieldShape,
  allowedFieldTypes: PropTypes.arrayOf(PropTypes.string),
}

export {
  CreateOrChangeTypeFieldForm,
}
