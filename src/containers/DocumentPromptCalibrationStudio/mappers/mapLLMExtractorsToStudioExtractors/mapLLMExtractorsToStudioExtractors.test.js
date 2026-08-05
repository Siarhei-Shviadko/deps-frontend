
import { mockEnv } from '@/mocks/mockEnv'
import { Extractor } from '@/containers/PromptCalibrationStudio/viewModels'
import { LLMExtractor } from '@/models/LLMExtractor'
import { LLMExtractionParams } from '@/models/LLMExtractor/LLMExtractionParams'
import { LLMSettings } from '@/models/LLMProvider'
import { mapLLMExtractorsToStudioExtractors } from './mapLLMExtractorsToStudioExtractors'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/models/LLMProvider', () => ({
  LLMSettings: {
    settingsToLLMType: jest.fn((provider, model) => `${provider}@${model}`),
  },
}))

const mockLLMExtractor = new LLMExtractor({
  extractorId: 'extractor-1',
  name: 'Test Extractor',
  extractionParams: new LLMExtractionParams({
    customInstruction: 'Extract the data',
    groupingFactor: 5,
    pageSpan: null,
    temperature: 0.7,
    topP: 0.9,
  }),
  llmReference: {
    provider: 'openai',
    model: 'gpt-4',
  },
})

test('transforms LLM extractors to studio extractors correctly', () => {
  const llmExtractors = [mockLLMExtractor]

  const { extractorId, name, extractionParams, llmReference } = mockLLMExtractor
  const { customInstruction, groupingFactor, pageSpan, temperature, topP } = extractionParams
  const { provider, model } = llmReference

  const result = mapLLMExtractorsToStudioExtractors(llmExtractors)

  expect(result).toHaveLength(1)
  expect(result[0]).toEqual(new Extractor({
    id: extractorId,
    name,
    customInstruction: customInstruction,
    groupingFactor,
    model: LLMSettings.settingsToLLMType(provider, model),
    pageSpan,
    temperature,
    topP,
    stop: [],
    contextAttachments: '',
  }))
})

test('calls LLMSettings.settingsToLLMType with correct parameters', () => {
  jest.clearAllMocks()

  const llmExtractors = [mockLLMExtractor]
  const { llmReference } = mockLLMExtractor
  const { provider, model } = llmReference

  mapLLMExtractorsToStudioExtractors(llmExtractors)

  expect(LLMSettings.settingsToLLMType).toHaveBeenCalledWith(provider, model)
})

test('handles empty array correctly', () => {
  const result = mapLLMExtractorsToStudioExtractors([])

  expect(result).toEqual([])
})

test('handles extractor with null customInstruction', () => {
  const llmExtractors = [
    {
      ...mockLLMExtractor,
      extractionParams: {
        ...mockLLMExtractor.extractionParams,
        customInstruction: null,
      },
    },
  ]

  const result = mapLLMExtractorsToStudioExtractors(llmExtractors)

  expect(result[0].customInstruction).toBeNull()
})

test('handles extractor with pageSpan object', () => {
  const llmExtractors = [
    {
      ...mockLLMExtractor,
      extractionParams: {
        ...mockLLMExtractor.extractionParams,
        pageSpan: {
          start: 2,
          end: 10,
        },
      },
    },
  ]

  const result = mapLLMExtractorsToStudioExtractors(llmExtractors)

  expect(result[0].pageSpan).toEqual({
    start: 2,
    end: 10,
  })
})

test('maps advanced extraction params to studio extractor', () => {
  const llmExtractors = [
    {
      ...mockLLMExtractor,
      extractionParams: {
        ...mockLLMExtractor.extractionParams,
        contextAttachments: 'documentImages',
        maxTokens: 2048,
        stop: ['stop1'],
        seed: 42,
        logprobs: true,
      },
    },
  ]

  const result = mapLLMExtractorsToStudioExtractors(llmExtractors)

  expect(result[0]).toEqual(expect.objectContaining({
    contextAttachments: 'documentImages',
    maxTokens: 2048,
    stop: ['stop1'],
    seed: 42,
    logprobs: true,
  }))
})
