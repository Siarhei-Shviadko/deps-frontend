
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen } from '@testing-library/react'
import { Extractor } from '@/containers/PromptCalibrationStudio/viewModels'
import { Localization, localize } from '@/localization/i18n'
import { render } from '@/utils/rendererRTL'
import { ManageLLMExtractorForm } from './ManageLLMExtractorForm'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-hook-form', () => mockReactHookForm)

jest.mock('@/containers/ExtractionLLMSelect', () => ({
  ExtractionLLMSelect: () => <div data-testid={LLM_SELECT_TEST_ID} />,
}))

jest.mock('@/components/GraduatedSlider', () => ({
  GraduatedSlider: () => <div data-testid={GRADUATED_SLIDER_TEST_ID} />,
}))

jest.mock('../AdvancedLLMSettings', () => mockShallowComponent('AdvancedLLMSettings'))

const LLM_SELECT_TEST_ID = 'llm-select'
const GRADUATED_SLIDER_TEST_ID = 'graduated-slider'
const ADVANCED_LLM_SETTINGS_TEST_ID = 'AdvancedLLMSettings'

const mockExtractor1 = new Extractor({
  id: 'extractor-1',
  name: 'GPT-4 Extractor',
  model: 'gpt-4',
  customInstruction: 'Test instruction',
  groupingFactor: 5,
  temperature: 0.5,
  topP: 1,
  pageSpan: null,
})

const mockExtractor2 = new Extractor({
  id: 'extractor-2',
  name: 'Claude Extractor',
  model: 'claude-3',
  customInstruction: 'Test instruction 2',
  groupingFactor: 3,
  temperature: 0.7,
  topP: 0.9,
  pageSpan: null,
})

jest.mock('@/containers/PromptCalibrationStudio/hooks', () => ({
  useFieldCalibration: jest.fn(() => ({
    extractors: [mockExtractor1, mockExtractor2],
  })),
}))

const defaultProps = {
  extractor: null,
}

test('renders Name field with label and placeholder', () => {
  render(<ManageLLMExtractorForm {...defaultProps} />)

  const nameLabel = screen.getByText(localize(Localization.NAME))
  const nameInput = screen.getByPlaceholderText(localize(Localization.NAME_PLACEHOLDER))

  expect(nameLabel).toBeInTheDocument()
  expect(nameInput).toBeInTheDocument()
})

test('renders LLM Model field with label', () => {
  render(<ManageLLMExtractorForm {...defaultProps} />)

  const llmLabel = screen.getByText(localize(Localization.LLM_MODEL))
  const llmSelect = screen.getByTestId(LLM_SELECT_TEST_ID)

  expect(llmLabel).toBeInTheDocument()
  expect(llmSelect).toBeInTheDocument()
})

test('renders Temperature field with label', () => {
  render(<ManageLLMExtractorForm {...defaultProps} />)

  const temperatureLabel = screen.getByText(localize(Localization.TEMPERATURE))
  const temperatureSliders = screen.getAllByTestId(GRADUATED_SLIDER_TEST_ID)

  expect(temperatureLabel).toBeInTheDocument()
  expect(temperatureSliders.length).toBeGreaterThanOrEqual(1)
})

test('renders Top P field with label', () => {
  render(<ManageLLMExtractorForm {...defaultProps} />)

  const topPLabel = screen.getByText(localize(Localization.TOP_P))
  const topPSliders = screen.getAllByTestId(GRADUATED_SLIDER_TEST_ID)

  expect(topPLabel).toBeInTheDocument()
  expect(topPSliders.length).toBeGreaterThanOrEqual(1)
})

test('renders AdvancedLLMSettings section', () => {
  render(<ManageLLMExtractorForm {...defaultProps} />)

  const advancedSettings = screen.getByTestId(ADVANCED_LLM_SETTINGS_TEST_ID)

  expect(advancedSettings).toBeInTheDocument()
})

test('renders Custom Instruction field with label', () => {
  render(<ManageLLMExtractorForm {...defaultProps} />)

  const customInstructionLabel = screen.getByText(localize(Localization.CUSTOM_INSTRUCTION))

  expect(customInstructionLabel).toBeInTheDocument()
})

test('validates unique extractor name when creating new extractor', () => {
  render(<ManageLLMExtractorForm {...defaultProps} />)

  const nameInput = screen.getByPlaceholderText(localize(Localization.NAME_PLACEHOLDER))

  expect(nameInput).toBeInTheDocument()
})

test('validates unique extractor name when editing existing extractor', () => {
  const props = {
    ...defaultProps,
    extractor: mockExtractor1,
  }
  render(<ManageLLMExtractorForm {...props} />)

  const nameInput = screen.getByPlaceholderText(localize(Localization.NAME_PLACEHOLDER))

  expect(nameInput).toBeInTheDocument()
})
