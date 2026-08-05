
import PropTypes from 'prop-types'
import { useCallback } from 'react'
import { NoData } from '@/components/NoData'
import { DOCUMENT_LAYOUT_FEATURE, DOCUMENT_LAYOUT_PARSING_TYPE } from '@/enums/DocumentLayoutType'
import { Localization, localize } from '@/localization/i18n'
import { usePaginatedLayout } from '../hooks'
import { LocalErrorBoundary } from '../LocalErrorBoundary'
import { Spinner } from './TableLayout.styles'
import { TableLayoutField } from './TableLayoutField'

const enrichTableLayoutWithPageContext = (data) =>
  data.map(({ page, pageId, layout }) => ({
    ...layout,
    cells: layout.cells.map((cell) => ({
      ...cell,
      page,
      initialPosition: {
        pageId,
        rowIndex: cell.rowIndex,
        columnIndex: cell.columnIndex,
        tableId: layout.id,
      },
    })),
  }))

const TableLayout = ({
  batchIndex,
  parsingType,
  mergedTables = [],
}) => {
  const { layoutData, isFetching } = usePaginatedLayout({
    batchIndex,
    parsingFeature: DOCUMENT_LAYOUT_FEATURE.TABLES,
    parsingType,
  })

  const isParentTable = useCallback(
    (tableId) => !!mergedTables.find((item) => item.parentId === tableId),
    [mergedTables],
  )

  if (isFetching) {
    return <Spinner spinning />
  }

  if (!layoutData.length) {
    return <NoData description={localize(Localization.NO_DATA)} />
  }

  return enrichTableLayoutWithPageContext(layoutData).map((table, i) => (
    <LocalErrorBoundary key={i}>
      <TableLayoutField
        alignHeightByContent={isParentTable(table.id)}
        parsingType={parsingType}
        table={table}
      />
    </LocalErrorBoundary>
  ))
}

TableLayout.propTypes = {
  batchIndex: PropTypes.number.isRequired,
  mergedTables: PropTypes.arrayOf(
    PropTypes.shape({
      parentId: PropTypes.string.isRequired,
      tableId: PropTypes.string.isRequired,
    }),
  ),
  parsingType: PropTypes.oneOf(
    Object.values(DOCUMENT_LAYOUT_PARSING_TYPE),
  ).isRequired,
}

export {
  TableLayout,
}
