
import { mockReact } from '@/mocks/mockReact'
import { mockComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { mockReactRouter } from '@/mocks/mockReactRouter'
import { mockSessionStorageWrapper } from '@/mocks/mockSessionStorageWrapper'
import { shallow } from 'enzyme'
import { Resizable } from 're-resizable'
import { PAGE_SEPARATOR_POSITION } from '@/constants/storage'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { UNKNOWN_DOCUMENT_TYPE } from '@/models/DocumentType'
import { documentSelector } from '@/selectors/documentReviewPage'
import { sessionStorageWrapper } from '@/utils/sessionStorageWrapper'
import { DocumentReview } from './DocumentReview'

jest.mock('react', () => mockReact())
jest.mock('react-redux', () => mockReactRedux)
jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-router', () => ({
  ...mockReactRouter,
  useParams: jest.fn(() => ({ documentId: 'mockId' })),
}))
jest.mock('@/selectors/documentReviewPage')
jest.mock('@/containers/DocumentViewHeader', () => mockComponent('DocumentViewHeader'))
jest.mock('@/containers/DocumentPreview', () => mockComponent('DocumentPreview'))
jest.mock('@/containers/DocumentData', () => mockComponent('DocumentData'))
jest.mock('@/containers/DocumentPromptCalibrationStudio', () => mockComponent('DocumentPromptCalibrationStudio'))
jest.mock('@/utils/sessionStorageWrapper', () => mockSessionStorageWrapper('50%'))
jest.mock('re-resizable', () => mockComponent('Resizable'))

jest.mock('@/actions/documentReviewPage', () => ({
  updateDocument: jest.fn(),
}))

const {
  ConnectedComponent,
} = DocumentReview

describe('Container: DocumentReview', () => {
  let defaultProps
  let wrapper

  beforeEach(() => {
    defaultProps = {
      document: documentSelector.getSelectorMockValue(),
      fetchDocumentData: jest.fn(() => {}),
      fetchDocumentType: jest.fn(() => {}),
      highlightPolygonCoordsField: jest.fn(),
      highlightTableCoordsField: jest.fn(),
      addActivePolygons: jest.fn(),
      clearActivePolygons: jest.fn(),
      fetching: false,
    }

    wrapper = shallow(<ConnectedComponent {...defaultProps} />)
  })

  it('should render correct layout', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should call sessionStorageWrapper.getItem on mount', () => {
    expect(sessionStorageWrapper.getItem).toHaveBeenCalled()
  })

  it('should apply size from sessionStorage to Resizable', () => {
    const resizableProps = wrapper.find(Resizable).props()

    const expectedWidth = sessionStorageWrapper.getItem()
    expect(resizableProps.defaultSize.width).toEqual(expectedWidth)
  })

  it('should call sessionStorage.setItem with correct argument on change size', () => {
    const mockRef = {
      style: {
        width: '35%',
      },
    }

    wrapper.find(Resizable).props().onResizeStop(null, null, mockRef)
    expect(sessionStorageWrapper.setItem).toHaveBeenCalledWith(PAGE_SEPARATOR_POSITION, mockRef.style.width)
  })

  it('should call fetchDocumentType with correct argument', () => {
    const mockFetchDocumentType = jest.fn()

    const mockDocument = documentSelector.getSelectorMockValue()

    const props = {
      ...defaultProps,
      fetchDocumentType: mockFetchDocumentType,
    }

    shallow(<ConnectedComponent {...props} />)

    expect(mockFetchDocumentType).nthCalledWith(
      1,
      mockDocument.documentType.code,
      [
        DocumentTypeExtras.EXTRACTION_FIELDS,
        DocumentTypeExtras.WORKFLOW_CONFIGURATIONS,
        DocumentTypeExtras.PROFILES,
        DocumentTypeExtras.EXTRA_FIELDS,
        DocumentTypeExtras.LLM_EXTRACTORS,
      ],
    )
  })

  it('should not call fetchDocumentType if documentType is unknown', () => {
    const mockFetchDocumentType = jest.fn()

    const mockDocument = {
      ...documentSelector.getSelectorMockValue(),
      documentType: UNKNOWN_DOCUMENT_TYPE,
    }

    const props = {
      ...defaultProps,
      document: mockDocument,
      fetchDocumentType: mockFetchDocumentType,
    }

    shallow(<ConnectedComponent {...props} />)

    expect(mockFetchDocumentType).not.toBeCalled()
  })

  it('should render DocumentPromptCalibrationStudio component', () => {
    expect(wrapper.find('DocumentPromptCalibrationStudio').exists()).toBe(true)
  })
})
