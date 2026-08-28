
import { mockReact } from '@/mocks/mockReact'
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import { goTo } from '@/actions/navigation'
import { documentsApi } from '@/api/documentsApi'
import { StatisticCard } from '@/components/StatisticCard'
import { DocumentFilterKeys, PaginationKeys } from '@/constants/navigation'
import { DocumentState } from '@/enums/DocumentState'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { useAbortRequest } from '@/hooks/useAbortRequest'
import { Localization, localize } from '@/localization/i18n'
import { DocumentType } from '@/models/DocumentType'
import { navigationMap } from '@/utils/navigationMap'
import { notifyWarning } from '@/utils/notification'
import { DocumentTypeByStateCard } from './DocumentTypeByStateCard'

const mockDocumentType = new DocumentType(
  'code',
  'name',
  KnownProcessingEngines.TESSERACT,
)

const mockResponse = {
  meta: {
    total: 10,
  },
}

const mockSignal = {}

jest.mock('react', () => mockReact())
jest.mock('react-redux', () => mockReactRedux)
jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('@/api/documentsApi', () => ({
  documentsApi: {
    getDocuments: jest.fn(() => Promise.resolve(mockResponse)),
  },
}))

jest.mock('@/actions/navigation', () => ({
  goTo: jest.fn(),
}))

jest.mock('@/hooks/useAbortRequest', () => ({
  useAbortRequest: jest.fn(() => ({
    signal: mockSignal,
    isCanceled: jest.fn(() => false),
  })),
}))

describe('Container: DocumentTypeByStateCard', () => {
  let wrapper, defaultProps

  beforeEach(() => {
    defaultProps = {
      documentType: mockDocumentType,
      limitValue: 100,
      states: [DocumentState.COMPLETED],
    }

    wrapper = shallow(<DocumentTypeByStateCard {...defaultProps} />)
  })

  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should call documentApi.getDocuments when render component', () => {
    jest.clearAllMocks()

    wrapper = shallow(<DocumentTypeByStateCard {...defaultProps} />)

    expect(documentsApi.getDocuments).nthCalledWith(1, {
      [DocumentFilterKeys.STATES]: defaultProps.states,
      [DocumentFilterKeys.TYPES]: [mockDocumentType.code],
      [PaginationKeys.PER_PAGE]: 1,
    }, {
      signal: mockSignal,
    },
    )
  })

  it('should show warning notification if request throws an error', async () => {
    documentsApi.getDocuments.mockImplementationOnce(() => Promise.reject(new Error('error')))

    wrapper = shallow(<DocumentTypeByStateCard {...defaultProps} />)

    expect(await notifyWarning).nthCalledWith(1, localize(Localization.DEFAULT_ERROR))
  })

  it('should not show warning notification if request was aborted', async () => {
    jest.clearAllMocks()

    useAbortRequest.mockImplementationOnce(() => ({
      signal: mockSignal,
      isCanceled: () => true,
    }))
    documentsApi.getDocuments.mockImplementationOnce(() => Promise.reject(new Error('abort')))

    wrapper = shallow(<DocumentTypeByStateCard {...defaultProps} />)

    expect(await notifyWarning).not.toBeCalled()
  })

  it('should dispatch goTo action when click on IconButton', () => {
    const Extra = wrapper.find(StatisticCard).props().renderExtra
    const Icon = shallow(<Extra />)

    Icon.props().onClick()

    expect(goTo).nthCalledWith(
      1,
      navigationMap.documents(),
      {
        filters: {
          [DocumentFilterKeys.TYPES]: [defaultProps.documentType.code],
          [DocumentFilterKeys.STATES]: defaultProps.states,
        },
      })
  })
})
