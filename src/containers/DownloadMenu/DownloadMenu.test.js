
import { mockReact } from '@/mocks/mockReact'
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import { CustomMenu } from '@/components/Menu/CustomMenu'
import { DocumentState } from '@/enums/DocumentState'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { File } from '@/models/Document'
import { DocumentType } from '@/models/DocumentType'
import { DownloadMenu } from '.'

const mockDocumentType = new DocumentType(
  'code',
  'name',
  KnownProcessingEngines.TESSERACT,
)

jest.mock('react', () => mockReact())
jest.mock('react-redux', () => mockReactRedux)
jest.mock('@/hooks/useCustomization', () => ({
  useCustomization: jest.fn(() => ({
    module: jest.fn(),
  })),
}))
jest.mock('@/selectors/authorization')
jest.mock('@/selectors/customization')
jest.mock('@/utils/env', () => mockEnv)

jest.mock('./withCustomization', () => ({
  withCustomization: jest.fn((Component) => Component),
}))

describe('Container: DownloadMenu', () => {
  let defaultProps
  let wrapper
  let menuItemsProp

  beforeEach(() => {
    defaultProps = {
      disabled: false,
      documentId: '1',
      documentTitle: 'mockTitle',
      documentType: mockDocumentType,
      state: DocumentState.FAILED,
      error: {
        description: '',
        inState: DocumentState.PREPROCESSING,
      },
      files: [
        new File('url/asd.pdf', 'blob/asd.pdf'),
      ],
      containerType: null,
      isDocumentTypeFetching: false,
    }

    wrapper = shallow(<DownloadMenu {...defaultProps} />)
    menuItemsProp = wrapper.find(CustomMenu).props().items
  })

  it('should render correct layout', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should render correct items', () => {
    menuItemsProp.forEach((item) => {
      if (item.content) {
        expect(shallow(<div>{item.content()}</div>)).toMatchSnapshot()
      } else if (item.subContent) {
        expect(shallow(<div>{item.subContent}</div>)).toMatchSnapshot()
      }
    })
  })
})
