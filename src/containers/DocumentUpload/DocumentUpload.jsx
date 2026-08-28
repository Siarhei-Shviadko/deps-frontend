
import isEmpty from 'lodash/isEmpty'
import isObject from 'lodash/isObject'
import PropTypes from 'prop-types'
import { PureComponent } from 'react'
import { connect } from 'react-redux'
import { refreshDocuments } from '@/actions/documentsListPage'
import { fetchDocumentTypes } from '@/actions/documentTypes'
import { fetchProcessingEngines } from '@/actions/engines'
import { Button, ButtonType } from '@/components/Button'
import { CommandBar } from '@/components/CommandBar'
import { ArrowRightOutlined } from '@/components/Icons/ArrowRightOutlined'
import { LaptopIcon } from '@/components/Icons/LaptopIcon'
import { LoadingIcon } from '@/components/Icons/LoadingIcon'
import { PlusFilledIcon } from '@/components/Icons/PlusFilledIcon'
import { SelectOptionModalButton } from '@/components/SelectOptionModalButton'
import { Tooltip } from '@/components/Tooltip'
import { SUPPORTED_EXTENSIONS_DOCUMENTS, SUPPORTED_TEXT_FORMATS } from '@/constants/common'
import { GoogleDriveUpload } from '@/containers/DocumentsStorages/GoogleDriveUpload'
import { FileImportConfig } from '@/containers/DocumentsStorages/models/FileImportConfig'
import { OneDriveUpload } from '@/containers/DocumentsStorages/OneDriveUpload'
import { DocumentUploadList } from '@/containers/DocumentUploadList'
import { DEFAULT_FORM_SETTINGS, DocumentUploadSettings } from '@/containers/DocumentUploadSettings'
import { UnsupportedFilesList } from '@/containers/UnsupportedFilesList'
import { ComponentSize } from '@/enums/ComponentSize'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { FilesStorage } from '@/enums/FilesStorage'
import { Placement } from '@/enums/Placement'
import { UploadStatus } from '@/enums/UploadStatus'
import { localize, Localization } from '@/localization/i18n'
import { DocumentType, documentTypeShape } from '@/models/DocumentType'
import { Engine, engineShape } from '@/models/Engine'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { processingEnginesSelector } from '@/selectors/engines'
import {
  areEnginesFetchingSelector,
  areTypesFetchingSelector,
} from '@/selectors/requests'
import { pathNameSelector } from '@/selectors/router'
import { getDocumentUploadService } from '@/services/DocumentUploadService'
import { theme } from '@/theme/theme.default'
import { ENV } from '@/utils/env'
import { getMime } from '@/utils/getMime'
import { navigationMap } from '@/utils/navigationMap'
import {
  notifySuccess,
  notifyWarning,
  notifyError,
} from '@/utils/notification'
import { throttleAndMergeArgs } from '@/utils/throttleAndMergeArgs'
import { DocumentTypeSelection } from './DocumentTypeSelection'
import {
  UploadWrapper,
  UploadContent,
  FilesPicker,
  UploadFooter,
  UploadFilesList,
  UploadButton,
  TitleWrapper,
  Drawer,
  AdditionalSettingsButton,
  IconWrapperCropped,
  IconWrapper,
  FilesPickerUploadButton,
  FilesPickerSectionButton,
  ButtonContentWrapper,
  ButtonContentBorderlessWrapper,
  StoragesWrapper,
} from './DocumentUpload.styles'

const UI_UPDATES_DELAY = 750

const KEY_CHANGE_TYPE = 'changeType'
const KEY_CHANGE_ENGINE = 'changeEngine'

const COMMAND_BAR_CUSTOM_SIZE = {
  width: '1.6rem',
  height: '1.6rem',
}

class DocumentUpload extends PureComponent {
  static propTypes = {
    engines: PropTypes.arrayOf(engineShape).isRequired,
    enginesFetching: PropTypes.bool,
    documentTypes: PropTypes.arrayOf(documentTypeShape).isRequired,
    documentTypesFetching: PropTypes.bool,
    refreshDocuments: PropTypes.func.isRequired,
    fetchProcessingEngines: PropTypes.func.isRequired,
    fetchDocumentTypes: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    isVisible: PropTypes.bool.isRequired,
    pathName: PropTypes.string.isRequired,
  }

  state = {
    filesStorage: {
      [FilesStorage.LOCAL]: [],
      [FilesStorage.GOOGLE_DRIVE]: [],
      [FilesStorage.ONE_DRIVE]: [],
    },
    uploadState: {
      [FilesStorage.LOCAL]: {},
      [FilesStorage.GOOGLE_DRIVE]: null,
      [FilesStorage.ONE_DRIVE]: null,
    },
    selectedDocumentType: undefined,
    selectedDocumentTypesGroup: undefined,
    uploading: false,
    areSettingsVisible: false,
    settings: DEFAULT_FORM_SETTINGS,
  }

  mergeDocumentUploadState = (uploadState, uploadStateUpdates) => Object.keys(uploadStateUpdates).reduce((acc, documentUid) => ({
    ...acc,
    [documentUid]: {
      ...acc[documentUid],
      ...uploadStateUpdates[documentUid],
      files: {
        ...(acc[documentUid] && acc[documentUid].files),
        ...(uploadStateUpdates[documentUid].files && uploadStateUpdates[documentUid].files),
      },
    },
  }), uploadState)

  _mergeCallback = (acc, [stateUpdate]) => this.mergeDocumentUploadState(acc, stateUpdate)

  constructor (props) {
    super(props)
    this.onDocumentUploadStateChange = throttleAndMergeArgs(
      this.onLocalUploadsStateChange,
      UI_UPDATES_DELAY,
      this._mergeCallback,
      {},
    )
  }

  componentDidMount () {
    this.props.fetchProcessingEngines()
    this.props.fetchDocumentTypes()
  }

  areLocalUploadsInProgress = () => {
    const uploadValues = Object.values(this.state.uploadState[FilesStorage.LOCAL])
    return (
      !!uploadValues.length &&
      uploadValues.some(({ status }) => status === UploadStatus.PENDING)
    )
  }

  getUploadReport = () => {
    const uploadDocs = Object.values(this.state.uploadState[FilesStorage.LOCAL])
    const totalCount = uploadDocs.length
    const successCount = uploadDocs.filter(({ status }) => status === UploadStatus.SUCCESS).length
    const failureCount = uploadDocs.filter(({ status }) => status === UploadStatus.FAILURE).length
    const uniqueErrors = uploadDocs.reduce((acc, doc) => {
      if (!doc.error) {
        return acc
      }

      const { code } = doc.error.response.data

      acc.add(code)
      return acc
    }, new Set())

    return {
      totalCount,
      successCount,
      failureCount,
      errors: [...uniqueErrors],
    }
  }

  showNotificationUploadStatus = () => {
    const uploadReport = this.getUploadReport()
    if (uploadReport.errors.length) {
      return uploadReport.errors.forEach((errorCode) => {
        const message = RESOURCE_ERROR_TO_DISPLAY[errorCode]
        message && notifyError(message)
      })
    }
    if (uploadReport.successCount === uploadReport.totalCount) {
      return notifySuccess(localize(
        Localization.UPLOADS_SUCCESS_STATUS, {
          storageName: localize(Localization.LOCAL_STORAGE),
        }))
    }
    if (uploadReport.failureCount === uploadReport.totalCount) {
      return notifyError(localize(
        Localization.UPLOADS_FAILURE_STATUS, {
          storageName: localize(Localization.LOCAL_STORAGE),
        },
      ))
    }
    return notifyWarning(localize(Localization.ALL_UPLOADS_WARNING_STATUS,
      {
        successCount: uploadReport.successCount,
        failureCount: uploadReport.failureCount,
        storageName: localize(Localization.LOCAL_STORAGE),
      }))
  }

  onLocalUploadsStateChange = (newUploadState) => {
    const shouldRefreshDocuments = this.props.pathName.includes(navigationMap.documents())

    this.setState((state) => ({
      ...state,
      uploadState: {
        ...state.uploadState,
        [FilesStorage.LOCAL]: this.mergeDocumentUploadState(
          state.uploadState[FilesStorage.LOCAL], newUploadState,
        ),
      },
    }), () => {
      if (!this.areLocalUploadsInProgress()) {
        this.showNotificationUploadStatus()
        shouldRefreshDocuments && this.props.refreshDocuments()
        this.onUploadComplete()
      }
    })
  }

  onDocumentTypeChange = (documentType) => {
    this.setState({
      selectedDocumentType: documentType,
    })
  }

  onDocumentTypesGroupChange = (group) => {
    this.setState({
      selectedDocumentTypesGroup: group,
    })

    const updatedDocuments = this.state.filesStorage[FilesStorage.LOCAL].map((doc) => ({
      ...doc,
      documentType: undefined,
    }))

    this.setState((prev) => ({
      filesStorage: {
        ...prev.filesStorage,
        [FilesStorage.LOCAL]: updatedDocuments,
      },
    }))
  }

  getEnginesOptions = () => Engine.toAllEnginesOptions(this.props.engines)

  getDocumentTypesOptions = () => {
    const { selectedDocumentTypesGroup } = this.state

    const adjustedDocumentTypes = selectedDocumentTypesGroup
      ? this.props.documentTypes?.filter(({ code }) => selectedDocumentTypesGroup.documentTypeIds.includes(code))
      : this.props.documentTypes

    return adjustedDocumentTypes.map(DocumentType.toOption)
  }

  onDocumentsChange = (documents) => {
    this.setState((prev) => ({
      uploadState: {
        ...prev.uploadState,
        [FilesStorage.LOCAL]: {},
      },
      filesStorage: {
        ...prev.filesStorage,
        [FilesStorage.LOCAL]: documents,
      },
    }))
  }

  addFiles = (document, files) => {
    const modifiedDocuments = this.state.filesStorage[FilesStorage.LOCAL].map((doc) => {
      if (doc === document) {
        doc.files = [...doc.files, ...files]
      }
      return doc
    })
    this.onDocumentsChange(modifiedDocuments)
  }

  showUnsupportedSizeMessage = () => notifyWarning(localize(Localization.FILE_SIZE_IS_TOO_LARGE))

  showNoValidFilesFound = () => notifyError(localize(Localization.ONLY_UNSUPPORTED_DOCUMENTS_SELECTED))

  renderUploadTrigger = () => (
    <Button.Text>
      {localize(Localization.ADD_FILES)}
    </Button.Text>
  )

  renderAddFilesOption = (document) => ({
    renderComponent: () => (
      <FilesPicker
        accept={SUPPORTED_EXTENSIONS_DOCUMENTS.join(', ')}
        disabled={this.state.uploading}
        onFilesSelected={(files) => this.addFiles(document, files)}
        onFilesValidationFailed={this.onFilesValidationFailed}
        renderUploadTrigger={this.renderUploadTrigger}
      />
    ),
    hidden: true,
  })

  deleteDocument = (document) => this.onDocumentsChange(
    this.state.filesStorage[FilesStorage.LOCAL].filter((d) => d !== document),
  )

  renderDeleteDocumentOption = (document) => ({
    renderComponent: () => (
      <Button.Text
        key='remove'
        onClick={() => this.deleteDocument(document)}
      >
        {localize(Localization.REMOVE_DOCUMENT)}
      </Button.Text>
    ),
    hidden: true,
  })

  changeDocument = (document, value) => this.onDocumentsChange(
    this.state.filesStorage[FilesStorage.LOCAL].map((d) => d !== document ? d : ({
      ...d,
      ...value,
    })),
  )

  renderChangeDocumentTypeOption = (document) => ({
    renderComponent: () => (
      <SelectOptionModalButton
        key={KEY_CHANGE_TYPE}
        emptySearchText={
          localize(Localization.EMPTY_SEARCH_TEXT, {
            object: `${localize(Localization.TYPE).toLowerCase()}`,
          })
        }
        fetching={this.props.documentTypesFetching}
        onSave={(documentType) => this.changeDocument(document, { documentType })}
        options={this.getDocumentTypesOptions()}
        placeholder={localize(Localization.PLACEHOLDER_DOCUMENT_TYPE)}
        saveButtonText={localize(Localization.CONFIRM)}
        title={localize(Localization.CHANGE_DOCUMENT_TYPE)}
      >
        {localize(Localization.OVERRIDE_DOCUMENT_TYPE)}
      </SelectOptionModalButton>
    ),
    hidden: true,
  })

  renderChangeDocumentEngineOption = (document) => ({
    renderComponent: () => (
      <SelectOptionModalButton
        key={KEY_CHANGE_ENGINE}
        emptySearchText={
          localize(Localization.EMPTY_SEARCH_TEXT, {
            object: `${localize(Localization.ENGINE).toLowerCase()}`,
          })
        }
        fetching={this.props.enginesFetching}
        onSave={(engine) => this.changeDocument(document, { engine })}
        options={this.getEnginesOptions()}
        placeholder={localize(Localization.PLACEHOLDER_DOCUMENT_ENGINE)}
        saveButtonText={localize(Localization.CONFIRM)}
        title={localize(Localization.CHANGE_DOCUMENT_ENGINE)}
      >
        {localize(Localization.OVERRIDE_DOCUMENT_ENGINE)}
      </SelectOptionModalButton>
    ),
    hidden: true,
  })

  getPopupContainer = (trigger) => trigger.parentNode.parentNode.parentNode

  renderDocumentControls = (document) => (
    <CommandBar
      commands={
        [
          ...(
            ENV.FEATURE_MULTIFILE_SESSION_UPLOAD
              ? [this.renderAddFilesOption(document)]
              : []
          ),
          this.renderDeleteDocumentOption(document),
          this.renderChangeDocumentTypeOption(document),
          this.renderChangeDocumentEngineOption(document),
        ]
      }
      customSize={COMMAND_BAR_CUSTOM_SIZE}
      disabled={this.state.uploading || this.areAllUploadsFinished()}
      getPopupContainer={this.getPopupContainer}
    />
  )

  renderDocumentUploadList = () => (
    this.state.filesStorage[FilesStorage.LOCAL] &&
    this.props.engines && (
      <DocumentUploadList
        disabled={this.state.uploading}
        documentTypes={this.getDocumentTypesOptions()}
        documents={this.state.filesStorage[FilesStorage.LOCAL]}
        engines={this.getEnginesOptions()}
        onDocumentsChange={this.onDocumentsChange}
        renderDocumentControls={this.renderDocumentControls}
        size={ComponentSize.SMALL}
        uploadState={this.state.uploadState[FilesStorage.LOCAL]}
        uploading={this.state.uploading}
      />
    ))

  onDocumentUploadSuccess = (document) => this.onDocumentUploadStateChange({
    [document.uid]: {
      status: UploadStatus.SUCCESS,
    },
  })

  onFileUploadProgress = (document, file, percent) => this.onDocumentUploadStateChange({
    [document.uid]: {
      status: UploadStatus.PENDING,
      files: {
        [file.uid]: percent,
      },
    },
  })

  onDocumentUploadError = (document, error) => this.onDocumentUploadStateChange({
    [document.uid]: {
      status: UploadStatus.FAILURE,
      error,
    },
  })

  uploadLocalDocuments = () => {
    const {
      engine,
      llmType,
      labels,
      parsingFeatures,
      shouldExtractData,
      shouldAssignToMe,
    } = this.state.settings

    const uploader = getDocumentUploadService(
      this.onFileUploadProgress,
      this.onDocumentUploadError,
      this.onDocumentUploadSuccess,
    )

    const documentTypeCode = this.state.selectedDocumentType?.code

    const documentsWithMeta = this.state.filesStorage[FilesStorage.LOCAL].map((document) => ({
      ...document,
      engine: document.engine ?? engine,
      groupId: this.state.selectedDocumentTypesGroup?.id,
      documentType: document.documentType ?? documentTypeCode,
      needsExtraction: shouldExtractData,
      assignedToMe: shouldAssignToMe,
      parsingFeatures,
      llmType,
      labelIds: labels.map((l) => l._id),
      needsUnifier: true,
      needsParsing: true,
    }))

    uploader.upload(documentsWithMeta)
  }

  onUploadClick = () => {
    this.setState({
      uploading: true,
    })

    this.state.filesStorage[FilesStorage.LOCAL].length && this.uploadLocalDocuments()
  }

  mapFileToDocument = (file) => ({
    uid: file.uid,
    name: file.name,
    files: [file],
  })

  addDocuments = (supportedFiles) => {
    if (this.areAllUploadsFinished()) {
      this.onStorageFilesChange(
        FilesStorage.LOCAL,
        supportedFiles.map(this.mapFileToDocument),
      )
    } else {
      this.onStorageFilesChange(
        FilesStorage.LOCAL, [
          ...this.state.filesStorage[FilesStorage.LOCAL],
          ...supportedFiles.map(this.mapFileToDocument),
        ])
    }
  }

  onFilesValidationFailed = (unsupportedFiles, fileList) => {
    notifyWarning(<UnsupportedFilesList files={unsupportedFiles} />)

    if (unsupportedFiles.length === fileList.length) {
      this.showNoValidFilesFound()
    }
  }

  getMime = async (file) => {
    if (SUPPORTED_TEXT_FORMATS.includes(file.type)) {
      return file.type
    }
    return await getMime(file)
  }

  renderFilesPickerMainButton = () => (
    <FilesPickerSectionButton
      disabled={this.state.upload}
      title={
        localize(
          Localization.SUPPORTED_FORMATS, {
            formats: SUPPORTED_EXTENSIONS_DOCUMENTS.join(', '),
          },
        )
      }
      type={ButtonType.GHOST}
    >
      <IconWrapperCropped>
        <LaptopIcon />
      </IconWrapperCropped>
      <ButtonContentWrapper>
        {localize(Localization.LOCAL_STORAGE)}
        <ArrowRightOutlined />
      </ButtonContentWrapper>
    </FilesPickerSectionButton>
  )

  renderFilesPickerSecondaryButton = () => (
    <FilesPickerUploadButton
      disabled={this.state.uploading}
      title={
        localize(
          Localization.SUPPORTED_FORMATS, {
            formats: SUPPORTED_EXTENSIONS_DOCUMENTS.join(', '),
          },
        )
      }
      type={ButtonType.GHOST}
    >
      <IconWrapper>
        <LaptopIcon />
      </IconWrapper>
      <ButtonContentBorderlessWrapper>
        <PlusFilledIcon />
        {localize(Localization.LOCAL_STORAGE_DOCUMENTS)}
      </ButtonContentBorderlessWrapper>
    </FilesPickerUploadButton>
  )

  renderFilesPicker = () => {
    const hasDocuments = !!this.state.filesStorage[FilesStorage.LOCAL].length
    const renderTrigger = hasDocuments
      ? this.renderFilesPickerSecondaryButton
      : this.renderFilesPickerMainButton

    return (
      <FilesPicker
        accept={SUPPORTED_EXTENSIONS_DOCUMENTS.join(', ')}
        description={
          localize(
            Localization.SUPPORTED_FORMATS, {
              formats: SUPPORTED_EXTENSIONS_DOCUMENTS.join(', '),
            },
          )
        }
        disabled={this.state.uploading}
        getMime={this.getMime}
        maxFileSize={ENV.MAX_FILE_SIZE_MB}
        onFileSizeValidationFailed={this.showUnsupportedSizeMessage}
        onFilesSelected={this.addDocuments}
        onFilesValidationFailed={this.onFilesValidationFailed}
        renderUploadTrigger={renderTrigger}
      />
    )
  }

  areDocumentsSelected = () => (
    Object.values(this.state.filesStorage).some(
      (files) => files.length,
    )
  )

  areAllUploadsFinished = () => {
    const stateValues = Object.values(this.state.uploadState).filter((val) => !isEmpty(val))
    return !!stateValues.length && (
      stateValues.every((state) => (
        isObject(state)
          ? Object.values(state).every(({ status }) => status !== UploadStatus.PENDING)
          : state !== UploadStatus.PENDING
      ))
    )
  }

  isDocumentTypeOrGroupMissing = () => (
    !this.state.selectedDocumentType && !this.state.selectedDocumentTypesGroup
  )

  renderUploadButton = () => {
    const disabled =
      this.isDocumentTypeOrGroupMissing() ||
      !this.areDocumentsSelected() ||
      this.state.uploading ||
      this.areAllUploadsFinished()

    return (
      <UploadButton
        disabled={disabled}
        onClick={this.onUploadClick}
        type={ButtonType.PRIMARY}
      >
        {this.state.uploading && <LoadingIcon />}
        {localize(Localization.UPLOAD_DOCUMENTS)}
      </UploadButton>
    )
  }

  renderUploadButtonWithTooltip = () => (
    <Tooltip title={localize(Localization.SELECT_DOCUMENT_TYPE_OR_GROUP_REQUIRED)}>
      {this.renderUploadButton()}
    </Tooltip>
  )

  toggleDrawer = () => {
    this.setState(({ areSettingsVisible }) => ({
      areSettingsVisible: !areSettingsVisible,
    }))
  }

  renderAdditionalSettingsButton = () => (
    <AdditionalSettingsButton
      onClick={this.toggleDrawer}
      type={ButtonType.LINK}
    >
      {localize(Localization.ADDITIONAL_SETTINGS)}
    </AdditionalSettingsButton>
  )

  renderDrawerTitle = () => (
    <TitleWrapper>
      {localize(Localization.UPLOAD_DOCUMENTS)}
    </TitleWrapper>
  )

  renderDrawerFooter = () => (
    <UploadFooter>
      {this.isDocumentTypeOrGroupMissing() && this.renderUploadButtonWithTooltip()}
      {!this.isDocumentTypeOrGroupMissing() && this.renderUploadButton()}
    </UploadFooter>
  )

  setDocumentUploadSettings = (settings) => {
    this.setState({
      settings,
    })
  }

  onStorageFilesChange = (storageName, files) => {
    const resetUploadState = {}
    const resetFilesStorage = {}

    if (this.areAllUploadsFinished()) {
      Object.keys(this.state.filesStorage)
        .forEach((key) => {
          resetFilesStorage[key] = []
          resetUploadState[key] = key === FilesStorage.LOCAL ? {} : null
        })
    }

    this.setState((prev) => ({
      uploadState: {
        ...prev.uploadState,
        ...resetUploadState,
      },
      filesStorage: {
        ...prev.filesStorage,
        ...resetFilesStorage,
        [storageName]: files,
      },
    }))
  }

  updateStorageUploadStatus = (storageName, status) => {
    this.setState((prev) => ({
      uploadState: {
        ...prev.uploadState,
        [storageName]: status,
      },
    }))
  }

  onUploadComplete = () => {
    if (this.areAllUploadsFinished()) {
      this.setState(({
        uploading: false,
      }))
    }
  }

  getFileImportConfig = (storageName) => {
    const filesId = this.state.filesStorage[storageName].map(({ id }) => id)

    return new FileImportConfig({
      paths: filesId,
      source: storageName,
      engine: this.state.settings.engine,
      invokeExtraction: this.state.settings.shouldExtractData,
      assignedToMe: this.state.settings.shouldAssignToMe,
      documentType: this.state.selectedDocumentType?.code,
      parsingFeatures: this.state.settings.parsingFeatures,
      llmType: this.state.settings.llmType,
    })
  }

  render = () => (
    <>
      <Drawer
        footer={this.renderDrawerFooter()}
        getContainer={() => document.body}
        hasCloseIcon={false}
        mask={!this.state.areSettingsVisible}
        onClose={this.props.onClose}
        open={this.props.isVisible}
        placement={Placement.RIGHT}
        push={false}
        title={this.renderDrawerTitle()}
        width={theme.size.drawerWidth}
      >
        <UploadWrapper>
          <UploadContent>
            <DocumentTypeSelection
              documentTypes={this.props.documentTypes}
              onDocumentTypeChange={this.onDocumentTypeChange}
              onGroupChange={this.onDocumentTypesGroupChange}
              selectedDocumentType={this.state.selectedDocumentType}
              selectedGroup={this.state.selectedDocumentTypesGroup}
            />
            {this.renderAdditionalSettingsButton()}
            {this.renderFilesPicker()}
          </UploadContent>
          <UploadFilesList>
            {this.renderDocumentUploadList()}
          </UploadFilesList>
          <StoragesWrapper>
            {
              ENV.GOOGLE_DRIVE_API_KEY &&
              ENV.GOOGLE_DRIVE_CLIENT_ID &&
              ENV.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL && (
                <GoogleDriveUpload
                  fileImportConfig={this.getFileImportConfig(FilesStorage.GOOGLE_DRIVE)}
                  files={this.state.filesStorage[FilesStorage.GOOGLE_DRIVE]}
                  onFileValidationFailed={this.onFilesValidationFailed}
                  onSizeValidationFailed={this.showUnsupportedSizeMessage}
                  onUploadComplete={this.onUploadComplete}
                  setFiles={this.onStorageFilesChange}
                  updateUploadStatus={this.updateStorageUploadStatus}
                  uploadStatus={this.state.uploadState[FilesStorage.GOOGLE_DRIVE]}
                  uploading={this.state.uploading}
                />
              )
            }
            {
              ENV.ONE_DRIVE_CLIENT_ID &&
              ENV.ONE_DRIVE_SERVICE_ACCOUNT_EMAIL && (
                <OneDriveUpload
                  fileImportConfig={this.getFileImportConfig(FilesStorage.ONE_DRIVE)}
                  files={this.state.filesStorage[FilesStorage.ONE_DRIVE]}
                  onFileValidationFailed={this.onFilesValidationFailed}
                  onSizeValidationFailed={this.showUnsupportedSizeMessage}
                  onUploadComplete={this.onUploadComplete}
                  setFiles={this.onStorageFilesChange}
                  updateUploadStatus={this.updateStorageUploadStatus}
                  uploadStatus={this.state.uploadState[FilesStorage.ONE_DRIVE]}
                  uploading={this.state.uploading}
                />
              )
            }
          </StoragesWrapper>
        </UploadWrapper>
      </Drawer>
      <DocumentUploadSettings
        isVisible={this.state.areSettingsVisible}
        onClose={this.toggleDrawer}
        setSettings={this.setDocumentUploadSettings}
      />
    </>
  )
}

const mapStateToProps = (state) => ({
  engines: processingEnginesSelector(state),
  enginesFetching: areEnginesFetchingSelector(state),
  documentTypes: documentTypesSelector(state),
  documentTypesFetching: areTypesFetchingSelector(state),
  pathName: pathNameSelector(state),
})

const mapDispatchToProps = {
  fetchProcessingEngines,
  fetchDocumentTypes,
  refreshDocuments,
}

const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(DocumentUpload)

export {
  ConnectedComponent as DocumentUpload,
}
