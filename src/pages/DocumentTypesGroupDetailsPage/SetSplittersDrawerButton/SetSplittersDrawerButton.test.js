
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { ErrorCode, RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Localization, localize } from '@/localization/i18n'
import { DocumentTypesGroup } from '@/models/DocumentTypesGroup'
import { Splitter } from '@/models/Splitter'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { SetSplittersDrawerButton } from './SetSplittersDrawerButton'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)

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
  id: 'id1',
  name: 'Group1',
  documentTypeIds: ['testType1', 'testType2'],
  createdAt: '2012-12-12',
  genAiClassifiers: [],
  splitters: [
    new Splitter({
      id: 'splitter-id',
      groupId: 'id1',
      documentTypeId: 'testType1',
      name: 'Splitter Name',
      splittingQuery: 'Test query',
      llmType: 'provider1/model-1-1',
    }),
  ],
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
    <SetSplittersDrawerButton
      group={mockDocTypesGroup}
    />,
  )

  const button = screen.getByRole('button', {
    name: localize(Localization.SET_SPLITTERS),
  })
  const drawer = screen.getByTestId('drawer')

  expect(drawer).toBeInTheDocument()
  expect(button).toBeInTheDocument()

  await userEvent.click(button)

  expect(mockOnTriggerClick).toHaveBeenCalled()
})

test('calls create splitter api with correct args if onSubmit prop was called', async () => {
  render(
    <SetSplittersDrawerButton
      group={mockDocTypesGroup}
    />,
  )

  const submitButton = screen.getByTestId('submit-btn')
  await userEvent.click(submitButton)

  expect(mockCreateSplitter).nthCalledWith(1, {
    ...mockFormValues,
    groupId: mockDocTypesGroup.id,
  })
})

test('calls success notification on successful splitter creation', async () => {
  jest.clearAllMocks()

  render(
    <SetSplittersDrawerButton
      group={mockDocTypesGroup}
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
    <SetSplittersDrawerButton
      group={mockDocTypesGroup}
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
    <SetSplittersDrawerButton
      group={mockDocTypesGroup}
    />,
  )

  const submitButton = screen.getByTestId('submit-btn')
  await userEvent.click(submitButton)

  expect(notifyWarning).nthCalledWith(
    1,
    localize(Localization.DEFAULT_ERROR),
  )
})
