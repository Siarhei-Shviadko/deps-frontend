
import { mockReact } from '@/mocks/mockReact'
import { mockComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { shallow } from 'enzyme'
import flushPromises from 'flush-promises'
import { documentsApi } from '@/api/documentsApi'
import { FilesStorage } from '@/enums/FilesStorage'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { MimeType } from '@/enums/MimeType'
import { UploadStatus } from '@/enums/UploadStatus'
import { Localization, localize } from '@/localization/i18n'
import { notifyError } from '@/utils/notification'
import { FileImportConfig } from '../models/FileImportConfig'
import { StorageFile } from '../models/StorageFile'
import { GoogleDriveUpload } from './GoogleDriveUpload'

const mockSharePermission = jest.fn()

jest.mock('react', () => mockReact())
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('@/utils/env', () => mockEnv)
jest.mock('./GoogleDrivePicker', () => mockComponent('GoogleDrivePicker'))
jest.mock('./useGoogleDriveApi', () => ({
  useGoogleDriveApi: jest.fn(() => ({
    sharePermission: mockSharePermission,
  })),
}))
jest.mock('@/api/documentsApi', () => ({
  documentsApi: {
    importDocuments: jest.fn(),
  },
}))

const mockFile = new StorageFile({
  id: 'id',
  sizeBytes: 123,
  name: 'name.pdf',
  mimeType: MimeType.APPLICATION_PDF,
})

const mockFileImportConfig = new FileImportConfig(
  {
    paths: [mockFile.id],
    source: FilesStorage.GOOGLE_DRIVE,
    language: KnownLanguage.ENGLISH,
    engine: KnownProcessingEngines.TESSERACT,
    documentType: 'mockDocTypeCode',
    invokeExtraction: true,
    assignedToMe: true,
  })

describe('Container: GoogleDriveUpload', () => {
  let wrapper
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      files: [mockFile],
      onFileValidationFailed: jest.fn(),
      onSizeValidationFailed: jest.fn(),
      onUploadComplete: jest.fn(),
      updateUploadStatus: jest.fn(),
      setFiles: jest.fn(),
      fileImportConfig: mockFileImportConfig,
      uploading: true,
      uploadStatus: undefined,
    }

    wrapper = shallow(<GoogleDriveUpload {...defaultProps} />)
  })

  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should call sharePermission when upload has been started', () => {
    const filesId = defaultProps.files.map(({ id }) => id)
    expect(mockSharePermission).nthCalledWith(1, {
      filesId,
    })
  })

  it('should call import files api request', () => {
    expect(documentsApi.importDocuments).nthCalledWith(1, mockFileImportConfig)
  })

  it('should update upload status when upload has been started ', () => {
    expect(defaultProps.updateUploadStatus).nthCalledWith(
      1,
      FilesStorage.GOOGLE_DRIVE,
      UploadStatus.PENDING,
    )
  })

  it('should call notifySuccess with correct message in case of requests success', () => {
    expect(defaultProps.updateUploadStatus).nthCalledWith(
      2,
      FilesStorage.GOOGLE_DRIVE,
      UploadStatus.SUCCESS,
    )
  })

  it('should call notifyError with correct message in case of requests fail', async () => {
    jest.clearAllMocks()
    const mockError = new Error('error')
    documentsApi.importDocuments.mockImplementation(() => Promise.reject(mockError))
    wrapper = shallow(<GoogleDriveUpload {...defaultProps} />)
    await flushPromises()
    expect(notifyError).nthCalledWith(1, localize(
      Localization.UPLOADS_FAILURE_STATUS, {
        storageName: localize(Localization.GOOGLE_DRIVE),
      },
    ))
  })

  it('should update upload status when upload has failed ', async () => {
    jest.clearAllMocks()
    const mockError = new Error('error')
    documentsApi.importDocuments.mockImplementation(() => Promise.reject(mockError))
    wrapper = shallow(<GoogleDriveUpload {...defaultProps} />)
    await flushPromises()
    expect(defaultProps.updateUploadStatus).nthCalledWith(
      2,
      FilesStorage.GOOGLE_DRIVE,
      UploadStatus.FAILURE,
    )
  })

  it('should call onUploadComplete after requests being complete', () => {
    expect(defaultProps.onUploadComplete).toHaveBeenCalled()
  })

  it('should not start uploading if defaultProps.uploading is set to false', () => {
    jest.clearAllMocks()
    wrapper.setProps({
      ...defaultProps,
      uploading: false,
    })

    expect(documentsApi.importDocuments).not.toHaveBeenCalled()
  })

  it('should not start uploading if there are no files', () => {
    jest.clearAllMocks()
    wrapper.setProps({
      ...defaultProps,
      files: [],
    })

    expect(documentsApi.importDocuments).not.toHaveBeenCalled()
  })
})
