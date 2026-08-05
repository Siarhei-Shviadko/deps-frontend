import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import { parsePageSpanToContent } from '@/containers/PromptCalibrationStudio/utils'
import { Extractor } from '@/containers/PromptCalibrationStudio/viewModels'
import { LLMModelContextType } from '@/enums/LLMModelContextType'
import { Localization, localize } from '@/localization/i18n'
import { LLModel, LLMProvider } from '@/models/LLMProvider'
import { render } from '@/utils/rendererRTL'
import { LLMExtractorDescription } from './LLMExtractorDescription'

jest.mock('@/utils/env', () => mockEnv)

const mockLLMsData = [
  new LLMProvider({
    code: 'openai',
    name: 'OpenAI',
    models: [
      new LLModel({
        code: 'gpt-4',
        name: 'GPT-4',
        contextType: LLMModelContextType.TEXT_BASED,
      }),
    ],
  }),
  new LLMProvider({
    code: 'anthropic',
    name: 'Anthropic',
    models: [
      new LLModel({
        code: 'claude-3',
        name: 'Claude 3',
        contextType: LLMModelContextType.TEXT_BASED,
      }),
    ],
  }),
]

jest.mock('@/apiRTK/LLMsApi', () => ({
  useFetchLLMsQuery: jest.fn(() => ({
    data: mockLLMsData,
    isFetching: false,
  })),
}))

const mockExtractor = new Extractor({
  id: 'extractor-1',
  name: 'GPT-4 Extractor',
  model: 'openai@gpt-4',
  customInstruction: 'Extract all relevant information from the document',
  groupingFactor: 2,
  temperature: 0.7,
  topP: 0.9,
  pageSpan: {
    start: 1,
    end: 5,
  },
})

const defaultProps = {
  extractor: mockExtractor,
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders description correctly with provider and model names from API', () => {
  render(<LLMExtractorDescription {...defaultProps} />)

  const llmModel = screen.getByText('GPT-4')
  const llmProvider = screen.getByText('OpenAI')
  const temperature = screen.getByText(mockExtractor.temperature)
  const topP = screen.getByText(mockExtractor.topP)
  const groupingFactor = screen.getByText(mockExtractor.groupingFactor)
  const pageSpan = screen.getByText(parsePageSpanToContent(mockExtractor.pageSpan))
  const customInstruction = screen.getByText(mockExtractor.customInstruction)

  expect(llmModel).toBeInTheDocument()
  expect(llmProvider).toBeInTheDocument()
  expect(temperature).toBeInTheDocument()
  expect(topP).toBeInTheDocument()
  expect(groupingFactor).toBeInTheDocument()
  expect(pageSpan).toBeInTheDocument()
  expect(customInstruction).toBeInTheDocument()
})

test('renders All Pages when pageSpan is null', () => {
  const props = {
    extractor: {
      ...mockExtractor,
      pageSpan: null,
    },
  }

  render(<LLMExtractorDescription {...props} />)

  const pageSpan = screen.getByText(localize(Localization.ALL_PAGES))

  expect(pageSpan).toBeInTheDocument()
})

test('shows loading spinner when data is fetching', () => {
  const { useFetchLLMsQuery } = require('@/apiRTK/LLMsApi')
  useFetchLLMsQuery.mockReturnValueOnce({
    data: [],
    isFetching: true,
  })

  render(<LLMExtractorDescription {...defaultProps} />)

  const spinner = screen.getByTestId('spin')

  expect(spinner).toBeInTheDocument()
})

test('falls back to provider code when provider not found in API data', () => {
  const { useFetchLLMsQuery } = require('@/apiRTK/LLMsApi')
  useFetchLLMsQuery.mockReturnValueOnce({
    data: [],
    isFetching: false,
  })

  render(<LLMExtractorDescription {...defaultProps} />)

  const [provider] = mockExtractor.model.split('@')
  const llmProvider = screen.getByText(provider)

  expect(llmProvider).toBeInTheDocument()
})

test('falls back to model code when model not found in API data', () => {
  const { useFetchLLMsQuery } = require('@/apiRTK/LLMsApi')
  useFetchLLMsQuery.mockReturnValueOnce({
    data: [
      new LLMProvider({
        code: 'openai',
        name: 'OpenAI',
        models: [],
      }),
    ],
    isFetching: false,
  })

  render(<LLMExtractorDescription {...defaultProps} />)

  const [, model] = mockExtractor.model.split('@')
  const llmModel = screen.getByText(model)

  expect(llmModel).toBeInTheDocument()
})
