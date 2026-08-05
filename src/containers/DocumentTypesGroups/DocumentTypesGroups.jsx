
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import {
  setFilters,
  setPagination,
  setSelection,
} from '@/actions/navigation'
import { Table } from '@/components/Table'
import {
  DocumentTypesGroupsFilterKey,
  PaginationKeys,
  TABLE_SORT_DIRECT_KEY_TO_DATA_FILTER_KEY,
} from '@/constants/navigation'
import { DOCUMENT_TYPES_GROUPS_PER_PAGE } from '@/constants/storage'
import { withParentSize } from '@/hocs/withParentSize'
import { documentTypesGroupShape } from '@/models/DocumentTypesGroup'
import { Pagination } from '@/models/Pagination'
import { DefaultPaginationConfig } from '@/models/PaginationConfig'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { selectionSelector } from '@/selectors/navigation'
import { navigationMap } from '@/utils/navigationMap'
import { goTo } from '@/utils/routerActions'
import { defaultShowTotal } from '@/utils/tableUtils'
import { openInNewTarget } from '@/utils/window'
import {
  generateGroupActionsColumn,
  generateGroupCreationDateColumn,
  generateGroupDocumentTypesColumn,
  generateGroupNameColumn,
  generateGroupSplitterColumn,
  DocumentTypesGroupsColumn,
} from './columns'

const SizeAwareTable = withParentSize({
  monitorHeight: true,
  noPlaceholder: true,
})((props) => (
  <Table
    {...props}
    height={props.size.height}
  />
))

const CHECKBOX_CLASS_NAME = 'ant-checkbox-wrapper'

const getTableColumns = (filterConfig, documentTypes) => [
  generateGroupNameColumn(filterConfig),
  generateGroupDocumentTypesColumn(filterConfig, documentTypes),
  generateGroupCreationDateColumn(filterConfig),
  generateGroupSplitterColumn(),
  generateGroupActionsColumn(),
]

const DocumentTypesGroups = ({
  filterConfig,
  isFetching,
  data,
}) => {
  const selectedRowKeys = useSelector(selectionSelector)
  const documentTypes = useSelector(documentTypesSelector)

  const dispatch = useDispatch()

  const rowKey = (record) => record.id

  const onSelectChange = (newSelectedRowKeys) => {
    dispatch(setSelection(newSelectedRowKeys))
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }

  const changePagination = (page, size) => {
    Pagination.setSize(DOCUMENT_TYPES_GROUPS_PER_PAGE, size)
    dispatch(setPagination({
      [PaginationKeys.PAGE]: page || DefaultPaginationConfig[PaginationKeys.PAGE],
      [PaginationKeys.PER_PAGE]: size || DefaultPaginationConfig[PaginationKeys.PER_PAGE],
    }))
  }

  const filterHandler = (pagination, filters, sorter) => {
    changePagination(pagination.current, pagination.pageSize)

    const [dateStart, dateEnd] = filters[DocumentTypesGroupsColumn.CREATION_DATE] || []
    const sortOrder = TABLE_SORT_DIRECT_KEY_TO_DATA_FILTER_KEY[sorter.order]

    const nextFiltersConfig = {
      ...filterConfig,
      [DocumentTypesGroupsFilterKey.NAME]: filters[DocumentTypesGroupsFilterKey.NAME],
      [DocumentTypesGroupsFilterKey.DOCUMENT_TYPE_ID]: filters[DocumentTypesGroupsFilterKey.DOCUMENT_TYPE_ID],
      [DocumentTypesGroupsFilterKey.DATE_START]: dateStart,
      [DocumentTypesGroupsFilterKey.DATE_END]: dateEnd,
      [DocumentTypesGroupsFilterKey.SORT_ORDER]: sortOrder || '',
      [DocumentTypesGroupsFilterKey.SORT_BY]: sortOrder ? sorter.columnKey : '',
    }

    dispatch(setFilters(nextFiltersConfig))
  }

  const paginationConfig = () => {
    const { page, perPage } = filterConfig
    const total = data.meta?.total

    return {
      current: page,
      pageSize: perPage,
      total,
      onChange: changePagination,
      onShowSizeChange: changePagination,
      showSizeChanger: !!total,
      showTotal: defaultShowTotal,
    }
  }

  const onRowProps = ({ id }) => ({
    onClick: (event) => {
      const url = navigationMap.documentTypesGroups.documentTypesGroup(id)

      !event.target.classList.contains(CHECKBOX_CLASS_NAME) &&
        openInNewTarget(
          event,
          url,
          () => goTo(url),
        )
    },
  })

  return (
    <SizeAwareTable
      columns={
        getTableColumns(filterConfig, documentTypes)
      }
      data={data.result}
      fetching={isFetching}
      onFilter={filterHandler}
      onRow={onRowProps}
      pagination={paginationConfig()}
      rowKey={rowKey}
      rowSelection={rowSelection}
    />
  )
}

DocumentTypesGroups.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  filterConfig: PropTypes.shape({
    page: PropTypes.number,
    perPage: PropTypes.number,
  }),
  data: PropTypes.shape({
    meta: PropTypes.shape({
      total: PropTypes.number,
    }),
    result: PropTypes.arrayOf(
      documentTypesGroupShape,
    ),
  }),
}

export {
  DocumentTypesGroups,
}
