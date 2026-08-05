
import { mockReact } from '@/mocks/mockReact'
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { shallow } from 'enzyme'
import React from 'react'
import { useWatch } from 'react-hook-form'
import { FormItem } from '@/components/Form/ReactHookForm'
import { ALLOWED_FIELD_TYPES_FOR_DISPLAY_MODE_FEATURE } from '@/constants/field'
import { ManageDisplayModeFormSection } from '@/containers/ManageDisplayModeFormSection'
import { FieldType } from '@/enums/FieldType'
import { DocumentTypeField } from '@/models/DocumentTypeField'
import {
  TableFieldMeta,
  TableFieldColumn,
  DictFieldMeta,
  ListFieldMeta,
  EnumFieldMeta,
} from '@/models/DocumentTypeFieldMeta'
import { ENV } from '@/utils/env'
import { Collapse } from './CreateOrChangeTypeFieldDrawerButton.styles'
import { CreateOrChangeTypeFieldForm } from './CreateOrChangeTypeFieldForm'

const mockSetValue = jest.fn()
const mockFieldCode = 'code'
const mockValue = 'test'

jest.mock('react-hook-form', () => ({
  ...mockReactHookForm,
  useFormContext: jest.fn(() => ({
    control: {},
    setValue: mockSetValue,
  })),
}))

jest.mock('react', () => mockReact())
jest.mock('@/utils/env', () => mockEnv)

describe('Component: CreateOrChangeTypeFieldForm', () => {
  let defaultProps
  let wrapper

  beforeEach(() => {
    defaultProps = {
      field: new DocumentTypeField(
        'stringCode',
        'stringName',
        {},
        FieldType.STRING,
        true,
        0,
        '11111',
        0,
        false,
        false,
      ),
    }

    wrapper = shallow(<CreateOrChangeTypeFieldForm {...defaultProps} />)
  })

  it('should render layout correctly based on props', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should render layout correctly for Table fieldType', () => {
    defaultProps.field = new DocumentTypeField(
      'tableCode',
      'tableName',
      new TableFieldMeta([
        new TableFieldColumn('column title'),
      ]),
      FieldType.TABLE,
      true,
      3,
      'mockDocumentTypeCode',
      0,
    )

    useWatch.mockImplementationOnce(() => FieldType.TABLE)

    wrapper.setProps(defaultProps)

    expect(wrapper).toMatchSnapshot()
  })

  it('should render layout correctly for Dictionary fieldType', () => {
    defaultProps.field = new DocumentTypeField(
      'kvCode',
      'kvName',
      new DictFieldMeta(),
      FieldType.DICTIONARY,
      false,
      0,
      'whole',
      7,
    )

    useWatch.mockImplementationOnce(() => FieldType.DICTIONARY)

    wrapper.setProps(defaultProps)

    expect(wrapper).toMatchSnapshot()
  })

  it('should render layout correctly for List fieldType', () => {
    defaultProps.field = new DocumentTypeField(
      'listCode',
      'listName',
      new ListFieldMeta(FieldType.DICTIONARY, new DictFieldMeta()),
      FieldType.LIST,
      false,
      0,
      'whole',
      4,
    )

    useWatch.mockImplementationOnce(() => FieldType.LIST)

    wrapper.setProps(defaultProps)

    expect(wrapper).toMatchSnapshot()
  })

  it('should render layout correctly for Enum fieldType', () => {
    defaultProps.field = new DocumentTypeField(
      'enumCode',
      'enumName',
      new EnumFieldMeta(['firstOption', 'secondOption']),
      FieldType.ENUM,
      false,
      0,
      'whole',
      9,
    )

    useWatch.mockImplementationOnce(() => FieldType.ENUM)

    wrapper.setProps(defaultProps)

    expect(wrapper).toMatchSnapshot()
  })

  it('should render layout correctly for list of enums', () => {
    defaultProps.field = new DocumentTypeField(
      'LIST ENUMERATIONS',
      'LIST ENUMERATIONS',
      new ListFieldMeta(
        FieldType.ENUM,
        new EnumFieldMeta(['firstOption', 'secondOption']),
      ),
      FieldType.LIST,
      false,
      0,
      'whole',
      12,
    )

    useWatch.mockImplementationOnce(() => FieldType.LIST).mockImplementationOnce(() => FieldType.ENUM)

    wrapper.setProps(defaultProps)

    expect(wrapper).toMatchSnapshot()
  })

  it('should not display additional options if fieldType === CHECKMARK', () => {
    defaultProps.field = new DocumentTypeField(
      'CHECKMARK',
      'CHECKMARK',
      null,
      FieldType.CHECKMARK,
      false,
      0,
      'whole',
      66,
    )

    useWatch.mockImplementationOnce(() => FieldType.CHECKMARK)

    wrapper.setProps(defaultProps)

    expect(wrapper.find(Collapse).exists()).toBe(false)
  })

  it('should not display additional options if fieldType === LIST and baseType === CHECKMARK', () => {
    defaultProps.field = new DocumentTypeField(
      'LIST CHECKMARK',
      'LIST CHECKMARK',
      new ListFieldMeta(FieldType.CHECKMARK, null),
      FieldType.LIST,
      false,
      0,
      'whole',
      12,
    )

    useWatch.mockImplementationOnce(() => FieldType.LIST).mockImplementationOnce(() => FieldType.CHECKMARK)

    wrapper.setProps(defaultProps)

    expect(wrapper.find(Collapse).exists()).toBe(false)
  })

  it('should not display additional options if fieldType is not in the allowedFieldTypes prop', () => {
    defaultProps.field = new DocumentTypeField(
      'STRING',
      'STRING',
      null,
      FieldType.STRING,
      false,
      0,
      'code',
      66,
    )

    wrapper.setProps({
      ...defaultProps,
      allowedFieldTypes: [FieldType.DATE],
    })

    expect(wrapper.find(Collapse).exists()).toBe(false)
  })

  it('should call setValue if field prop exists and onChange event is triggered on field with code "name"', () => {
    const mockEvent = {
      target: {
        value: mockValue,
      },
    }

    wrapper.setProps({
      ...defaultProps,
      field: undefined,
    })

    const FormComponent = wrapper.find(FormItem).at(0)
    FormComponent.props().field.handler.onChange(mockEvent)

    expect(mockSetValue).nthCalledWith(1, mockFieldCode, mockValue, { shouldValidate: true })
  })

  it('should not render display mode form section in case feature flag is off', () => {
    ENV.FEATURE_FIELDS_DISPLAY_MODE = false

    wrapper = shallow(<CreateOrChangeTypeFieldForm {...defaultProps} />)

    expect(wrapper.find(ManageDisplayModeFormSection).exists()).toBe(false)

    ENV.FEATURE_FIELDS_DISPLAY_MODE = true
    jest.clearAllMocks()
  })

  it('should not render display mode form section if fieldType is not in the allowed list', () => {
    defaultProps.field = new DocumentTypeField(
      'CHECKMARK',
      'CHECKMARK',
      null,
      FieldType.CHECKMARK,
      false,
      0,
      'whole',
      66,
    )

    useWatch
      .mockImplementationOnce(() => FieldType.CHECKMARK)
      .mockImplementationOnce(() => undefined)

    wrapper.setProps(defaultProps)

    expect(ALLOWED_FIELD_TYPES_FOR_DISPLAY_MODE_FEATURE).not.toContain(FieldType.CHECKMARK)
    expect(wrapper.find(ManageDisplayModeFormSection).exists()).toBe(false)
  })

  it('should pass displayCharLimit from valueMeta to ManageDisplayModeFormSection for Dictionary field', () => {
    const mockDisplayCharLimit = 5

    defaultProps.field = new DocumentTypeField(
      'kvCode',
      'kvName',
      {
        keyType: FieldType.STRING,
        valueType: FieldType.STRING,
        valueMeta: {
          displayCharLimit: mockDisplayCharLimit,
        },
      },
      FieldType.DICTIONARY,
      false,
      0,
      'whole',
      7,
    )

    useWatch.mockImplementationOnce(() => FieldType.DICTIONARY)

    wrapper.setProps(defaultProps)

    expect(wrapper.find(ManageDisplayModeFormSection).props().displayCharLimit).toBe(mockDisplayCharLimit)
  })
})
