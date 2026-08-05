
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen } from '@testing-library/dom'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorCode, RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Localization, localize } from '@/localization/i18n'
import { DocumentTypesGroup } from '@/models/DocumentTypesGroup'
import { Splitter } from '@/models/Splitter'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { EditDocumentTypesGroupDrawerButton } from './EditDocumentTypesGroupDrawerButton'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('@/containers/DocumentTypeSplitter', () => ({
  DEFAULT_VALUES: {
    name: '',
    llmType: null,
    splittingContextAttachments: ['fileLayout'],
    query: '',
    description: '',
    splittingMode: 'pageBased',
  },
  DocumentTypeSplitter: {
    Section: ({ children, onVisibilityChange }) => (
      <div data-testid="DocumentTypeSplitterSection">
        <button
          data-testid="hide-splitter"
          onClick={() => onVisibilityChange?.(false)}
          type="button"
        >
          hide
        </button>
        {children}
      </div>
    ),
    Fields: () => <div data-testid="DocumentTypeSplitterFields" />,
  },
}))

const mockManageSplitter = jest.fn(() => Promise.resolve())

jest.mock('./useManageSplitter', () => ({
  useManageSplitter: jest.fn(() => ({
    manageSplitter: mockManageSplitter,
    isLoading: false,
  })),
}))

jest.mock('@/apiRTK/documentTypesGroupsApi', () => ({
  useUpdateDocumentTypesGroupMutation: jest.fn(() => ([
    mockUpdateDocumentTypesGroupFn,
    { isLoading: false },
  ])),
}))

const mockUpdateDocumentTypesGroupFn = jest.fn(() => ({
  unwrap: jest.fn(() => Promise.resolve({})),
}))

const mockGroupId = 'groupId'
const updatedGroupName = 'New Group Name'
const mockSplitterId = 'splitter-id'

const mockGroupSplitter = new Splitter({
  id: mockSplitterId,
  groupId: mockGroupId,
  documentTypeId: '',
  name: 'Splitter Name',
  splittingQuery: 'Test query',
  llmType: 'provider1/model-1-1',
})

const mockDocumentTypesGroup = new DocumentTypesGroup({
  id: mockGroupId,
  name: 'Group Name',
  documentTypeIds: [],
  splitters: [mockGroupSplitter],
})

beforeEach(() => {
  jest.clearAllMocks()
})

const fillAndSaveDrawerFormValues = async () => {
  const editButton = screen.getByRole('button', { name: localize(Localization.EDIT) })
  await userEvent.click(editButton)

  const input = screen.getByPlaceholderText(localize(Localization.GROUP_PLACEHOLDER))
  await userEvent.clear(input)
  await userEvent.type(input, updatedGroupName)

  const saveButton = screen.getByRole('button', { name: localize(Localization.SAVE) })
  await userEvent.click(saveButton)
}

test('shows drawer on trigger click', async () => {
  render(
    <EditDocumentTypesGroupDrawerButton
      group={mockDocumentTypesGroup}
    />,
  )

  const editButton = screen.getByRole('button', { name: localize(Localization.EDIT) })
  await userEvent.click(editButton)

  const drawer = screen.getByTestId('drawer')
  const input = screen.getByPlaceholderText(localize(Localization.GROUP_PLACEHOLDER))

  expect(drawer).toBeInTheDocument()
  expect(drawer).toHaveTextContent(localize(Localization.EDIT_GROUP))
  expect(input).toBeInTheDocument()
})

test('renders disabled save button if form is invalid', async () => {
  render(
    <EditDocumentTypesGroupDrawerButton
      group={mockDocumentTypesGroup}
    />,
  )

  const editButton = screen.getByRole('button', { name: localize(Localization.EDIT) })
  await userEvent.click(editButton)

  const input = screen.getByPlaceholderText(localize(Localization.GROUP_PLACEHOLDER))
  await userEvent.clear(input)

  const saveButton = screen.getByRole('button', { name: localize(Localization.SAVE) })
  expect(saveButton).toBeDisabled()
})

test('calls manageSplitter with splitter before updating group when splitter is visible', async () => {
  render(
    <EditDocumentTypesGroupDrawerButton
      group={mockDocumentTypesGroup}
    />,
  )

  await fillAndSaveDrawerFormValues()

  await waitFor(() => {
    expect(mockManageSplitter).toHaveBeenCalledTimes(1)
  })

  expect(mockUpdateDocumentTypesGroupFn).toHaveBeenNthCalledWith(
    1,
    {
      groupId: mockGroupId,
      groupInfo: { name: updatedGroupName },
    },
  )
})

test('calls manageSplitter with null when splitter is hidden before save', async () => {
  render(
    <EditDocumentTypesGroupDrawerButton
      group={mockDocumentTypesGroup}
    />,
  )

  const editButton = screen.getByRole('button', { name: localize(Localization.EDIT) })
  await userEvent.click(editButton)

  await userEvent.click(screen.getByTestId('hide-splitter'))

  const input = screen.getByPlaceholderText(localize(Localization.GROUP_PLACEHOLDER))
  await userEvent.clear(input)
  await userEvent.type(input, updatedGroupName)

  const saveButton = screen.getByRole('button', { name: localize(Localization.SAVE) })
  await userEvent.click(saveButton)

  await waitFor(() => {
    expect(mockManageSplitter).toHaveBeenNthCalledWith(1, null)
  })
})

test('calls updateDocumentTypesGroup when click on save button', async () => {
  render(
    <EditDocumentTypesGroupDrawerButton
      group={mockDocumentTypesGroup}
    />,
  )

  await fillAndSaveDrawerFormValues()

  await waitFor(() => {
    expect(mockUpdateDocumentTypesGroupFn).nthCalledWith(
      1,
      {
        groupId: mockGroupId,
        groupInfo: { name: updatedGroupName },
      },
    )
  })
})

test('calls success notification on successful document types group update', async () => {
  render(
    <EditDocumentTypesGroupDrawerButton
      group={mockDocumentTypesGroup}
    />,
  )

  await fillAndSaveDrawerFormValues()

  await waitFor(() => {
    expect(notifySuccess).nthCalledWith(
      1,
      localize(Localization.DOC_TYPES_GROUP_SUCCESS_UPDATE),
    )
  })
})

test('calls notifyWarning if updateDocumentTypesGroup fails with known error', async () => {
  const errorCode = ErrorCode.groupWithNameAlreadyExists
  const mockError = {
    data: {
      code: errorCode,
    },
  }

  mockUpdateDocumentTypesGroupFn.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => Promise.reject(mockError)),
  }))

  render(
    <EditDocumentTypesGroupDrawerButton
      group={mockDocumentTypesGroup}
    />,
  )

  await fillAndSaveDrawerFormValues()

  await waitFor(() => {
    expect(notifyWarning).nthCalledWith(
      1,
      RESOURCE_ERROR_TO_DISPLAY[errorCode],
    )
  })
})

test('calls notifyWarning if updateDocumentTypesGroup fails with unknown error', async () => {
  mockUpdateDocumentTypesGroupFn.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => Promise.reject(new Error())),
  }))

  render(
    <EditDocumentTypesGroupDrawerButton
      group={mockDocumentTypesGroup}
    />,
  )

  await fillAndSaveDrawerFormValues()

  await waitFor(() => {
    expect(notifyWarning).nthCalledWith(
      1,
      localize(Localization.DEFAULT_ERROR),
    )
  })
})

test('update document types group if form is submitted with Enter key', async () => {
  render(
    <EditDocumentTypesGroupDrawerButton
      group={mockDocumentTypesGroup}
    />,
  )

  const editButton = screen.getByRole('button', { name: localize(Localization.EDIT) })
  await userEvent.click(editButton)

  const input = screen.getByPlaceholderText(localize(Localization.GROUP_PLACEHOLDER))
  await userEvent.clear(input)
  await userEvent.type(input, updatedGroupName)

  await userEvent.keyboard('{Enter}')

  await waitFor(() => {
    expect(mockUpdateDocumentTypesGroupFn).nthCalledWith(
      1,
      {
        groupId: mockGroupId,
        groupInfo: { name: updatedGroupName },
      },
    )
  })

  await waitFor(() => {
    expect(notifySuccess).nthCalledWith(
      1,
      localize(Localization.DOC_TYPES_GROUP_SUCCESS_UPDATE),
    )
  })
})

test('closes drawer when cancel button is clicked', async () => {
  render(
    <EditDocumentTypesGroupDrawerButton
      group={mockDocumentTypesGroup}
    />,
  )

  const editButton = screen.getByRole('button', { name: localize(Localization.EDIT) })
  await userEvent.click(editButton)

  expect(screen.getByTestId('drawer')).toBeInTheDocument()

  const cancelButton = screen.getByRole('button', { name: localize(Localization.CANCEL) })
  await userEvent.click(cancelButton)

  await waitFor(() => {
    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument()
  })
})

test('closes drawer after successful document types group update', async () => {
  render(
    <EditDocumentTypesGroupDrawerButton
      group={mockDocumentTypesGroup}
    />,
  )

  await fillAndSaveDrawerFormValues()

  await waitFor(() => {
    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument()
  })
})

test('resets form from group values when drawer is reopened after successful update', async () => {
  render(
    <EditDocumentTypesGroupDrawerButton
      group={mockDocumentTypesGroup}
    />,
  )

  await fillAndSaveDrawerFormValues()

  await waitFor(() => {
    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument()
  })

  const editButton = screen.getByRole('button', { name: localize(Localization.EDIT) })
  await userEvent.click(editButton)

  const reopenedInput = screen.getByPlaceholderText(localize(Localization.GROUP_PLACEHOLDER))
  expect(reopenedInput).toHaveValue(mockDocumentTypesGroup.name)
})

test('resets form values when drawer is closed and reopened', async () => {
  render(
    <EditDocumentTypesGroupDrawerButton
      group={mockDocumentTypesGroup}
    />,
  )

  const editButton = screen.getByRole('button', { name: localize(Localization.EDIT) })
  await userEvent.click(editButton)

  const input = screen.getByPlaceholderText(localize(Localization.GROUP_PLACEHOLDER))
  await userEvent.clear(input)
  await userEvent.type(input, updatedGroupName)

  expect(input).toHaveValue(updatedGroupName)

  const cancelButton = screen.getByRole('button', { name: localize(Localization.CANCEL) })
  await userEvent.click(cancelButton)

  await waitFor(() => {
    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument()
  })

  await userEvent.click(editButton)

  const reopenedInput = screen.getByPlaceholderText(localize(Localization.GROUP_PLACEHOLDER))
  expect(reopenedInput).toHaveValue(mockDocumentTypesGroup.name)
})
