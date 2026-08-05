
import PropTypes from 'prop-types'
import isRequiredIf from 'react-proptype-conditional-require'
import { StyledPagination } from './Pagination.styles'

const Pagination = ({
  onChange,
  pageSize,
  pageSizeOptions,
  showSizeChanger,
  total,
  current,
  showLessItems,
  simple,
  className,
  ...rest
}) => (
  <StyledPagination
    className={className}
    current={current}
    onChange={onChange}
    pageSize={pageSize}
    pageSizeOptions={pageSizeOptions}
    showLessItems={showLessItems}
    showSizeChanger={showSizeChanger}
    simple={simple}
    total={total}
    {...rest}
  />
)

Pagination.propTypes = {
  onChange: PropTypes.func.isRequired,
  pageSize: PropTypes.number.isRequired,
  pageSizeOptions: isRequiredIf(
    PropTypes.arrayOf(PropTypes.number),
    (props) => props.showSizeChanger),
  showSizeChanger: PropTypes.bool,
  total: PropTypes.number.isRequired,
  current: PropTypes.number.isRequired,
  showLessItems: PropTypes.bool,
  simple: PropTypes.bool,
  className: PropTypes.string,
}

export { Pagination }
