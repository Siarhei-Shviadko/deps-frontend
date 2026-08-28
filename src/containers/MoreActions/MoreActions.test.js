
import { mockComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import { Dropdown } from '@/components/Dropdown'
import {
  FORBIDDEN_EXTENSIONS_TO_OPEN_LT,
  FORBIDDEN_EXTENSIONS_TO_LAUNCH_PIPELINE,
  FORBIDDEN_EXTENSIONS_FOR_OUTPUT_ACTIONS,
} from '@/constants/document'
import { AgenticChatModalButton } from '@/containers/AgenticChatModalButton'
import { DocumentOutputArchiveButton } from '@/containers/DocumentOutputArchiveButton'
import { StudioTriggerButton } from '@/containers/DocumentPromptCalibrationStudio'
import { OpenLabelingToolButton } from '@/containers/OpenLabelingToolButton'
import { RunPipelineButton } from '@/containers/RunPipelineButton'
import { SkipValidationButton } from '@/containers/SkipValidationButton'
import { DocumentState } from '@/enums/DocumentState'
import { ExtractionType } from '@/enums/ExtractionType'
import { FieldType } from '@/enums/FieldType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { localize, Localization } from '@/localization/i18n'
import { DocumentType, UNKNOWN_DOCUMENT_TYPE } from '@/models/DocumentType'
import { DocumentTypeField } from '@/models/DocumentTypeField'
import {
  documentSelector, documentTypeSelector,
} from '@/selectors/documentReviewPage'
import { MoreActions } from './MoreActions'

jest.mock('react-redux', () => mockReactRedux)

jest.mock('@/utils/features', () => ({
  isFeatureEnabled: jest.fn(() => true),
}))

jest.mock('@/components/LabelingTool', () => ({
  isLabelingToolAvailable: jest.fn(() => true),
  LabelingTool: mockComponent('LabelingTool'),
}))
jest.mock('@/selectors/documentReviewPage')
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('@/containers/RunPipelineButton', () => mockComponent('RunPipelineButton'))
jest.mock('@/containers/OpenLabelingToolButton', () => mockComponent('OpenLabelingToolButton'))
jest.mock('@/containers/GoToErrorButton', () => mockComponent('GoToErrorButton'))
jest.mock('@/containers/DetectTableDataButton', () => mockComponent('DetectTableDataButton'))
jest.mock('@/containers/DeleteDocumentButton', () => mockComponent('DeleteDocumentButton'))
jest.mock('@/containers/ChangeDocumentTypeButton', () => mockComponent('ChangeDocumentTypeButton'))
jest.mock('@/containers/ChangeDocumentLanguageButton', () => mockComponent('ChangeDocumentLanguageButton'))
jest.mock('@/containers/SkipValidationButton', () => mockComponent('SkipValidationButton'))
jest.mock('@/containers/PdfSplitting', () => mockComponent('PdfSplittingButton'))
jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/containers/ManageLabelsModalButton', () => mockComponent('ManageLabelsModalButton'))
jest.mock('@/containers/DocumentPromptCalibrationStudio', () => mockComponent('StudioTriggerButton'))
jest.mock('@/containers/AgenticChatModalButton', () => mockComponent('AgenticChatModalButton'))

const documentType = new DocumentType('DirectionalSurvey', 'Directional Survey', KnownProcessingEngines.TESSERACT)

const { ConnectedComponent, mapStateToProps } = MoreActions

describe('Container: MoreActions', () => {
  describe('mapStateToProps', () => {
    it('should call documentSelector with state and pass the result as document prop', () => {
      const { props } = mapStateToProps()
      expect(documentSelector).toHaveBeenCalled()
      expect(props.document).toEqual(documentSelector.getSelectorMockValue())
    })

    it('should call to the documentTypeSelector and pass the result as documentType prop', () => {
      const { props } = mapStateToProps()

      expect(documentTypeSelector).toHaveBeenCalled()
      expect(props.documentType).toEqual(documentTypeSelector.getSelectorMockValue())
    })
  })

  describe('connected component', () => {
    let defaultProps
    let componentWrapper

    const mockDocumentTypeField = new DocumentTypeField(
      'fieldCode',
      'fieldName',
      {},
      FieldType.STRING,
      true,
      0,
      'testCode',
      0,
    )

    beforeEach(() => {
      jest.clearAllMocks()

      defaultProps = {
        documentType: new DocumentType(
          'testCode',
          'test name',
          'mockEngineCode',
          KnownLanguage.ENGLISH,
          ExtractionType.TEMPLATE,
          [mockDocumentTypeField],
        ),
        updateDocumentType: jest.fn(() => [documentType]),
        documentId: 'Id',
        document: documentSelector.getSelectorMockValue(),
      }

      componentWrapper = shallow(<ConnectedComponent {...defaultProps} />)
    })

    it('should render correct layout', () => {
      expect(componentWrapper).toMatchSnapshot()
    })

    it('should render correct actions', () => {
      const dropdownMenu = shallow(<div>{componentWrapper.find(Dropdown).props().dropdownRender()}</div>)
      expect(dropdownMenu).toMatchSnapshot()
    })

    it('should render disabled OpenLabelingToolButton in case of unsupported document extension', () => {
      defaultProps.document.state = DocumentState.IN_REVIEW
      FORBIDDEN_EXTENSIONS_TO_OPEN_LT.forEach((extension) => {
        defaultProps.document.files[0].blobName = extension
        componentWrapper.setProps(defaultProps)
        const itemsWrapper = shallow(<div>{componentWrapper.props().dropdownRender()}</div>)
        const openLtWrapper = itemsWrapper.find(OpenLabelingToolButton)
        expect(openLtWrapper.props().disabled).toBe(true)
      })
    })

    it('should call notifyRequest on updateDocumentType call', async () => {
      await componentWrapper.instance().updateDocumentType()
      expect(mockNotification.notifyProgress).nthCalledWith(1, localize(Localization.FETCHING_UPDATE_DOCUMENT_TYPE))
      expect(mockNotification.notifySuccess).nthCalledWith(1, localize(Localization.UPDATE_DOCUMENT_TYPE_SUCCESSFUL))
    })

    it('should render disabled OpenLabelingToolButton in case documentType is Unknown', () => {
      defaultProps.documentType = UNKNOWN_DOCUMENT_TYPE
      componentWrapper.setProps(defaultProps)
      const itemsWrapper = shallow(<div>{componentWrapper.props().dropdownRender()}</div>)
      const openLtWrapper = itemsWrapper.find(OpenLabelingToolButton)
      expect(openLtWrapper.props().disabled).toBe(true)
    })

    it('should render disabled SkipValidationButton in case documentType is Unknown', () => {
      defaultProps.documentType = UNKNOWN_DOCUMENT_TYPE
      defaultProps.documentType.extractionType = ExtractionType.TEMPLATE
      componentWrapper.setProps(defaultProps)
      const itemsWrapper = shallow(<div>{componentWrapper.props().dropdownRender()}</div>)
      const validationWrapper = itemsWrapper.find(SkipValidationButton)
      expect(validationWrapper.props().disabled).toBe(true)
    })

    it('should render disabled RunPipelineButton in case of document extension MSG/EML', () => {
      FORBIDDEN_EXTENSIONS_TO_LAUNCH_PIPELINE.forEach((extension) => {
        defaultProps.document.files[0].blobName = `mockName${extension}`
        componentWrapper.setProps(defaultProps)
        const itemsWrapper = shallow(<div>{componentWrapper.props().dropdownRender()}</div>)
        const pipelineMenuItem = itemsWrapper.find(RunPipelineButton).parent()
        expect(pipelineMenuItem.props().disabled).toBe(true)
      })
    })

    it('should not render button to view output archive if document extension is in the forbidden list', () => {
      FORBIDDEN_EXTENSIONS_FOR_OUTPUT_ACTIONS.forEach((extension) => {
        defaultProps.document.files[0].blobName = `mockName${extension}`
        componentWrapper.setProps(defaultProps)
        const itemsWrapper = shallow(<div>{componentWrapper.props().dropdownRender()}</div>)
        const outputArchiveWrapper = itemsWrapper.find(DocumentOutputArchiveButton)
        expect(outputArchiveWrapper.exists()).toBe(false)
      })
    })

    it('should render StudioTriggerButton when FEATURE_PROMPT_CALIBRATION_STUDIO is enabled', () => {
      const itemsWrapper = shallow(<div>{componentWrapper.props().dropdownRender()}</div>)
      const studioTriggerWrapper = itemsWrapper.find(StudioTriggerButton)
      expect(studioTriggerWrapper.exists()).toBe(true)
    })

    it('should not render StudioTriggerButton when FEATURE_PROMPT_CALIBRATION_STUDIO is disabled', () => {
      mockEnv.ENV.FEATURE_PROMPT_CALIBRATION_STUDIO = false
      componentWrapper = shallow(<ConnectedComponent {...defaultProps} />)
      const itemsWrapper = shallow(<div>{componentWrapper.props().dropdownRender()}</div>)
      const studioTriggerWrapper = itemsWrapper.find(StudioTriggerButton)
      expect(studioTriggerWrapper.exists()).toBe(false)
      mockEnv.ENV.FEATURE_PROMPT_CALIBRATION_STUDIO = true
    })

    it('should not render AgenticChatModalButton when FEATURE_AGENTIC_DOCUMENT_PROCESSING is disabled', () => {
      const itemsWrapper = shallow(<div>{componentWrapper.props().dropdownRender()}</div>)
      const agenticChatWrapper = itemsWrapper.find(AgenticChatModalButton)
      expect(agenticChatWrapper.exists()).toBe(false)
    })

    it('should render AgenticChatModalButton when FEATURE_AGENTIC_DOCUMENT_PROCESSING is enabled', () => {
      mockEnv.ENV.FEATURE_AGENTIC_DOCUMENT_PROCESSING = true
      componentWrapper = shallow(<ConnectedComponent {...defaultProps} />)
      const itemsWrapper = shallow(<div>{componentWrapper.props().dropdownRender()}</div>)
      const agenticChatWrapper = itemsWrapper.find(AgenticChatModalButton)
      expect(agenticChatWrapper.exists()).toBe(true)
      mockEnv.ENV.FEATURE_AGENTIC_DOCUMENT_PROCESSING = false
    })
  })
})
