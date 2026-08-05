
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen } from '@testing-library/dom'
import { waitFor } from '@testing-library/react'
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { Localization, localize } from '@/localization/i18n'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { AddDocumentTypesGroupDrawerButton } from './AddDocumentTypesGroupDrawerButton'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('@/selectors/documentTypesListPage')
jest.mock('@/selectors/requests')

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => jest.fn()),
}))

jest.mock('@/actions/documentTypes', () => ({
  fetchDocumentTypes: jest.fn(),
}))

const mockCreateDocumentTypesGroupFn = jest.fn(() => ({
  unwrap: jest.fn(() => Promise.resolve({})),
}))

const mockCreateSplitterFn = jest.fn(() => ({
  unwrap: jest.fn(() => Promise.resolve({})),
}))

jest.mock('@/apiRTK/documentTypesGroupsApi', () => ({
  useCreateDocumentTypesGroupMutation: jest.fn(() => ([
    mockCreateDocumentTypesGroupFn,
    { isLoading: false },
  ])),
}))

jest.mock('@/apiRTK/splittingApi', () => ({
  useCreateSplitterMutation: jest.fn(() => ([
    mockCreateSplitterFn,
    { isLoading: false },
  ])),
}))

const mockInput = 'Test'

const fillAndSaveDrawerFormValues = async () => {
  const addGroupButton = screen.getByRole('button', { name: localize(Localization.ADD_GROUP) })

  await userEvent.click(addGroupButton)

  const nameInput = screen.getByPlaceholderText(localize(Localization.GROUP_PLACEHOLDER))
  await userEvent.type(nameInput, mockInput)

  const [docTypesSelect] = screen.getAllByRole('combobox')
  expect(docTypesSelect).toBeInTheDocument()

  await userEvent.click(docTypesSelect)

  const [mocDocType] = documentTypesSelector.getSelectorMockValue()
  const docType = screen.getByText(mocDocType.name)

  await userEvent.click(docType, {
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  })

  const saveButton = screen.getByRole('button', { name: localize(Localization.SAVE) })
  await userEvent.click(saveButton)
}

test('shows drawer on trigger click', async () => {
  render(<AddDocumentTypesGroupDrawerButton />)

  const addGroupButton = screen.getByRole('button', { name: localize(Localization.ADD_GROUP) })

  await userEvent.click(addGroupButton)

  const nameInput = screen.getByPlaceholderText(localize(Localization.GROUP_PLACEHOLDER))
  const Selects = screen.getAllByRole('combobox')

  expect(nameInput).toBeInTheDocument()
  expect(Selects).toHaveLength(1)
})

test('save button should be disabled if form is invalid', async () => {
  render(<AddDocumentTypesGroupDrawerButton />)

  const addGroupButton = screen.getByRole('button', { name: localize(Localization.ADD_GROUP) })

  await userEvent.click(addGroupButton)

  const saveButton = screen.getByRole('button', { name: localize(Localization.SAVE) })
  expect(saveButton).toBeDisabled()
})

test('calls createDocumentTypesGroup when click on save button', async () => {
  render(<AddDocumentTypesGroupDrawerButton />)

  await fillAndSaveDrawerFormValues()

  await waitFor(() => {
    expect(mockCreateDocumentTypesGroupFn).nthCalledWith(1, {
      documentTypeIds: [
        documentTypesSelector.getSelectorMockValue()[0].code,
      ],
      name: mockInput,
    })
  })
})

test('calls success notification on successful document types group creation', async () => {
  render(<AddDocumentTypesGroupDrawerButton />)

  await fillAndSaveDrawerFormValues()

  await waitFor(() => {
    expect(notifySuccess).nthCalledWith(1, localize(Localization.DOC_TYPES_GROUP_SUCCESS_CREATION))
  })
})

test('calls notifyWarning if createDocumentTypesGroup fails', async () => {
  mockCreateDocumentTypesGroupFn.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => Promise.reject(new Error())),
  }))

  render(<AddDocumentTypesGroupDrawerButton />)

  await fillAndSaveDrawerFormValues()

  await waitFor(() => {
    expect(notifyWarning).nthCalledWith(1, localize(Localization.DEFAULT_ERROR))
  })
})
