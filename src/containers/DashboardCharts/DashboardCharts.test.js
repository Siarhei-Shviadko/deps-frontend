
import { mockReact } from '@/mocks/mockReact'
import { mockComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import { fetchDocumentsByFilter } from '@/actions/documentsListPage'
import { fetchDocumentTypes } from '@/actions/documentTypes'
import { Spin } from '@/components/Spin'
import { EmptyDashboard } from '@/containers/DashboardCharts/EmptyDashboard'
import { ExtractionType } from '@/enums/ExtractionType'
import { documentsTotalSelector } from '@/selectors/documentsListPage'
import { documentTypesStateSelector } from '@/selectors/documentTypes'
import { areDocumentsFetchingSelector, areTypesFetchingSelector } from '@/selectors/requests'
import { ENV } from '@/utils/env'
import { DashboardCharts } from './'

const mockDispatch = jest.fn((action) => action)
const mockActions = {
  fetchDocumentsByFilter: 'fetchDocumentsByFilter',
  fetchDocumentTypes: 'fetchDocumentTypes',
}

jest.mock('react-redux', () => ({
  ...mockReactRedux,
  useDispatch: jest.fn(() => mockDispatch),
}))
jest.mock('react', () => mockReact())
jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/selectors/requests')
jest.mock('@/selectors/documentsListPage')
jest.mock('@/selectors/documentTypes')

jest.mock('@/actions/documentsListPage', () => ({
  fetchDocumentsByFilter: jest.fn(() => mockActions.fetchDocumentsByFilter),
}))

jest.mock('@/actions/documentTypes', () => ({
  fetchDocumentTypes: jest.fn(() => mockActions.fetchDocumentTypes),
}))
jest.mock('@/containers/DocumentsStatesChart', () => mockComponent('DocumentsStatesChart'))
jest.mock('@/containers/FieldEditsTable', () => mockComponent('FieldEditsTable'))
jest.mock('./DocumentsByTypeChart', () => mockComponent('DocumentsByTypeChart'))

describe('Container: DashboardCharts', () => {
  let wrapper

  const makeType = (overrides = {}) => ({
    code: 'TYPE_CODE',
    name: 'Type Name',
    extractionType: ExtractionType.TEMPLATE,
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()

    ENV.FEATURE_TEMPLATES = true
    ENV.FEATURE_MACHINE_LEARNING_MODELS = true
    ENV.FEATURE_PROTOTYPES = true
    ENV.FEATURE_AI_PROMPTED_EXTRACTORS = true
    ENV.FEATURE_AZURE_CLOUD_NATIVE_EXTRACTOR = true

    documentsTotalSelector.mockImplementation(() => 1)
    areDocumentsFetchingSelector.mockImplementation(() => false)
    areTypesFetchingSelector.mockImplementation(() => false)

    documentTypesStateSelector.mockImplementation(() => ({
      t1: makeType({
        code: 'P1',
        name: 'Prototype type',
        extractionType: ExtractionType.PROTOTYPE,
      }),
      t2: makeType({
        code: 'T1',
        name: 'Template type',
        extractionType: ExtractionType.TEMPLATE,
      }),
      t3: makeType({
        code: 'M1',
        name: 'Model type',
        extractionType: ExtractionType.PLUGIN,
      }),
    }))

    wrapper = shallow(<DashboardCharts />)
  })

  it('should render correct layout when fetching is finished', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should render FieldEditsTable alongside DocumentsStatesChart in charts row', () => {
    expect(wrapper.find('FieldEditsTable').exists()).toEqual(true)
    expect(wrapper.find('DocumentsStatesChart').exists()).toEqual(true)
  })

  it('should render empty if no documents and document types provided', () => {
    documentsTotalSelector.mockImplementationOnce(() => 0)
    documentTypesStateSelector.mockImplementationOnce(() => ({}))

    wrapper = shallow(<DashboardCharts />)

    expect(
      wrapper.find(EmptyDashboard).exists(),
    ).toEqual(true)
  })

  it('should render Spin when types are fetching', () => {
    areTypesFetchingSelector.mockImplementationOnce(() => true)

    wrapper = shallow(<DashboardCharts />)

    expect(
      wrapper.find(Spin.Centered).exists(),
    ).toEqual(true)
  })

  it('should render Spin when documents are fetching', () => {
    areDocumentsFetchingSelector.mockImplementationOnce(() => true)

    wrapper = shallow(<DashboardCharts />)

    expect(
      wrapper.find(Spin.Centered).exists(),
    ).toEqual(true)
  })

  it('should call to documentsTotalSelector', () => {
    expect(documentsTotalSelector).toHaveBeenCalled()
  })

  it('should call to areDocumentsFetchingSelector', () => {
    expect(areDocumentsFetchingSelector).toHaveBeenCalled()
  })

  it('should call to areTypesFetchingSelector', () => {
    expect(areTypesFetchingSelector).toHaveBeenCalled()
  })

  it('should call dispatch with fetchDocumentsByFilter and fetchDocumentTypes when component mount', () => {
    expect(mockDispatch).toHaveBeenNthCalledWith(1, fetchDocumentsByFilter())
    expect(mockDispatch).toHaveBeenNthCalledWith(2, fetchDocumentTypes())
  })

  it('should include AI-Prompted types when FEATURE_AI_PROMPTED_EXTRACTORS is enabled', () => {
    documentTypesStateSelector.mockImplementationOnce(() => ({
      t1: makeType({
        code: 'AI1',
        name: 'AI type',
        extractionType: ExtractionType.AI_PROMPTED,
      }),
    }))

    wrapper = shallow(<DashboardCharts />)

    const docTypesList = wrapper.find('DocumentsByTypeChart').prop('docTypesList')
    expect(docTypesList).toHaveLength(1)
    expect(docTypesList[0]).toEqual(expect.objectContaining({
      id: 'AI1',
      code: 'AI1',
      documentType: 'AI type',
      extractionType: ExtractionType.AI_PROMPTED,
    }))
  })

  it('should include Azure Cloud Native types when FEATURE_AZURE_CLOUD_NATIVE_EXTRACTOR is enabled', () => {
    documentTypesStateSelector.mockImplementationOnce(() => ({
      t1: makeType({
        code: 'AZ1',
        name: 'Azure type',
        extractionType: ExtractionType.AZURE_CLOUD_EXTRACTOR,
      }),
    }))

    wrapper = shallow(<DashboardCharts />)

    const docTypesList = wrapper.find('DocumentsByTypeChart').prop('docTypesList')
    expect(docTypesList).toHaveLength(1)
    expect(docTypesList[0]).toEqual(expect.objectContaining({
      id: 'AZ1',
      code: 'AZ1',
      documentType: 'Azure type',
      extractionType: ExtractionType.AZURE_CLOUD_EXTRACTOR,
    }))
  })
})
