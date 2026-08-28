
import { mockButton } from '@/mocks/mockButton'
import { mockComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import { refreshDocuments } from '@/actions/documentsListPage'
import { PICKER_TYPES } from '@/components/FilesPicker'
import { GoogleDrivePicker } from '@/containers/DocumentsStorages/GoogleDriveUpload/GoogleDrivePicker'
import { OneDrivePicker } from '@/containers/DocumentsStorages/OneDriveUpload/OneDrivePicker'
import { DocumentUploadList } from '@/containers/DocumentUploadList'
import { DocumentUploadSettings } from '@/containers/DocumentUploadSettings'
import { UnsupportedFilesList } from '@/containers/UnsupportedFilesList/UnsupportedFilesList'
import { AuthType } from '@/enums/AuthType'
import { FilesStorage } from '@/enums/FilesStorage'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { UploadStatus } from '@/enums/UploadStatus'
import { localize, Localization } from '@/localization/i18n'
import { DocumentToUpload } from '@/models/DocumentToUpload'
import { DocumentType } from '@/models/DocumentType'
import { DocumentTypesGroup } from '@/models/DocumentTypesGroup'
import { Label } from '@/models/Label'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { processingEnginesSelector } from '@/selectors/engines'
import { getDocumentUploadService } from '@/services/DocumentUploadService'
import { ENV } from '@/utils/env'
import { navigationMap } from '@/utils/navigationMap'
import {
  notifySuccess,
  notifyWarning,
  notifyError,
} from '@/utils/notification'
import { throttleAndMergeArgs } from '@/utils/throttleAndMergeArgs'
import { DocumentTypeSelection } from './DocumentTypeSelection'
import { DocumentUpload } from './DocumentUpload'
import {
  AdditionalSettingsButton,
  Drawer,
  FilesPicker,
  UploadButton,
} from './DocumentUpload.styles'

jest.mock('@/containers/DocumentsStorages/GoogleDriveUpload', () => mockComponent('GoogleDriveUpload'))

jest.mock('react-redux', () => mockReactRedux)
jest.mock('@/components/Button', () => ({
  ...jest.requireActual('@/components/Button'),
  ...mockButton(),
}))
jest.mock('@/selectors/documentTypesListPage')
jest.mock('@/selectors/engines')
jest.mock('@/selectors/requests')

jest.mock('@/utils/throttleAndMergeArgs', () => ({
  throttleAndMergeArgs: jest.fn((fn) => (newUploadState) => fn(newUploadState)),
}))

jest.mock('@/utils/notification', () => ({
  notifyWarning: jest.fn(),
  notifyError: jest.fn(),
  notifySuccess: jest.fn(),
}))

const mockRefreshDocuments = 'mockRefreshDocuments'
jest.mock('@/actions/documentsListPage', () => ({
  refreshDocuments: jest.fn(() => mockRefreshDocuments),
}))
jest.mock('@/actions/documentTypes', () => ({
  fetchDocumentTypes: jest.fn(),
}))
jest.mock('@/actions/engines', () => ({
  fetchProcessingEngines: jest.fn(),
}))

const mockDocumentUploadMethod = jest.fn()
jest.mock('@/services/DocumentUploadService', () => ({
  getDocumentUploadService: jest.fn().mockImplementation(() => ({
    upload: mockDocumentUploadMethod,
  })),
}))
jest.mock('@/utils/env', () => mockEnv)

const mockDocumentWithOneFile = {
  uid: 'mockUIDFile1',
  name: 'date - mockDocumentName1.pdf',
  files: [
    {
      uid: 'mockUIDFile1',
      name: 'mockFileName1',
    },
  ],
}

describe('Component: DocumentUpload', () => {
  const {
    mapStateToProps,
    mapDispatchToProps,
    ConnectedComponent,
  } = DocumentUpload

  describe('mapStateToProps', () => {
    it('should call documentTypesSelector and pass the result as sources prop', () => {
      const { props } = mapStateToProps()
      const expectedResult = documentTypesSelector.getSelectorMockValue()

      expect(documentTypesSelector).toHaveBeenCalled()
      expect(props.documentTypes).toEqual(expectedResult)
    })

    it('should call processingEnginesSelector and pass the result as sources prop', () => {
      const { props } = mapStateToProps()

      expect(processingEnginesSelector).toHaveBeenCalled()
      expect(props.engines).toEqual(processingEnginesSelector.getSelectorMockValue())
    })
  })

  describe('mapDispatchToProps', () => {
    it('should pass refreshDocuments action as refreshDocuments property', () => {
      const { props } = mapDispatchToProps()

      props.refreshDocuments()
      expect(refreshDocuments).toHaveBeenCalledTimes(1)
    })
  })

  describe('ConnectedComponent', () => {
    let wrapper, defaultProps

    beforeEach(() => {
      jest.clearAllMocks()

      ENV.AUTH_TYPE = AuthType.OIDC
      ENV.GOOGLE_DRIVE_API_KEY = 'apiKey'
      ENV.GOOGLE_DRIVE_CLIENT_ID = 'clientId'
      ENV.ONE_DRIVE_CLIENT_ID = 'client id'
      ENV.ONE_DRIVE_SERVICE_ACCOUNT_EMAIL = 'service-account@example.com'
      ENV.FEATURE_MULTIFILE_SESSION_UPLOAD = true

      defaultProps = {
        documentTypes: documentTypesSelector.getSelectorMockValue(),
        shouldExtractData: true,
        engines: processingEnginesSelector.getSelectorMockValue(),
        refreshDocuments: jest.fn(),
        fetchProcessingEngines: jest.fn(),
        fetchDocumentTypes: jest.fn(),
        onClose: jest.fn(),
        isVisible: true,
        pathName: navigationMap.documents(),
      }

      wrapper = shallow(<ConnectedComponent {...defaultProps} />)
      ENV.AUTH_TYPE = AuthType.NO_AUTH
    })

    it('should call props.fetchProcessingEngines when component did mount', () => {
      expect(defaultProps.fetchProcessingEngines).toHaveBeenCalled()
    })

    it('should call props.fetchDocumentTypes when component did mount', () => {
      expect(defaultProps.fetchDocumentTypes).toHaveBeenCalled()
    })

    it('should pass correct callbacks to FilesPicker', () => {
      const mockDocument = 'document'
      const filesPicker = shallow(<div>{wrapper.instance().renderAddFilesOption(mockDocument).renderComponent()}</div>)
      expect(filesPicker.find(FilesPicker).props().onFileFormatValidationFailed).toEqual(wrapper.instance().showUnsupportedFormatMessage)
    })

    it('should correct render Add Files Option', () => {
      const filesPickerConfig = wrapper.instance().renderAddFilesOption()
      const filesPicker = shallow(filesPickerConfig.renderComponent())
      expect(filesPicker).toMatchSnapshot()
    })

    it('should correct render Delete Document Option', () => {
      const deleteDocumentOptionConfig = wrapper.instance().renderDeleteDocumentOption()
      const deleteDocumentOption = shallow(deleteDocumentOptionConfig.renderComponent())
      expect(deleteDocumentOption).toMatchSnapshot()
    })

    it('should correct render Change Document Type Option', () => {
      const selectOptionModalButtonConfig = wrapper.instance().renderChangeDocumentTypeOption()
      const selectOptionModalButton = shallow(selectOptionModalButtonConfig.renderComponent())
      expect(selectOptionModalButton).toMatchSnapshot()
    })

    it('should correct render Document Controls', () => {
      const renderDocumentControls = shallow(<div>{wrapper.instance().renderDocumentControls()}</div>)
      expect(renderDocumentControls).toMatchSnapshot()
    })

    it('should not render add document files option if FEATURE_MULTIFILE_SESSION_UPLOAD disabled', () => {
      ENV.FEATURE_MULTIFILE_SESSION_UPLOAD = false

      wrapper = shallow(<ConnectedComponent {...defaultProps} />)

      const renderDocumentControls = shallow(<div>{wrapper.instance().renderDocumentControls()}</div>)
      expect(renderDocumentControls.find(FilesPicker).exists()).toBe(false)
    })

    it('should render ConnectedComponent Upload with correct props', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('should call notification.warning with correct message when onFilesValidationFailed is called with unsupported and all files selected to upload', () => {
      const mockUnsupportedFiles = ['mockFile1', 'mockFile2']
      const mockFileList = ['mockFile1', 'mockFile2', 'mockFile3']
      wrapper.instance().onFilesValidationFailed(mockUnsupportedFiles, mockFileList)
      expect(notifyWarning).nthCalledWith(1, <UnsupportedFilesList files={mockUnsupportedFiles} />)
    })

    it('should call notification.error with correct message when calling to onFilesValidationFailed with no supported files', () => {
      const mockUnsupportedFiles = ['mockFile1', 'mockFile2']
      wrapper.instance().onFilesValidationFailed(mockUnsupportedFiles, mockUnsupportedFiles)
      expect(notifyError).nthCalledWith(1, localize(Localization.ONLY_UNSUPPORTED_DOCUMENTS_SELECTED))
    })

    it('should call notification.warning with correct message when calling to calling showUnsupportedSizeMessage', () => {
      wrapper.instance().showUnsupportedSizeMessage()
      expect(notifyWarning).toHaveBeenCalledWith(localize(Localization.FILE_SIZE_IS_TOO_LARGE))
    })

    it('should add document to DocumentUploadList when calling to addDocuments with a valid file', () => {
      wrapper.setState({
        uploadState: {
          [FilesStorage.LOCAL]: {
            mockUID1: {
              status: UploadStatus.SUCCESS,
              files: {
                mockUID1: 100,
              },
            },
          },
        },
      })

      const mockFile = {
        uid: 'mockUid1',
        name: 'mockName1',
      }

      wrapper.instance().addDocuments([mockFile], [])

      const documentUploadsProps = wrapper.find(DocumentUploadList).props()
      expect(documentUploadsProps.documents[0].files).toEqual([mockFile])
    })

    it('should render DocumentTypeSelection with correct onDocumentTypeChange prop', () => {
      const dtSelectionProps = wrapper.find(DocumentTypeSelection).props()
      expect(dtSelectionProps.onDocumentTypeChange).toEqual(wrapper.instance().onDocumentTypeChange)
    })

    it('should pass correct selectedDocumentType prop for DocumentTypeSelection', () => {
      const mockSource = new DocumentType(
        'testType1',
        'Test Type 1',
        'Test Engine Code 1',
        'Test Language Code 1',
      )
      wrapper.instance().onDocumentTypeChange(mockSource)
      const dtSelectionProps = wrapper.find(DocumentTypeSelection).props()
      expect(dtSelectionProps.selectedDocumentType).toEqual(mockSource)
    })

    it('should render DocumentTypeSelection with correct onGroupChange prop', () => {
      const dtSelectionProps = wrapper.find(DocumentTypeSelection).props()
      expect(dtSelectionProps.onGroupChange).toEqual(wrapper.instance().onDocumentTypesGroupChange)
    })

    it('should reset documentTypes in the uploaded documents on document types group change', () => {
      const mockDocument = new DocumentToUpload({
        uid: 'mockUID1',
        name: 'mockName.pdf',
        files: [],
      })

      const mockDocuments = [{
        ...mockDocument,
        documentType: 'code',
      }]

      const mockGroup = new DocumentTypesGroup({
        id: 'id1',
        name: 'Group1',
        documentTypeIds: ['1', '2'],
        createdAt: '2012-12-12',
      })

      wrapper.setState({
        filesStorage: {
          ...wrapper.state().filesStorage,
          [FilesStorage.LOCAL]: mockDocuments,
        },
      })

      wrapper.instance().onDocumentTypesGroupChange(mockGroup)

      const documentsProps = wrapper.find(DocumentUploadList).props()

      expect(documentsProps.documents).toEqual([mockDocument])
    })

    it('should pass correct selectedGroup prop for DocumentTypeSelection', () => {
      const mockSource = new DocumentTypesGroup({
        id: 'id1',
        name: 'Group1',
        documentTypeIds: ['1', '2'],
        createdAt: '2012-12-12',
      })
      wrapper.instance().onDocumentTypesGroupChange(mockSource)
      const DTSelectionProps = wrapper.find(DocumentTypeSelection).props()
      expect(DTSelectionProps.selectedGroup).toEqual(mockSource)
    })

    it('should pass correct disabled prop to Button in case state.filesStorage is empty', () => {
      wrapper.setState({
        filesStorage: {
          [FilesStorage.LOCAL]: [],
          [FilesStorage.GOOGLE_DRIVE]: [],
          [FilesStorage.ONE_DRIVE]: [],
        },
      })

      const FooterComponent = wrapper.find(Drawer).props().footer
      const footer = shallow(FooterComponent)

      const startUploadBtnProps = footer.find(UploadButton).props()
      expect(startUploadBtnProps.disabled).toEqual(true)
    })

    it('should disable Save button when no document type or document types group is selected', () => {
      wrapper.setState({
        filesStorage: {
          ...wrapper.state().filesStorage,
          [FilesStorage.LOCAL]: [mockDocumentWithOneFile],
        },
        selectedDocumentType: undefined,
        selectedDocumentTypesGroup: undefined,
      })

      const FooterComponent = wrapper.find(Drawer).props().footer
      const footer = shallow(FooterComponent)

      const startUploadBtnProps = footer.find(UploadButton).props()
      expect(startUploadBtnProps.disabled).toEqual(true)
    })

    it('should pass correct disabled prop to Button in case all documents are finished', () => {
      const mockDocuments = [{
        uid: 'mockUID1',
        name: 'mockName.pdf',
        files: [
          {
            uid: 'mockUID1',
            name: 'mockName.pdf',
          },
        ],
      }]

      wrapper.setState({
        filesStorage: {
          ...wrapper.state().filesStorage,
          [FilesStorage.LOCAL]: mockDocuments,
        },
        uploadState: {
          [FilesStorage.LOCAL]: {
            mockUID1: {
              files: {
                mockUID1: 100,
              },
              status: UploadStatus.SUCCESS,
            },
          },
        },
      })

      const FooterComponent = wrapper.find(Drawer).props().footer
      const footer = shallow(FooterComponent)

      const startUploadBtnProps = footer.find(UploadButton).props()
      expect(startUploadBtnProps.disabled).toEqual(true)
    })

    it('should pass correct onClick prop to Button', () => {
      const mockDocument = new DocumentToUpload({
        uid: 'mockUIDFile1',
        name: 'date - mockDocumentName1.pdf',
        files: [
          {
            uid: 'mockUIDFile1',
            name: 'mockFileName1',
          },
        ],
      })

      wrapper.setState({
        filesStorage: {
          ...wrapper.state().filesStorage,
          [FilesStorage.LOCAL]: [mockDocument],
        },
      })

      const FooterComponent = wrapper.find(Drawer).props().footer
      const footer = shallow(FooterComponent)

      const startUploadBtnProps = footer.find(UploadButton).props()
      expect(startUploadBtnProps.onClick).toEqual(wrapper.instance().onUploadClick)
    })

    it('should call DocumentUploader upload method with correct data in case clicking Start Upload Button', () => {
      const mockDocument = new DocumentToUpload({
        uid: 'mockUIDFile1',
        name: 'date - mockDocumentName1.pdf',
        files: [
          {
            uid: 'mockUIDFile1',
            name: 'mockFileName1',
          },
        ],
      })

      wrapper.setState({
        ...wrapper.state().uploadState,
        filesStorage: {
          ...wrapper.state().filesStorage,
          [FilesStorage.LOCAL]: [mockDocument],
        },
        settings: {
          engine: 'engineCode',
          llmType: 'LLM type',
          labels: [
            new Label('mockLabelId', 'Mock Label'),
          ],
          parsingFeatures: [
            KnownParsingFeature.TABLES,
            KnownParsingFeature.IMAGES,
          ],
          shouldExtractData: true,
          shouldAssignToMe: false,
        },
      })

      const FooterComponent = wrapper.find(Drawer).props().footer
      const footer = shallow(FooterComponent)

      const onFileUploadProgress = wrapper.instance().onFileUploadProgress
      const onDocumentUploadError = wrapper.instance().onDocumentUploadError
      const onDocumentUploadSuccess = wrapper.instance().onDocumentUploadSuccess

      const startUploadBtnProps = footer.find(UploadButton).props()
      startUploadBtnProps.onClick()

      expect(getDocumentUploadService).nthCalledWith(1, onFileUploadProgress, onDocumentUploadError, onDocumentUploadSuccess)
      jest.clearAllMocks()
    })

    it('should call DocumentUploader upload method with correct data in case clicking Start Upload Button', () => {
      const mockDocument = {
        uid: 'mockUID1',
        name: 'mockName.pdf',
        files: [
          {
            uid: 'mockUID1',
            name: 'mockName.pdf',
          },
        ],
      }

      wrapper.setState({
        filesStorage: {
          ...wrapper.state().filesStorage,
          [FilesStorage.LOCAL]: [mockDocument],
        },
        settings: {
          engine: 'mockEngineCode',
          labels: [
            new Label('mockLabelId', 'Mock Label'),
          ],
          llmType: 'LLM type',
          parsingFeatures: [
            KnownParsingFeature.TABLES,
            KnownParsingFeature.IMAGES,
          ],
          shouldExtractData: true,
          shouldAssignToMe: false,
        },
      })

      const FooterComponent = wrapper.find(Drawer).props().footer
      const footer = shallow(FooterComponent)

      const startUploadBtnProps = footer.find(UploadButton).props()
      startUploadBtnProps.onClick()

      const expected = [{
        ...mockDocument,
        assignedToMe: false,
        engine: 'mockEngineCode',
        documentType: undefined,
        groupId: undefined,
        labelIds: ['mockLabelId'],
        llmType: 'LLM type',
        needsExtraction: true,
        needsParsing: true,
        needsUnifier: true,
        parsingFeatures: [
          KnownParsingFeature.TABLES,
          KnownParsingFeature.IMAGES,
        ],
      }]
      expect(mockDocumentUploadMethod).nthCalledWith(1, expected)
      jest.clearAllMocks()
    })

    it('should pass correct onDocumentsChange prop to DocumentUploadList', () => {
      const documentUploadsProps = wrapper.find(DocumentUploadList).props()
      expect(documentUploadsProps.onDocumentsChange).toEqual(wrapper.instance().onDocumentsChange)
    })

    it('should pass correct uploadState and documents props to DocumentUploadList in case new documents upload', () => {
      const mockNewDocuments = [
        new DocumentToUpload({
          uid: 'mockUIDFile1',
          name: 'mockDocumentName1.pdf',
          files: [
            {
              uid: 'mockUIDFile1',
              name: 'mockFileName1',
            },
          ],
        }),
        new DocumentToUpload({
          uid: 'mockUIDFile2',
          name: 'mockDocumentName2.pdf',
          files: [
            {
              uid: 'mockUIDFile2',
              name: 'mockFileName2',
            },
          ],
        }),
      ]
      wrapper.setState({
        uploadState: {
          [FilesStorage.LOCAL]: {
            mockUID1: {
              status: UploadStatus.SUCCESS,
              files: {
                mockUID1: 100,
              },
            },
          },
        },
      })
      wrapper.instance().onDocumentsChange(mockNewDocuments)
      const documentUploadsProps = wrapper.find(DocumentUploadList).props()
      expect(documentUploadsProps.uploadState).toEqual({})
      expect(documentUploadsProps.documents).toEqual(mockNewDocuments)
    })

    it('should pass correct documents props to DocumentUploadList in case new files were added to the document', () => {
      const mockDocument2WithOneFile = {
        uid: 'mockUIDFile2',
        name: 'date - mockDocumentName2.pdf',
        files: [
          {
            uid: 'mockUIDFile2',
            name: 'mockFileName2',
          },
        ],
      }

      wrapper.setState({
        filesStorage: {
          ...wrapper.state().filesStorage,
          [FilesStorage.LOCAL]: [mockDocumentWithOneFile, mockDocument2WithOneFile],
        },
      })

      const mockDocFile = {
        uid: 'mockUIDFile2',
        name: 'mock Added',
      }
      wrapper.instance().addFiles(mockDocumentWithOneFile, [mockDocFile])
      const documentUploadsProps = wrapper.find(DocumentUploadList).props()
      expect(documentUploadsProps.documents).toMatchSnapshot()
    })

    it('should call throttleAndMergeArgs with correct arguments', () => {
      const wrapper = shallow(<ConnectedComponent {...defaultProps} />)
      const delay = 750
      expect(throttleAndMergeArgs).toHaveBeenCalledWith(wrapper.instance().onLocalUploadsStateChange, delay, wrapper.instance()._mergeCallback, {})
    })

    it('should call notifySuccess with correct arguments if document upload was successful', () => {
      const mockDocument = { uid: 'mockUID1' }
      wrapper.setState({
        uploadState: {
          [FilesStorage.LOCAL]: {
            mockUID1: {
              status: UploadStatus.PENDING,
              files: {},
            },
          },
        },
      })
      wrapper.instance().onDocumentUploadSuccess(mockDocument)
      expect(notifySuccess).nthCalledWith(1,
        localize(
          Localization.UPLOADS_SUCCESS_STATUS, {
            storageName: localize(Localization.LOCAL_STORAGE),
          }),
      )
    })

    it('should call props.refreshDocuments if upload has finished and user is on the Documents page', () => {
      const mockDocument = { uid: 'mockUID1' }

      wrapper.setState({
        uploadState: {
          [FilesStorage.LOCAL]: {
            mockUID1: {
              status: UploadStatus.PENDING,
              files: {},
            },
          },
        },
      })

      wrapper.instance().onDocumentUploadSuccess(mockDocument)

      expect(defaultProps.pathName).toBe(navigationMap.documents())
      expect(defaultProps.refreshDocuments).toHaveBeenCalledTimes(1)
    })

    it('should not call props.refreshDocuments if upload has finished but user is not on the Documents page', () => {
      const mockDocument = { uid: 'mockUID1' }

      wrapper.setState({
        uploadState: {
          [FilesStorage.LOCAL]: {
            mockUID1: {
              status: UploadStatus.PENDING,
              files: {},
            },
          },
        },
      })

      wrapper.setProps({
        ...defaultProps,
        pathName: 'path',
      })

      wrapper.instance().onDocumentUploadSuccess(mockDocument)

      expect(defaultProps.refreshDocuments).not.toHaveBeenCalled()
    })

    it('should call error notification with correct arguments if upload failed', () => {
      const mockDocument = { uid: 'mockUID1' }
      wrapper.instance().onDocumentUploadError(mockDocument)
      expect(notifyError).nthCalledWith(1,
        localize(
          Localization.UPLOADS_FAILURE_STATUS, {
            storageName: localize(Localization.LOCAL_STORAGE),
          },
        ),
      )
    })

    it('should call warning notification with correct arguments if some document failed but some are not', () => {
      const mockDocument1 = { uid: 'mockUID1' }
      const mockDocument2 = { uid: 'mockUID2' }
      wrapper.instance().onDocumentUploadError(mockDocument1)
      wrapper.instance().onDocumentUploadSuccess(mockDocument2)
      expect(notifyWarning).nthCalledWith(1,
        localize(Localization.ALL_UPLOADS_WARNING_STATUS, {
          successCount: 1,
          failureCount: 1,
          storageName: localize(Localization.LOCAL_STORAGE),
        }),
      )
    })

    it('should call error notification with correct arguments', () => {
      const mockDocument = { uid: 'mockUID' }
      const reason = {
        response: {
          data: {
            code: 'templates_limit_reached',
          },
        },
      }

      wrapper.instance().onDocumentUploadError(mockDocument, reason)
      expect(notifyError).nthCalledWith(1, 'Trial version limit exceeded')
    })

    it('shouldn`t call props.refreshDocuments in case not all documents are finished', () => {
      const mockDocument = { uid: 'mockUID1' }
      const mockFile = { uid: 'mockUID1' }
      const mockPercent = 42
      wrapper.instance().onFileUploadProgress(mockDocument, mockFile, mockPercent)
      expect(defaultProps.refreshDocuments).not.toHaveBeenCalled()
    })

    it('should pass correct type to FilesPicker in case empty state.filesStorage.local', () => {
      wrapper.setState({
        filesStorage: {
          ...wrapper.state().filesStorage,
          [FilesStorage.LOCAL]: [],
        },
      })

      const filesPickerProps = wrapper.find(FilesPicker).props()
      expect(filesPickerProps.type).toEqual(PICKER_TYPES.SECTION)
    })

    it('should pass correct callbacks to FilesPicker', () => {
      const filesPickerProps = wrapper.find(FilesPicker).props()
      expect(filesPickerProps.onFilesSelected).toEqual(wrapper.instance().addDocuments)
      expect(filesPickerProps.onFileSizeValidationFailed).toEqual(wrapper.instance().showUnsupportedSizeMessage)
      expect(filesPickerProps.onFilesValidationFailed).toEqual(wrapper.instance().onFilesValidationFailed)
    })

    it('should open settings drawer when click on AdditionalSettingsButton', () => {
      wrapper.find(AdditionalSettingsButton).props().onClick()

      expect(wrapper.find(DocumentUploadSettings).props().isVisible).toBe(true)
    })

    it('should not render GoogleDrivePicker if ENV.GOOGLE_DRIVE_API_KEY is empty', () => {
      ENV.GOOGLE_DRIVE_API_KEY = null

      wrapper = shallow(<ConnectedComponent {...defaultProps} />)

      expect(wrapper.find(GoogleDrivePicker).exists()).toBe(false)
    })

    it('should not render GoogleDrivePicker if ENV.GOOGLE_DRIVE_CLIENT_ID is empty', () => {
      ENV.GOOGLE_DRIVE_CLIENT_ID = null

      wrapper = shallow(<ConnectedComponent {...defaultProps} />)

      expect(wrapper.find(GoogleDrivePicker).exists()).toBe(false)
    })

    it('should not render OneDrivePicker if ENV.ONE_DRIVE_SERVICE_ACCOUNT_EMAIL is empty', () => {
      ENV.ONE_DRIVE_SERVICE_ACCOUNT_EMAIL = null

      wrapper = shallow(<ConnectedComponent {...defaultProps} />)

      expect(wrapper.find(OneDrivePicker).exists()).toBe(false)
    })

    it('should not render OneDrivePicker if ENV.ONE_DRIVE_CLIENT_ID is empty', () => {
      ENV.ONE_DRIVE_CLIENT_ID = null

      wrapper = shallow(<ConnectedComponent {...defaultProps} />)

      expect(wrapper.find(OneDrivePicker).exists()).toBe(false)
    })
  })
})
