
import PropTypes from 'prop-types'
import { useCallback, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button, ButtonType } from '@/components/Button'
import { FormValidationMode } from '@/components/Form/ReactHookForm'
import { DEFAULT_DATE_FORMAT } from '@/constants/common'
import { FieldType } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import { documentTypeFieldShape } from '@/models/DocumentTypeField'
import { TableFieldColumn } from '@/models/DocumentTypeFieldMeta'
import { theme } from '@/theme/theme.default'
import { childrenShape } from '@/utils/propTypes'
import {
  Drawer,
  DrawerFooterWrapper,
  CancelButton,
} from './CreateOrChangeTypeFieldDrawerButton.styles'
import { CreateOrChangeTypeFieldForm } from './CreateOrChangeTypeFieldForm'

const BASE_FIELD_TYPES = {
  STRING: 'string',
  DICTIONARY: 'dict',
  TABLE: 'table',
  ENUM: 'enum',
  CHECKMARK: 'checkmark',
  DATE: 'date',
}

const META_FIELDS_NAME_MAPPING = {
  enum: 'options',
  baseEnum: 'values',
  baseCharWhitelist: 'charWhitelist',
  baseCharBlacklist: 'charBlacklist',
  keyCharWhitelist: 'charWhitelist',
  keyCharBlacklist: 'charBlacklist',
  valueCharWhitelist: 'charWhitelist',
  valueCharBlacklist: 'charBlacklist',
  displayCharLimit: 'displayCharLimit',
}

const BASE_FIELD_TYPE_TO_META_FIELDS_MAPPING = {
  [BASE_FIELD_TYPES.STRING]: ['baseCharWhitelist', 'baseCharBlacklist', 'displayCharLimit'],
  [BASE_FIELD_TYPES.DICTIONARY]: ['keyMeta', 'keyType', 'valueMeta', 'valueType', 'displayCharLimit'],
  [BASE_FIELD_TYPES.ENUM]: ['baseEnum'],
}

const FIELD_TYPE_TO_META_FIELDS_MAPPING = {
  [FieldType.ENUM]: ['enum'],
  [FieldType.STRING]: ['charWhitelist', 'charBlacklist', 'displayCharLimit'],
  [FieldType.LIST]: ['baseType'],
  [FieldType.DICTIONARY]: ['keyType', 'valueType', 'displayCharLimit'],
  [FieldType.TABLE]: ['columns'],
  [FieldType.DATE]: ['format', 'displayCharLimit'],
}

const DICTIONARY_KEY_FIELD_TYPE_TO_META_FIELDS_MAPPING = {
  [BASE_FIELD_TYPES.STRING]: ['keyCharWhitelist', 'keyCharBlacklist', 'displayCharLimit'],
}

const DICTIONARY_VALUE_FIELD_TYPE_TO_META_FIELDS_MAPPING = {
  [BASE_FIELD_TYPES.STRING]: ['valueCharWhitelist', 'valueCharBlacklist', 'displayCharLimit'],
}

const CreateOrChangeTypeFieldDrawerButton = ({
  disabled,
  onSave,
  field,
  fetching,
  children,
  allowedFieldTypes,
  renderTrigger,
}) => {
  const [visible, setVisible] = useState(false)

  const methods = useForm({
    mode: FormValidationMode.ON_CHANGE,
    shouldUnregister: true,
  })

  const {
    getValues,
    formState: {
      isValid, isDirty,
    },
  } = methods

  const generateMetaParamsByFieldName = useCallback((fieldsNames, formValues) => {
    const metaFieldsParams = {}

    fieldsNames.forEach((fieldName) => {
      const requestParamName = META_FIELDS_NAME_MAPPING[fieldName] || fieldName
      metaFieldsParams[requestParamName] = formValues[fieldName] ?? null
    })

    return metaFieldsParams
  }, [])

  const getDictionaryMetaParams = useCallback((formValues) => {
    const keyType = formValues.keyType ?? FieldType.STRING
    const valueType = formValues.valueType ?? FieldType.STRING
    const keyDictionaryMetaFieldsNames = DICTIONARY_KEY_FIELD_TYPE_TO_META_FIELDS_MAPPING[keyType]
    const valueDictionaryMetaFieldsNames = DICTIONARY_VALUE_FIELD_TYPE_TO_META_FIELDS_MAPPING[valueType]

    return {
      keyMeta: generateMetaParamsByFieldName(keyDictionaryMetaFieldsNames, formValues),
      keyType,
      valueType,
      valueMeta: generateMetaParamsByFieldName(valueDictionaryMetaFieldsNames, formValues),
    }
  }, [generateMetaParamsByFieldName])

  const getTableMetaParams = useCallback((formValues) => ({
    columns: formValues.columns?.map((column) => new TableFieldColumn(column)) || [],
  }), [])

  const getEnumMetaParams = useCallback((formValues) => ({
    options: formValues.options || [],
  }), [])

  const getDateMetaParams = useCallback((formValues) => {
    const fieldType = formValues.baseType || formValues.fieldType
    const allowedMetaFields = FIELD_TYPE_TO_META_FIELDS_MAPPING[fieldType]
    const metaFields = generateMetaParamsByFieldName(allowedMetaFields, formValues)

    return ({
      ...metaFields,
      format: formValues.format || DEFAULT_DATE_FORMAT,
    })
  }, [generateMetaParamsByFieldName])

  const getListMetaParams = useCallback((formValues) => {
    const baseType = formValues.baseType ?? FieldType.TABLE
    const baseMetaFieldsNames = BASE_FIELD_TYPE_TO_META_FIELDS_MAPPING[baseType]
    const BASE_TYPE_TO_META_PARAMS_MAPPER = {
      [FieldType.CHECKMARK]: () => null,
      [FieldType.TABLE]: () => getTableMetaParams(formValues),
      [FieldType.DICTIONARY]: () => getDictionaryMetaParams(formValues),
      [FieldType.STRING]: () => generateMetaParamsByFieldName(baseMetaFieldsNames, formValues),
      [FieldType.ENUM]: () => getEnumMetaParams(formValues),
      [FieldType.DATE]: () => getDateMetaParams(formValues),
    }

    return {
      baseType,
      baseTypeMeta: BASE_TYPE_TO_META_PARAMS_MAPPER[baseType](),
    }
  }, [
    getTableMetaParams,
    getDictionaryMetaParams,
    generateMetaParamsByFieldName,
    getEnumMetaParams,
    getDateMetaParams,
  ])

  const getRequestParamsMetaFields = useCallback(
    (formValues) => {
      const metaFieldsNames = FIELD_TYPE_TO_META_FIELDS_MAPPING[formValues.fieldType]

      if (!metaFieldsNames) {
        return
      }

      switch (formValues.fieldType) {
        case FieldType.TABLE:
          return getTableMetaParams(formValues)
        case FieldType.DICTIONARY:
          return getDictionaryMetaParams(formValues)
        case FieldType.LIST:
          return getListMetaParams(formValues)
        case FieldType.ENUM:
          return getEnumMetaParams(formValues)
        case FieldType.DATE:
          return getDateMetaParams(formValues)
        default:
          return generateMetaParamsByFieldName(metaFieldsNames, formValues)
      }
    }, [
      generateMetaParamsByFieldName,
      getDateMetaParams,
      getDictionaryMetaParams,
      getListMetaParams,
      getTableMetaParams,
      getEnumMetaParams,
    ])

  const getRequestParams = useCallback((formValues) => {
    const fieldType = (
      formValues.fieldType === FieldType.LIST
        ? formValues.baseType
        : formValues.fieldType
    )

    const metaFieldsValues = (
      allowedFieldTypes?.includes(fieldType) &&
      getRequestParamsMetaFields(formValues)
    )

    const filteredFieldMeta = (
      metaFieldsValues
        ? Object.keys(metaFieldsValues)
          .filter((key) => metaFieldsValues[key] !== null)
          .reduce((acc, key) => {
            acc[key] = metaFieldsValues[key]
            return acc
          }, {})
        : {}
    )

    return {
      code: formValues.code,
      name: formValues.name,
      fieldType: formValues.fieldType,
      required: formValues.required,
      ...(field?.order && {
        order: field.order,
      }),
      ...(formValues.readOnly !== undefined && {
        readOnly: formValues.readOnly,
      }),
      ...(formValues.confidential !== undefined && {
        confidential: formValues.confidential,
      }),
      fieldMeta: filteredFieldMeta,
    }
  },
  [
    allowedFieldTypes,
    field?.order,
    getRequestParamsMetaFields,
  ])

  const onToggleVisible = useCallback(() => setVisible((prev) => !prev), [])

  const saveData = useCallback(async () => {
    await onSave(getRequestParams(getValues()))
    onToggleVisible()
  }, [
    getRequestParams,
    getValues,
    onSave,
    onToggleVisible,
  ])

  const getContainer = useCallback(() => document.body, [])

  const OpenButton = useMemo(() => {
    if (renderTrigger) {
      return renderTrigger(onToggleVisible)
    }

    return (
      <Button.Text
        disabled={disabled}
        onClick={onToggleVisible}
      >
        {children}
      </Button.Text>
    )
  }, [
    children,
    disabled,
    onToggleVisible,
    renderTrigger,
  ])

  const DrawerFooter = useMemo(() => (
    <DrawerFooterWrapper>
      <CancelButton
        onClick={onToggleVisible}
      >
        {localize(Localization.CANCEL)}
      </CancelButton>
      <Button
        disabled={!isDirty || !isValid}
        loading={fetching}
        onClick={saveData}
        type={ButtonType.PRIMARY}
      >
        {localize(Localization.SUBMIT)}
      </Button>
    </DrawerFooterWrapper>
  ), [
    fetching,
    isDirty,
    isValid,
    onToggleVisible,
    saveData,
  ])

  const drawerTitle = (
    field
      ? localize(Localization.EDIT_EXTRACTION_FIELD)
      : localize(Localization.ADD_EXTRACTION_FIELD)
  )

  return (
    <>
      {OpenButton}
      <Drawer
        destroyOnClose
        footer={DrawerFooter}
        getContainer={getContainer}
        hasCloseIcon={false}
        onClose={onToggleVisible}
        open={visible}
        title={drawerTitle}
        width={theme.size.drawerWidth}
      >
        <FormProvider {...methods}>
          <CreateOrChangeTypeFieldForm
            allowedFieldTypes={allowedFieldTypes}
            field={field}
          />
        </FormProvider>
      </Drawer>
    </>
  )
}

CreateOrChangeTypeFieldDrawerButton.propTypes = {
  disabled: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  children: childrenShape,
  renderTrigger: PropTypes.func,
  field: documentTypeFieldShape,
  fetching: PropTypes.bool,
  allowedFieldTypes: PropTypes.arrayOf(
    PropTypes.oneOf(
      Object.values(FieldType),
    ),
  ),
}

export {
  CreateOrChangeTypeFieldDrawerButton,
}
