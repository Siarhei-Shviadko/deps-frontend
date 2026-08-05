
import isEmpty from 'lodash/isEmpty'
import { useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPagination, setSelection } from '@/actions/navigation'
import { Table } from '@/components/Table'
import {
  DATA_FILTER_KEY_TO_TABLE_SORT_DIRECT_KEY,
  PaginationKeys,
} from '@/constants/navigation'
import { GROUP_DOCUMENT_TYPES_PER_PAGE } from '@/constants/storage'
import { ExtractionType, RESOURCE_EXTRACTION_TYPE } from '@/enums/ExtractionType'
import { withParentSize } from '@/hocs/withParentSize'
import { documentTypesGroupShape } from '@/models/DocumentTypesGroup'
import { BASE_GROUP_DOCUMENT_TYPES_FILTER_CONFIG } from '@/models/GroupDocumentTypesFilterConfig'
import { Pagination } from '@/models/Pagination'
import { DefaultPaginationConfig } from '@/models/PaginationConfig'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { filterSelector, selectionSelector } from '@/selectors/navigation'
import { ENV } from '@/utils/env'
import { navigationMap } from '@/utils/navigationMap'
import { goTo } from '@/utils/routerActions'
import { defaultShowTotal } from '@/utils/tableUtils'
import { openInNewTarget } from '@/utils/window'
import {
  generateGroupDocTypeClassifierColumn,
  generateGroupDocTypeExtractorColumn,
  generateGroupDocTypeNameColumn,
  generateGroupDocTypeSplitterColumn,
  generateDocTypeActionsColumn,
} from './columns'
import {
  GROUP_DOC_TYPE_COLUMN_TO_FILTER_KEY,
  GroupDocTypeColumn,
} from './columns/GroupDocTypeColumn'
import { mapDocTypeToGroupDocType } from './mappers'
import { useFilterGroupDocTypes } from './useFilterGroupDocTypes'

const SizeAwareTable = withParentSize({
  monitorHeight: true,
  noPlaceholder: true,
})((props) => (
  <Table
    {...props}
    height={props.size.height}
  />
))

const AvailableExtractionTypes = [
  ExtractionType.PROTOTYPE,
  ExtractionType.TEMPLATE,
  ExtractionType.CUSTOM_MODEL,
  ExtractionType.AI_PROMPTED,
]

const ExtractionTypeOptions = (
  AvailableExtractionTypes.map((value) => ({
    value,
    text: RESOURCE_EXTRACTION_TYPE[value],
  }))
)

const COLUMN_KEY_TO_COLUMN_GENERATOR = {
  [GroupDocTypeColumn.NAME]: generateGroupDocTypeNameColumn,
  [GroupDocTypeColumn.TYPE_OF_EXTRACTOR]: generateGroupDocTypeExtractorColumn,
  [GroupDocTypeColumn.CLASSIFIER]: generateGroupDocTypeClassifierColumn,
  [GroupDocTypeColumn.SPLITTER]: generateGroupDocTypeSplitterColumn,
  [GroupDocTypeColumn.ACTIONS]: generateDocTypeActionsColumn,
}

const DEFAULT_FILTER_CONFIG = {
  ...BASE_GROUP_DOCUMENT_TYPES_FILTER_CONFIG,
  ...DefaultPaginationConfig,
}

const CHECKBOX_CLASS_NAME = 'ant-checkbox-wrapper'

const GroupDocumentTypesList = ({ group }) => {
  const documentTypes = useSelector(documentTypesSelector)
  const selectedRowKeys = useSelector(selectionSelector)
  const filters = useSelector(filterSelector)

  const dispatch = useDispatch()

  const initialPagination = Pagination.getInitialPagination(GROUP_DOCUMENT_TYPES_PER_PAGE)

  const rowKey = (record) => record.id

  const groupDocTypes = useMemo(() => (
    documentTypes
      ?.filter((type) => group.documentTypeIds?.includes(type.code))
      .map((documentType) => mapDocTypeToGroupDocType({
        documentType,
        classifiers: group.genAiClassifiers,
        splitters: group.splitters,
        groupId: group.id,
      }))
  ), [
    group,
    documentTypes,
  ])

  const filterConfig = useMemo(() => ({
    ...DEFAULT_FILTER_CONFIG,
    ...(isEmpty(filters) ? initialPagination : filters),
  }), [filters, initialPagination])

  const onSelectChange = (newSelectedRowKeys) => {
    dispatch(setSelection(newSelectedRowKeys))
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }

  const changePagination = useCallback((page, size) => {
    Pagination.setSize(GROUP_DOCUMENT_TYPES_PER_PAGE, size)
    dispatch(setPagination({
      [PaginationKeys.PAGE]: page || DefaultPaginationConfig[PaginationKeys.PAGE],
      [PaginationKeys.PER_PAGE]: size || DefaultPaginationConfig[PaginationKeys.PER_PAGE],
    }))
  }, [dispatch])

  const [filteredList, filterHandler] = useFilterGroupDocTypes({
    groupDocTypes,
    filters,
    filterConfig,
    changePagination,
  })

  const paginationConfig = () => {
    const { page, perPage } = filterConfig
    const total = filteredList.length

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

  const getColumns = useCallback(() => {
    const { sortField, sortDirect } = filterConfig

    const columnsData = {
      [GroupDocTypeColumn.TYPE_OF_EXTRACTOR]: ExtractionTypeOptions,
    }

    return Object.values(GroupDocTypeColumn)
      .filter((col) => (
        ((ENV.FEATURE_CLASSIFIER && ENV.FEATURE_LLM_DATA_EXTRACTION) || col !== GroupDocTypeColumn.CLASSIFIER) &&
        (ENV.FEATURE_PDF_SPLITTING || col !== GroupDocTypeColumn.SPLITTER)
      ))
      .map((col) => {
        const columnFilterKey = GROUP_DOC_TYPE_COLUMN_TO_FILTER_KEY[col]
        const columnCreator = COLUMN_KEY_TO_COLUMN_GENERATOR[col]

        return columnCreator({
          filteredValue: filterConfig[columnFilterKey],
          sortOrder: (
            sortField === col
              ? DATA_FILTER_KEY_TO_TABLE_SORT_DIRECT_KEY[sortDirect]
              : ''
          ),
          columnData: columnsData[col],
        })
      })
  }, [filterConfig])

  const onRow = (record) => ({
    onClick: (event) => {
      !event.target.classList.contains(CHECKBOX_CLASS_NAME) &&
      openInNewTarget(
        event,
        navigationMap.documentTypes.documentType(record.id),
        () => goTo(navigationMap.documentTypes.documentType(record.id)),
      )
    },
  })

  return (
    <SizeAwareTable
      columns={getColumns()}
      data={filteredList}
      onFilter={filterHandler}
      onRow={onRow}
      pagination={paginationConfig()}
      rowKey={rowKey}
      rowSelection={rowSelection}
    />
  )
}

GroupDocumentTypesList.propTypes = {
  group: documentTypesGroupShape.isRequired,
}

export {
  GroupDocumentTypesList,
}
