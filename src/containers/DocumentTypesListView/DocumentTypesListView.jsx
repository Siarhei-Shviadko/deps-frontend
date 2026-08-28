
import isEmpty from 'lodash/isEmpty'
import PropTypes from 'prop-types'
import { useMemo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setFilters, setPagination } from '@/actions/navigation'
import { Table } from '@/components/Table'
import {
  DocumentTypeFilterKey,
  TABLE_SORT_DIRECT_KEY_TO_DATA_FILTER_KEY,
  DATA_FILTER_KEY_TO_TABLE_SORT_DIRECT_KEY,
  PaginationKeys,
  EXTRACTION_TYPE_FILTER_KEY,
} from '@/constants/navigation'
import { DOCUMENT_TYPES_PER_PAGE } from '@/constants/storage'
import { withParentSize } from '@/hocs/withParentSize'
import { documentTypeShape } from '@/models/DocumentType'
import {
  BASE_DOCUMENT_TYPES_FILTER_CONFIG,
  DocumentTypesFilterConfig,
} from '@/models/DocumentTypesFilterConfig'
import { Engine } from '@/models/Engine'
import { Language } from '@/models/Language'
import { Pagination } from '@/models/Pagination'
import { DefaultPaginationConfig } from '@/models/PaginationConfig'
import { processingEnginesSelector } from '@/selectors/engines'
import { languagesSelector } from '@/selectors/languages'
import { filterSelector } from '@/selectors/navigation'
import { navigationMap } from '@/utils/navigationMap'
import { goTo } from '@/utils/routerActions'
import { defaultShowTotal } from '@/utils/tableUtils'
import { openInNewTarget } from '@/utils/window'
import {
  DocumentTypesColumnKey,
  generateDocumentTypeNameColumn,
  generateDocumentTypeCreatedAtColumn,
  generateDocumentTypeEngineColumn,
  generateDocumentTypeLanguageColumn,
  generateDocumentTypeActionsColumn,
} from './columns'

const COLUMN_KEY_TO_COLUMN_GENERATOR = {
  [DocumentTypesColumnKey.NAME]: generateDocumentTypeNameColumn,
  [DocumentTypesColumnKey.ENGINE]: generateDocumentTypeEngineColumn,
  [DocumentTypesColumnKey.LANGUAGE]: generateDocumentTypeLanguageColumn,
  [DocumentTypesColumnKey.CREATED_AT]: generateDocumentTypeCreatedAtColumn,
  [DocumentTypesColumnKey.ACTIONS]: generateDocumentTypeActionsColumn,
}

const DOCUMENT_TYPES_COLUMN_TO_FILTER_KEY = {
  [DocumentTypesColumnKey.NAME]: DocumentTypeFilterKey.NAME,
  [DocumentTypesColumnKey.CREATED_AT]: DocumentTypeFilterKey.DATE_RANGE,
  [DocumentTypesColumnKey.ENGINE]: DocumentTypeFilterKey.ENGINE,
  [DocumentTypesColumnKey.LANGUAGE]: DocumentTypeFilterKey.LANGUAGE,
}

const EXTRACTION_TYPE_TO_CUSTOM_COLUMNS = {
  [EXTRACTION_TYPE_FILTER_KEY.azureCloudExtractor]: [
    DocumentTypesColumnKey.NAME,
    DocumentTypesColumnKey.CREATED_AT,
    DocumentTypesColumnKey.ACTIONS,
  ],
}

const DataTable = withParentSize({
  monitorHeight: true,
  noPlaceholder: true,
})((tableProps) => (
  <Table
    {...tableProps}
    height={tableProps.size.height}
  />
))

const DEFAULT_FILTER_CONFIG = {
  ...BASE_DOCUMENT_TYPES_FILTER_CONFIG,
  ...DefaultPaginationConfig,
}

const initialPagination = Pagination.getInitialPagination(DOCUMENT_TYPES_PER_PAGE)

const DocumentTypesListView = ({
  documentTypes,
  documentTypesExtractor,
}) => {
  const dispatch = useDispatch()

  const filters = useSelector(filterSelector)
  const languages = useSelector(languagesSelector)
  const engines = useSelector(processingEnginesSelector)

  const filterConfig = useMemo(() => ({
    ...DEFAULT_FILTER_CONFIG,
    ...(isEmpty(filters) ? initialPagination : filters),
  }), [filters])

  const getRowKey = ({ code }) => code

  const getColumns = useCallback(() => {
    const columnsList = EXTRACTION_TYPE_TO_CUSTOM_COLUMNS[documentTypesExtractor] || Object.values(DocumentTypesColumnKey)
    const { sortField, sortDirect } = filterConfig
    const columnsData = {
      [DocumentTypesColumnKey.ENGINE]: Engine.toAllEnginesOptions(engines),
      [DocumentTypesColumnKey.LANGUAGE]: languages.map(Language.toOption),
    }

    return columnsList.map((col) => {
      const columnFilterKey = DOCUMENT_TYPES_COLUMN_TO_FILTER_KEY[col]
      const columnCreator = COLUMN_KEY_TO_COLUMN_GENERATOR[col]
      return columnCreator({
        filteredValue: filterConfig[columnFilterKey],
        sortOrder: sortField === col ? DATA_FILTER_KEY_TO_TABLE_SORT_DIRECT_KEY[sortDirect] : '',
        columnData: columnsData[col],
      })
    })
  }, [
    filterConfig,
    engines,
    documentTypesExtractor,
    languages,
  ])

  const changePagination = useCallback((page, size) => {
    Pagination.setSize(DOCUMENT_TYPES_PER_PAGE, size)
    dispatch(setPagination({
      [PaginationKeys.PAGE]: page || DefaultPaginationConfig[PaginationKeys.PAGE],
      [PaginationKeys.PER_PAGE]: size || DefaultPaginationConfig[PaginationKeys.PER_PAGE],
    }))
  }, [dispatch])

  const paginationConfig = useMemo(() => {
    const { page, perPage } = filterConfig
    const total = documentTypes?.length

    return {
      current: page,
      pageSize: perPage,
      total,
      onChange: changePagination,
      onShowSizeChange: changePagination,
      showSizeChanger: !!total,
      showTotal: defaultShowTotal,
    }
  }, [
    filterConfig,
    changePagination,
    documentTypes,
  ])

  const filterHandler = useCallback((pagination, filters, sorter) => {
    const { current, pageSize } = pagination

    changePagination(current, pageSize)
    const sortDirect = TABLE_SORT_DIRECT_KEY_TO_DATA_FILTER_KEY[sorter?.order]
    const newFilterConfig = new DocumentTypesFilterConfig({
      ...filterConfig,
      [DocumentTypeFilterKey.SORT_DIRECT]: sortDirect || '',
      [DocumentTypeFilterKey.SORT_FIELD]: sortDirect ? sorter.columnKey : '',
    })

    Object.entries(filters).forEach(([key, val]) => {
      if (DOCUMENT_TYPES_COLUMN_TO_FILTER_KEY[key]) {
        newFilterConfig[DOCUMENT_TYPES_COLUMN_TO_FILTER_KEY[key]] = val || ''
      }
    })

    dispatch(setFilters(newFilterConfig))
  }, [
    dispatch,
    filterConfig,
    changePagination,
  ])

  const onRowProps = ({ code }) => ({
    onClick: (event) => {
      openInNewTarget(
        event,
        navigationMap.documentTypes.documentType(code),
        () => goTo(navigationMap.documentTypes.documentType(code)),
      )
    },
  })

  return (
    <DataTable
      columns={getColumns()}
      data={documentTypes}
      onFilter={filterHandler}
      onRow={onRowProps}
      pagination={paginationConfig}
      rowKey={getRowKey}
    />
  )
}

DocumentTypesListView.propTypes = {
  documentTypes: PropTypes.arrayOf(documentTypeShape),
  documentTypesExtractor: PropTypes.oneOf(
    Object.values(EXTRACTION_TYPE_FILTER_KEY),
  ).isRequired,
}

export {
  DocumentTypesListView,
}
