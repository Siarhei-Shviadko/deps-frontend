
import { mockReact } from '@/mocks/mockReact'
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import { fetchDocumentTypes } from '@/actions/documentTypes'
import { fetchProcessingEngines } from '@/actions/engines'
import { fetchAvailableLanguages } from '@/actions/languages'
import { setFilters, setPagination } from '@/actions/navigation'
import { Spin } from '@/components/Spin'
import { DocumentTypeFilterKey } from '@/constants/navigation'
import { BASE_DOCUMENT_TYPES_FILTER_CONFIG } from '@/models/DocumentTypesFilterConfig'
import { documentTypesStateSelector } from '@/selectors/documentTypes'
import { filterSelector } from '@/selectors/navigation'
import { areTypesFetchingSelector } from '@/selectors/requests'
import { DocumentTypesPage } from './DocumentTypesPage'
import { Tabs } from './DocumentTypesPage.styles'

const mockDispatch = jest.fn((action) => action)
const mockAction = { type: 'type' }

jest.mock('react', () => mockReact())

jest.mock('react-redux', () => ({
  ...mockReactRedux,
  useDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/selectors/requests')
jest.mock('@/selectors/documentTypes')

jest.mock('@/actions/documentTypes', () => ({
  fetchDocumentTypes: jest.fn(() => mockAction),
}))

jest.mock('@/actions/navigation', () => ({
  setFilters: jest.fn(() => mockAction),
  setPagination: jest.fn(() => mockAction),
}))

jest.mock('@/actions/engines', () => ({
  fetchProcessingEngines: jest.fn(() => mockAction),
}))

jest.mock('@/actions/languages', () => ({
  fetchAvailableLanguages: jest.fn(() => mockAction),
}))

jest.mock('@/selectors/navigation', () => ({
  filterSelector: jest.fn(() => mockAction),
}))

jest.mock('@/utils/env', () => mockEnv)

test('should call areTypesFetchingSelector', () => {
  jest.clearAllMocks()

  shallow(<DocumentTypesPage />)

  expect(areTypesFetchingSelector).toHaveBeenCalledTimes(1)
})

test('should call documentTypesStateSelector', () => {
  jest.clearAllMocks()

  shallow(<DocumentTypesPage />)

  expect(documentTypesStateSelector).toHaveBeenCalledTimes(1)
})

test('should call filterSelector', async () => {
  jest.clearAllMocks()

  shallow(<DocumentTypesPage />)

  expect(filterSelector).toHaveBeenCalledTimes(1)
})

test('should call dispatch with fetchDocumentTypes action when render component', () => {
  jest.clearAllMocks()

  shallow(<DocumentTypesPage />)

  expect(mockDispatch).nthCalledWith(1, fetchDocumentTypes())
})

test('should call dispatch fetchProcessingEngines action when render component', () => {
  jest.clearAllMocks()

  shallow(<DocumentTypesPage />)

  expect(mockDispatch).nthCalledWith(1, fetchProcessingEngines())
})

test('should call dispatch fetchAvailableLanguages action when render component', () => {
  jest.clearAllMocks()

  shallow(<DocumentTypesPage />)

  expect(mockDispatch).nthCalledWith(1, fetchAvailableLanguages())
})

test('should render Document types page correctly', () => {
  const wrapper = shallow(<DocumentTypesPage />)

  expect(wrapper).toMatchSnapshot()
})

test('should render Spin if isFetching is true', () => {
  areTypesFetchingSelector.mockReturnValueOnce(true)

  const wrapper = shallow(<DocumentTypesPage />)

  expect(wrapper.find(Spin.Centered).exists()).toBe(true)
})

test('should reset filter to default and set new tab key if active tab was changed', () => {
  jest.clearAllMocks()
  const newActiveTabKey = 'newActiveTabKey'

  const wrapper = shallow(<DocumentTypesPage />)

  wrapper.find(Tabs).props().onChange(newActiveTabKey)

  expect(mockDispatch).nthCalledWith(1, setFilters())
  expect(setFilters).nthCalledWith(1, {
    ...BASE_DOCUMENT_TYPES_FILTER_CONFIG,
    [DocumentTypeFilterKey.EXTRACTION_TYPE]: newActiveTabKey,
  })
})

test('should reset pagination if active tab was changed', () => {
  jest.clearAllMocks()

  const wrapper = shallow(<DocumentTypesPage />)

  wrapper.find(Tabs).props().onChange()

  expect(mockDispatch).nthCalledWith(1, setPagination())
  expect(setPagination).nthCalledWith(1, {})
})
