
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorCode, RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Localization, localize } from '@/localization/i18n'
import { Splitter } from '@/models/Splitter'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { EditSplitterDrawerButton } from './EditSplitterDrawerButton'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('@/apiRTK/splittingApi', () => ({
  useUpdateSplitterMutation: jest.fn(() => ([
    mockUpdateSplitter,
    { isLoading: false },
  ])),
}))

const mockUpdateSplitter = jest.fn(() => ({
  unwrap: jest.fn(() => Promise.resolve({})),
}))

const mockOnTriggerClick = jest.fn()
const mockFormValues = {
  documentTypeId: 'mockDocTypeId1',
  name: 'name',
  splittingQuery: 'query',
  llmType: 'gpt',
}

const mockSplitter = new Splitter({
  id: 'splitter-id',
  groupId: 'group-id',
  documentTypeId: 'mockDocTypeId1',
  name: 'Splitter Name',
  llmType: 'Test Splitter Llm',
  splittingQuery: 'Test Splitter Query',
})

jest.mock('@/containers/DocumentTypeSplitter', () => ({
  DocumentTypeSplitter: {
    Drawer: ({ renderTrigger, onSubmit }) => (
      <>
        {renderTrigger(mockOnTriggerClick)}
        <div data-testid='drawer'>
          <button
            data-testid='submit-btn'
            onClick={() => onSubmit(mockFormValues)}
          />
        </div>
      </>
    ),
    DocTypeField: ({ children }) => children,
    Fields: () => null,
  },
}))

jest.mock('@/components/Icons/PenIcon', () => ({
  PenIcon: () => <div data-testid={'edit-icon'} />,
}))

test('renders trigger button and drawer correctly', async () => {
  render(
    <EditSplitterDrawerButton
      splitter={mockSplitter}
    />,
  )

  const editSplitterButton = screen.getByTestId('edit-icon')
  const drawer = screen.getByTestId('drawer')

  expect(drawer).toBeInTheDocument()
  expect(editSplitterButton).toBeInTheDocument()

  await userEvent.click(editSplitterButton)

  expect(mockOnTriggerClick).toHaveBeenCalled()
})

test('calls update splitter api with correct args if onSubmit was called', async () => {
  render(
    <EditSplitterDrawerButton
      splitter={mockSplitter}
    />,
  )

  const submitButton = screen.getByTestId('submit-btn')
  await userEvent.click(submitButton)

  expect(mockUpdateSplitter).nthCalledWith(1, {
    id: mockSplitter.id,
    ...mockFormValues,
  })
})

test('calls success notification on successful splitter update', async () => {
  jest.clearAllMocks()

  render(
    <EditSplitterDrawerButton
      splitter={mockSplitter}
    />,
  )

  const submitButton = screen.getByTestId('submit-btn')
  await userEvent.click(submitButton)

  expect(notifySuccess).nthCalledWith(
    1,
    localize(Localization.UPDATE_SPLITTER_SUCCESSFUL),
  )
})

test('calls notifyWarning if update splitter fails with known error', async () => {
  const errorCode = ErrorCode.forbidden
  const mockError = {
    data: {
      code: errorCode,
    },
  }

  mockUpdateSplitter.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => Promise.reject(mockError)),
  }))

  render(
    <EditSplitterDrawerButton
      splitter={mockSplitter}
    />,
  )

  const submitButton = screen.getByTestId('submit-btn')
  await userEvent.click(submitButton)

  expect(notifyWarning).nthCalledWith(
    1,
    RESOURCE_ERROR_TO_DISPLAY[errorCode],
  )
})

test('calls notifyWarning if update splitter fails with unknown error', async () => {
  jest.clearAllMocks()

  mockUpdateSplitter.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => Promise.reject(new Error())),
  }))

  render(
    <EditSplitterDrawerButton
      splitter={mockSplitter}
    />,
  )

  const submitButton = screen.getByTestId('submit-btn')
  await userEvent.click(submitButton)

  expect(notifyWarning).nthCalledWith(
    1,
    localize(Localization.DEFAULT_ERROR),
  )
})
