
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen } from '@testing-library/react'
import { FormFieldType } from '@/components/Form'
import { useFieldCalibration } from '@/containers/PromptCalibrationStudio/hooks'
import { MULTIPLICITY } from '@/containers/PromptCalibrationStudio/viewModels'
import { FieldType } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import { render } from '@/utils/rendererRTL'
import { FIELD_FORM_CODE } from '../constants'
import { AddFieldForm } from './AddFieldForm'

var MockManageDisplayModeFormSection

let MockFormItem

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-hook-form', () => mockReactHookForm)
jest.mock('@/containers/PromptCalibrationStudio/hooks', () => ({
  useFieldCalibration: jest.fn(),
}))
jest.mock('@/components/Form', () => ({
  ...jest.requireActual('@/components/Form'),
  Form: ({ children }) => <form data-testid="form">{children}</form>,
  FormItem: (props) => {
    if (MockFormItem) {
      MockFormItem(props)
    }
    return (
      <div
        data-default-value={props.field.defaultValue}
        data-disabled={props.field.disabled}
        data-has-max-length={!!props.field.rules?.maxLength}
        data-has-options={!!props.field.options}
        data-has-pattern={!!props.field.rules?.pattern}
        data-has-render={!!props.field.render}
        data-has-required={!!props.field.rules?.required}
        data-has-rules={!!props.field.rules}
        data-placeholder={props.field.placeholder}
        data-testid={`form-item-${props.field.code}`}
        data-type={props.field.type}
      >
        {props.label && <label>{props.label}</label>}
        {props.requiredMark && <span>*</span>}
        {
          props.field.render ? props.field.render({}) : (
            <input
              name={props.field.code}
              placeholder={props.field.placeholder}
            />
          )
        }
      </div>
    )
  },
}))
jest.mock('../MultiplicitySwitcher', () => mockShallowComponent('MultiplicitySwitcher'))
jest.mock('@/containers/ManageDisplayModeFormSection', () => {
  const mock = mockShallowComponent('ManageDisplayModeFormSection')
  MockManageDisplayModeFormSection = mock.ManageDisplayModeFormSection
  return mock
})
jest.mock('./AddFieldForm.styles', () => ({
  StyledCollapse: ({ children, header }) => (
    <div data-testid="styled-collapse">
      <div>{header}</div>
      {children}
    </div>
  ),
  SwitchFormItem: ({ field, label }) => (
    <div
      data-testid={`switch-form-item-${field.code}`}
      data-type={field.type}
    >
      <label>{label}</label>
      {field.render({})}
    </div>
  ),
  Title: ({ children }) => <div data-testid="title">{children}</div>,
  Wrapper: ({ children }) => <div data-testid="wrapper">{children}</div>,
}))

let defaultProps
let mockControl
let mockUseWatch
let mockFields

beforeEach(() => {
  jest.clearAllMocks()

  mockControl = { name: 'mockControl' }
  mockUseWatch = jest.fn(({ name }) => {
    if (name === FIELD_FORM_CODE.FIELD_TYPE) {
      return FieldType.STRING
    }
    if (name === FIELD_FORM_CODE.MULTIPLICITY) {
      return MULTIPLICITY.MULTIPLE
    }
    return undefined
  })
  mockFields = []

  mockReactHookForm.useFormContext.mockReturnValue({
    control: mockControl,
    setValue: jest.fn(),
    getValues: jest.fn(),
    formState: {},
    reset: jest.fn(),
  })

  mockReactHookForm.useWatch.mockImplementation(mockUseWatch)

  useFieldCalibration.mockReturnValue({
    fields: mockFields,
  })

  MockFormItem = jest.fn()

  defaultProps = {}
})

test('renders form with all required fields', () => {
  render(<AddFieldForm {...defaultProps} />)

  expect(screen.getByTestId('form')).toBeInTheDocument()
  expect(screen.getByTestId('form-item-name')).toBeInTheDocument()
  expect(screen.getByTestId('styled-collapse')).toBeInTheDocument()
  expect(screen.getByTestId('form-item-fieldType')).toBeInTheDocument()
  expect(screen.getByTestId('form-item-multiplicity')).toBeInTheDocument()
})

test('name field is configured correctly', () => {
  render(<AddFieldForm {...defaultProps} />)

  const nameField = screen.getByTestId('form-item-name')
  expect(nameField).toHaveTextContent(localize(Localization.NAME))
  expect(nameField).toHaveTextContent('*')
  expect(nameField).toHaveAttribute('data-type', FormFieldType.STRING)
  expect(nameField).toHaveAttribute('data-placeholder', localize(Localization.FIELD_NAME_PLACEHOLDER))
  expect(nameField).toHaveAttribute('data-has-required', 'true')
  expect(nameField).toHaveAttribute('data-has-pattern', 'true')
  expect(nameField).toHaveAttribute('data-has-max-length', 'true')
})

test('field type field is configured correctly', () => {
  render(<AddFieldForm {...defaultProps} />)

  const fieldTypeField = screen.getByTestId('form-item-fieldType')
  expect(fieldTypeField).toHaveAttribute('data-type', FormFieldType.ENUM)
  expect(fieldTypeField).toHaveAttribute('data-placeholder', localize(Localization.FILED_TYPE_PLACEHOLDER))
  expect(fieldTypeField).toHaveAttribute('data-has-options', 'true')
})

test('multiplicity field renders MultiplicitySwitcher', () => {
  render(<AddFieldForm {...defaultProps} />)

  const multiplicityField = screen.getByTestId('form-item-multiplicity')
  expect(multiplicityField).toHaveAttribute('data-has-render', 'true')
  expect(screen.getByTestId('MultiplicitySwitcher')).toBeInTheDocument()
})

test('aliases field is rendered with checkmark type when multiplicity is MULTIPLE', () => {
  render(<AddFieldForm {...defaultProps} />)

  const aliasesField = screen.getByTestId('form-item-aliases')
  expect(aliasesField).toBeInTheDocument()
  expect(aliasesField).toHaveAttribute('data-type', FormFieldType.CHECKMARK)
})

test('aliases field is not rendered when multiplicity is SINGLE', () => {
  mockReactHookForm.useWatch.mockImplementation(({ name }) => {
    if (name === FIELD_FORM_CODE.FIELD_TYPE) {
      return FieldType.STRING
    }
    if (name === FIELD_FORM_CODE.MULTIPLICITY) {
      return MULTIPLICITY.SINGLE
    }
    return undefined
  })

  render(<AddFieldForm {...defaultProps} />)

  const aliasesField = screen.queryByTestId('form-item-aliases')
  expect(aliasesField).not.toBeInTheDocument()
})

test('advanced settings collapse is rendered with correct header', () => {
  render(<AddFieldForm {...defaultProps} />)

  const collapse = screen.getByTestId('styled-collapse')
  expect(collapse).toHaveTextContent(localize(Localization.ADVANCED_SETTINGS))
  expect(collapse).toHaveTextContent(localize(Localization.FIELD_TYPE))
})

test('watches field type changes with correct parameters', () => {
  render(<AddFieldForm {...defaultProps} />)

  expect(mockUseWatch).toHaveBeenCalledWith({
    control: mockControl,
    name: FIELD_FORM_CODE.FIELD_TYPE,
  })
})

test('renders ManageDisplayModeFormSection when feature flag is enabled', () => {
  render(<AddFieldForm {...defaultProps} />)

  expect(screen.getByTestId('ManageDisplayModeFormSection')).toBeInTheDocument()
})

test('does not render ManageDisplayModeFormSection when feature flag is disabled', () => {
  mockEnv.ENV.FEATURE_FIELDS_DISPLAY_MODE = false

  render(<AddFieldForm {...defaultProps} />)

  expect(screen.queryByTestId('ManageDisplayModeFormSection')).not.toBeInTheDocument()
  mockEnv.ENV.FEATURE_FIELDS_DISPLAY_MODE = true
})

test('ManageDisplayModeFormSection receives correct props', () => {
  render(<AddFieldForm {...defaultProps} />)

  const props = MockManageDisplayModeFormSection.getProps()
  expect(props).toEqual({
    displayCharLimit: 10,
    fieldType: FieldType.STRING,
    isEditMode: true,
    isMaskingModeDisabled: false,
    isReadOnlyField: false,
  })
})

test('ManageDisplayModeFormSection disables masking mode when field type is CHECKMARK', () => {
  mockReactHookForm.useWatch.mockImplementation(({ name }) => {
    if (name === FIELD_FORM_CODE.FIELD_TYPE) {
      return FieldType.CHECKMARK
    }

    if (name === FIELD_FORM_CODE.MULTIPLICITY) {
      return MULTIPLICITY.MULTIPLE
    }

    return undefined
  })

  render(<AddFieldForm {...defaultProps} />)

  const props = MockManageDisplayModeFormSection.getProps()
  expect(props.isMaskingModeDisabled).toBe(true)
})

test('ManageDisplayModeFormSection updates when field type changes', () => {
  mockUseWatch.mockReturnValue(FieldType.NUMBER)

  render(<AddFieldForm {...defaultProps} />)

  const props = MockManageDisplayModeFormSection.getProps()
  expect(props.fieldType).toBe(FieldType.NUMBER)
})

test('validate function returns error message for duplicate name', () => {
  mockFields = [
    {
      id: '1',
      name: 'ExistingField',
    },
  ]
  useFieldCalibration.mockReturnValue({
    fields: mockFields,
  })

  render(<AddFieldForm {...defaultProps} />)

  const nameFieldCall = MockFormItem.mock.calls.find(
    (call) => call[0].field.code === FIELD_FORM_CODE.NAME,
  )
  const validateFn = nameFieldCall[0].field.rules.validate

  expect(validateFn('ExistingField')).toBe(localize(Localization.FIELD_NAME_DUPLICATE))
  expect(validateFn('EXISTINGFIELD')).toBe(localize(Localization.FIELD_NAME_DUPLICATE))
  expect(validateFn(' ExistingField ')).toBe(localize(Localization.FIELD_NAME_DUPLICATE))
})

test('renders Required field in Advanced Settings', () => {
  render(<AddFieldForm {...defaultProps} />)

  const requiredField = screen.getByTestId(`switch-form-item-${FIELD_FORM_CODE.REQUIRED}`)
  expect(requiredField).toBeInTheDocument()
  expect(requiredField).toHaveTextContent(localize(Localization.REQUIRED_FIELD))
  expect(requiredField).toHaveAttribute('data-type', FormFieldType.CHECKMARK)
})
