
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { renderHook } from '@testing-library/react-hooks'
import { GroupDocumentTypesFilterKey } from '@/constants/navigation'
import { ExtractionType } from '@/enums/ExtractionType'
import { GenAiClassifier } from '@/models/DocumentTypesGroup'
import { Splitter } from '@/models/Splitter'
import { GroupDocumentType } from '../GroupDocumentType'
import { useFilterGroupDocTypes } from './useFilterGroupDocTypes'

jest.mock('@/actions/navigation', () => ({
  setFilters: jest.fn(),
}))

jest.mock('react-redux', () => ({
  ...mockReactRedux,
  useDispatch: jest.fn(),
}))

jest.mock('@/utils/env', () => mockEnv)

const mockDocumentTypes = [
  new GroupDocumentType({
    id: 'typeCode1',
    groupId: 'mockGroupId',
    name: 'typeName1',
    classifier: new GenAiClassifier({
      genAiClassifierId: 'genAiClassifierId1',
      documentTypeId: 'typeCode1',
      name: 'Classifier Name 1',
      llmType: 'Test llm',
      prompt: 'Test prompt',
    }),
    extractionType: ExtractionType.PROTOTYPE,
  }),
  new GroupDocumentType({
    id: 'typeCode2',
    groupId: 'mockGroupId',
    name: 'typeName2',
    classifier: new GenAiClassifier({
      genAiClassifierId: 'genAiClassifierId2',
      documentTypeId: 'typeCode2',
      name: 'Classifier Name 2',
      llmType: 'Test llm',
      prompt: 'Test prompt',
    }),
    extractionType: ExtractionType.PROTOTYPE,
  }),
  new GroupDocumentType({
    id: 'typeCode3',
    groupId: 'mockGroupId',
    name: 'typeName3',
    extractionType: ExtractionType.CUSTOM_MODEL,
  }),
]

const [
  firstDocType,
  secondDocType,
  thirdDocType,
] = mockDocumentTypes

const defaultFilters = Object.fromEntries(
  Object.entries(GroupDocumentTypesFilterKey).map(([, value]) => [
    value, '',
  ]),
)

test('returns expected API', async () => {
  const args = {
    groupDocTypes: mockDocumentTypes,
    filters: defaultFilters,
    filterConfig: {},
    changePagination: jest.fn(),
  }

  const { result } = renderHook(() => useFilterGroupDocTypes(args))

  const [list, filterHandler] = result.current

  expect(list).toEqual(mockDocumentTypes)
  expect(filterHandler).toEqual(expect.any(Function))
})

test('returns filtered list by document type name', async () => {
  const args = {
    groupDocTypes: mockDocumentTypes,
    filters: {
      ...defaultFilters,
      [GroupDocumentTypesFilterKey.NAME]: thirdDocType.name,
    },
    filterConfig: {},
    changePagination: jest.fn(),
  }

  const { result } = renderHook(() => useFilterGroupDocTypes(args))

  const [list, filterHandler] = result.current

  expect(list).toEqual([thirdDocType])
  expect(filterHandler).toEqual(expect.any(Function))
})

test('returns filtered list by extraction type', async () => {
  const args = {
    groupDocTypes: mockDocumentTypes,
    filters: {
      ...defaultFilters,
      [GroupDocumentTypesFilterKey.EXTRACTION_TYPE]: [
        firstDocType.extractionType,
      ],
    },
    filterConfig: {},
    changePagination: jest.fn(),
  }

  const { result } = renderHook(() => useFilterGroupDocTypes(args))

  const [list, filterHandler] = result.current

  expect(list).toEqual([firstDocType, secondDocType])
  expect(filterHandler).toEqual(expect.any(Function))
})

test('returns filtered list by document type classifier', async () => {
  const args = {
    groupDocTypes: mockDocumentTypes,
    filters: {
      ...defaultFilters,
      [GroupDocumentTypesFilterKey.CLASSIFIER]: firstDocType.classifier.name,
    },
    filterConfig: {},
    changePagination: jest.fn(),
  }

  const { result } = renderHook(() => useFilterGroupDocTypes(args))

  const [list, filterHandler] = result.current

  expect(list).toEqual([firstDocType])
  expect(filterHandler).toEqual(expect.any(Function))
})

test('returns filtered list by document type splitter', async () => {
  const docTypeWithSplitter = new GroupDocumentType({
    id: 'typeCode4',
    groupId: 'mockGroupId',
    name: 'typeName4',
    splitter: new Splitter({
      id: 'splitter-id',
      groupId: 'mockGroupId',
      documentTypeId: 'typeCode4',
      name: 'Splitter Name',
      splittingQuery: 'Test query',
      llmType: 'provider1/model-1-1',
    }),
    extractionType: ExtractionType.PROTOTYPE,
  })

  const args = {
    groupDocTypes: [...mockDocumentTypes, docTypeWithSplitter],
    filters: {
      ...defaultFilters,
      [GroupDocumentTypesFilterKey.SPLITTER]: docTypeWithSplitter.splitter.name,
    },
    filterConfig: {},
    changePagination: jest.fn(),
  }

  const { result } = renderHook(() => useFilterGroupDocTypes(args))

  const [list, filterHandler] = result.current

  expect(list).toEqual([docTypeWithSplitter])
  expect(filterHandler).toEqual(expect.any(Function))
})
