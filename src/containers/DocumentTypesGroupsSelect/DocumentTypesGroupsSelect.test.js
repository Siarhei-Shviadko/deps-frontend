
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/dom'
import { waitFor } from '@testing-library/react'
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { DocumentTypesGroupsFilterKey, PaginationKeys } from '@/constants/navigation'
import { DocumentTypesGroupExtras } from '@/enums/DocumentTypesGroupExtras'
import { Localization, localize } from '@/localization/i18n'
import { DocumentTypesGroup } from '@/models/DocumentTypesGroup'
import { render } from '@/utils/rendererRTL'
import {
  defaultFilterConfig,
  GROUPS_INITIAL_PAGE,
  GROUPS_PER_PAGE,
} from './constants'
import { DocumentTypesGroupsSelect } from './DocumentTypesGroupsSelect'
import { useFetchGroupsInfiniteQuery } from './useFetchGroupsInfiniteQuery'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('lodash/debounce', () =>
  jest.fn((fn) => fn),
)

jest.mock('./useFetchGroupsInfiniteQuery', () => ({
  useFetchGroupsInfiniteQuery: jest.fn(),
}))

const mockGroup1 = new DocumentTypesGroup({
  id: 'id1',
  name: 'Group1',
  documentTypeIds: ['code1', 'code2'],
  createdAt: '2012-12-12',
})

const mockGroup2 = new DocumentTypesGroup({
  id: 'id2',
  name: 'Group2',
  documentTypeIds: ['code1', 'code2'],
  createdAt: '2012-11-12',
})

beforeEach(() => {
  jest.clearAllMocks()
})

test('shows the select component with correct placeholder', () => {
  useFetchGroupsInfiniteQuery.mockReturnValue({
    groups: [],
    total: 0,
    isFetching: false,
  })

  render(
    <DocumentTypesGroupsSelect
      onChange={jest.fn()}
    />,
  )

  const select = screen.getByRole('combobox')
  const placeholder = screen.getByText(localize(Localization.SELECT_DOCUMENT_TYPES_GROUP))
  expect(select).toBeInTheDocument()
  expect(placeholder).toBeInTheDocument()
})

test('shows fetched groups names as select options', async () => {
  useFetchGroupsInfiniteQuery.mockReturnValue({
    groups: [mockGroup1, mockGroup2],
    total: 2,
    isFetching: false,
  })

  render(
    <DocumentTypesGroupsSelect
      onChange={jest.fn()}
    />,
  )

  const select = screen.getByRole('combobox')

  await userEvent.click(select)

  expect(screen.getByText(mockGroup1.name)).toBeInTheDocument()
  expect(screen.getByText(mockGroup2.name)).toBeInTheDocument()
})

test('calls onChange prop when user selects the group', async () => {
  useFetchGroupsInfiniteQuery.mockReturnValue({
    groups: [mockGroup1, mockGroup2],
    total: 2,
    isFetching: false,
  })

  const mockOnChange = jest.fn()

  render(
    <DocumentTypesGroupsSelect
      onChange={mockOnChange}
    />,
  )

  const select = screen.getByRole('combobox')

  await userEvent.click(select)

  const option = screen.getByText(mockGroup1.name)

  await userEvent.click(option, {
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  })

  await waitFor(() => {
    expect(mockOnChange).nthCalledWith(1, mockGroup1)
  })
})

test('shows spinner when data is fetching', async () => {
  useFetchGroupsInfiniteQuery.mockReturnValue({
    groups: [],
    total: 0,
    isFetching: true,
  })

  render(
    <DocumentTypesGroupsSelect
      onChange={jest.fn()}
    />,
  )

  const select = screen.getByRole('combobox')

  await userEvent.click(select)

  await waitFor(() => {
    const [, spin] = screen.getAllByTestId('spin')
    expect(spin).toHaveClass('ant-spin-spinning')
  })
})

test('sets correct filter values on search value change', async () => {
  useFetchGroupsInfiniteQuery.mockReturnValue({
    groups: [mockGroup1, mockGroup2],
    total: 2,
    isFetching: false,
  })

  render(
    <DocumentTypesGroupsSelect
      onChange={jest.fn()}
    />,
  )

  const select = screen.getByRole('combobox')

  await userEvent.click(select)
  await userEvent.type(select, 'text')

  expect(useFetchGroupsInfiniteQuery).toHaveBeenLastCalledWith(
    {
      filter: {
        [DocumentTypesGroupsFilterKey.NAME]: 'text',
        [PaginationKeys.PAGE]: GROUPS_INITIAL_PAGE,
        [PaginationKeys.PER_PAGE]: GROUPS_PER_PAGE,
        extras: [DocumentTypesGroupExtras.SPLITTERS],
      },
    },
  )
})

test('sets default filter on dropdown open', async () => {
  useFetchGroupsInfiniteQuery.mockReturnValue({
    groups: [mockGroup1, mockGroup2],
    total: 2,
    isFetching: false,
  })

  render(
    <DocumentTypesGroupsSelect
      onChange={jest.fn()}
    />,
  )

  const select = screen.getByRole('combobox')
  await userEvent.click(select)

  expect(useFetchGroupsInfiniteQuery).toHaveBeenLastCalledWith(
    {
      filter: {
        ...defaultFilterConfig,
        extras: [DocumentTypesGroupExtras.SPLITTERS],
      },
    },
  )
})

test('passes value prop to CustomSelect component', () => {
  useFetchGroupsInfiniteQuery.mockReturnValue({
    groups: [mockGroup1, mockGroup2],
    total: 2,
    isFetching: false,
  })

  render(
    <DocumentTypesGroupsSelect
      onChange={jest.fn()}
      value={mockGroup1}
    />,
  )

  expect(screen.getByText(mockGroup1.name)).toBeInTheDocument()
})
