
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { FormValidationMode } from '@/components/Form'
import { Localization, localize } from '@/localization/i18n'
import {
  LLMExtractorPageSpan,
  LLMExtractor,
  LLMReference,
  LLMExtractionParams,
} from '@/models/LLMExtractor'
import { LLMSettings } from '@/models/LLMProvider'
import { render } from '@/utils/rendererRTL'
import { KnownContextAttachments } from './KnownContextAttachments'
import { DEFAULT_VALUES, FIELD_CODE } from './LLMExtractorForm/constants'
import { LLMExtractorModal } from './LLMExtractorModal'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('react-hook-form', () => ({
  ...mockReactHookForm,
  useForm: jest.fn(() => ({
    getValues: jest.fn(() => mockValues),
    formState: {
      isValid: true,
    },
  })),
}))

jest.mock('./LLMExtractorForm', () => ({
  LLMExtractorForm: () => <form data-testid={'llm-extractor-form'} />,
}))

const mockProvider = 'Provider'
const mockModel = 'Model'

const mockValues = {
  customInstruction: 'Test Instruction',
  extractorName: 'Test Name',
  groupingFactor: 1,
  llmModel: LLMSettings.settingsToLLMType(mockProvider, mockModel),
  temperature: 0,
  topP: 1,
  pageSpan: new LLMExtractorPageSpan({
    start: 1,
    end: 2,
  }),
  maxTokens: DEFAULT_VALUES[FIELD_CODE.MAX_TOKENS],
  stop: DEFAULT_VALUES[FIELD_CODE.STOP],
  seed: DEFAULT_VALUES[FIELD_CODE.SEED],
  logprobs: DEFAULT_VALUES[FIELD_CODE.LOGPROBS],
  coordinatesEnabled: DEFAULT_VALUES[FIELD_CODE.COORDINATES_ENABLED],
}

const mockLLMExtractor = new LLMExtractor({
  extractorId: 'mockId1',
  name: 'LLM Extractor Name 1',
  llmReference: new LLMReference({
    model: 'modelCode1',
    provider: 'providerCode',
  }),
  queries: [],
  extractionParams: new LLMExtractionParams({
    customInstruction: 'Test Instructions 1',
    groupingFactor: 1,
    temperature: 0.5,
    topP: 0.3,
    pageSpan: null,
  }),
})

beforeEach(() => {
  useForm.mockImplementation(() => ({
    formState: {
      isValid: true,
    },
    getValues: jest.fn(() => mockValues),
  }))
})

test('renders modal with correct title and form', async () => {
  render(
    <LLMExtractorModal
      isLoading={false}
      isVisible={true}
      onCancel={jest.fn()}
      onSave={jest.fn()}
    />,
  )

  const modal = screen.getByRole('dialog')
  const form = screen.getByTestId('llm-extractor-form')
  const createButton = screen.getByRole('button', {
    name: localize(Localization.CREATE),
  })

  expect(createButton).toBeInTheDocument()
  expect(modal).toHaveTextContent(localize(Localization.ADD_LLM_EXTRACTOR))
  expect(form).toBeInTheDocument()
})

test('renders modal with correct title and form if LLM Extractor is passed', async () => {
  render(
    <LLMExtractorModal
      isLoading={false}
      isVisible={true}
      llmExtractor={mockLLMExtractor}
      onCancel={jest.fn()}
      onSave={jest.fn()}
    />,
  )

  const modal = screen.getByRole('dialog')
  const form = screen.getByTestId('llm-extractor-form')
  const submitButton = screen.getByRole('button', {
    name: localize(Localization.SUBMIT),
  })

  expect(submitButton).toBeInTheDocument()
  expect(modal).toHaveTextContent(localize(Localization.EDIT_LLM_EXTRACTOR))
  expect(form).toBeInTheDocument()
})

test('calls useForm with default values if LLM Extractor is passed', async () => {
  jest.clearAllMocks()

  render(
    <LLMExtractorModal
      isLoading={false}
      isVisible={true}
      llmExtractor={mockLLMExtractor}
      onCancel={jest.fn()}
      onSave={jest.fn()}
    />,
  )

  expect(useForm).nthCalledWith(1, {
    mode: FormValidationMode.ON_CHANGE,
    shouldUnregister: true,
    defaultValues: {
      extractorName: mockLLMExtractor.name,
      llmModel: LLMSettings.settingsToLLMType(mockLLMExtractor.llmReference.provider, mockLLMExtractor.llmReference.model),
      contextAttachments: '',
      stop: DEFAULT_VALUES[FIELD_CODE.STOP],
      customInstruction: mockLLMExtractor.extractionParams.customInstruction,
      groupingFactor: mockLLMExtractor.extractionParams.groupingFactor,
      temperature: mockLLMExtractor.extractionParams.temperature,
      topP: mockLLMExtractor.extractionParams.topP,
      pageSpan: mockLLMExtractor.extractionParams.pageSpan,
      maxTokens: mockLLMExtractor.extractionParams.maxTokens,
      seed: mockLLMExtractor.extractionParams.seed,
      logprobs: mockLLMExtractor.extractionParams.logprobs,
      coordinatesEnabled: mockLLMExtractor.extractionParams.coordinatesEnabled,
    },
  })
})

test('disables Create button when form data is invalid', async () => {
  useForm.mockImplementation(() => ({
    formState: {
      isValid: false,
    },
    getValues: jest.fn(() => mockValues),
  }))

  render(
    <LLMExtractorModal
      isLoading={false}
      isVisible={true}
      onCancel={jest.fn()}
      onSave={jest.fn()}
    />,
  )

  const createButton = screen.getByRole('button', {
    name: localize(Localization.CREATE),
  })

  expect(createButton).toBeDisabled()
})

test('calls onSave with correct arguments when Create button is clicked', async () => {
  const mockOnSave = jest.fn()
  render(
    <LLMExtractorModal
      isLoading={false}
      isVisible={true}
      onCancel={jest.fn()}
      onSave={mockOnSave}
    />,
  )

  const createButton = screen.getByRole('button', {
    name: localize(Localization.CREATE),
  })

  await userEvent.click(createButton)

  expect(mockOnSave).nthCalledWith(
    1,
    {
      extractorName: mockValues.extractorName,
      provider: mockProvider,
      model: mockModel,
      extractionParams: {
        contextAttachments: null,
        customInstruction: mockValues.customInstruction,
        groupingFactor: mockValues.groupingFactor,
        temperature: mockValues.temperature,
        topP: mockValues.topP,
        pageSpan: mockValues.pageSpan,
        maxTokens: mockValues.maxTokens,
        stop: mockValues.stop,
        seed: mockValues.seed,
        logprobs: mockValues.logprobs,
        coordinatesEnabled: mockValues.coordinatesEnabled,
      },
    },
  )
})

test('calls onSave with contextAttachments when provided', async () => {
  const mockOnSave = jest.fn()
  const contextAttachmentsValue = KnownContextAttachments.DOCUMENT_IMAGES
  useForm.mockImplementation(() => ({
    formState: {
      isValid: true,
    },
    getValues: jest.fn(() => ({
      ...mockValues,
      contextAttachments: contextAttachmentsValue,
    })),
  }))

  render(
    <LLMExtractorModal
      isLoading={false}
      isVisible={true}
      onCancel={jest.fn()}
      onSave={mockOnSave}
    />,
  )

  const createButton = screen.getByRole('button', {
    name: localize(Localization.CREATE),
  })

  await userEvent.click(createButton)

  expect(mockOnSave).nthCalledWith(
    1,
    {
      extractorName: mockValues.extractorName,
      provider: mockProvider,
      model: mockModel,
      extractionParams: {
        contextAttachments: contextAttachmentsValue,
        customInstruction: mockValues.customInstruction,
        groupingFactor: mockValues.groupingFactor,
        temperature: mockValues.temperature,
        topP: mockValues.topP,
        pageSpan: mockValues.pageSpan,
        maxTokens: mockValues.maxTokens,
        stop: mockValues.stop,
        seed: mockValues.seed,
        logprobs: mockValues.logprobs,
        coordinatesEnabled: mockValues.coordinatesEnabled,
      },
    },
  )
})
