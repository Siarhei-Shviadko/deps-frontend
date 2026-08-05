/* eslint-disable no-undef */
import { mockEnv } from '@/mocks/mockEnv'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import {
  mapFileDataToDto,
  mapSplitFileDataToDto,
  mapSplittedFileDataToDto,
} from './mappers'

jest.mock('@/utils/env', () => mockEnv)

const createMockFormData = () => {
  const formData = {
    append: jest.fn((key, value) => {
      formData[key] = value
    }),
  }

  return formData
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('maps splitted file data to dto with all provided fields', () => {
  const mockLabels = [{ name: 'label-1' }, { name: 'label-2' }]
  const mockParsingFeatures = [KnownParsingFeature.TEXT]

  const result = mapSplittedFileDataToDto({
    documentTypeId: 'doc-type-1',
    engine: 'tesseract',
    llmType: 'gpt-4',
    parsingFeatures: mockParsingFeatures,
    labels: mockLabels,
    groupId: 'group-1',
    needsSplittingProposalReview: true,
  })

  expect(result).toEqual({
    documentTypeId: result.documentTypeId,
    classificationEnabled: true,
    engine: result.engine,
    language: result.language,
    llmType: result.llmType,
    parsingFeatures: mockParsingFeatures,
    needsUnifier: true,
    needsExtraction: true,
    assignedToMe: true,
    labels: result.labels,
    groupId: result.groupId,
    needsSplittingProposalReview: true,
  })
})

test('maps empty parsingFeatures to null and missing labels to null', () => {
  const result = mapSplittedFileDataToDto({
    documentTypeId: 'doc-type-1',
    engine: 'tesseract',
    llmType: null,
    parsingFeatures: [],
    groupId: 'group-1',
    needsSplittingProposalReview: false,
  })

  expect(result.parsingFeatures).toBeNull()
  expect(result.labels).toBeNull()
  expect(result.language).toBeNull()
  expect(result.classificationEnabled).toBe(true)
  expect(result.needsUnifier).toBe(true)
  expect(result.needsExtraction).toBe(true)
  expect(result.assignedToMe).toBe(true)
})

test('maps split file data to dto with all provided fields', () => {
  const mockFormData = createMockFormData()
  global.FormData = jest.fn(() => mockFormData)

  const mockFile = new File(['content'], 'test.pdf')
  const mockLabels = [{ name: 'label-1' }, { name: 'label-2' }]
  const mockParsingFeatures = [KnownParsingFeature.TEXT]

  mapSplitFileDataToDto({
    file: mockFile,
    documentTypeId: 'doc-type-1',
    engine: 'tesseract',
    llmType: 'gpt-4',
    parsingFeatures: mockParsingFeatures,
    labels: mockLabels,
    groupId: 'group-1',
    needsSplittingProposalReview: true,
  })

  expect(mockFormData.file).toBe(mockFile)
  expect(mockFormData.classificationEnabled).toBe(true)
  expect(mockFormData.needsUnifier).toBe(true)
  expect(mockFormData.needsExtraction).toBe(true)
  expect(mockFormData.assignedToMe).toBe(true)
  expect(mockFormData.groupId).toBe('group-1')
  expect(mockFormData.needsSplittingProposalReview).toBe(true)
  expect(mockFormData.documentTypeId).toBe('doc-type-1')
  expect(mockFormData.engine).toBe('tesseract')
  expect(mockFormData.language).toBeUndefined()
  expect(mockFormData.llmType).toBe('gpt-4')
  expect(mockFormData.parsingFeatures).toBe(JSON.stringify(mockParsingFeatures))
  expect(mockFormData.labels).toBe(JSON.stringify(['label-1', 'label-2']))
})

test('omits null optional fields from form data when not provided', () => {
  const mockFormData = createMockFormData()
  global.FormData = jest.fn(() => mockFormData)

  const mockFile = new File(['content'], 'test.pdf')

  mapSplitFileDataToDto({
    file: mockFile,
    groupId: null,
    parsingFeatures: [],
  })

  expect(mockFormData.classificationEnabled).toBe(true)
  expect(mockFormData.needsUnifier).toBe(true)
  expect(mockFormData.needsExtraction).toBe(true)
  expect(mockFormData.assignedToMe).toBe(true)
  expect(mockFormData.needsSplittingProposalReview).toBeUndefined()
  expect(mockFormData.parsingFeatures).toBeUndefined()
  expect(mockFormData.labels).toBeUndefined()
  expect(mockFormData.language).toBeUndefined()
  expect(mockFormData.groupId).toBeUndefined()
})

test('maps file data to dto with correct transformations', () => {
  const mockFormData = createMockFormData()
  global.FormData = jest.fn(() => mockFormData)

  const mockFile = new File(['content'], 'test.pdf')
  const mockLabels = [{ name: 'label-1' }]
  const mockParsingFeatures = [KnownParsingFeature.TEXT, KnownParsingFeature.TABLES]

  mapFileDataToDto({
    file: mockFile,
    engine: 'tesseract',
    labels: mockLabels,
    group: { id: 'group-1' },
    assignedToMe: false,
    needsExtraction: true,
    llmType: 'gpt-4',
    parsingFeatures: mockParsingFeatures,
  })

  expect(mockFormData.file).toBe(mockFile)
  expect(mockFormData.engine).toBe('tesseract')
  expect(mockFormData.needsExtraction).toBe(true)
  expect(mockFormData.assignedToMe).toBe(false)
  expect(mockFormData.needsUnifier).toBe(true)
  expect(mockFormData.labels).toBe(JSON.stringify(['label-1']))
  expect(mockFormData.parsingFeatures).toBe(JSON.stringify(mockParsingFeatures))
  expect(mockFormData.groupId).toBe('group-1')
  expect(mockFormData.llmType).toBe('gpt-4')
})

test('maps file data to dto with default values when optional fields are not provided', () => {
  const mockFormData = createMockFormData()
  global.FormData = jest.fn(() => mockFormData)

  const mockFile = new File(['content'], 'test.pdf')
  const mockLabels = [{ name: 'label-1' }]
  const mockParsingFeatures = [KnownParsingFeature.TEXT]

  mapFileDataToDto({
    file: mockFile,
    labels: mockLabels,
    parsingFeatures: mockParsingFeatures,
  })

  expect(mockFormData.needsExtraction).toBe(false)
  expect(mockFormData.assignedToMe).toBe(true)
  expect(mockFormData.groupId).toBeNull()
  expect(mockFormData.llmType).toBeNull()
})
