
import { mockEnv } from '@/mocks/mockEnv'
import { Extractor } from '@/containers/PromptCalibrationStudio/viewModels'
import { mapExtractorToLLMExtractor } from './mapExtractorToLLMExtractor'

jest.mock('@/utils/env', () => mockEnv)

test('parses model with provider correctly when model includes slash', () => {
  const extractor = new Extractor({
    id: 'extractor-1',
    name: 'Test Extractor',
    model: 'openai@gpt-4',
    temperature: 0.7,
    topP: 0.9,
    groupingFactor: 1,
    customInstruction: 'Test instructions',
    pageSpan: 5,
    coordinatesEnabled: false,
    logprobs: false,
    seed: 42,
    maxTokens: 1000,
  })

  const result = mapExtractorToLLMExtractor(extractor)

  expect(result).toEqual({
    extractorName: 'Test Extractor',
    provider: 'openai',
    model: 'gpt-4',
    extractionParams: {
      customInstruction: 'Test instructions',
      pageSpan: 5,
      contextAttachments: null,
      stop: null,
      id: 'extractor-1',
      temperature: 0.7,
      topP: 0.9,
      groupingFactor: 1,
      model: 'openai@gpt-4',
      logprobs: false,
      seed: 42,
      maxTokens: 1000,
      coordinatesEnabled: false,
    },
  })
})

test('converts empty string customInstruction to null', () => {
  const extractor = new Extractor({
    id: 'extractor-1',
    name: 'Test Extractor',
    model: 'gpt-4',
    temperature: 0.7,
    topP: 0.9,
    groupingFactor: 1,
    customInstruction: '',
    pageSpan: null,
  })

  const result = mapExtractorToLLMExtractor(extractor)

  expect(result.extractionParams.customInstruction).toBeNull()
})

test('maps advanced extraction params correctly', () => {
  const extractor = new Extractor({
    id: 'extractor-1',
    name: 'Test Extractor',
    model: 'openai@gpt-4',
    temperature: 0.7,
    topP: 0.9,
    groupingFactor: 1,
    customInstruction: 'Test instructions',
    pageSpan: null,
    contextAttachments: 'documentImages',
    maxTokens: 2048,
    stop: ['stop1', 'stop2'],
    seed: 42,
    logprobs: true,
    coordinatesEnabled: true,
  })

  const result = mapExtractorToLLMExtractor(extractor)

  expect(result.extractionParams).toEqual({
    customInstruction: 'Test instructions',
    pageSpan: null,
    contextAttachments: 'documentImages',
    stop: ['stop1', 'stop2'],
    id: 'extractor-1',
    temperature: 0.7,
    topP: 0.9,
    groupingFactor: 1,
    model: 'openai@gpt-4',
    logprobs: true,
    seed: 42,
    maxTokens: 2048,
    coordinatesEnabled: true,
  })
})

test('converts empty stop array to null', () => {
  const extractor = new Extractor({
    id: 'extractor-1',
    name: 'Test Extractor',
    model: 'gpt-4',
    temperature: 0.7,
    topP: 0.9,
    groupingFactor: 1,
    customInstruction: 'Test instructions',
    pageSpan: null,
    stop: [],
  })

  const result = mapExtractorToLLMExtractor(extractor)

  expect(result.extractionParams.stop).toBeNull()
})
