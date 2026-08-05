
import { mockEnv } from '@/mocks/mockEnv'
import { renderHook } from '@testing-library/react-hooks'
import { CHAR_TYPE } from '@/containers/FieldBusinessRuleModal/constants'
import { sendBatchRequests } from '@/containers/PromptCalibrationStudio/utils'
import {
  Field,
  Query,
  QueryNode,
  MULTIPLICITY,
} from '@/containers/PromptCalibrationStudio/viewModels'
import { FieldType } from '@/enums/FieldType'
import { useCreateFields } from './useCreateFields'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/containers/PromptCalibrationStudio/utils', () => ({
  sendBatchRequests: jest.fn(async (requests) => {
    for (const request of requests) {
      await request()
    }
  }),
}))

jest.mock('@/apiRTK/extractionFieldsApi', () => ({
  useCreateExtractionFieldMutation: jest.fn(() => [mockCreateExtractionField]),
}))

jest.mock('@/apiRTK/documentTypeApi', () => ({
  useCreateLLMExtractorQueryMutation: jest.fn(() => [mockCreateLLMExtractorQuery]),
}))

const mockUnwrapExtractionField = jest.fn()
const mockUnwrapLLMQuery = jest.fn()
const mockCreateExtractionField = jest.fn(() => ({
  unwrap: mockUnwrapExtractionField,
}))
const mockCreateLLMExtractorQuery = jest.fn(() => ({
  unwrap: mockUnwrapLLMQuery,
}))

const mockDocumentTypeId = 'doc-type-123'

const mockFieldWithQuery = new Field({
  id: 'field-2',
  name: 'Test Field 2',
  extractorId: 'extractor-2',
  multiplicity: MULTIPLICITY.MULTIPLE,
  fieldType: FieldType.STRING,
  confidential: true,
  readOnly: true,
  aliases: true,
  order: 2,
  query: new Query({
    nodes: [
      new QueryNode({
        id: 'node-1',
        name: 'Node 1',
        prompt: 'Extract data',
      }),
      new QueryNode({
        id: 'node-2',
        name: 'Node 2',
        prompt: 'Validate data',
      }),
    ],
  }),
})

test('successfully creates fields with extraction field and LLM query', async () => {
  jest.clearAllMocks()

  mockUnwrapExtractionField.mockResolvedValueOnce({ code: 'field-code-1' })
  mockUnwrapLLMQuery.mockResolvedValueOnce({})

  const { result } = renderHook(() => useCreateFields())

  await result.current.createFields(
    mockDocumentTypeId,
    [mockFieldWithQuery],
  )

  expect(mockCreateExtractionField).toHaveBeenCalledTimes(1)
  expect(mockCreateLLMExtractorQuery).toHaveBeenCalledTimes(1)
})

test('creates extraction field with correct data for single multiplicity field', async () => {
  jest.clearAllMocks()

  mockUnwrapExtractionField.mockResolvedValueOnce({ code: 'field-code-1' })

  const { result } = renderHook(() => useCreateFields())

  await result.current.createFields(
    mockDocumentTypeId,
    [{
      ...mockFieldWithQuery,
      multiplicity: MULTIPLICITY.SINGLE,
    }],
  )

  expect(mockCreateExtractionField).toHaveBeenCalledWith({
    documentTypeCode: mockDocumentTypeId,
    field: {
      name: mockFieldWithQuery.name,
      required: false,
      readOnly: mockFieldWithQuery.readOnly,
      confidential: mockFieldWithQuery.confidential,
      fieldType: mockFieldWithQuery.fieldType,
      extractorId: mockFieldWithQuery.extractorId,
      fieldMeta: {
        charType: CHAR_TYPE.ALPHANUMERIC,
      },
      order: mockFieldWithQuery.order,
    },
  })
})

test('creates extraction field with correct data for multiple multiplicity field', async () => {
  jest.clearAllMocks()

  mockUnwrapExtractionField.mockResolvedValueOnce({ code: 'field-code-2' })

  const { result } = renderHook(() => useCreateFields())

  await result.current.createFields(
    mockDocumentTypeId,
    [mockFieldWithQuery],
  )

  expect(mockCreateExtractionField).toHaveBeenCalledWith({
    documentTypeCode: mockDocumentTypeId,
    field: {
      name: mockFieldWithQuery.name,
      required: false,
      readOnly: mockFieldWithQuery.readOnly,
      confidential: mockFieldWithQuery.confidential,
      fieldType: FieldType.LIST,
      extractorId: mockFieldWithQuery.extractorId,
      fieldMeta: {
        baseType: mockFieldWithQuery.fieldType,
        baseTypeMeta: {
          charType: CHAR_TYPE.ALPHANUMERIC,
        },
      },
      order: mockFieldWithQuery.order,
    },
  })
})

test('creates LLM query when field has query nodes', async () => {
  jest.clearAllMocks()

  const mockFieldCode = 'field-code-2'

  mockUnwrapExtractionField.mockResolvedValueOnce({ code: mockFieldCode })
  mockUnwrapLLMQuery.mockResolvedValueOnce({})

  const { result } = renderHook(() => useCreateFields())

  await result.current.createFields(
    mockDocumentTypeId,
    [mockFieldWithQuery],
  )

  expect(mockCreateLLMExtractorQuery).toHaveBeenCalledTimes(1)
  expect(mockCreateLLMExtractorQuery).toHaveBeenCalledWith({
    documentTypeId: mockDocumentTypeId,
    extractorId: mockFieldWithQuery.extractorId,
    data: expect.objectContaining({
      code: mockFieldCode,
      shape: expect.any(Object),
      workflow: expect.any(Object),
    }),
  })
})

test('calls sendBatchRequests when call createFields', async () => {
  jest.clearAllMocks()

  const { result } = renderHook(() => useCreateFields())

  await result.current.createFields(
    mockDocumentTypeId,
    [],
  )

  expect(sendBatchRequests).toHaveBeenCalledWith(
    expect.any(Array),
    3,
  )
})
