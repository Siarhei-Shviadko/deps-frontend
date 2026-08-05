
import { CHAR_TYPE } from '@/containers/FieldBusinessRuleModal/constants'
import { MULTIPLICITY } from '@/containers/PromptCalibrationStudio/viewModels'
import { FieldType } from '@/enums/FieldType'

const getDictionaryMeta = (displayCharLimit) => ({
  keyType: FieldType.STRING,
  valueType: FieldType.STRING,
  ...(displayCharLimit != null && { valueMeta: { displayCharLimit } }),
})

const getStringMeta = (displayCharLimit) => ({
  charType: CHAR_TYPE.ALPHANUMERIC,
  ...(displayCharLimit != null && { displayCharLimit }),
})

const getBooleanMeta = () => ({
  charType: CHAR_TYPE.BOOLEAN,
})

const mapBaseTypeToMetaGetter = {
  [FieldType.STRING]: getStringMeta,
  [FieldType.CHECKMARK]: getBooleanMeta,
  [FieldType.DICTIONARY]: getDictionaryMeta,
}

export const mapFieldToExtractionField = (field) => {
  const {
    multiplicity,
    fieldType: baseType,
    confidential,
    name,
    readOnly,
    required,
    extractorId,
    order,
    displayCharLimit,
  } = field

  const isMultiple = multiplicity === MULTIPLICITY.MULTIPLE
  const fieldType = isMultiple ? FieldType.LIST : baseType

  const baseTypeMeta = mapBaseTypeToMetaGetter[baseType](displayCharLimit)

  const getFieldMeta = () => {
    if (isMultiple) {
      return {
        baseType,
        baseTypeMeta,
      }
    }

    return baseTypeMeta
  }

  const fieldMeta = getFieldMeta()

  return {
    name,
    required,
    readOnly,
    confidential,
    fieldType,
    extractorId,
    fieldMeta,
    order,
  }
}
