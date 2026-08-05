
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { fetchDocumentTypes } from '@/actions/documentTypes'
import { setSelection } from '@/actions/navigation'
import { useFetchDocumentTypesGroupsQuery } from '@/apiRTK/documentTypesGroupsApi'
import { Modal } from '@/components/Modal'
import { Localization, localize } from '@/localization/i18n'
import { DocumentTypesGroup } from '@/models/DocumentTypesGroup'
import { selectionSelector } from '@/selectors/navigation'
import { notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { DocumentTypesGroupsPage } from '.'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('@/apiRTK/documentTypesGroupsApi', () => ({
  useFetchDocumentTypesGroupsQuery: jest.fn(() => mockDocTypesGroupsResponse),
  useDeleteDocumentTypesGroupMutation: jest.fn(() => []),
}))

jest.mock('@/selectors/navigation', () => ({
  ...jest.requireActual('@/selectors/navigation'),
  selectionSelector: jest.fn(() => []),
}))

jest.mock('@/actions/navigation', () => ({
  setSelection: jest.fn(),
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/actions/documentTypes', () => ({
  fetchDocumentTypes: jest.fn(),
}))

jest.mock('@/containers/AddDocumentTypesGroupDrawerButton', () => ({
  AddDocumentTypesGroupDrawerButton: () => <div data-testid={addGroupButtonTestId} />,
}))

Modal.confirm = jest.fn()

const mockDispatch = jest.fn()

const mockDocTypesGroupsData = {
  meta: {
    size: 10,
    total: 100,
  },
  result: [
    new DocumentTypesGroup({
      id: 'id1',
      name: 'Group1',
      documentTypeIds: ['1', '2'],
      createdAt: '2012-12-12',
    }),
    new DocumentTypesGroup({
      id: 'id2',
      name: 'Group2',
      documentTypeIds: ['1', '2'],
      createdAt: '2012-11-11',
    }),
  ],
}

const mockDocTypesGroupsResponse = {
  data: mockDocTypesGroupsData,
  isFetching: false,
  isError: false,
}

const addGroupButtonTestId = 'add-doc-types-group'

test('render DocumentTypesGroupsPage correctly', () => {
  render(<DocumentTypesGroupsPage />)

  const documentTypesGroupPageTitle = screen.getByText(localize(Localization.DOCUMENT_TYPES_GROUPS))
  const addGroupButton = screen.getByTestId(addGroupButtonTestId)

  expect(addGroupButton).toBeInTheDocument()
  expect(documentTypesGroupPageTitle).toBeInTheDocument()

  const columns = screen.getAllByRole('columnheader')

  const [
    ,
    fieldNameColumn,
    fieldDocTypesColumn,
    fieldCreationDateColumn,
    fieldSplitterColumn,
  ] = columns

  expect(columns).toHaveLength(6)

  expect(fieldNameColumn).toHaveTextContent(localize(Localization.NAME))
  expect(fieldDocTypesColumn).toHaveTextContent(localize(Localization.DOCUMENT_TYPES))
  expect(fieldCreationDateColumn).toHaveTextContent(localize(Localization.CREATION_DATE))
  expect(fieldSplitterColumn).toHaveTextContent(localize(Localization.SPLITTER))
})

test('shows notification warning message document types groups fetch fails', async () => {
  useFetchDocumentTypesGroupsQuery.mockReturnValueOnce(
    {
      ...mockDocTypesGroupsResponse,
      isError: true,
    },
  )

  render(<DocumentTypesGroupsPage />)

  expect(notifyWarning).nthCalledWith(1, localize(Localization.DEFAULT_ERROR))
})

test('renders delete button if there are selected groups', async () => {
  selectionSelector.mockReturnValue(['id'])

  render(<DocumentTypesGroupsPage />)

  const deleteButton = screen.getByText(localize(Localization.DELETE))

  expect(deleteButton).toBeInTheDocument()

  selectionSelector.mockReturnValue([])
})

test('calls Modal.confirm with correct arguments in case of delete button click', async () => {
  selectionSelector.mockReturnValue(['id'])

  render(<DocumentTypesGroupsPage />)

  const deleteButton = screen.getByText(localize(Localization.DELETE))

  await userEvent.click(deleteButton)

  expect(Modal.confirm).nthCalledWith(1, {
    title: localize(Localization.DELETE_DOC_TYPES_GROUPS),
    onOk: expect.any(Function),
  })

  selectionSelector.mockReturnValue([])
})

test('calls dispatch with setSelection action in case of delete button click', async () => {
  selectionSelector.mockReturnValue(['id'])
  Modal.confirm.mockImplementationOnce((config) => config.onOk())

  render(<DocumentTypesGroupsPage />)

  const deleteButton = screen.getByText(localize(Localization.DELETE))

  await userEvent.click(deleteButton)

  expect(mockDispatch).nthCalledWith(1, setSelection(null))

  selectionSelector.mockReturnValue([])
})

test('calls dispatch with fetchDocumentTypes action when mount component', async () => {
  jest.clearAllMocks()

  render(<DocumentTypesGroupsPage />)

  await waitFor(() => {
    expect(mockDispatch).nthCalledWith(1, fetchDocumentTypes())
  })
})
