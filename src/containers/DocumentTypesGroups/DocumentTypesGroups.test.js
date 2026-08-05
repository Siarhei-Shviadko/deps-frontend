
import { mockEnv } from '@/mocks/mockEnv'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setFilters, setPagination, setSelection } from '@/actions/navigation'
import {
  DocumentTypesGroupsFilterKey,
  PaginationKeys,
  SortDirection,
} from '@/constants/navigation'
import { DOCUMENT_TYPES_GROUPS_PER_PAGE } from '@/constants/storage'
import { Localization, localize } from '@/localization/i18n'
import { DocumentTypesGroup } from '@/models/DocumentTypesGroup'
import { Pagination } from '@/models/Pagination'
import { DefaultPaginationConfig } from '@/models/PaginationConfig'
import { toLocalizedDateString } from '@/utils/dayjs'
import { navigationMap } from '@/utils/navigationMap'
import { render } from '@/utils/rendererRTL'
import { openInNewTarget } from '@/utils/window'
import { DocumentTypesGroupsColumn } from './columns'
import { DocumentTypesGroups } from './DocumentTypesGroups'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('lodash/debounce', () =>
  jest.fn((fn) => fn),
)

jest.mock('@/actions/navigation', () => ({
  setPagination: jest.fn(),
  setSelection: jest.fn(),
  setFilters: jest.fn(),
}))

jest.mock('@/utils/window', () => ({
  ...jest.requireActual('@/utils/window'),
  openInNewTarget: jest.fn((_event, _url, cb) => {
    mockOpenInNewTargetCallback = cb
    cb()
  }),
}))

let mockOpenInNewTargetCallback

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

const filterConfig = {
  ...DefaultPaginationConfig,
  ...Pagination.getInitialPagination(DOCUMENT_TYPES_GROUPS_PER_PAGE),
}

const searchIconTestId = 'search-icon'
jest.mock('@/components/Icons/SearchIcon', () => ({
  SearchIcon: () => <div data-testid={searchIconTestId} />,
}))

test('render table with document types groups correctly', () => {
  const props = {
    filterConfig,
    isFetching: false,
    data: mockDocTypesGroupsData,
  }

  render(<DocumentTypesGroups {...props} />)

  const columns = screen.getAllByRole('columnheader')

  const [
    ,
    groupNameColumn,
    groupDocTypesColumn,
    groupCreationDateColumn,
    groupSplitterColumn,
  ] = columns

  expect(columns).toHaveLength(6)

  expect(groupNameColumn).toHaveTextContent(localize(Localization.NAME))
  expect(groupDocTypesColumn).toHaveTextContent(localize(Localization.DOCUMENT_TYPES))
  expect(groupCreationDateColumn).toHaveTextContent(localize(Localization.CREATION_DATE))
  expect(groupSplitterColumn).toHaveTextContent(localize(Localization.SPLITTER))

  mockDocTypesGroupsData.result.forEach((g) => {
    expect(screen.getByText(g.name)).toBeInTheDocument()
    expect(screen.getByText(
      toLocalizedDateString(g.createdAt),
      { exact: false },
    )).toBeInTheDocument()
  })
})

test('render NoData component if table data is not provided', () => {
  const props = {
    filterConfig,
    isFetching: false,
    data: {
      meta: {},
      data: [],
    },
  }

  render(<DocumentTypesGroups {...props} />)

  const noDataComponent = screen.getByText(/no data/i)

  expect(noDataComponent).toBeInTheDocument()
})

test('calls dispatch with correct arguments when change page', async () => {
  const props = {
    filterConfig,
    isFetching: false,
    data: mockDocTypesGroupsData,
  }

  render(<DocumentTypesGroups {...props} />)

  const lastPage = (
    mockDocTypesGroupsData.meta.total / DefaultPaginationConfig[PaginationKeys.PER_PAGE]
  )

  const pageBtn = screen.getByText(lastPage)

  await userEvent.click(pageBtn)

  expect(mockDispatch).nthCalledWith(
    1,
    setPagination({
      [PaginationKeys.PAGE]: lastPage,
      [PaginationKeys.PER_PAGE]: DefaultPaginationConfig[PaginationKeys.PER_PAGE],
    }),
  )
})

test('calls dispatch with correct arguments when select rows', async () => {
  const props = {
    filterConfig,
    isFetching: false,
    data: mockDocTypesGroupsData,
  }

  render(<DocumentTypesGroups {...props} />)

  const [checkbox] = screen.getAllByRole('checkbox')

  await userEvent.click(checkbox)

  expect(mockDispatch).nthCalledWith(
    1,
    setSelection(),
  )
})

test('calls openInNewTarget with correct args in case of on row click', async () => {
  const [firstGroup] = mockDocTypesGroupsData.result

  const props = {
    filterConfig,
    isFetching: false,
    data: mockDocTypesGroupsData,
  }

  render(<DocumentTypesGroups {...props} />)

  const [, secondRow] = screen.getAllByRole('row')

  fireEvent.click(secondRow)

  expect(openInNewTarget).nthCalledWith(
    1,
    expect.objectContaining({ target: secondRow }),
    navigationMap.documentTypesGroups.documentTypesGroup(firstGroup.id),
    mockOpenInNewTargetCallback,
  )
})

test('calls setFilters with correct arguments on table sort', async () => {
  const props = {
    filterConfig,
    isFetching: false,
    data: mockDocTypesGroupsData,
  }

  render(<DocumentTypesGroups {...props} />)

  const sortUpButtons = screen.getAllByLabelText('caret-up')
  const sortFields = [DocumentTypesGroupsColumn.NAME, DocumentTypesGroupsColumn.CREATION_DATE]

  sortUpButtons.forEach((sortButton, i) => {
    jest.clearAllMocks()

    fireEvent.click(sortButton)

    expect(setFilters).nthCalledWith(1,
      expect.objectContaining({
        [DocumentTypesGroupsFilterKey.SORT_ORDER]: SortDirection.ASC,
        [DocumentTypesGroupsFilterKey.SORT_BY]: sortFields[i],
        [PaginationKeys.PAGE]: DefaultPaginationConfig[PaginationKeys.PAGE],
        [PaginationKeys.PER_PAGE]: DefaultPaginationConfig[PaginationKeys.PER_PAGE],
      }),
    )
  })
})

test('calls setFilters with correct arguments on table filter', async () => {
  jest.clearAllMocks()

  const props = {
    filterConfig,
    isFetching: false,
    data: mockDocTypesGroupsData,
  }

  render(<DocumentTypesGroups {...props} />)

  const searchIcon = screen.getByTestId('search-icon')

  fireEvent.click(searchIcon)

  const input = screen.getByPlaceholderText(localize(Localization.SEARCH))
  const searchVal = '123'

  fireEvent.change(input, { target: { value: searchVal } })

  expect(setFilters).nthCalledWith(1,
    expect.objectContaining({
      [DocumentTypesGroupsFilterKey.NAME]: searchVal,
      [DocumentTypesGroupsFilterKey.DOCUMENT_TYPE_ID]: [],
      [PaginationKeys.PAGE]: DefaultPaginationConfig[PaginationKeys.PAGE],
      [PaginationKeys.PER_PAGE]: DefaultPaginationConfig[PaginationKeys.PER_PAGE],
    }),
  )
})
