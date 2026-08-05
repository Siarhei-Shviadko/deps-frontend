
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '@/components/Modal'
import { ErrorCode, RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Localization, localize } from '@/localization/i18n'
import { Splitter } from '@/models/Splitter'
import { render } from '@/utils/rendererRTL'
import { SplitterTag } from './SplitterTag'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('@/components/Icons/XMarkIcon', () => ({
  XMarkIcon: () => <div data-testid='delete-icon' />,
}))

jest.mock('@/apiRTK/splittingApi', () => ({
  useDeleteSplitterMutation: jest.fn(() => (
    [mockDeleteSplitter]),
  ),
}))

const deleteSplitterUnwrappedFn = jest.fn(() => Promise.resolve())
const mockDeleteSplitter = jest.fn(() => ({
  unwrap: deleteSplitterUnwrappedFn,
}))

Modal.confirm = jest.fn()

const mockSplitter = new Splitter({
  id: 'splitter-id',
  groupId: 'group-id',
  documentTypeId: 'mockDocumentTypeId',
  name: 'Splitter Name',
  llmType: 'Test Splitter Llm',
  splittingQuery: 'Test Splitter Query',
})

test('shows splitter name', async () => {
  render(
    <SplitterTag
      splitter={mockSplitter}
    />,
  )

  expect(screen.getByText(mockSplitter.name)).toBeInTheDocument()
})

test('calls Modal.confirm with correct arguments in case of remove splitter icon click', async () => {
  render(
    <SplitterTag
      splitter={mockSplitter}
    />,
  )

  await userEvent.click(screen.getByTestId('delete-icon'))

  expect(Modal.confirm).nthCalledWith(1, {
    title: localize(Localization.DELETE_SPLITTER_CONFIRM_MESSAGE, {
      name: mockSplitter.name,
    }),
    onOk: expect.any(Function),
  })
})

test('calls deleteSplitter with correct argument when clicking on modal confirm', async () => {
  Modal.confirm.mockImplementationOnce((config) => config.onOk())

  render(
    <SplitterTag
      splitter={mockSplitter}
    />,
  )

  await userEvent.click(screen.getByTestId('delete-icon'))

  expect(mockDeleteSplitter).nthCalledWith(1, mockSplitter.id)
})

test('calls notifySuccess with correct message in case successful splitter deletion', async () => {
  Modal.confirm.mockImplementationOnce((config) => config.onOk())

  render(
    <SplitterTag
      splitter={mockSplitter}
    />,
  )

  await userEvent.click(screen.getByTestId('delete-icon'))

  expect(mockNotification.notifySuccess).nthCalledWith(
    1,
    localize(Localization.SPLITTER_SUCCESS_DELETION, {
      name: mockSplitter.name,
    }),
  )
})

test('calls notifyWarning with correct message in case delete fails with unknown error code', async () => {
  jest.clearAllMocks()

  const mockError = new Error('test')

  mockDeleteSplitter.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => Promise.reject(mockError)),
  }))

  Modal.confirm.mockImplementationOnce((config) => config.onOk())

  render(
    <SplitterTag
      splitter={mockSplitter}
    />,
  )

  await userEvent.click(screen.getByTestId('delete-icon'))

  expect(mockNotification.notifyWarning).nthCalledWith(
    1,
    localize(Localization.DEFAULT_ERROR),
  )
})

test('calls notifyWarning with correct message in case delete fails with known code', async () => {
  jest.clearAllMocks()

  const mockError = {
    data: {
      code: ErrorCode.illegal_argument,
    },
  }

  mockDeleteSplitter.mockImplementationOnce(() => ({
    unwrap: () => Promise.reject(mockError),
  }))

  Modal.confirm.mockImplementationOnce((config) => config.onOk())

  render(
    <SplitterTag
      splitter={mockSplitter}
    />,
  )

  await userEvent.click(screen.getByTestId('delete-icon'))

  expect(mockNotification.notifyWarning).nthCalledWith(
    1,
    RESOURCE_ERROR_TO_DISPLAY[ErrorCode.illegal_argument],
  )
})
