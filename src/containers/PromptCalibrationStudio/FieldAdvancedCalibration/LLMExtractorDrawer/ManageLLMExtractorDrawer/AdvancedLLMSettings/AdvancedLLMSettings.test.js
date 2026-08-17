
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen } from '@testing-library/react'
import { Localization, localize } from '@/localization/i18n'
import { render } from '@/utils/rendererRTL'
import { AdvancedLLMSettings } from './AdvancedLLMSettings'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-hook-form', () => mockReactHookForm)

jest.mock('@/components/Select', () => ({
  CustomSelect: () => <div data-testid="custom-select" />,
  SelectMode: {
    TAGS: 'tags',
  },
  SelectOption: class SelectOption {
    constructor (value, label, options) {
      this.value = value
      this.label = label
      this.options = options
    }
  },
}))

jest.mock('./AdvancedLLMSettings.styles', () => ({
  StyledCollapse: ({ children, header }) => (
    <div data-testid="advanced-settings-collapse">
      <div>{header}</div>
      {children}
    </div>
  ),
  Wrapper: ({ children }) => <div>{children}</div>,
  StyledFormItem: ({ label, field }) => (
    <div data-testid={`form-item-${field.code}`}>
      <label>{label}</label>
      {field.render?.({})}
    </div>
  ),
  SwitchFormItem: ({ label, field }) => (
    <div data-testid={`switch-form-item-${field.code}`}>
      <label>{label}</label>
      {field.render?.({ value: false })}
    </div>
  ),
  StyledInputNumber: (props) => (
    <input
      data-testid={`input-number-${props.placeholder}`}
      placeholder={props.placeholder}
    />
  ),
  StyledPageSpanSection: () => <div data-testid="page-span-section" />,
}))

test('renders advanced settings collapse with header', () => {
  render(<AdvancedLLMSettings />)

  const collapse = screen.getByTestId('advanced-settings-collapse')

  expect(collapse).toHaveTextContent(localize(Localization.ADVANCED_SETTINGS))
})

test('renders advanced LLM fields with labels and placeholders', () => {
  render(<AdvancedLLMSettings />)

  expect(screen.getByText(localize(Localization.MAX_TOKENS))).toBeInTheDocument()
  expect(screen.getByPlaceholderText(localize(Localization.MAX_TOKENS_PLACEHOLDER))).toBeInTheDocument()

  expect(screen.getByText(localize(Localization.GROUPING_FACTOR))).toBeInTheDocument()
  expect(screen.getByPlaceholderText(localize(Localization.GROUPING_FACTOR_PLACEHOLDER))).toBeInTheDocument()

  expect(screen.getByText(localize(Localization.CONTEXT_FOR_EXTRACTION))).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.SEED))).toBeInTheDocument()
  expect(screen.getByPlaceholderText(localize(Localization.SEED_PLACEHOLDER))).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.STOP_WORDS))).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.PAGE_SPAN))).toBeInTheDocument()
  expect(screen.getByTestId('page-span-section')).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.LOGARITHMIC_PROBABILITIES))).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.DETERMINE_FIELD_COORDINATES))).toBeInTheDocument()
})
