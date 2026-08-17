import PropTypes from 'prop-types'
import { KnownTabularLayoutParsingType } from '@/enums/KnownTabularLayoutParsingType'

class TableInfo {
  constructor ({
    id,
    rowCount,
    columnCount,
  }) {
    this.id = id
    this.rowCount = rowCount
    this.columnCount = columnCount
  }
}

class SheetInfo {
  constructor ({
    id,
    title,
    isHidden,
    tables,
    images,
  }) {
    this.id = id
    this.title = title
    this.isHidden = isHidden
    this.tables = tables
    this.images = images
  }
}

class TabularLayoutInfo {
  constructor ({
    id,
    parsingType,
    sheets,
  }) {
    this.id = id
    this.parsingType = parsingType
    this.sheets = sheets
  }
}

const tableInfoShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
  columnCount: PropTypes.number.isRequired,
})

const sheetInfoShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  isHidden: PropTypes.bool.isRequired,
  tables: PropTypes.arrayOf(tableInfoShape).isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
})

const tabularLayoutInfoShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  parsingType: PropTypes.oneOf(
    Object.values(KnownTabularLayoutParsingType),
  ).isRequired,
  sheets: PropTypes.arrayOf(
    sheetInfoShape,
  ).isRequired,
})

export {
  TabularLayoutInfo,
  SheetInfo,
  TableInfo,
  tabularLayoutInfoShape,
  tableInfoShape,
  sheetInfoShape,
}
