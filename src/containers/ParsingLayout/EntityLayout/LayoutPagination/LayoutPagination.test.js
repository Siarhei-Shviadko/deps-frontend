import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/utils/rendererRTL'
import { PAGINATION_PAGE_SIZE } from '../constants'
import { LayoutPagination } from './LayoutPagination'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('./LayoutPagination.styles', () => ({
  PaginationContainer: ({ children }) => <div data-testid="PaginationContainer">{children}</div>,
  StyledPagination: ({ current, onChange, pageSize, total }) => (
    <div data-testid="StyledPagination">
      <span data-testid="current">{current}</span>
      <span data-testid="pageSize">{pageSize}</span>
      <span data-testid="total">{total}</span>
      <button
        data-testid="change-page-button"
        onClick={() => onChange(2)}
      >
        Change page
      </button>
    </div>
  ),
}))

const mockOnPageChange = jest.fn()

const defaultProps = {
  currentPage: 1,
  onPageChange: mockOnPageChange,
  total: 5,
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders pagination when total is greater than page size', () => {
  render(<LayoutPagination {...defaultProps} />)

  expect(screen.getByTestId('StyledPagination')).toBeInTheDocument()
  expect(screen.getByTestId('current')).toHaveTextContent(defaultProps.currentPage.toString())
  expect(screen.getByTestId('pageSize')).toHaveTextContent(String(PAGINATION_PAGE_SIZE))
  expect(screen.getByTestId('total')).toHaveTextContent(defaultProps.total.toString())
})

test('does not render pagination when total equals page size', () => {
  const props = {
    ...defaultProps,
    total: PAGINATION_PAGE_SIZE,
  }

  render(<LayoutPagination {...props} />)

  expect(screen.queryByTestId('StyledPagination')).not.toBeInTheDocument()
})

test('does not render pagination when total is missing', () => {
  const props = {
    ...defaultProps,
    total: undefined,
  }

  render(<LayoutPagination {...props} />)

  expect(screen.queryByTestId('StyledPagination')).not.toBeInTheDocument()
})

test('does not render pagination when total is zero', () => {
  const props = {
    ...defaultProps,
    total: 0,
  }

  render(<LayoutPagination {...props} />)

  expect(screen.queryByTestId('StyledPagination')).not.toBeInTheDocument()
})

test('calls onPageChange when page is changed', async () => {
  render(<LayoutPagination {...defaultProps} />)

  await userEvent.click(screen.getByTestId('change-page-button'))

  expect(mockOnPageChange).toHaveBeenNthCalledWith(1, 2)
})
