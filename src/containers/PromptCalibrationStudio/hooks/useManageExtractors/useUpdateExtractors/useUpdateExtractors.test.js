
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { renderHook } from '@testing-library/react-hooks'
import { mapExtractorToLLMExtractor } from '@/containers/PromptCalibrationStudio/mappers'
import { sendBatchRequests } from '@/containers/PromptCalibrationStudio/utils'
import { Extractor } from '@/containers/PromptCalibrationStudio/viewModels'
import { useUpdateExtractors } from './useUpdateExtractors'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('@/containers/PromptCalibrationStudio/utils', () => ({
  sendBatchRequests: jest.fn(async (requests) => {
    for (const request of requests) {
      await request()
    }
  }),
}))

jest.mock('@/apiRTK/documentTypeApi', () => ({
  useUpdateLLMExtractorMutation: jest.fn(() => [mockUpdateLLMExtractor]),
  useUpdateExtractorLLMReferenceMutation: jest.fn(() => [mockUpdateExtractorLLMReference]),
}))

const mockUnwrapUpdateExtractor = jest.fn()
const mockUnwrapUpdateReference = jest.fn()
const mockUpdateLLMExtractor = jest.fn(() => ({
  unwrap: mockUnwrapUpdateExtractor,
}))
const mockUpdateExtractorLLMReference = jest.fn(() => ({
  unwrap: mockUnwrapUpdateReference,
}))

const mockDocumentTypeId = 'doc-type-123'

const mockInitialExtractor = new Extractor({
  id: 'extractor-1',
  name: 'Test Extractor',
  model: 'openai@gpt-4',
  temperature: 0.7,
  topP: 0.9,
  groupingFactor: 1,
  customInstruction: 'Test instructions',
  pageSpan: 5,
})

const mockUpdatedExtractorSameModel = new Extractor({
  id: 'extractor-1',
  name: 'Updated Extractor',
  model: 'openai@gpt-4',
  temperature: 0.8,
  topP: 0.95,
  groupingFactor: 2,
  customInstruction: 'Updated instructions',
  pageSpan: 10,
})

const mockUpdatedExtractorDifferentModel = new Extractor({
  id: 'extractor-1',
  name: 'Updated Extractor',
  model: 'anthropic@claude-3',
  temperature: 0.7,
  topP: 0.9,
  groupingFactor: 1,
  customInstruction: 'Test instructions',
  pageSpan: 5,
})

test('successfully updates extractor without changing model', async () => {
  jest.clearAllMocks()

  mockUnwrapUpdateExtractor.mockResolvedValue({})

  const { result } = renderHook(() => useUpdateExtractors())

  await result.current.updateExtractors(
    mockDocumentTypeId,
    [mockUpdatedExtractorSameModel],
    [mockInitialExtractor],
  )

  expect(mockUpdateExtractorLLMReference).not.toHaveBeenCalled()
  expect(mockUpdateLLMExtractor).toHaveBeenCalledTimes(1)
})

test('updates LLM reference when model changes', async () => {
  jest.clearAllMocks()

  mockUnwrapUpdateReference.mockResolvedValue({})
  mockUnwrapUpdateExtractor.mockResolvedValue({})

  const { result } = renderHook(() => useUpdateExtractors())

  await result.current.updateExtractors(
    mockDocumentTypeId,
    [mockUpdatedExtractorDifferentModel],
    [mockInitialExtractor],
  )

  expect(mockUpdateExtractorLLMReference).toHaveBeenCalledWith({
    documentTypeId: mockDocumentTypeId,
    extractorId: mockUpdatedExtractorDifferentModel.id,
    data: {
      provider: 'anthropic',
      model: 'claude-3',
    },
  })
  expect(mockUpdateLLMExtractor).toHaveBeenCalledTimes(1)
})

test('updates extractor with correct data', async () => {
  jest.clearAllMocks()

  mockUnwrapUpdateExtractor.mockResolvedValue({})

  const { result } = renderHook(() => useUpdateExtractors())

  await result.current.updateExtractors(
    mockDocumentTypeId,
    [mockUpdatedExtractorSameModel],
    [mockInitialExtractor],
  )

  const { extractorName, extractionParams } = mapExtractorToLLMExtractor(mockUpdatedExtractorSameModel)

  expect(mockUpdateLLMExtractor).toHaveBeenCalledWith({
    documentTypeId: mockDocumentTypeId,
    extractorId: mockUpdatedExtractorSameModel.id,
    data: {
      name: extractorName,
      extractionParams,
    },
  })
})

test('processes multiple extractors in batches', async () => {
  jest.clearAllMocks()

  mockUnwrapUpdateExtractor.mockResolvedValue({})

  const { result } = renderHook(() => useUpdateExtractors())

  const multipleExtractors = [mockUpdatedExtractorSameModel, mockUpdatedExtractorDifferentModel]
  const initialExtractors = [mockInitialExtractor, mockInitialExtractor]

  await result.current.updateExtractors(
    mockDocumentTypeId,
    multipleExtractors,
    initialExtractors,
  )

  expect(sendBatchRequests).toHaveBeenCalledWith(
    expect.any(Array),
    3,
  )
  expect(mockUpdateLLMExtractor).toHaveBeenCalledTimes(2)
})

test('handles null custom instruction', async () => {
  jest.clearAllMocks()

  mockUnwrapUpdateExtractor.mockResolvedValue({})

  const extractorWithNullInstruction = new Extractor({
    id: 'extractor-1',
    name: 'Test Extractor',
    model: 'openai@gpt-4',
    temperature: 0.7,
    topP: 0.9,
    groupingFactor: 1,
    customInstruction: null,
    pageSpan: 5,
  })

  const { result } = renderHook(() => useUpdateExtractors())

  await result.current.updateExtractors(
    mockDocumentTypeId,
    [extractorWithNullInstruction],
    [mockInitialExtractor],
  )

  expect(mockUpdateLLMExtractor).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        extractionParams: expect.objectContaining({
          customInstruction: null,
        }),
      }),
    }),
  )
})

test('calls sendBatchRequests when call updateExtractors', async () => {
  jest.clearAllMocks()

  const { result } = renderHook(() => useUpdateExtractors())

  await result.current.updateExtractors(
    mockDocumentTypeId,
    [mockUpdatedExtractorSameModel],
    [mockInitialExtractor],
  )

  expect(sendBatchRequests).toHaveBeenCalledTimes(1)
  const [[requests, batchSize]] = sendBatchRequests.mock.calls
  expect(requests).toHaveLength(1)
  expect(batchSize).toBe(3)
})
