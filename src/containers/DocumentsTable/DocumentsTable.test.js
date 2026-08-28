
import { mockComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import { Table } from '@/components/Table'
import { TableSortDirection, TableSorter } from '@/components/Table/TableSorter'
import { SYSTEM_EMAIL } from '@/constants/common'
import {
  DocumentFilterKeys,
  PaginationKeys,
  SortDirection,
} from '@/constants/navigation'
import { DocumentState } from '@/enums/DocumentState'
import { Document } from '@/models/Document'
import { DocumentsFilterConfig } from '@/models/DocumentsFilterConfig'
import { DocumentType } from '@/models/DocumentType'
import { Engine } from '@/models/Engine'
import { Label } from '@/models/Label'
import { Language } from '@/models/Language'
import { PaginationConfig } from '@/models/PaginationConfig'
import { documentSelector } from '@/selectors/documentReviewPage'
import { documentsSelector } from '@/selectors/documentsListPage'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { processingEnginesSelector } from '@/selectors/engines'
import { labelsSelector } from '@/selectors/labels'
import { languagesSelector } from '@/selectors/languages'
import { selectionSelector } from '@/selectors/navigation'
import {
  areDocumentsFetchingSelector,
  areEnginesFetchingSelector,
  areLabelsFetchingSelector,
  areLanguagesFetchingSelector,
  areDocumentsTypeUpdatingSelector,
  areDocumentsDataExtractingSelector,
  areDocumentsReviewStartingSelector,
  areDocumentsDeletingSelector,
  isLabelAddingSelector,
  isLabelCreatingSelector,
  isLabelDeletingSelector,
} from '@/selectors/requests'
import { navigationMap } from '@/utils/navigationMap'
import { goTo } from '@/utils/routerActions'
import { DocumentColumn } from './columns/DocumentColumn'
import { DocumentsTable } from '.'

jest.mock('@/actions/engines', () => ({
  fetchProcessingEngines: jest.fn(),
}))
jest.mock('@/actions/documentTypes', () => ({
  fetchDocumentTypes: jest.fn(),
}))
jest.mock('@/actions/labels', () => ({
  fetchLabels: jest.fn(),
}))

jest.mock('@/actions/languages', () => ({
  fetchAvailableLanguages: jest.fn(),
}))

jest.mock('@/utils/routerActions', () => ({
  goTo: jest.fn(),
}))

jest.mock('@/containers/DocumentsTable/DocumentsTableCommands', () => mockComponent('DocumentsTableCommands'))

jest.mock('react-redux', () => mockReactRedux)
jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/selectors/languages')
jest.mock('@/selectors/documentTypesListPage')
jest.mock('@/selectors/documentsListPage')
jest.mock('@/selectors/documentReviewPage')
jest.mock('@/selectors/requests')
jest.mock('@/selectors/engines')
jest.mock('@/selectors/navigation')
jest.mock('@/selectors/labels')

window.open = jest.fn()

const mockRecord = {
  _id: '1',
}
const mockUrl = navigationMap.documents.document(mockRecord._id)

const mockDate = '2010-03-01T23:59:59.999'

const { mapStateToProps, ConnectedComponent } = DocumentsTable

const mockFilters = new DocumentsFilterConfig({
  [DocumentFilterKeys.SORT_FIELD]: 'title',
  [DocumentFilterKeys.SORT_DIRECT]: 'desc',
  [DocumentFilterKeys.STATES]: [DocumentState.IN_REVIEW],
  [DocumentFilterKeys.TYPES]: ['bp'],
  [DocumentFilterKeys.TITLE]: 'Passport',
  [DocumentFilterKeys.REVIEWER]: SYSTEM_EMAIL,
})

const mockPagination = new PaginationConfig()

const mockDocument = new Document({
  id: '840283042034234',
})

describe('Container: DocumentsTable', () => {
  describe('mapStateToProps', () => {
    it('should set fetching to false if fetching selectors are set to false', () => {
      areDocumentsFetchingSelector.mockImplementation(() => false)
      areEnginesFetchingSelector.mockImplementation(() => false)
      areLabelsFetchingSelector.mockImplementation(() => false)
      areLanguagesFetchingSelector.mockImplementation(() => false)
      areDocumentsTypeUpdatingSelector.mockImplementation(() => false)
      areDocumentsDataExtractingSelector.mockImplementation(() => false)
      areDocumentsReviewStartingSelector.mockImplementation(() => false)
      areDocumentsDeletingSelector.mockImplementation(() => false)
      isLabelAddingSelector.mockImplementation(() => false)
      isLabelCreatingSelector.mockImplementation(() => false)
      isLabelDeletingSelector.mockImplementation(() => false)

      expect(mapStateToProps().props.fetching).toEqual(false)
    })

    it('should set fetching to true if some fetching selectors are set to true', () => {
      areDocumentsFetchingSelector.mockImplementation(() => true)
      expect(mapStateToProps().props.fetching).toEqual(true)
    })

    it('should call to documentsSelector and pass the result as documents prop', () => {
      expect(documentsSelector).toHaveBeenCalled()
      expect(mapStateToProps().props.documents).toEqual(documentsSelector.getSelectorMockValue())
    })

    it('should call to processingEnginesSelector and pass the result as engines prop', () => {
      expect(processingEnginesSelector).toHaveBeenCalled()
      expect(mapStateToProps().props.engines).toEqual(processingEnginesSelector.getSelectorMockValue())
    })

    it('should call to languagesSelector and pass the result as engines prop', () => {
      expect(languagesSelector).toHaveBeenCalled()
      expect(mapStateToProps().props.languages).toEqual(languagesSelector.getSelectorMockValue())
    })

    it('should call to documentTypesSelector and pass the result as documentTypes prop', () => {
      expect(documentTypesSelector).toHaveBeenCalled()
      expect(mapStateToProps().props.documentTypes).toEqual(documentTypesSelector.getSelectorMockValue())
    })

    it('should call to selectionSelector and pass the result as selectedDocuments prop', () => {
      expect(selectionSelector).toHaveBeenCalled()
      expect(mapStateToProps().props.selectedDocuments).toEqual(selectionSelector.getSelectorMockValue())
    })

    it('should call to labelsSelector and pass the result as labels prop', () => {
      expect(labelsSelector).toHaveBeenCalled()
      expect(mapStateToProps().props.labels).toEqual(labelsSelector.getSelectorMockValue())
    })
  })

  let defaultProps
  let wrapper
  let mockEvent

  const getTableProps = (isAdmin = true) => {
    const tableWrapper = wrapper.childAt(isAdmin ? 1 : 0)
    return tableWrapper.props()
  }

  beforeEach(() => {
    defaultProps = {
      documents: [
        documentSelector.getSelectorMockValue(),
      ],
      tableColumns: ['title', 'date'],
      filterConfig: mockFilters,
      labels: [new Label('mockLabelId', 'mock Label Name')],
      documentTypes: [
        new DocumentType('bp', 'B P', 'ec1'),
        new DocumentType('type2', 'title2', 'engine2'),
      ],
      engines: [
        new Engine('code 1', 'name 1'),
        new Engine('code 2', 'name 2'),
      ],
      languages: [
        new Language('eng', 'English'),
        new Language('rus', 'Russian'),
      ],
      fetching: false,
      selectedDocuments: ['1'],
      setFilters: jest.fn(),
      setSelection: jest.fn(),
      refreshData: jest.fn(),
      fetchProcessingEngines: jest.fn(),
      fetchDocumentTypes: jest.fn(),
      fetchAvailableLanguages: jest.fn(),
      fetchLabels: jest.fn(),
      pagination: {
        ...mockPagination,
        onChange: jest.fn(),
        onShowSizeChange: jest.fn(),
      },
      defaultFilterConfig: new DocumentsFilterConfig(),
      setPagination: jest.fn(),
    }

    mockEvent = {
      shiftKey: false,
      ctrlKey: false,
      target: {
        classList: { contains: jest.fn() },
      },
    }

    wrapper = shallow(<ConnectedComponent {...defaultProps} />)
  })

  it('should render correct layout', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should call setSelection with correct props in case calling onSelectRows ', () => {
    const mockSelectedRowKeys = { id: 'id' }
    wrapper.instance().onSelectRows(mockSelectedRowKeys)
    expect(defaultProps.setSelection).nthCalledWith(1, mockSelectedRowKeys)
  })

  it('should call setFilters with correct props in case calling resetFilters ', () => {
    wrapper.instance().resetFilters()
    expect(defaultProps.setFilters).nthCalledWith(1, defaultProps.defaultFilterConfig)
  })

  it('should call setFilters with correct props in case calling filterHandler', () => {
    const filterFromTable = {
      [DocumentColumn.TITLE]: '',
      [DocumentColumn.DOCUMENT_TYPE]: ['test'],
      [DocumentColumn.LABELS]: ['test'],
      [DocumentColumn.STATE]: ['test'],
      [DocumentColumn.DATE]: [mockDate, mockDate],
      [DocumentColumn.LANGUAGE]: [],
      [DocumentColumn.REVIEWER]: 'system@example.com',
      [DocumentColumn.ENGINE]: [],
    }

    const sorterFromTable = new TableSorter({
      order: TableSortDirection.DESCEND,
      columnKey: DocumentColumn.TITLE,
    })

    wrapper.instance().filterHandler(
      mockPagination,
      filterFromTable,
      sorterFromTable,
    )

    expect(
      defaultProps.setFilters,
    ).nthCalledWith(1, {
      ...mockFilters,
      [DocumentFilterKeys.TITLE]: filterFromTable[DocumentColumn.TITLE],
      [DocumentFilterKeys.TYPES]: filterFromTable[DocumentColumn.DOCUMENT_TYPE],
      [DocumentFilterKeys.LABELS]: filterFromTable[DocumentColumn.LABELS],
      [DocumentFilterKeys.LANGUAGES]: filterFromTable[DocumentColumn.LANGUAGE],
      [DocumentFilterKeys.STATES]: filterFromTable[DocumentColumn.STATE],
      [DocumentFilterKeys.DATE_RANGE]: filterFromTable[DocumentColumn.DATE],
      [DocumentFilterKeys.REVIEWER]: filterFromTable[DocumentColumn.REVIEWER],
      [DocumentFilterKeys.ENGINES]: filterFromTable[DocumentColumn.ENGINE],
      [DocumentFilterKeys.SORT_FIELD]: DocumentColumn.TITLE,
      [DocumentFilterKeys.SORT_DIRECT]: SortDirection.DESC,
    })
  })

  it('should call props.fetchProcessingEngines when component did mount', () => {
    expect(defaultProps.fetchProcessingEngines).toHaveBeenCalled()
  })

  it('should call props.fetchAvailableLanguages when component did mount', () => {
    expect(defaultProps.fetchAvailableLanguages).toHaveBeenCalled()
  })

  it('should call props.fetchLabels when component did mount', () => {
    expect(defaultProps.fetchLabels).toHaveBeenCalled()
  })

  it('should call goTo when click on row with left mouse button', () => {
    const rowProps = wrapper.instance().onRowProps(mockRecord)

    rowProps.onClick(mockEvent)

    expect(goTo).nthCalledWith(1, mockUrl)
  })

  it('should call window.open when click on row with ctrl+left mouse buttons', () => {
    const rowProps = wrapper.instance().onRowProps(mockRecord)
    mockEvent.ctrlKey = true

    rowProps.onClick(mockEvent)

    expect(window.open).nthCalledWith(1, mockUrl)
  })

  it('should call window.open when click on row with shift+left mouse buttons', () => {
    jest.clearAllMocks()
    const rowProps = wrapper.instance().onRowProps(mockRecord)
    mockEvent.shiftKey = true

    rowProps.onClick(mockEvent)

    expect(window.open).nthCalledWith(1, mockUrl, '_blank')
  })

  it('should call setFilters with new filters when calling onFilter Table prop', () => {
    const onFilter = getTableProps().onFilter
    const newFilters = {
      [DocumentColumn.TITLE]: 'mock title',
      [DocumentColumn.ENGINE]: ['mockEngine'],
    }

    onFilter(mockPagination, newFilters, {})

    expect(defaultProps.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        [DocumentFilterKeys.TITLE]: 'mock title',
        [DocumentFilterKeys.ENGINES]: ['mockEngine'],
      }),
    )
  })

  it('should call setPagination with new pagination config when calling onFilter Table prop', () => {
    const onFilter = getTableProps().onFilter
    const newPagination = new PaginationConfig({
      current: 2,
      pageSize: 10,
    })

    onFilter(newPagination, {}, {})

    expect(defaultProps.setPagination).nthCalledWith(1, {
      [PaginationKeys.PAGE]: newPagination.current,
      [PaginationKeys.PER_PAGE]: newPagination.pageSize,
    },
    )
  })

  it('should provide onClick event as table row props', () => {
    const onRow = getTableProps().onRow
    const { onClick } = onRow(mockDocument)

    onClick(mockEvent)

    expect(goTo).toHaveBeenCalledWith(
      navigationMap.documents.document(mockDocument._id),
    )
  })

  it('should pass rowKey prop that maps document id as row key', () => {
    const rowKey = getTableProps().rowKey

    const key = rowKey(mockDocument)

    expect(key).toEqual(mockDocument._id)
  })

  it('should render Table component without a wrapper for size tracking in case table does not have pagination', () => {
    wrapper.setProps({
      ...defaultProps,
      pagination: false,
    })
    expect(wrapper.find(Table).exists()).toEqual(true)
  })
})
