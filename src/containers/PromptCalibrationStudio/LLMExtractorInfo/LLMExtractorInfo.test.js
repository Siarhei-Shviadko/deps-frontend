
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Localization, localize } from '@/localization/i18n'
import { render } from '@/utils/rendererRTL'
import { Extractor, Field } from '../viewModels'
import { EMPTY_VALUE } from './constants'
import { LLMExtractorInfo } from './LLMExtractorInfo'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/components/LongText', () => ({
  LongText: ({ text }) => <span>{text}</span>,
}))

const mockUseFieldCalibration = jest.fn()
const mockUseExtractorModel = jest.fn()

jest.mock('../hooks', () => ({
  useFieldCalibration: () => mockUseFieldCalibration(),
  useExtractorModel: () => mockUseExtractorModel(),
}))

const mockExtractor = new Extractor({
  id: 'extractor-1',
  name: 'Test Extractor',
  model: 'gpt-4@openai',
  temperature: 0.7,
  topP: 0.9,
  groupingFactor: 5,
  customInstruction: 'Extract all relevant information from the document',
  pageSpan: {
    start: 1,
    end: 10,
  },
  logprobs: true,
  contextAttachments: 'documentImages',
  stop: ['stop1', 'stop2'],
  maxTokens: 2048,
  seed: 42,
})

const mockField = new Field({
  id: 'field-1',
  name: 'Test Field',
  extractorId: 'extractor-1',
})

beforeEach(() => {
  jest.clearAllMocks()
  mockUseFieldCalibration.mockReturnValue({
    activeField: mockField,
    extractors: [mockExtractor],
  })
  mockUseExtractorModel.mockReturnValue({
    providerName: 'OpenAI',
    modelName: 'GPT-4',
    isFetching: false,
  })
})

test('renders LLM extractor info correctly with all info items provided', async () => {
  render(<LLMExtractorInfo />)

  const btn = screen.getByRole('button')
  await userEvent.click(btn)

  const [
    modelItem,
    pageSpanItem,
    logprobsItem,
    contextAttachmentsItem,
    stopItem,
    temperatureItem,
    groupingFactorItem,
    topPItem,
    maxTokensItem,
    seedItem,
    customInstructionsItem,
  ] = screen.getAllByRole('listitem')

  expect(modelItem).toHaveTextContent(localize(Localization.LLM_MODEL))
  expect(modelItem).toHaveTextContent('GPT-4 / OpenAI')

  expect(pageSpanItem).toHaveTextContent(localize(Localization.PAGE_SPAN))
  expect(pageSpanItem).toHaveTextContent(`${mockExtractor.pageSpan.start} - ${mockExtractor.pageSpan.end}`)

  expect(logprobsItem).toHaveTextContent(localize(Localization.LOG_PROBS))
  expect(logprobsItem).toHaveTextContent(localize(Localization.YES))

  expect(contextAttachmentsItem).toHaveTextContent(localize(Localization.CONTEXT_FOR_EXTRACTION))
  expect(contextAttachmentsItem).toHaveTextContent(localize(Localization.AI_CONTEXT_TEXT_AND_IMAGES))

  expect(stopItem).toHaveTextContent(localize(Localization.STOP_WORDS))
  expect(stopItem).toHaveTextContent('stop1, stop2')

  expect(temperatureItem).toHaveTextContent(localize(Localization.TEMPERATURE))
  expect(temperatureItem).toHaveTextContent(String(mockExtractor.temperature))

  expect(groupingFactorItem).toHaveTextContent(localize(Localization.GROUPING_FACTOR))
  expect(groupingFactorItem).toHaveTextContent(String(mockExtractor.groupingFactor))

  expect(topPItem).toHaveTextContent(localize(Localization.TOP_P))
  expect(topPItem).toHaveTextContent(String(mockExtractor.topP))

  expect(maxTokensItem).toHaveTextContent(localize(Localization.MAX_TOKENS))
  expect(maxTokensItem).toHaveTextContent(String(mockExtractor.maxTokens))

  expect(seedItem).toHaveTextContent(localize(Localization.SEED))
  expect(seedItem).toHaveTextContent(String(mockExtractor.seed))

  expect(customInstructionsItem).toHaveTextContent(localize(Localization.CUSTOM_INSTRUCTION))
  expect(customInstructionsItem).toHaveTextContent(mockExtractor.customInstruction)
})

test('renders button with correct tooltip', () => {
  render(<LLMExtractorInfo />)

  const btn = screen.getByRole('button')

  expect(btn).toBeInTheDocument()
})

test('popover opens and shows all info items', async () => {
  render(<LLMExtractorInfo />)

  const btn = screen.getByRole('button')

  expect(screen.queryByRole('listitem')).not.toBeInTheDocument()

  await userEvent.click(btn)
  const listItems = screen.getAllByRole('listitem')
  expect(listItems.length).toBe(11)

  expect(screen.getByText(localize(Localization.LLM_MODEL))).toBeInTheDocument()
})

test('shows All Pages text for missing pageSpan', async () => {
  const extractorWithoutPageSpan = new Extractor({
    id: 'extractor-no-span',
    name: 'No PageSpan Extractor',
    model: 'gpt-4@openai',
    temperature: 0.7,
    topP: 0.9,
    groupingFactor: 5,
  })

  const fieldForNoPageSpan = new Field({
    id: 'field-2',
    name: 'Test Field 2',
    extractorId: 'extractor-no-span',
  })

  mockUseFieldCalibration.mockReturnValue({
    activeField: fieldForNoPageSpan,
    extractors: [extractorWithoutPageSpan],
  })

  render(<LLMExtractorInfo />)

  const btn = screen.getByRole('button')
  await userEvent.click(btn)

  const pageSpanItem = screen.getAllByRole('listitem')[1]
  expect(pageSpanItem).toHaveTextContent(localize(Localization.ALL_PAGES))
})

test('shows empty value placeholder for missing optional settings', async () => {
  const extractorWithMinimalSettings = new Extractor({
    id: 'extractor-minimal',
    name: 'Minimal Extractor',
    model: 'gpt-4@openai',
    temperature: 0.7,
    topP: 0.9,
    groupingFactor: 5,
  })

  mockUseFieldCalibration.mockReturnValue({
    activeField: new Field({
      id: 'field-3',
      name: 'Test Field 3',
      extractorId: 'extractor-minimal',
    }),
    extractors: [extractorWithMinimalSettings],
  })

  render(<LLMExtractorInfo />)

  const btn = screen.getByRole('button')
  await userEvent.click(btn)

  const stopItem = screen.getAllByRole('listitem')[4]
  const maxTokensItem = screen.getAllByRole('listitem')[8]
  const seedItem = screen.getAllByRole('listitem')[9]

  expect(stopItem).toHaveTextContent(EMPTY_VALUE)
  expect(maxTokensItem).toHaveTextContent(EMPTY_VALUE)
  expect(seedItem).toHaveTextContent(EMPTY_VALUE)
})

test('shows text-only context when contextAttachments is not set', async () => {
  const extractorWithoutContext = new Extractor({
    id: 'extractor-no-context',
    name: 'No Context Extractor',
    model: 'gpt-4@openai',
    temperature: 0.7,
    topP: 0.9,
    groupingFactor: 5,
  })

  mockUseFieldCalibration.mockReturnValue({
    activeField: new Field({
      id: 'field-4',
      name: 'Test Field 4',
      extractorId: 'extractor-no-context',
    }),
    extractors: [extractorWithoutContext],
  })

  render(<LLMExtractorInfo />)

  const btn = screen.getByRole('button')
  await userEvent.click(btn)

  const contextAttachmentsItem = screen.getAllByRole('listitem')[3]
  expect(contextAttachmentsItem).toHaveTextContent(localize(Localization.AI_CONTEXT_TEXT_ONLY))
})
