
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import { extractData } from '@/actions/documents'
import { fetchProcessingEngines } from '@/actions/engines'
import { DocumentState } from '@/enums/DocumentState'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Engine } from '@/models/Engine'
import { processingEnginesSelector } from '@/selectors/engines'
import { areEnginesFetchingSelector } from '@/selectors/requests'
import {
  notifySuccess,
  notifyWarning,
} from '@/utils/notification'
import { ExtractData } from '.'

jest.mock('@/actions/documents', () => ({
  extractData: jest.fn(),
}))
jest.mock('@/actions/engines', () => ({
  fetchProcessingEngines: jest.fn(),
}))
jest.mock('@/utils/notification', () => ({
  notifyWarning: jest.fn(),
  notifySuccess: jest.fn(),
}))
jest.mock('react-redux', () => mockReactRedux)
jest.mock('@/selectors/engines')
jest.mock('@/selectors/requests')
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('@/utils/env', () => mockEnv)

const { mergeProps, mapStateToProps, ConnectedComponent } = ExtractData

describe('Component: ExtractData', () => {
  describe('mapStateToProps', () => {
    it('should call to processingEnginesSelector with state and pass the result as engines prop', () => {
      const { props } = mapStateToProps()
      expect(processingEnginesSelector).toHaveBeenCalled()
      expect(props.engines).toEqual(processingEnginesSelector.getSelectorMockValue())
    })

    it('should call to areEnginesFetchingSelector with state and pass the result as enginesFetching prop', () => {
      const { props } = mapStateToProps()
      expect(areEnginesFetchingSelector).toHaveBeenCalled()
      expect(props.enginesFetching).toEqual(areEnginesFetchingSelector.getSelectorMockValue())
    })
  })

  describe('mergeProps', () => {
    it('should pass extractData action as extractData property', () => {
      const { props: stateProps } = mapStateToProps()
      const { props } = mergeProps(stateProps)
      props.extractData()
      expect(extractData).toHaveBeenCalled()
    })

    it('should pass fetchProcessingEngines action as fetchProcessingEngines property', () => {
      const { props: stateProps } = mapStateToProps()
      const { props } = mergeProps(stateProps)
      props.fetchProcessingEngines()
      expect(fetchProcessingEngines).toHaveBeenCalled()
    })
  })

  describe('Connected component', () => {
    let defaultProps
    let wrapper

    const mockData = [
      new Document({ id: 'mockDocumentId1' }),
    ]

    beforeEach(() => {
      defaultProps = {
        children: 'ExtractData',
        disabled: false,
        documentState: DocumentState.IN_REVIEW,
        initialEngine: KnownProcessingEngines.TESSERACT,
        extractData: jest.fn(() => Promise.resolve(mockData)),
        documentIds: ['123', '456'],
        engines: [
          new Engine('code1', 'name1'),
        ],
        fetchProcessingEngines: jest.fn(),
      }

      wrapper = shallow(<ConnectedComponent {...defaultProps} />)
    })

    it('should render correct layout', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('should call props extractData when calling to extractDocument', async () => {
      defaultProps.extractData.mockImplementationOnce(() => Promise.resolve([{ _id: defaultProps.documentIds }]))
      await wrapper.instance().extractDocument(defaultProps.initialEngine)
      expect(defaultProps.extractData).nthCalledWith(1, defaultProps.initialEngine, defaultProps.documentIds)
    })

    it('should call success in case of extractData ', async () => {
      wrapper.instance().extractDocument(defaultProps.initialEngine)
      await defaultProps.extractData(defaultProps.initialEngine, defaultProps.documentIds)
      expect(notifySuccess).nthCalledWith(
        1,
        '1 document(s) were sent to automatic data extraction process',
        'After data extraction these documents will appear in \'Documents\' tab')
    })

    it('should call warning in case of extractData returns empty array', async () => {
      defaultProps.extractData.mockImplementationOnce(() => Promise.resolve([]))
      await wrapper.instance().extractDocument(defaultProps.initialEngine)
      expect(notifyWarning).nthCalledWith(1, 'Can\'t send 2 document(s) to data extraction process', 'because they were updated by another user')
    })
  })
})
