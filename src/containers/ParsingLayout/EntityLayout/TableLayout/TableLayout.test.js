import { mockEnv } from '@/mocks/mockEnv'
import { screen, within } from '@testing-library/react'
import { DOCUMENT_LAYOUT_FEATURE, DOCUMENT_LAYOUT_PARSING_TYPE } from '@/enums/DocumentLayoutType'
import { Localization, localize } from '@/localization/i18n'
import {
  TableCellLayout,
  TableLayout,
} from '@/models/DocumentLayout'
import { Point } from '@/models/Point'
import { render } from '@/utils/rendererRTL'
import { usePaginatedLayout } from '../hooks'
import { TableLayout as TableLayoutComponent } from './TableLayout'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/components/Spin', () => ({
  Spin: () => <div data-testid="spin" />,
}))

jest.mock('../hooks', () => ({
  usePaginatedLayout: jest.fn(),
}))

const mockCell1 = new TableCellLayout({
  content: 'Cell 1 content',
  kind: 'kind',
  columnIndex: 0,
  columnSpan: 1,
  rowIndex: 0,
  rowSpan: 1,
  page: 1,
  polygon: [
    new Point(0.111, 0.222),
    new Point(0.333, 0.444),
  ],
})

const mockCell2 = new TableCellLayout({
  content: 'Cell 2 content',
  kind: 'kind',
  columnIndex: 0,
  columnSpan: 1,
  rowIndex: 0,
  rowSpan: 1,
  page: 2,
  polygon: [
    new Point(0.111, 0.222),
    new Point(0.333, 0.444),
  ],
})

const mockTable1 = new TableLayout({
  id: 'id1',
  order: 1,
  cells: [mockCell1],
  confidence: 0,
  columnCount: 1,
  rowCount: 1,
  polygon: [
    new Point(0.111, 0.222),
    new Point(0.333, 0.444),
  ],
})

const mockTable2 = new TableLayout({
  id: 'id2',
  order: 1,
  cells: [mockCell2],
  confidence: 0,
  columnCount: 1,
  rowCount: 1,
  polygon: [
    new Point(0.111, 0.222),
    new Point(0.333, 0.444),
  ],
})

const mockData = [
  {
    layout: mockTable1,
    page: 1,
    pageId: 'page-1',
  },
  {
    layout: mockTable2,
    page: 2,
    pageId: 'page-2',
  },
]

const mergedTablesMapping = [
  {
    parentId: mockTable1.id,
    tableId: mockTable2.id,
  },
]

const mockTableLayoutFieldComponent = jest.fn(({ alignHeightByContent, parsingType, table }) => (
  <div
    data-align-height={alignHeightByContent}
    data-parsing-type={parsingType}
    data-testid={table.id}
  >
    {
      table.cells.map((cell, index) => (
        <span key={index}>
          {cell.content}
        </span>
      ))
    }
  </div>
))

jest.mock('./TableLayoutField', () => ({
  TableLayoutField: (...args) => mockTableLayoutFieldComponent(...args),
}))

const defaultProps = {
  batchIndex: 0,
  mergedTables: [],
  parsingType: DOCUMENT_LAYOUT_PARSING_TYPE.TESSERACT,
}

beforeEach(() => {
  jest.clearAllMocks()
  usePaginatedLayout.mockReturnValue({
    layoutData: mockData,
    isFetching: false,
  })
})

test('calls usePaginatedLayout with correct parameters', () => {
  render(<TableLayoutComponent {...defaultProps} />)

  expect(usePaginatedLayout).toHaveBeenCalledWith({
    batchIndex: 0,
    parsingFeature: DOCUMENT_LAYOUT_FEATURE.TABLES,
    parsingType: DOCUMENT_LAYOUT_PARSING_TYPE.TESSERACT,
  })
})

test('renders correct layout for separate tables', () => {
  render(<TableLayoutComponent {...defaultProps} />)

  const table1 = screen.getByTestId(mockTable1.id)
  const table2 = screen.getByTestId(mockTable2.id)

  expect(table1).toBeInTheDocument()
  expect(screen.getByText(mockCell1.content)).toBeInTheDocument()
  expect(table2).toBeInTheDocument()
  expect(within(table2).getByText(mockCell2.content)).toBeInTheDocument()
  expect(within(table2).queryByText(mockCell1.content)).not.toBeInTheDocument()
})

test('passes alignHeightByContent true for parent table', () => {
  const props = {
    ...defaultProps,
    mergedTables: mergedTablesMapping,
  }

  render(<TableLayoutComponent {...props} />)

  expect(mockTableLayoutFieldComponent).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      alignHeightByContent: true,
      parsingType: DOCUMENT_LAYOUT_PARSING_TYPE.TESSERACT,
      table: expect.objectContaining({ id: mockTable1.id }),
    }),
    expect.anything(),
  )
  expect(mockTableLayoutFieldComponent).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({
      alignHeightByContent: false,
      parsingType: DOCUMENT_LAYOUT_PARSING_TYPE.TESSERACT,
      table: expect.objectContaining({ id: mockTable2.id }),
    }),
    expect.anything(),
  )
})

test('enriches table cells with page context', () => {
  render(<TableLayoutComponent {...defaultProps} />)

  expect(mockTableLayoutFieldComponent).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      table: expect.objectContaining({
        cells: [
          expect.objectContaining({
            page: 1,
            initialPosition: {
              pageId: 'page-1',
              rowIndex: mockCell1.rowIndex,
              columnIndex: mockCell1.columnIndex,
              tableId: mockTable1.id,
            },
          }),
        ],
      }),
    }),
    expect.anything(),
  )
})

test('renders spinner when layout is fetching', () => {
  usePaginatedLayout.mockReturnValueOnce({
    layoutData: [],
    isFetching: true,
  })

  render(<TableLayoutComponent {...defaultProps} />)

  expect(screen.getByTestId('spin')).toBeInTheDocument()
  expect(screen.queryByTestId(mockTable1.id)).not.toBeInTheDocument()
})

test('renders no data message when layout data is empty', () => {
  usePaginatedLayout.mockReturnValueOnce({
    layoutData: [],
    isFetching: false,
  })

  render(<TableLayoutComponent {...defaultProps} />)

  expect(screen.getByText(localize(Localization.NO_DATA))).toBeInTheDocument()
})
