
import PropTypes from 'prop-types'
import { PAGINATION_PAGE_SIZE } from '../constants'
import { PaginationContainer, StyledPagination } from './LayoutPagination.styles'

export const LayoutPagination = ({ currentPage, total, onPageChange }) => {
  if (!total || total === PAGINATION_PAGE_SIZE) {
    return null
  }

  return (
    <PaginationContainer>
      <StyledPagination
        current={currentPage}
        onChange={onPageChange}
        pageSize={PAGINATION_PAGE_SIZE}
        showQuickJumper
        showSizeChanger={false}
        total={total}
      />
    </PaginationContainer>
  )
}

LayoutPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  total: PropTypes.number,
}
