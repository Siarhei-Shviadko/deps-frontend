import { mockEnv } from '@/mocks/mockEnv'
import { screen, waitFor } from '@testing-library/react'
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { DocumentTypeFieldExtras } from '@/enums/DocumentTypeFieldExtras'
import { Localization, localize } from '@/localization/i18n'
import { render } from '@/utils/rendererRTL'
import { TOP_LIMIT } from './constants'
import { FieldEditsTable } from './FieldEditsTable'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/hocs/withParentSize', () => ({
  withParentSize: () => (Component) => (props) => (
    <Component
      {...props}
      size={
        {
          height: 500,
          width: 800,
        }
      }
    />
  ),
}))

const mockUseGetMostActiveFieldsQuery = jest.fn()

jest.mock('@/apiRTK/documentFieldAnalyticsApi', () => ({
  useGetMostActiveFieldsQuery: (...args) => mockUseGetMostActiveFieldsQuery(...args),
}))

const mockFieldEditsData = [
  {
    fieldCode: 'field-001',
    fieldName: 'Invoice Number',
    modificationCount: 142,
    documentTypeName: 'Invoice Type',
    documentsWithModifications: 89,
  },
  {
    fieldCode: 'field-002',
    fieldName: 'Total Amount',
    modificationCount: 128,
    documentTypeName: 'Receipt Type',
    documentsWithModifications: 76,
  },
]

const mockQueryParams = (limit) => ({
  limit,
  extras: DocumentTypeFieldExtras.NAMES,
})

beforeEach(() => {
  jest.clearAllMocks()
  mockUseGetMostActiveFieldsQuery.mockReturnValue({
    data: { items: mockFieldEditsData },
    isFetching: false,
  })
})

test('renders field edits title and table data when field edits are loaded', () => {
  render(<FieldEditsTable />)

  expect(screen.getByText(
    localize(Localization.FIELD_EDITS_TITLE, { top: TOP_LIMIT.TEN }),
  )).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.FIELD_NAME))).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.DOCUMENT_TYPE))).toBeInTheDocument()
  expect(screen.getByText('Invoice Number')).toBeInTheDocument()
  expect(screen.getByText('Invoice Type')).toBeInTheDocument()
})

test('requests field edits with default top limit on mount', () => {
  render(<FieldEditsTable />)

  expect(mockUseGetMostActiveFieldsQuery).toHaveBeenNthCalledWith(1, mockQueryParams(TOP_LIMIT.TEN))
})

test('requests field edits with updated limit when user changes top select', async () => {
  jest.clearAllMocks()
  mockUseGetMostActiveFieldsQuery.mockReturnValue({
    data: { items: mockFieldEditsData },
    isFetching: false,
  })

  render(<FieldEditsTable />)

  const topLimitSelect = screen.getByRole('combobox')

  await userEvent.click(topLimitSelect)

  const option = await screen.findByText(String(TOP_LIMIT.FIFTY))

  await userEvent.click(option, {
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  })

  await waitFor(() => {
    expect(mockUseGetMostActiveFieldsQuery).toHaveBeenLastCalledWith(mockQueryParams(TOP_LIMIT.FIFTY))
  })
})
