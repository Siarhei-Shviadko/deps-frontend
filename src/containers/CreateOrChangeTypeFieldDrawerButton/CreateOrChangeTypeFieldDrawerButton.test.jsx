
import { mockReact } from '@/mocks/mockReact'
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { shallow } from 'enzyme'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/Button'
import { FieldType } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import { DocumentTypeField } from '@/models/DocumentTypeField'
import {
  TableFieldColumn,
  TableFieldMeta,
  ListFieldMeta,
  EnumFieldMeta,
} from '@/models/DocumentTypeFieldMeta'
import { Drawer } from './CreateOrChangeTypeFieldDrawerButton.styles'
import { CreateOrChangeTypeFieldDrawerButton } from '.'

jest.mock('react-hook-form', () => mockReactHookForm)
jest.mock('react', () => mockReact())
jest.mock('@/utils/env', () => mockEnv)

const mockField = new DocumentTypeField(
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
)

describe('Component: CreateOrChangeTypeFieldDrawerButton', () => {
  let defaultProps
  let wrapper

  beforeEach(() => {
    defaultProps = {
      onSave: jest.fn(),
      children: 'open_button_text',
      disabled: false,
      fetching: false,
    }

    wrapper = shallow(<CreateOrChangeTypeFieldDrawerButton {...defaultProps} />)
  })

  it('should render layout correctly based on props', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should render Drawer in correct container', () => {
    const container = wrapper.find(Drawer).props().getContainer()

    expect(container).toEqual(document.body)
  })

  it('should render correct trigger if renderTrigger prop was passed', () => {
    const mockTrigger = <div className="trigger" />

    defaultProps.renderTrigger = jest.fn(() => mockTrigger)
    wrapper.setProps(defaultProps)

    expect(wrapper.find('.trigger').exists()).toBe(true)
  })

  it('should render correct drawer title if field prop was passed', () => {
    defaultProps.field = mockField
    wrapper.setProps(defaultProps)

    expect(wrapper.find(Drawer).props().title).toBe(localize(Localization.EDIT_EXTRACTION_FIELD))
  })

  it('should call onSave with correct argument in case creating a field with type Table', () => {
    const mockedResult = {
      fieldMeta: new TableFieldMeta([
        new TableFieldColumn('a'),
      ]),
      code: 'code',
      fieldType: FieldType.TABLE,
      name: 'name',
      required: 'test',
    }

    const mockFormValues = {
      code: 'code',
      name: 'name',
      fieldType: FieldType.TABLE,
      required: 'test',
      columns: ['a'],
    }

    useForm.mockImplementation(() => ({
      formState: {},
      getValues: jest.fn(() => mockFormValues),
    }))

    wrapper.setProps({
      ...defaultProps,
      allowedFieldTypes: [FieldType.TABLE],
    })

    const Footer = wrapper.find(Drawer).props().footer
    const DrawerFooter = shallow(<div>{Footer}</div>)
    DrawerFooter.find(Button).props().onClick()

    expect(defaultProps.onSave).toBeCalledWith(mockedResult)
  })

  it('should call onSave with correct argument in case creating a field with type String', () => {
    const mockedResult = {
      code: 'code',
      fieldType: FieldType.STRING,
      name: 'name',
      required: 'test',
      readOnly: false,
      confidential: false,
      fieldMeta: {},
    }

    const mockFormValues = {
      code: 'code',
      name: 'name',
      fieldType: FieldType.STRING,
      required: 'test',
      readOnly: false,
      confidential: false,
    }

    useForm.mockImplementation(() => ({
      formState: {},
      getValues: jest.fn(() => mockFormValues),
    }))

    wrapper.setProps(defaultProps)

    const Footer = wrapper.find(Drawer).props().footer
    const DrawerFooter = shallow(<div>{Footer}</div>)
    DrawerFooter.find(Button).props().onClick()

    expect(defaultProps.onSave).toBeCalledWith(mockedResult)
  })

  it('should call onSave with correct argument in case creating a field with type Dictionary', () => {
    const mockedResult = {
      fieldMeta: {
        keyMeta: {
          charBlacklist: null,
          charWhitelist: null,
          displayCharLimit: null,
        },
        keyType: 'string',
        valueMeta: {
          charBlacklist: null,
          charWhitelist: null,
          displayCharLimit: null,
        },
        valueType: 'string',
      },
      code: 'code',
      fieldType: FieldType.DICTIONARY,
      name: 'name',
      required: 'test',
    }

    const mockFormValues = {
      code: 'code',
      name: 'name',
      fieldType: FieldType.DICTIONARY,
      required: 'test',
      keyType: 'string',
      valueType: 'string',
    }

    useForm.mockImplementation(() => ({
      formState: {},
      getValues: jest.fn(() => mockFormValues),
    }))

    wrapper.setProps({
      ...defaultProps,
      allowedFieldTypes: [FieldType.DICTIONARY],
    })

    const Footer = wrapper.find(Drawer).props().footer
    const DrawerFooter = shallow(<div>{Footer}</div>)
    DrawerFooter.find(Button).props().onClick()

    expect(defaultProps.onSave).toBeCalledWith(mockedResult)
  })

  it('should call onSave with displayCharLimit in fieldMeta when creating Dictionary field with masking', () => {
    const mockDisplayCharLimit = 5
    const mockedResult = {
      fieldMeta: {
        keyMeta: {
          charBlacklist: null,
          charWhitelist: null,
          displayCharLimit: mockDisplayCharLimit,
        },
        keyType: 'string',
        valueMeta: {
          charBlacklist: null,
          charWhitelist: null,
          displayCharLimit: mockDisplayCharLimit,
        },
        valueType: 'string',
      },
      code: 'code',
      fieldType: FieldType.DICTIONARY,
      name: 'name',
      required: 'test',
    }

    const mockFormValues = {
      code: 'code',
      name: 'name',
      fieldType: FieldType.DICTIONARY,
      required: 'test',
      keyType: 'string',
      valueType: 'string',
      displayCharLimit: mockDisplayCharLimit,
    }

    useForm.mockImplementation(() => ({
      formState: {},
      getValues: jest.fn(() => mockFormValues),
    }))

    wrapper.setProps({
      ...defaultProps,
      allowedFieldTypes: [FieldType.DICTIONARY],
    })

    const Footer = wrapper.find(Drawer).props().footer
    const DrawerFooter = shallow(<div>{Footer}</div>)
    DrawerFooter.find(Button).props().onClick()

    expect(defaultProps.onSave).toBeCalledWith(mockedResult)
  })

  it('should call on save with correct argument in case creating a field with type List', () => {
    const mockedResult = {
      fieldMeta: new ListFieldMeta(
        FieldType.STRING,
        {
          charBlacklist: null,
          charWhitelist: null,
          displayCharLimit: null,
        }),
      code: 'code',
      fieldType: FieldType.LIST,
      name: 'name',
      required: 'test',
    }

    const mockFormValues = {
      code: 'code',
      name: 'name',
      fieldType: FieldType.LIST,
      required: 'test',
      baseType: 'string',
    }

    useForm.mockImplementation(() => ({
      formState: {},
      getValues: jest.fn(() => mockFormValues),
    }))

    wrapper.setProps({
      ...defaultProps,
      allowedFieldTypes: [FieldType.STRING],
    })

    const Footer = wrapper.find(Drawer).props().footer
    const DrawerFooter = shallow(<div>{Footer}</div>)
    DrawerFooter.find(Button).props().onClick()

    expect(defaultProps.onSave).toBeCalledWith(mockedResult)
  })

  it('should call onSave with correct argument in case creating a field with type Checkmark', () => {
    const mockedResult = {
      code: 'code',
      fieldType: FieldType.CHECKMARK,
      name: 'name',
      required: 'test',
      fieldMeta: {},
    }

    const mockFormValues = {
      code: 'code',
      name: 'name',
      fieldType: FieldType.CHECKMARK,
      required: 'test',
    }

    useForm.mockImplementation(() => ({
      formState: {},
      getValues: jest.fn(() => mockFormValues),
    }))

    wrapper.setProps({
      ...defaultProps,
      allowedFieldTypes: [FieldType.CHECKMARK],
    })
    const Footer = wrapper.find(Drawer).props().footer
    const DrawerFooter = shallow(<div>{Footer}</div>)
    DrawerFooter.find(Button).props().onClick()

    expect(defaultProps.onSave).toBeCalledWith(mockedResult)
  })

  it('should call onSave with correct argument in case creating a field with type Enum', () => {
    const mockedResult = {
      fieldMeta: new EnumFieldMeta(['firstOption', 'secondOption']),
      code: 'code',
      fieldType: FieldType.ENUM,
      name: 'name',
      required: 'test',
    }

    const mockFormValues = {
      code: 'code',
      name: 'name',
      fieldType: FieldType.ENUM,
      required: 'test',
      options: ['firstOption', 'secondOption'],
    }

    useForm.mockImplementation(() => ({
      formState: {},
      getValues: jest.fn(() => mockFormValues),
    }))

    wrapper.setProps({
      ...defaultProps,
      allowedFieldTypes: [FieldType.ENUM],
    })
    const Footer = wrapper.find(Drawer).props().footer
    const DrawerFooter = shallow(<div>{Footer}</div>)
    DrawerFooter.find(Button).props().onClick()

    expect(defaultProps.onSave).toBeCalledWith(mockedResult)
  })
})
