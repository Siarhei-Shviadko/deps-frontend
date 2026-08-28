
import { mockReact } from '@/mocks/mockReact'
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import flushPromises from 'flush-promises'
import { useState } from 'react'
import { clearKeyToAssign, setActiveTable } from '@/actions/prototypePage'
import { FieldType } from '@/enums/FieldType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { MappingType } from '@/enums/MappingType'
import { DocumentTypeField } from '@/models/DocumentTypeField'
import { TableFieldColumn, TableFieldMeta } from '@/models/DocumentTypeFieldMeta'
import { Prototype } from '@/models/Prototype'
import {
  PrototypeField,
  PrototypeFieldMapping,
  PrototypeFieldType,
} from '@/models/PrototypeField'
import { PrototypeTableField, PrototypeTableHeader, PrototypeTabularMapping, TableHeaderType } from '@/models/PrototypeTableField'
import { usePrototypeEditMode } from './usePrototypeEditMode'

const mockExtractionField = new DocumentTypeField('code', 'name')

const mockUpdatePrototype = jest.fn(() => ({
  unwrap: jest.fn(),
}))
const mockUpdatePrototypeField = jest.fn(() => ({
  unwrap: jest.fn(),
}))
const mockUpdatePrototypeFieldMapping = jest.fn(() => ({
  unwrap: jest.fn(),
}))
const mockCreatePrototypeField = jest.fn(() => ({
  unwrap: jest.fn(() => Promise.resolve(mockExtractionField)),
}))
const mockDeletePrototypeFields = jest.fn(() => ({
  unwrap: jest.fn(),
}))
const mockCreatePrototypeFieldMapping = jest.fn(() => ({
  unwrap: jest.fn(),
}))

const mockCreatePrototypeTabularMapping = jest.fn(() => ({
  unwrap: () => jest.fn(),
}))

const mockUpdatePrototypeTabularMapping = jest.fn(() => ({
  unwrap: () => jest.fn(),
}))

const mockField = new PrototypeField({
  id: 'fieldId',
  prototypeId: 'prototypeId',
  name: 'Test Field1',
  fieldType: new PrototypeFieldType({
    typeCode: FieldType.STRING,
    description: {},
  }),
  mapping: new PrototypeFieldMapping({
    keys: [
      'mappingKey1',
      'mappingKey2',
    ],
    mappingDataType: FieldType.STRING,
    mappingType: MappingType.ONE_TO_ONE,
  }),
  required: true,
})

const mockTableField = new PrototypeTableField({
  id: 'tableFieldId',
  prototypeId: 'prototypeId',
  name: 'Test Table Field',
  fieldType: new PrototypeFieldType({
    typeCode: FieldType.TABLE,
    description: new TableFieldMeta([
      new TableFieldColumn('Row name'),
    ]),
  }),
  tabularMapping: new PrototypeTabularMapping({
    headerType: TableHeaderType.ROWS,
    headers: [
      new PrototypeTableHeader({
        name: 'Row name',
        aliases: ['Row alias'],
      }),
    ],
    occurrenceIndex: 1,
  }),
  required: false,
})

const mockCreatedField = {
  ...mockField,
  id: 'createdFieldId',
}

const mockCreatedTableField = {
  ...mockTableField,
  id: 'createdTableFieldId',
}

const mockModifiedField = {
  ...mockField,
  name: 'modifiedFieldName',
  mapping: new PrototypeFieldMapping({
    keys: [
      'modifiedKey',
      'mappingKey2',
    ],
    mappingType: MappingType.ONE_TO_ONE,
  }),
}

const mockModifiedTableField = {
  ...mockTableField,
  name: 'modifiedTableFieldName',
  fieldType: new PrototypeFieldType({
    typeCode: FieldType.TABLE,
    description: new TableFieldMeta([
      new TableFieldColumn('Col name'),
    ]),
  }),
  tabularMapping: new PrototypeTabularMapping({
    headerType: TableHeaderType.COLUMNS,
    headers: [
      new PrototypeTableHeader({
        name: 'Col name',
        aliases: ['Col alias'],
      }),
    ],
    occurrenceIndex: 2,
  }),
}

const mockPrototype = new Prototype({
  id: 'testId',
  name: 'testName',
  engine: KnownProcessingEngines.TESSERACT,
  language: KnownLanguage.ENGLISH,
  createdAt: '2023-12-22T07:25:56.466801',
  description: null,
  fields: [mockField],
  tableFields: [mockTableField],
})

const mockModifiedPrototype = new Prototype({
  id: 'testId',
  name: 'testName',
  engine: KnownProcessingEngines.AWS_TEXTRACT,
  language: KnownLanguage.ENGLISH,
  createdAt: '2023-12-22T07:25:56.466801',
  description: null,
  fields: [
    mockModifiedField,
    mockCreatedField,
  ],
  tableFields: [
    mockModifiedTableField,
    mockCreatedTableField,
  ],
})

jest.mock('@/utils/notification', () => mockNotification)
jest.mock('react', () => mockReact())
jest.mock('react-redux', () => mockReactRedux)
jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/apiRTK/extractionFieldsApi', () => ({
  useUpdateExtractionFieldMutation: jest.fn(() => ([
    mockUpdatePrototypeField,
    { isLoading: false },
  ])),
  useCreateExtractionFieldMutation: jest.fn(() => ([
    mockCreatePrototypeField,
    { isLoading: false },
  ])),
  useDeleteExtractionFieldMutation: jest.fn(() => ([
    mockDeletePrototypeFields,
    { isLoading: false },
  ])),
}))

jest.mock('@/apiRTK/prototypesApi', () => ({
  useUpdatePrototypeMutation: jest.fn(() => ([
    mockUpdatePrototype,
    { isLoading: false },
  ])),
  useUpdatePrototypeFieldMappingMutation: jest.fn(() => ([
    mockUpdatePrototypeFieldMapping,
    { isLoading: false },
  ])),
  useCreatePrototypeFieldMappingMutation: jest.fn(() => ([
    mockCreatePrototypeFieldMapping,
    { isLoading: false },
  ])),
  useCreatePrototypeTabularMappingMutation: jest.fn(() => [
    mockCreatePrototypeTabularMapping,
    { isLoading: false },
  ]),
  useUpdatePrototypeTabularMappingMutation: jest.fn(() => [
    mockUpdatePrototypeTabularMapping,
    { isLoading: false },
  ]),
}))

jest.mock('@/actions/prototypePage', () => ({
  setActiveTable: jest.fn(),
  clearKeyToAssign: jest.fn(),
}))

const Wrapper = () => (
  <div {...usePrototypeEditMode(mockPrototype)} />
)

describe('Hook: usePrototypeEditMode', () => {
  let props

  beforeEach(() => {
    jest.clearAllMocks()

    useState.mockReturnValueOnce([true, jest.fn()])
    useState.mockReturnValueOnce([mockModifiedPrototype, jest.fn()])

    const wrapper = shallow(<Wrapper />)
    props = wrapper.props()
  })

  it('should return expected API', () => {
    expect(props).toMatchSnapshot()
  })

  it('should call updatePrototypeData api method if prototype info data was modified and savePrototype prop was called', async () => {
    props.onSave()

    await flushPromises()

    expect(mockUpdatePrototype).nthCalledWith(1, {
      prototypeId: mockPrototype.id,
      engine: mockModifiedPrototype.engine,
      language: mockModifiedPrototype.language,
    })
  })

  it('should call updatePrototypeField api method if field was modified and savePrototype prop was called', async () => {
    props.onSave()

    await flushPromises()

    expect(mockUpdatePrototypeField).nthCalledWith(1, {
      documentTypeCode: mockPrototype.id,
      fieldCode: mockModifiedField.id,
      data: {
        name: mockModifiedField.name,
        readOnly: mockModifiedField.readOnly,
        confidential: mockModifiedField.readOnly,
        fieldType: mockModifiedField.fieldType.typeCode,
        fieldMeta: mockModifiedField.fieldType.description,
        required: mockModifiedField.required,
      },
    })

    expect(mockUpdatePrototypeField).nthCalledWith(2, {
      documentTypeCode: mockPrototype.id,
      fieldCode: mockModifiedTableField.id,
      data: {
        name: mockModifiedTableField.name,
        fieldType: mockModifiedTableField.fieldType.typeCode,
        fieldMeta: mockModifiedTableField.fieldType.description,
        required: mockModifiedTableField.required,
      },
    })
  })

  it('should call updatePrototypeFieldMapping api method if field mapping was modified and savePrototype prop was called', async () => {
    props.onSave()

    await flushPromises()

    expect(mockUpdatePrototypeFieldMapping).nthCalledWith(1, {
      prototypeId: mockPrototype.id,
      fieldCode: mockModifiedField.id,
      keys: mockModifiedField.mapping.keys,
    })
  })

  it('should call updateTabularMappingRequests api method if table field mapping was modified and savePrototype prop was called', async () => {
    props.onSave()

    await flushPromises()

    expect(mockUpdatePrototypeTabularMapping).nthCalledWith(1, {
      prototypeId: mockPrototype.id,
      fieldCode: mockModifiedTableField.id,
      tabularMapping: mockModifiedTableField.tabularMapping,
    })
  })

  it('should call createPrototypeField api method if field was created and savePrototype prop was called', async () => {
    props.onSave()

    await flushPromises()

    expect(mockCreatePrototypeField).nthCalledWith(1, {
      documentTypeCode: mockPrototype.id,
      field: {
        name: mockCreatedField.name,
        readOnly: mockCreatedField.readOnly,
        confidential: mockCreatedField.confidential,
        fieldType: mockCreatedField.fieldType.typeCode,
        fieldMeta: mockCreatedField.fieldType.description,
        required: mockCreatedField.required,
      },
    })

    expect(mockCreatePrototypeField).nthCalledWith(2, {
      documentTypeCode: mockPrototype.id,
      field: {
        name: mockCreatedTableField.name,
        fieldType: mockCreatedTableField.fieldType.typeCode,
        fieldMeta: new TableFieldMeta(
          mockCreatedTableField.tabularMapping.headers.map((h) => (
            new TableFieldColumn(h.name)
          )),
        ),
        required: mockCreatedTableField.required,
      },
    })
  })

  it('should call createPrototypeFieldMapping api method if field was created and savePrototype prop was called', async () => {
    jest.clearAllMocks()

    props.onSave()

    await flushPromises()

    expect(mockCreatePrototypeFieldMapping).nthCalledWith(1, {
      prototypeId: mockPrototype.id,
      field: {
        ...mockExtractionField,
        mapping: mockCreatedField.mapping,
      },
    })
  })

  it('should call createPrototypeTabularMapping api method if table field was created and savePrototype prop was called', async () => {
    jest.clearAllMocks()

    props.onSave()

    await flushPromises()

    expect(mockCreatePrototypeTabularMapping).nthCalledWith(1, {
      prototypeId: mockPrototype.id,
      data: {
        code: mockExtractionField.code,
        ...mockCreatedTableField.tabularMapping,
      },
    })
  })

  it('should call deletePrototypeFields api method if field was deleted and savePrototype prop was called', async () => {
    useState.mockReturnValueOnce([true, jest.fn()])
    useState.mockReturnValueOnce([{
      ...mockPrototype,
      fields: [],
    }, jest.fn()])

    const wrapper = shallow(<Wrapper />)
    wrapper.props().onSave()

    await flushPromises()

    expect(mockDeletePrototypeFields).nthCalledWith(1, {
      documentTypeCode: mockPrototype.id,
      fieldCodes: [mockField.id],
    })
  })

  it('resets active k-v pairs and tables on cancel edit mode', async () => {
    jest.clearAllMocks()

    props.onCancel()

    expect(setActiveTable).nthCalledWith(1, null)
    expect(clearKeyToAssign).nthCalledWith(1)
  })
})
