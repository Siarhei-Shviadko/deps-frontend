
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorCode, RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Localization, localize } from '@/localization/i18n'
import { DocumentTypesGroup } from '@/models/DocumentTypesGroup'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { AddSplitterDrawerButton } from './AddSplitterDrawerButton'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('react-router', () => ({
  useParams: jest.fn(() => ({
    groupId: 'group-id',
  })),
}))

jest.mock('@/apiRTK/documentTypesGroupsApi', () => ({
  useFetchDocumentTypesGroupState: jest.fn(() => ({
    data: {
      group: mockDocTypesGroup,
    },
  })),
}))

jest.mock('@/apiRTK/splittingApi', () => ({
  useCreateSplitterMutation: jest.fn(() => ([
    mockCreateSplitter,
    { isLoading: false },
  ])),
}))

const mockCreateSplitter = jest.fn(() => ({
  unwrap: jest.fn(() => Promise.resolve({})),
}))

const mockOnTriggerClick = jest.fn()
const mockFormValues = 'mockFormValues'

const mockDocTypesGroup = new DocumentTypesGroup({
  id: 'group-id',
  name: 'Group1',
  documentTypeIds: ['mockId'],
  createdAt: '2012-12-12',
  genAiClassifiers: [],
  splitters: [],
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

test('renders trigger button and drawer correctly', async () => {
  render(
    <AddSplitterDrawerButton
      documentTypeId={'mockId'}
    />,
  )

  const addSplitterButton = screen.getByRole('button', {
    name: localize(Localization.ADD_SPLITTER),
  })
  const drawer = screen.getByTestId('drawer')

  expect(drawer).toBeInTheDocument()
  expect(addSplitterButton).toBeInTheDocument()

  await userEvent.click(addSplitterButton)

  expect(mockOnTriggerClick).toHaveBeenCalled()
})

test('calls create splitter api with correct args if onSubmit was called', async () => {
  render(
    <AddSplitterDrawerButton
      documentTypeId={'mockId'}
    />,
  )

  const submitButton = screen.getByTestId('submit-btn')
  await userEvent.click(submitButton)

  expect(mockCreateSplitter).nthCalledWith(1, {
    ...mockFormValues,
    groupId: 'group-id',
  })
})

test('calls success notification on successful splitter creation', async () => {
  jest.clearAllMocks()

  render(
    <AddSplitterDrawerButton
      documentTypeId={'mockId'}
    />,
  )

  const submitButton = screen.getByTestId('submit-btn')
  await userEvent.click(submitButton)

  expect(notifySuccess).nthCalledWith(
    1,
    localize(Localization.CREATE_SPLITTER_SUCCESSFUL),
  )
})

test('calls notifyWarning if create splitter fails with known error', async () => {
  const errorCode = ErrorCode.forbidden
  const mockError = {
    data: {
      code: errorCode,
    },
  }

  mockCreateSplitter.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => Promise.reject(mockError)),
  }))

  render(
    <AddSplitterDrawerButton
      documentTypeId={'mockId'}
    />,
  )

  const submitButton = screen.getByTestId('submit-btn')
  await userEvent.click(submitButton)

  expect(notifyWarning).nthCalledWith(
    1,
    RESOURCE_ERROR_TO_DISPLAY[errorCode],
  )
})

test('calls notifyWarning if create splitter fails with unknown error', async () => {
  jest.clearAllMocks()

  mockCreateSplitter.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => Promise.reject(new Error())),
  }))

  render(
    <AddSplitterDrawerButton
      documentTypeId={'mockId'}
    />,
  )

  const submitButton = screen.getByTestId('submit-btn')
  await userEvent.click(submitButton)

  expect(notifyWarning).nthCalledWith(
    1,
    localize(Localization.DEFAULT_ERROR),
  )
})
