
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import ShallowRenderer from 'react-test-renderer/shallow'
import { setFilters, setPagination } from '@/actions/navigation'
import {
  DocumentTypeFilterKey,
  PaginationKeys,
  EXTRACTION_TYPE_FILTER_KEY,
} from '@/constants/navigation'
import { ExtractionType } from '@/enums/ExtractionType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { DocumentType } from '@/models/DocumentType'
import { DocumentTypesFilterConfig } from '@/models/DocumentTypesFilterConfig'
import { navigationMap } from '@/utils/navigationMap'
import { openInNewTarget } from '@/utils/window'
import { DocumentTypesColumnKey } from './columns'
import { DocumentTypesListView } from './DocumentTypesListView'

const mockDispatch = jest.fn((action) => action)
jest.mock('react-redux', () => ({
  ...mockReactRedux,
  useDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/actions/navigation', () => ({
  setPagination: jest.fn(),
  setFilters: jest.fn(),
}))

jest.mock('@/selectors/navigation')
jest.mock('@/selectors/engines')
jest.mock('@/selectors/languages')
jest.mock('@/utils/env', () => mockEnv)

let mockOpenInNewTargetCallback
jest.mock('@/utils/window', () => ({
  openInNewTarget: jest.fn((event, url, cb) => {
    mockOpenInNewTargetCallback = cb
    cb()
  }),
}))

const mockDocumentType = new DocumentType(
  'DocType1',
  'Doc Type 1',
  KnownProcessingEngines.TESSERACT,
  KnownLanguage.ENGLISH,
  ExtractionType.TEMPLATE,
)

const mockFilter = new DocumentTypesFilterConfig({
  dateRange: [],
  name: '',
  sortDirect: '',
  sortField: '',
})

test('should render correct layout', () => {
  const renderer = new ShallowRenderer()
  const wrapper = renderer.render(
    <DocumentTypesListView
      documentTypes={[mockDocumentType]}
      documentTypesExtractor={EXTRACTION_TYPE_FILTER_KEY.templates}
    />,
  )

  expect(wrapper).toMatchSnapshot()
})

test('should render correct layout with custom columns list', () => {
  const azureExtractorDocumentType = new DocumentType(
    'DocType1',
    'Doc Type 1',
    KnownProcessingEngines.TESSERACT,
    KnownLanguage.ENGLISH,
    ExtractionType.AZURE_CLOUD_EXTRACTOR,
  )

  const renderer = new ShallowRenderer()
  const wrapper = renderer.render(
    <DocumentTypesListView
      documentTypes={[azureExtractorDocumentType]}
      documentTypesExtractor={EXTRACTION_TYPE_FILTER_KEY.azureCloudExtractor}
    />,
  )

  expect(wrapper).toMatchSnapshot()
})

test('should call setFilters with correct arguments when onFilter prop is called', () => {
  const filterFromTable = {
    [DocumentTypesColumnKey.NAME]: 'testName',
    [DocumentTypesColumnKey.CREATED_AT]: ['testDate1', 'testDate2'],
  }

  const renderer = new ShallowRenderer()
  const wrapper = renderer.render(
    <DocumentTypesListView
      documentTypes={[mockDocumentType]}
      documentTypesExtractor={EXTRACTION_TYPE_FILTER_KEY.templates}
    />,
  )

  wrapper.props.onFilter({}, filterFromTable)

  expect(setFilters).nthCalledWith(1, {
    ...mockFilter,
    [DocumentTypeFilterKey.NAME]: filterFromTable[DocumentTypesColumnKey.NAME],
    [DocumentTypeFilterKey.DATE_RANGE]: filterFromTable[DocumentTypesColumnKey.CREATED_AT],
  })
})

test('should call setPagination with correct arguments when onFilterProp is called', () => {
  const tablePagination = {
    current: 1,
    pageSize: 20,
  }

  const renderer = new ShallowRenderer()
  const wrapper = renderer.render(
    <DocumentTypesListView
      documentTypes={[mockDocumentType]}
      documentTypesExtractor={EXTRACTION_TYPE_FILTER_KEY.templates}
    />,
  )

  wrapper.props.onFilter(tablePagination, {})

  expect(setPagination).nthCalledWith(1, {
    [PaginationKeys.PAGE]: tablePagination.current,
    [PaginationKeys.PER_PAGE]: tablePagination.pageSize,
  })
})

test('should maps document type code as row key', () => {
  const renderer = new ShallowRenderer()
  const wrapper = renderer.render(
    <DocumentTypesListView
      documentTypes={[mockDocumentType]}
      documentTypesExtractor={EXTRACTION_TYPE_FILTER_KEY.templates}
    />,
  )

  const key = wrapper.props.rowKey(mockDocumentType)

  expect(key).toEqual(mockDocumentType.code)
})

test('should call openInNewTarget with correct args in case of on row click', () => {
  const renderer = new ShallowRenderer()
  const mockEvent = { target: 'mockTarget' }
  const { code } = mockDocumentType

  const wrapper = renderer.render(
    <DocumentTypesListView
      documentTypes={[mockDocumentType]}
      documentTypesExtractor={EXTRACTION_TYPE_FILTER_KEY.templates}
    />,
  )

  wrapper.props.onRow({ code }).onClick(mockEvent)

  expect(openInNewTarget).nthCalledWith(
    1,
    mockEvent,
    navigationMap.documentTypes.documentType(code),
    mockOpenInNewTargetCallback,
  )
})
