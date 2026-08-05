import { mockEnv } from '@/mocks/mockEnv'
import { CHAR_TYPE } from '@/containers/FieldBusinessRuleModal/constants'
import { MULTIPLICITY, Field } from '@/containers/PromptCalibrationStudio/viewModels'
import { FieldType } from '@/enums/FieldType'
import { mapFieldToExtractionField } from './mapFieldToExtractionField'

jest.mock('@/utils/env', () => mockEnv)

const mockExtractorId = 'mapped-extractor-1'
const mockDisplayCharLimit = 10

const mockField = new Field({
  id: 'field-1',
  name: 'Test Field',
  extractorId: mockExtractorId,
  multiplicity: MULTIPLICITY.SINGLE,
  fieldType: FieldType.STRING,
  confidential: false,
  readOnly: false,
  order: 1,
})

test('maps single multiplicity field correctly', () => {
  const result = mapFieldToExtractionField(mockField)

  expect(result).toEqual({
    name: mockField.name,
    required: false,
    readOnly: mockField.readOnly,
    confidential: mockField.confidential,
    fieldType: mockField.fieldType,
    extractorId: mockField.extractorId,
    fieldMeta: {
      charType: CHAR_TYPE.ALPHANUMERIC,
    },
    order: mockField.order,
  })
})

test('maps single STRING field with charType correctly', () => {
  const field = new Field({
    id: 'field-string',
    name: 'Test String Field',
    extractorId: mockExtractorId,
    multiplicity: MULTIPLICITY.SINGLE,
    fieldType: FieldType.STRING,
    confidential: false,
    readOnly: false,
    order: 2,
  })

  const result = mapFieldToExtractionField(field)

  expect(result.fieldMeta).toEqual({
    charType: CHAR_TYPE.ALPHANUMERIC,
  })
  expect(result.order).toBe(2)
})

test('maps single STRING field with displayCharLimit in fieldMeta', () => {
  const field = new Field({
    id: 'field-string-limit',
    name: 'Test String Field With Limit',
    extractorId: mockExtractorId,
    multiplicity: MULTIPLICITY.SINGLE,
    fieldType: FieldType.STRING,
    displayCharLimit: mockDisplayCharLimit,
    confidential: false,
    readOnly: false,
    order: 2,
  })

  const result = mapFieldToExtractionField(field)

  expect(result.fieldMeta).toEqual({
    charType: CHAR_TYPE.ALPHANUMERIC,
    displayCharLimit: mockDisplayCharLimit,
  })
})

test('maps single CHECKMARK field with charType correctly', () => {
  const field = new Field({
    id: 'field-checkmark',
    name: 'Test Checkmark Field',
    extractorId: mockExtractorId,
    multiplicity: MULTIPLICITY.SINGLE,
    fieldType: FieldType.CHECKMARK,
    confidential: false,
    readOnly: false,
    order: 3,
  })

  const result = mapFieldToExtractionField(field)

  expect(result).toEqual({
    name: field.name,
    required: false,
    readOnly: field.readOnly,
    confidential: field.confidential,
    fieldType: FieldType.CHECKMARK,
    extractorId: field.extractorId,
    fieldMeta: {
      charType: CHAR_TYPE.BOOLEAN,
    },
    order: field.order,
  })
})

test('maps multiple multiplicity field correctly with fieldMeta', () => {
  const field = new Field({
    id: 'field-2',
    name: 'Test Multiple Field',
    extractorId: mockExtractorId,
    multiplicity: MULTIPLICITY.MULTIPLE,
    fieldType: FieldType.STRING,
    confidential: true,
    readOnly: true,
    order: 4,
  })

  const result = mapFieldToExtractionField(field)

  expect(result).toEqual({
    name: field.name,
    required: false,
    readOnly: field.readOnly,
    confidential: field.confidential,
    fieldType: FieldType.LIST,
    extractorId: field.extractorId,
    fieldMeta: {
      baseType: FieldType.STRING,
      baseTypeMeta: {
        charType: CHAR_TYPE.ALPHANUMERIC,
      },
    },
    order: field.order,
  })
})

test('maps multiple STRING field with displayCharLimit in baseTypeMeta', () => {
  const field = new Field({
    id: 'field-multiple-string-limit',
    name: 'Test Multiple String Field With Limit',
    extractorId: mockExtractorId,
    multiplicity: MULTIPLICITY.MULTIPLE,
    fieldType: FieldType.STRING,
    displayCharLimit: mockDisplayCharLimit,
    confidential: false,
    readOnly: false,
    order: 4,
  })

  const result = mapFieldToExtractionField(field)

  expect(result.fieldMeta).toEqual({
    baseType: FieldType.STRING,
    baseTypeMeta: {
      charType: CHAR_TYPE.ALPHANUMERIC,
      displayCharLimit: mockDisplayCharLimit,
    },
  })
})

test('maps multiple CHECKMARK field correctly with charType in baseTypeMeta', () => {
  const field = new Field({
    id: 'field-multiple-checkmark',
    name: 'Test Multiple Checkmark Field',
    extractorId: mockExtractorId,
    multiplicity: MULTIPLICITY.MULTIPLE,
    fieldType: FieldType.CHECKMARK,
    confidential: false,
    readOnly: false,
    order: 5,
  })

  const result = mapFieldToExtractionField(field)

  expect(result).toEqual({
    name: field.name,
    required: false,
    readOnly: field.readOnly,
    confidential: field.confidential,
    fieldType: FieldType.LIST,
    extractorId: field.extractorId,
    fieldMeta: {
      baseType: FieldType.CHECKMARK,
      baseTypeMeta: {
        charType: CHAR_TYPE.BOOLEAN,
      },
    },
    order: field.order,
  })
})

test('maps single DICTIONARY field correctly with keyType and valueType', () => {
  const field = new Field({
    id: 'field-3',
    name: 'Test Dictionary Field',
    extractorId: mockExtractorId,
    multiplicity: MULTIPLICITY.SINGLE,
    fieldType: FieldType.DICTIONARY,
    confidential: false,
    readOnly: false,
    order: 6,
  })

  const result = mapFieldToExtractionField(field)

  expect(result).toEqual({
    name: field.name,
    required: false,
    readOnly: field.readOnly,
    confidential: field.confidential,
    fieldType: FieldType.DICTIONARY,
    extractorId: field.extractorId,
    fieldMeta: {
      keyType: FieldType.STRING,
      valueType: FieldType.STRING,
    },
    order: field.order,
  })
})

test('maps single DICTIONARY field with displayCharLimit in valueMeta', () => {
  const field = new Field({
    id: 'field-dictionary-limit',
    name: 'Test Dictionary Field With Limit',
    extractorId: mockExtractorId,
    multiplicity: MULTIPLICITY.SINGLE,
    fieldType: FieldType.DICTIONARY,
    displayCharLimit: mockDisplayCharLimit,
    confidential: false,
    readOnly: false,
    order: 6,
  })

  const result = mapFieldToExtractionField(field)

  expect(result.fieldMeta).toEqual({
    keyType: FieldType.STRING,
    valueType: FieldType.STRING,
    valueMeta: {
      displayCharLimit: mockDisplayCharLimit,
    },
  })
})

test('maps multiple DICTIONARY field (KVP list) correctly with baseTypeMeta', () => {
  const field = new Field({
    id: 'field-4',
    name: 'Test KVP List Field',
    extractorId: mockExtractorId,
    multiplicity: MULTIPLICITY.MULTIPLE,
    fieldType: FieldType.DICTIONARY,
    confidential: false,
    readOnly: false,
    order: 7,
  })

  const result = mapFieldToExtractionField(field)

  expect(result).toEqual({
    name: field.name,
    required: false,
    readOnly: field.readOnly,
    confidential: field.confidential,
    fieldType: FieldType.LIST,
    extractorId: field.extractorId,
    fieldMeta: {
      baseType: FieldType.DICTIONARY,
      baseTypeMeta: {
        keyType: FieldType.STRING,
        valueType: FieldType.STRING,
      },
    },
    order: field.order,
  })
})

test('maps multiple DICTIONARY field with displayCharLimit in baseTypeMeta valueMeta', () => {
  const field = new Field({
    id: 'field-multiple-dictionary-limit',
    name: 'Test KVP List Field With Limit',
    extractorId: mockExtractorId,
    multiplicity: MULTIPLICITY.MULTIPLE,
    fieldType: FieldType.DICTIONARY,
    displayCharLimit: mockDisplayCharLimit,
    confidential: false,
    readOnly: false,
    order: 7,
  })

  const result = mapFieldToExtractionField(field)

  expect(result.fieldMeta).toEqual({
    baseType: FieldType.DICTIONARY,
    baseTypeMeta: {
      keyType: FieldType.STRING,
      valueType: FieldType.STRING,
      valueMeta: {
        displayCharLimit: mockDisplayCharLimit,
      },
    },
  })
})

test('maps field with required=true correctly', () => {
  const field = new Field({
    id: 'field-required',
    name: 'Required Field',
    extractorId: mockExtractorId,
    multiplicity: MULTIPLICITY.SINGLE,
    fieldType: FieldType.STRING,
    confidential: false,
    readOnly: false,
    required: true,
    order: 8,
  })

  const result = mapFieldToExtractionField(field)

  expect(result.required).toBe(true)
  expect(result.order).toBe(8)
})

test('maps field with required=false correctly', () => {
  const field = new Field({
    id: 'field-not-required',
    name: 'Optional Field',
    extractorId: mockExtractorId,
    multiplicity: MULTIPLICITY.SINGLE,
    fieldType: FieldType.STRING,
    confidential: false,
    readOnly: false,
    required: false,
    order: 9,
  })

  const result = mapFieldToExtractionField(field)

  expect(result.required).toBe(false)
  expect(result.order).toBe(9)
})

test('preserves required property for multiple multiplicity fields', () => {
  const field = new Field({
    id: 'field-multiple-required',
    name: 'Multiple Required Field',
    extractorId: mockExtractorId,
    multiplicity: MULTIPLICITY.MULTIPLE,
    fieldType: FieldType.STRING,
    confidential: false,
    readOnly: false,
    required: true,
    order: 10,
  })

  const result = mapFieldToExtractionField(field)

  expect(result.required).toBe(true)
  expect(result.fieldType).toBe(FieldType.LIST)
  expect(result.order).toBe(10)
})
