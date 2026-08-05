import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { act, renderHook } from '@testing-library/react-hooks'
import { Localization, localize } from '@/localization/i18n'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { useAutoSplitFiles } from './useAutoSplitFiles'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)

const mockUnwrap = jest.fn(() => Promise.resolve())

const mockSplitFile = jest.fn(() => ({
  unwrap: mockUnwrap,
}))

jest.mock('@/apiRTK/filesApi', () => ({
  useSplitFileMutation: jest.fn(() => [mockSplitFile]),
}))

const mockFileData = {
  file: { name: 'file1.png' },
  groupId: 'group-1',
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUnwrap.mockImplementation(() => Promise.resolve())
})

test('returns correct values', () => {
  const { result } = renderHook(() => useAutoSplitFiles())

  expect(result.current).toEqual({
    autoSplitFiles: expect.any(Function),
    completedRequests: 0,
    resetRequestsCounter: expect.any(Function),
  })
})

test('calls splitFile for each file when autoSplitFiles is called', async () => {
  const { result } = renderHook(() => useAutoSplitFiles())

  const mockFiles = [
    {
      ...mockFileData,
      file: { name: 'file1.png' },
    },
    {
      ...mockFileData,
      file: { name: 'file2.png' },
    },
  ]

  await act(async () => {
    await result.current.autoSplitFiles(mockFiles)
  })

  expect(mockSplitFile).toHaveBeenNthCalledWith(1, mockFiles[0])
  expect(mockSplitFile).toHaveBeenNthCalledWith(2, mockFiles[1])
  expect(notifySuccess).toHaveBeenNthCalledWith(1, localize(Localization.AUTO_SPLITTING_STARTED))
})

test('increments completedRequests after each successful split', async () => {
  const { result } = renderHook(() => useAutoSplitFiles())

  const mockFiles = [
    {
      ...mockFileData,
      file: { name: 'file1.png' },
    },
    {
      ...mockFileData,
      file: { name: 'file2.png' },
    },
  ]

  await act(async () => {
    await result.current.autoSplitFiles(mockFiles)
  })

  expect(result.current.completedRequests).toBe(2)
})

test('resets completedRequests when resetRequestsCounter is called', async () => {
  const { result } = renderHook(() => useAutoSplitFiles())

  await act(async () => {
    await result.current.autoSplitFiles([mockFileData])
  })

  act(() => {
    result.current.resetRequestsCounter()
  })

  expect(result.current.completedRequests).toBe(0)
})

test('shows error notification when splitFile fails', async () => {
  const mockError = { data: { code: 'UNKNOWN_ERROR' } }
  mockUnwrap.mockRejectedValueOnce(mockError)

  const { result } = renderHook(() => useAutoSplitFiles())

  await act(async () => {
    await result.current.autoSplitFiles([mockFileData])
  })

  expect(notifyWarning).toHaveBeenNthCalledWith(1, localize(Localization.DEFAULT_ERROR))
})

test('does not show success notification when splitFile fails', async () => {
  mockUnwrap.mockRejectedValueOnce(new Error('API Error'))

  const { result } = renderHook(() => useAutoSplitFiles())

  await act(async () => {
    await result.current.autoSplitFiles([mockFileData])
  })

  expect(notifySuccess).not.toHaveBeenCalled()
})
