
import PropTypes from 'prop-types'
import { Component } from 'react'
import { connect } from 'react-redux'
import { fetchDocumentTypes } from '@/actions/documentTypes'
import { fetchProcessingEngines } from '@/actions/engines'
import { fetchLabels } from '@/actions/labels'
import { fetchAvailableLanguages } from '@/actions/languages'
import {
  setFilters,
  setPagination,
  setSelection,
} from '@/actions/navigation'
import { HeadingLevel } from '@/components/Heading'
import { enumToOptions, stringsToOptions } from '@/components/Select'
import { Table } from '@/components/Table'
import {
  DocumentFilterKeys,
  PaginationKeys,
  TABLE_SORT_DIRECT_KEY_TO_DATA_FILTER_KEY,
  DATA_FILTER_KEY_TO_TABLE_SORT_DIRECT_KEY,
} from '@/constants/navigation'
import { DocumentState, RESOURCE_DOCUMENT_STATE } from '@/enums/DocumentState'
import { withParentSize } from '@/hocs/withParentSize'
import { documentShape } from '@/models/Document'
import { documentsFilterConfigShape } from '@/models/DocumentsFilterConfig'
import { DocumentType, documentTypeShape } from '@/models/DocumentType'
import { Engine, engineShape } from '@/models/Engine'
import { labelShape } from '@/models/Label'
import { Language, languageShape } from '@/models/Language'
import { DefaultPaginationConfig, paginationConfigShape } from '@/models/PaginationConfig'
import { documentsSelector } from '@/selectors/documentsListPage'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { processingEnginesSelector } from '@/selectors/engines'
import { labelsSelector } from '@/selectors/labels'
import { languagesSelector } from '@/selectors/languages'
import { selectionSelector } from '@/selectors/navigation'
import {
  areDocumentsDataExtractingSelector,
  areDocumentsDeletingSelector,
  areDocumentsFetchingSelector,
  areDocumentsReviewStartingSelector,
  areDocumentsTypeUpdatingSelector,
  areEnginesFetchingSelector,
  areLabelsFetchingSelector,
  areLanguagesFetchingSelector,
  isLabelAddingSelector,
  isLabelCreatingSelector,
  isLabelDeletingSelector,
} from '@/selectors/requests'
import { ENV } from '@/utils/env'
import { navigationMap } from '@/utils/navigationMap'
import { goTo } from '@/utils/routerActions'
import { openInNewTarget } from '@/utils/window'
import {
  DocumentColumn,
  generateDocumentDateColumn,
  generateDocumentEngineColumn,
  generateDocumentLabelsColumn,
  generateLanguageColumn,
  generateDocumentReviewerColumn,
  generateDocumentStateColumn,
  generateDocumentTitleColumn,
  generateDocumentTypeColumn,
  generateLLMTypeColumn,
  generateGroupColumn,
} from './columns'
import { Header, Title } from './DocumentsTable.styles'
import { DocumentsTableCommands } from './DocumentsTableCommands'

const COLUMN_KEY_TO_COLUMN_GENERATOR = {
  [DocumentColumn.TITLE]: generateDocumentTitleColumn,
  [DocumentColumn.DATE]: generateDocumentDateColumn,
  [DocumentColumn.DOCUMENT_TYPE]: generateDocumentTypeColumn,
  [DocumentColumn.STATE]: generateDocumentStateColumn,
  [DocumentColumn.LABELS]: generateDocumentLabelsColumn,
  [DocumentColumn.ENGINE]: generateDocumentEngineColumn,
  [DocumentColumn.LANGUAGE]: generateLanguageColumn,
  [DocumentColumn.REVIEWER]: generateDocumentReviewerColumn,
  ...(ENV.FEATURE_LLM_DATA_EXTRACTION && { [DocumentColumn.LLM_TYPE]: generateLLMTypeColumn }),
  ...(ENV.FEATURE_DOCUMENT_TYPES_GROUPS && { [DocumentColumn.GROUP]: generateGroupColumn }),
}

const DOCUMENTS_COLUMN_TO_FILTER_KEY = {
  [DocumentColumn.TITLE]: DocumentFilterKeys.TITLE,
  [DocumentColumn.DATE]: DocumentFilterKeys.DATE_RANGE,
  [DocumentColumn.DOCUMENT_TYPE]: DocumentFilterKeys.TYPES,
  [DocumentColumn.STATE]: DocumentFilterKeys.STATES,
  [DocumentColumn.LABELS]: DocumentFilterKeys.LABELS,
  [DocumentColumn.ENGINE]: DocumentFilterKeys.ENGINES,
  [DocumentColumn.LANGUAGE]: DocumentFilterKeys.LANGUAGES,
  [DocumentColumn.REVIEWER]: DocumentFilterKeys.REVIEWER,
  [DocumentColumn.GROUP]: DocumentFilterKeys.GROUPS,
}

const SizeAwareTable = withParentSize({
  monitorHeight: true,
  noPlaceholder: true,
})((props) => (
  <Table
    {...props}
    height={props.size.height}
  />
))

const LABEL_CLASS_NAME = 'ant-checkbox-wrapper'
const STORAGE_ID = 'documentsTable'

class DocumentsTable extends Component {
  static propTypes = {
    documents: PropTypes.arrayOf(documentShape).isRequired,
    fetching: PropTypes.bool.isRequired,
    collapsed: PropTypes.bool,
    selectedDocuments: PropTypes.arrayOf(PropTypes.string).isRequired,
    setFilters: PropTypes.func.isRequired,
    setSelection: PropTypes.func.isRequired,
    tableColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    fetchProcessingEngines: PropTypes.func.isRequired,
    fetchDocumentTypes: PropTypes.func.isRequired,
    fetchAvailableLanguages: PropTypes.func.isRequired,
    fetchLabels: PropTypes.func.isRequired,
    languages: PropTypes.arrayOf(languageShape).isRequired,
    engines: PropTypes.arrayOf(engineShape).isRequired,
    documentTypes: PropTypes.arrayOf(documentTypeShape).isRequired,
    labels: PropTypes.arrayOf(labelShape).isRequired,
    filterConfig: documentsFilterConfigShape,
    defaultFilterConfig: documentsFilterConfigShape,
    refreshData: PropTypes.func.isRequired,
    tableTitle: PropTypes.string,
    pagination: PropTypes.oneOfType([
      PropTypes.bool,
      paginationConfigShape,
    ]),
    setPagination: PropTypes.func,
  }

  componentDidMount () {
    this.props.fetchProcessingEngines()
    this.props.fetchDocumentTypes()
    this.props.fetchLabels()
    this.props.fetchAvailableLanguages()
  }

  componentDidUpdate (prevProps) {
    const {
      documents,
      filterConfig,
      setPagination,
    } = this.props

    if (
      filterConfig.page !== DefaultPaginationConfig.page &&
      prevProps.documents.length &&
      !documents.length
    ) {
      setPagination({
        [PaginationKeys.PAGE]: filterConfig.page - 1,
        [PaginationKeys.PER_PAGE]: filterConfig.perPage,
      })
    }
  }

  getColumns = () => {
    const columnsData = {
      [DocumentColumn.STATE]: enumToOptions(DocumentState, RESOURCE_DOCUMENT_STATE),
      [DocumentColumn.LABELS]: stringsToOptions(this.props.labels.map((l) => l.name)),
      [DocumentColumn.ENGINE]: Engine.toAllEnginesOptions(this.props.engines),
      [DocumentColumn.DOCUMENT_TYPE]: this.props.documentTypes.map(DocumentType.toOption),
      [DocumentColumn.LANGUAGE]: this.props.languages.map(Language.toOption),
    }

    const { sortField, sortDirect } = this.props.filterConfig
    return this.props.tableColumns
      .filter((col) => Object.keys(COLUMN_KEY_TO_COLUMN_GENERATOR).includes(col))
      .map((col) => {
        const columnFilterKey = DOCUMENTS_COLUMN_TO_FILTER_KEY[col]
        const columnCreator = COLUMN_KEY_TO_COLUMN_GENERATOR[col]
        return columnCreator({
          filteredValue: this.props.filterConfig[columnFilterKey] || null,
          sortOrder: sortField === col ? DATA_FILTER_KEY_TO_TABLE_SORT_DIRECT_KEY[sortDirect] : '',
          columnData: columnsData[col],
        })
      })
  }

  resetFilters = () => {
    this.props.setFilters(this.props.defaultFilterConfig)
  }

  onSelectRows = (selectedRowKeys) => {
    this.props.setSelection(selectedRowKeys)
  }

  paginationHandler = ({ current, pageSize }) => {
    const nextPaginationConfig = {
      [PaginationKeys.PAGE]: current || DefaultPaginationConfig[PaginationKeys.PAGE],
      [PaginationKeys.PER_PAGE]: pageSize || DefaultPaginationConfig[PaginationKeys.PER_PAGE],
    }

    this.props.setPagination(nextPaginationConfig)
  }

  filterHandler = (pagination, filters, sorter) => {
    this.paginationHandler(pagination)

    const sortDirect = TABLE_SORT_DIRECT_KEY_TO_DATA_FILTER_KEY[sorter.order]
    const nextFiltersConfig = {
      ...this.props.filterConfig,
      [DocumentFilterKeys.SORT_DIRECT]: sortDirect || '',
      [DocumentFilterKeys.SORT_FIELD]: sortDirect ? sorter.columnKey : '',
    }

    Object.entries(filters).forEach(([key, val]) => {
      if (DOCUMENTS_COLUMN_TO_FILTER_KEY[key]) {
        nextFiltersConfig[DOCUMENTS_COLUMN_TO_FILTER_KEY[key]] = val || ''
      }
    })

    this.props.setFilters(nextFiltersConfig)
  }

  rowKey = (record) => record._id

  onRowProps = (record) => ({
    onClick: (event) => {
      !event.target.classList.contains(LABEL_CLASS_NAME) &&
      openInNewTarget(
        event,
        navigationMap.documents.document(record._id),
        () => goTo(navigationMap.documents.document(record._id)),
      )
    },
  })

  getTableData = () => {
    const { documents, collapsed } = this.props

    return collapsed ? documents.slice(0, 2) : documents
  }

  render = () => {
    const DataTable = this.props.pagination ? SizeAwareTable : Table

    return (
      <>
        <Header>
          {
            this.props.tableTitle && (
              <Title level={HeadingLevel.H2}>
                {this.props.tableTitle}
              </Title>
            )
          }
          <DocumentsTableCommands
            checkedDocuments={this.props.selectedDocuments}
            filterConfig={this.props.filterConfig}
            refreshData={this.props.refreshData}
            resetFilters={this.resetFilters}
            tableColumns={this.props.tableColumns}
          />
        </Header>
        <DataTable
          columns={this.getColumns()}
          data={this.getTableData()}
          fetching={this.props.fetching}
          onFilter={this.filterHandler}
          onRow={this.onRowProps}
          pagination={this.props.pagination}
          rowKey={this.rowKey}
          rowSelection={
            {
              selectedRowKeys: this.props.selectedDocuments,
              onChange: this.onSelectRows,
            }
          }
          storageId={STORAGE_ID}
        />
      </>
    )
  }
}

const mapStateToProps = (state) => ({
  documents: documentsSelector(state),
  engines: processingEnginesSelector(state),
  languages: languagesSelector(state),
  documentTypes: documentTypesSelector(state),
  selectedDocuments: selectionSelector(state),
  labels: labelsSelector(state),
  fetching: (
    areDocumentsFetchingSelector(state) ||
    areEnginesFetchingSelector(state) ||
    areLabelsFetchingSelector(state) ||
    areLanguagesFetchingSelector(state) ||
    areDocumentsTypeUpdatingSelector(state) ||
    areDocumentsDataExtractingSelector(state) ||
    areDocumentsReviewStartingSelector(state) ||
    areDocumentsDeletingSelector(state) ||
    isLabelAddingSelector(state) ||
    isLabelCreatingSelector(state) ||
    isLabelDeletingSelector(state)
  ),
})

const ConnectedComponent = connect(
  mapStateToProps,
  {
    fetchProcessingEngines,
    fetchDocumentTypes,
    fetchLabels,
    fetchAvailableLanguages,
    setFilters,
    setSelection,
    setPagination,
  },
)(DocumentsTable)

export {
  ConnectedComponent as DocumentsTable,
}
