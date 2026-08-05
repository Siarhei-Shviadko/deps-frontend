
import PropTypes from 'prop-types'
import { DocumentTypeFieldCategory } from '@/enums/DocumentTypeFieldCategory'
import { FieldType } from '@/enums/FieldType'
import {
  fieldMetaShape,
  dictFieldMetaShape,
  tableFieldMetaShape,
  enumFieldMetaShape,
  listFieldMetaShape,
} from '@/models/DocumentTypeFieldMeta'
import { LLMExtractors } from '@/models/LLMExtractor'

const KEY_INDEX = 'key'
const VALUE_INDEX = 'value'

class DocumentTypeField {
  constructor (
    code,
    name,
    fieldMeta,
    fieldType,
    required,
    order,
    documentTypeCode,
    pk,
    readOnly,
    confidential,
  ) {
    this.code = code
    this.name = name
    this.fieldType = fieldType
    this.fieldMeta = fieldMeta
    this.required = required
    this.order = order
    this.documentTypeCode = documentTypeCode
    this.pk = pk
    readOnly !== undefined && (this.readOnly = readOnly)
    confidential !== undefined && (this.confidential = confidential)
  }

  static mapListFieldToDocumentTypeFieldConfigItem = (
    listFieldConfig,
    index = 0,
    alias,
  ) => {
    return {
      ...new DocumentTypeField(
        listFieldConfig.code,
        alias,
        listFieldConfig.fieldMeta.baseTypeMeta,
        listFieldConfig.fieldMeta.baseType,
        false,
        listFieldConfig.order,
        listFieldConfig.documentTypeCode,
        listFieldConfig.pk,
        listFieldConfig.readOnly,
        listFieldConfig.confidential,
      ),
      fieldIndex: index,
    }
  }

  static mapDictFieldToDocumentTypeFieldItems = (
    dictFieldConfig,
  ) => {
    const keyField = {
      ...new DocumentTypeField(
        dictFieldConfig.code,
        dictFieldConfig.name,
        dictFieldConfig.fieldMeta.keyMeta,
        dictFieldConfig.fieldMeta.keyType,
        dictFieldConfig.required,
        dictFieldConfig.order,
        dictFieldConfig.documentTypeCode,
        dictFieldConfig.pk,
      ),
      fieldIndex: dictFieldConfig.fieldIndex,
      fieldId: KEY_INDEX,
    }

    const valueField = {
      ...new DocumentTypeField(
        dictFieldConfig.code,
        dictFieldConfig.name,
        dictFieldConfig.fieldMeta.valueMeta,
        dictFieldConfig.fieldMeta.valueType,
        dictFieldConfig.required,
        dictFieldConfig.order,
        dictFieldConfig.documentTypeCode,
        dictFieldConfig.pk,
        dictFieldConfig.readOnly,
        dictFieldConfig.confidential,
      ),
      fieldIndex: dictFieldConfig.fieldIndex,
      fieldId: VALUE_INDEX,
    }

    return [keyField, valueField]
  }

  static getFieldCategory = (fieldCode, extractors) => {
    const llmExtractor = LLMExtractors.getExtractorByQueryCode(fieldCode, extractors)

    return llmExtractor ? DocumentTypeFieldCategory.GEN_AI : DocumentTypeFieldCategory.EXTRACTION
  }
}

const documentTypeFieldShape = PropTypes.shape({
  code: PropTypes.string.isRequired,
  name: PropTypes.string,
  fieldMeta: PropTypes.oneOfType([
    dictFieldMetaShape,
    fieldMetaShape,
    tableFieldMetaShape,
    enumFieldMetaShape,
    listFieldMetaShape,
  ]),
  documentTypeCode: PropTypes.string.isRequired,
  pk: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
  fieldType: PropTypes.oneOf(Object.values(FieldType)).isRequired,
  required: PropTypes.bool.isRequired,
  order: PropTypes.number,
  fieldIndex: PropTypes.number,
  readOnly: PropTypes.bool,
  confidential: PropTypes.bool,
  promptValue: PropTypes.string,
})

export {
  DocumentTypeField,
  documentTypeFieldShape,
  KEY_INDEX,
  VALUE_INDEX,
}
