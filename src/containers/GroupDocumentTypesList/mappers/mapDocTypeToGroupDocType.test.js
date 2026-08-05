
import { mockEnv } from '@/mocks/mockEnv'
import { ExtractionType } from '@/enums/ExtractionType'
import { DocumentType } from '@/models/DocumentType'
import { GenAiClassifier } from '@/models/DocumentTypesGroup'
import { Splitter } from '@/models/Splitter'
import { mapDocTypeToGroupDocType } from './mapDocTypesToGroupDocTypes'

jest.mock('@/utils/env', () => mockEnv)
const mockGroupId = 'groupId'

test('returns doc type with custom type if extraction type is in custom model types', () => {
  const docType = new DocumentType(
    'code',
    'name',
    null,
    null,
    ExtractionType.ML,
  )

  const result = mapDocTypeToGroupDocType({
    documentType: docType,
    groupId: mockGroupId,
    classifiers: [],
    splitters: [],
  })

  expect(result.extractionType).toBe(ExtractionType.CUSTOM_MODEL)
})

test('returns doc type with ai-prompted extractor type if it is not provided', () => {
  const docType = new DocumentType(
    'code',
    'name',
    null,
    null,
    null,
  )

  const result = mapDocTypeToGroupDocType({
    documentType: docType,
    groupId: mockGroupId,
    classifiers: [],
    splitters: [],
  })

  expect(result.extractionType).toBe(ExtractionType.AI_PROMPTED)
})

test('returns doc type with the same extraction type by default', () => {
  const docType = new DocumentType(
    'code',
    'name',
    null,
    null,
    ExtractionType.PROTOTYPE,
  )

  const result = mapDocTypeToGroupDocType({
    documentType: docType,
    groupId: mockGroupId,
    classifiers: [],
    splitters: [],
  })

  expect(result.extractionType).toBe(ExtractionType.PROTOTYPE)
})

test('returns doc type with correct classifier if classifiers list is provided', () => {
  const mockDocTypeCode = 'code'

  const docType = new DocumentType(
    mockDocTypeCode,
    'name',
    null,
    null,
    null,
  )

  const classifiersList = [
    new GenAiClassifier({
      genAiClassifierId: 'genAiClassifierId1',
      documentTypeId: mockDocTypeCode,
      name: 'Classifier Name 1',
    }),
    new GenAiClassifier({
      genAiClassifierId: 'genAiClassifierId2',
      documentTypeId: 'code 2',
      name: 'Classifier Name 2',
    }),
  ]

  const result = mapDocTypeToGroupDocType({
    documentType: docType,
    groupId: mockGroupId,
    classifiers: classifiersList,
    splitters: [],
  })

  expect(result.classifier).toBe(classifiersList[0])
})

test('returns doc type with correct splitter if splitters list is provided', () => {
  const mockDocTypeCode = 'code'

  const docType = new DocumentType(
    mockDocTypeCode,
    'name',
    null,
    null,
    null,
  )

  const splittersList = [
    new Splitter({
      id: 'splitter-id-1',
      groupId: mockGroupId,
      documentTypeId: mockDocTypeCode,
      name: 'Splitter Name 1',
      splittingQuery: 'Test query',
      llmType: 'provider1/model-1-1',
    }),
    new Splitter({
      id: 'splitter-id-2',
      groupId: mockGroupId,
      documentTypeId: 'code 2',
      name: 'Splitter Name 2',
      splittingQuery: 'Test query 2',
      llmType: 'provider1/model-1-2',
    }),
  ]

  const result = mapDocTypeToGroupDocType({
    documentType: docType,
    groupId: mockGroupId,
    classifiers: [],
    splitters: splittersList,
  })

  expect(result.splitter).toBe(splittersList[0])
})
