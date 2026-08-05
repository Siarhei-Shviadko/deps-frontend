import { mockEnv } from '@/mocks/mockEnv'
import { FieldType } from '@/enums/FieldType'
import { DocumentTypeField, KEY_INDEX, VALUE_INDEX } from '@/models/DocumentTypeField'
import { DictFieldMeta } from '@/models/DocumentTypeFieldMeta'

jest.mock('@/utils/env', () => mockEnv)

const mockDocumentTypeCode = 'doc-type-1'
const mockFieldIndex = 2

const mockDictFieldConfig = {
  code: 'dictionary-field',
  name: 'Dictionary Field',
  fieldMeta: new DictFieldMeta({
    keyType: FieldType.STRING,
    valueType: FieldType.STRING,
    valueMeta: {
      displayCharLimit: 5,
    },
  }),
  required: true,
  order: 1,
  documentTypeCode: mockDocumentTypeCode,
  pk: 10,
  fieldIndex: mockFieldIndex,
  readOnly: true,
  confidential: true,
}

test('maps dictionary field to key and value items with readOnly and confidential on value field', () => {
  const [keyField, valueField] = DocumentTypeField.mapDictFieldToDocumentTypeFieldItems(mockDictFieldConfig)

  expect(keyField).toEqual({
    code: mockDictFieldConfig.code,
    name: mockDictFieldConfig.name,
    fieldMeta: mockDictFieldConfig.fieldMeta.keyMeta,
    fieldType: mockDictFieldConfig.fieldMeta.keyType,
    required: mockDictFieldConfig.required,
    order: mockDictFieldConfig.order,
    documentTypeCode: mockDictFieldConfig.documentTypeCode,
    pk: mockDictFieldConfig.pk,
    fieldIndex: mockFieldIndex,
    fieldId: KEY_INDEX,
  })

  expect(valueField).toEqual({
    code: mockDictFieldConfig.code,
    name: mockDictFieldConfig.name,
    fieldMeta: mockDictFieldConfig.fieldMeta.valueMeta,
    fieldType: mockDictFieldConfig.fieldMeta.valueType,
    required: mockDictFieldConfig.required,
    order: mockDictFieldConfig.order,
    documentTypeCode: mockDictFieldConfig.documentTypeCode,
    pk: mockDictFieldConfig.pk,
    readOnly: mockDictFieldConfig.readOnly,
    confidential: mockDictFieldConfig.confidential,
    fieldIndex: mockFieldIndex,
    fieldId: VALUE_INDEX,
  })
})
