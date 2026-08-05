
import { mockEnv } from '@/mocks/mockEnv'
import { renderHook } from '@testing-library/react-hooks'
import { SplittingContextAttachments } from '@/enums/SplittingContextAttachments'
import { SPLITTING_MODE } from '@/enums/SplittingMode'
import { DocumentTypesGroup } from '@/models/DocumentTypesGroup'
import { Splitter } from '@/models/Splitter'
import { useManageSplitter } from './useManageSplitter'

jest.mock('@/utils/env', () => mockEnv)

const mockCreateSplitterUnwrap = jest.fn(() => Promise.resolve({}))
const mockUpdateSplitterUnwrap = jest.fn(() => Promise.resolve({}))
const mockDeleteSplitterUnwrap = jest.fn(() => Promise.resolve({}))

const mockCreateSplitterFn = jest.fn(() => ({
  unwrap: mockCreateSplitterUnwrap,
}))

const mockUpdateSplitterFn = jest.fn(() => ({
  unwrap: mockUpdateSplitterUnwrap,
}))

const mockDeleteSplitterFn = jest.fn(() => ({
  unwrap: mockDeleteSplitterUnwrap,
}))

jest.mock('@/apiRTK/splittingApi', () => ({
  useCreateSplitterMutation: jest.fn(() => ([
    mockCreateSplitterFn,
    { isLoading: false },
  ])),
  useUpdateSplitterMutation: jest.fn(() => ([
    mockUpdateSplitterFn,
    { isLoading: false },
  ])),
  useDeleteSplitterMutation: jest.fn(() => ([
    mockDeleteSplitterFn,
    { isLoading: false },
  ])),
}))

const mockGroupId = 'group-id'
const mockSplitterId = 'splitter-id'

const mockGroupSplitter = new Splitter({
  id: mockSplitterId,
  groupId: mockGroupId,
  documentTypeId: '',
  name: 'Existing Splitter',
  splittingQuery: 'Existing query',
  llmType: 'provider1/model-1-1',
})

const mockGroupWithoutSplitter = new DocumentTypesGroup({
  id: mockGroupId,
  name: 'Group Name',
  documentTypeIds: [],
  splitters: [],
})

const mockGroupWithSplitter = new DocumentTypesGroup({
  id: mockGroupId,
  name: 'Group Name',
  documentTypeIds: [],
  splitters: [mockGroupSplitter],
})

const mockSplitterFormValues = {
  name: 'Splitter Name',
  description: 'Splitter description',
  query: 'Test query',
  llmType: 'provider1/model-1-1',
  splittingContextAttachments: [SplittingContextAttachments.FILE_IMAGES],
  splittingMode: SPLITTING_MODE.SECTION_BASED,
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('creates splitter when group has no existing group-level splitter', async () => {
  const { result } = renderHook(() => useManageSplitter(mockGroupWithoutSplitter))

  await result.current.manageSplitter(mockSplitterFormValues)

  expect(mockCreateSplitterFn).toHaveBeenNthCalledWith(1, {
    groupId: mockGroupId,
    mode: mockSplitterFormValues.splittingMode,
    name: mockSplitterFormValues.name,
    description: mockSplitterFormValues.description,
    query: mockSplitterFormValues.query,
    llmType: mockSplitterFormValues.llmType,
    splittingContextAttachments: mockSplitterFormValues.splittingContextAttachments,
  })
  expect(mockCreateSplitterUnwrap).toHaveBeenCalledTimes(1)
})

test('updates splitter when group has existing group-level splitter', async () => {
  const { result } = renderHook(() => useManageSplitter(mockGroupWithSplitter))

  await result.current.manageSplitter(mockSplitterFormValues)

  expect(mockUpdateSplitterFn).toHaveBeenNthCalledWith(1, {
    id: mockSplitterId,
    name: mockSplitterFormValues.name,
    description: mockSplitterFormValues.description,
    query: mockSplitterFormValues.query,
    llmType: mockSplitterFormValues.llmType,
    splittingContextAttachments: mockSplitterFormValues.splittingContextAttachments,
  })
  expect(mockUpdateSplitterUnwrap).toHaveBeenCalledTimes(1)
})

test('deletes splitter when splitter form values are not provided and group has existing splitter', async () => {
  const { result } = renderHook(() => useManageSplitter(mockGroupWithSplitter))

  await result.current.manageSplitter(null)

  expect(mockDeleteSplitterFn).toHaveBeenNthCalledWith(1, mockSplitterId)
  expect(mockDeleteSplitterUnwrap).toHaveBeenCalledTimes(1)
})

test('returns isLoading as true when splitter mutation is in progress', () => {
  const { useCreateSplitterMutation } = jest.requireMock('@/apiRTK/splittingApi')

  useCreateSplitterMutation.mockImplementationOnce(() => ([
    mockCreateSplitterFn,
    { isLoading: true },
  ]))

  const { result } = renderHook(() => useManageSplitter(mockGroupWithoutSplitter))

  expect(result.current.isLoading).toBe(true)
})
