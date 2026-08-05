
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen } from '@testing-library/dom'
import { Localization, localize } from '@/localization/i18n'
import { render } from '@/utils/rendererRTL'
import { LLMExtractorForm } from './LLMExtractorForm'

jest.mock('react-hook-form', () => mockReactHookForm)
jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/containers/ExtractionLLMSelect', () => ({
  ExtractionLLMSelect: () => <div data-testid={LLM_TEST_ID} />,
}))
jest.mock('../InstructionSection', () => ({
  InstructionSection: () => <div data-testid={INSTRUCTION_TEST_ID} />,
}))
jest.mock('../TemperatureSection', () => ({
  TemperatureSection: () => <div data-testid={TEMPERATURE_TEST_ID} />,
}))
jest.mock('./AdvancedLLMSettings', () => mockShallowComponent('AdvancedLLMSettings'))

const INSTRUCTION_TEST_ID = 'instruction-section'
const LLM_TEST_ID = 'llm'
const TEMPERATURE_TEST_ID = 'temperature-section'
const ADVANCED_LLM_SETTINGS_TEST_ID = 'AdvancedLLMSettings'

test('shows base form sections correctly', () => {
  render(
    <LLMExtractorForm />,
  )

  const nameLabel = screen.getByText(localize(Localization.NAME))
  const nameInput = screen.getByPlaceholderText(localize(Localization.NAME_PLACEHOLDER))
  expect(nameLabel).toBeInTheDocument()
  expect(nameInput).toBeInTheDocument()

  const llmLabel = screen.getByText(localize(Localization.LLM_MODEL))
  const llmField = screen.getByTestId(LLM_TEST_ID)
  expect(llmLabel).toBeInTheDocument()
  expect(llmField).toBeInTheDocument()

  const temperatureSection = screen.getByTestId(TEMPERATURE_TEST_ID)
  expect(temperatureSection).toBeInTheDocument()

  const instructionSection = screen.getByTestId(INSTRUCTION_TEST_ID)
  expect(instructionSection).toBeInTheDocument()
})

test('renders AdvancedLLMSettings section', () => {
  render(
    <LLMExtractorForm />,
  )

  const advancedSettings = screen.getByTestId(ADVANCED_LLM_SETTINGS_TEST_ID)

  expect(advancedSettings).toBeInTheDocument()
})
