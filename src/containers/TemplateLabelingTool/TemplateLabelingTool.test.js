
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import { fetchDocumentType } from '@/api/documentTypesApi'
import { templatesApi } from '@/api/templatesApi'
import { extractionFieldsApi } from '@/apiRTK/extractionFieldsApi'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { ExtractionType } from '@/enums/ExtractionType'
import { FieldType } from '@/enums/FieldType'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { StatusCode } from '@/enums/StatusCode'
import { DocumentTypeField } from '@/models/DocumentTypeField'
import { ExtendedDocumentType } from '@/models/ExtendedDocumentType'
import { TemplateVersion } from '@/models/TemplateVersion'
import { FileCache } from '@/services/FileCache'
import { ENV } from '@/utils/env'
import { fetchImage } from '@/utils/image'
import { navigationMap } from '@/utils/navigationMap'
import { goBack, goTo } from '@/utils/routerActions'
import { mapVersionMarkupToLabels } from './mappers'
import { TemplateLabelingTool } from '.'

const mockTemplateId = 'testId'
const mockVersionId = 'versionId'
const mockImageUrl = 'http://localhost:8003/api/v1/storage/file/test/preview/0.png'

const mockTemplateVersion = new TemplateVersion({
  id: mockVersionId,
  name: 'versionName',
  createdAt: 'versionDate',
  templateId: mockTemplateId,
  referencePages: [
    {
      id: 'testId',
      blobName: 'testBlob',
      markups: [],
    },
  ],
})

const mockTemplateFields = [
  new DocumentTypeField(
    'firstCode',
    'firstField',
    {},
    FieldType.STRING,
    false,
    0,
    mockTemplateId,
    'firstPk',
  ),
  new DocumentTypeField(
    'secondCode',
    'secondField',
    {},
    FieldType.STRING,
    false,
    0,
    mockTemplateId,
    'secondPk',
  ),
]

const mockErrorMessage = 'Mock Error Message'
const mockError = new Error(mockErrorMessage)

const mockMarkup = { 1: {} }
const newFieldsFromLT = [
  new DocumentTypeField(
    'firstCode',
    'firstField',
    undefined,
    FieldType.STRING,
    false,
    666,
    'firstCode',
    666,
  ),
  new DocumentTypeField(
    'secondCode',
    'secondField',
    undefined,
    FieldType.STRING,
    false,
    666,
    'secondCode',
    666,
  ),
]

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-redux', () => mockReactRedux)

jest.mock('@/utils/notification', () => mockNotification)
jest.mock('./mappers', () => ({
  mapVersionMarkupToLabels: jest.fn(() => mockMarkup),
}))

jest.mock('@/api/templatesApi', () => ({
  templatesApi: {
    saveVersionMarkup: jest.fn(),
    fetchTemplateVersion: jest.fn(() => Promise.resolve(mockTemplateVersion)),
  },
}))

const mockDocumentType = new ExtendedDocumentType({
  code: 'MarketingContract',
  name: 'MarketingContract',
  engine: KnownProcessingEngines.TESSERACT,
  extractionType: ExtractionType.TEMPLATE,
  fields: mockTemplateFields,
  llmExtractors: [],
})

jest.mock('@/api/documentTypesApi', () => ({
  fetchDocumentType: jest.fn(() => Promise.resolve(mockDocumentType)),
}))

jest.mock('@/apiRTK/extractionFieldsApi', () => ({
  extractionFieldsApi: {
    endpoints: {
      createExtractionField: {
        initiate: jest.fn(),
      },
      deleteExtractionField: {
        initiate: jest.fn(),
      },
    },
  },
}))

jest.mock('@/utils/routerActions', () => ({
  goBack: jest.fn(),
  goTo: jest.fn(() => {
    throw mockError
  }),
}))

jest.mock('@/services/FileCache', () => ({
  FileCache: {
    requestAndStore: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('@/utils/image', () => ({
  fetchImage: jest.fn(),
}))

const {
  ConnectedComponent,
  mapDispatchToProps,
} = TemplateLabelingTool

describe('Container: TemplateLabelingTool', () => {
  describe('ConnectedComponent', () => {
    let wrapper, defaultProps

    URL.createObjectURL = jest.fn()

    beforeEach(() => {
      jest.clearAllMocks()

      defaultProps = {
        templateId: mockTemplateId,
        versionId: mockVersionId,
        deleteExtractionField: jest.fn(),
        createExtractionField: jest.fn(),
      }

      ENV.FEATURE_FILE_CACHE = true

      wrapper = shallow(<ConnectedComponent {...defaultProps} />)
    })

    it('should render spinner', () => {
      wrapper.setState({ fetching: true })
      expect(wrapper).toMatchSnapshot()
    })

    it('should render correct layout', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('should call notifyRequest with correct argument when calling to saveMarkup', async () => {
      await wrapper.instance().saveMarkup(mockMarkup, null, null, newFieldsFromLT)

      expect(mockNotification.notifyProgress).nthCalledWith(1, 'Saving markup ...')
    })

    it('should call notifyError if field creation met with trial limits', async () => {
      const errorCode = 'trial_version_expired'
      const mockError = {
        response: {
          data: {
            code: errorCode,
          },
        },
      }

      defaultProps.createExtractionField.mockImplementationOnce(() => Promise.reject(mockError))

      const newField = new DocumentTypeField(
        'testCode',
        'tesField',
        undefined,
        FieldType.STRING,
        false,
        666,
        'tesCode',
        666,
      )

      const fields = [
        ...newFieldsFromLT,
        newField,
      ]

      await wrapper.instance().saveMarkup(mockMarkup, null, null, fields)

      expect(mockNotification.notifyError).nthCalledWith(1, RESOURCE_ERROR_TO_DISPLAY[errorCode])
    })

    it('should call mapVersionMarkupToLabels with correct arguments when calling to saveMarkup', async () => {
      await wrapper.instance().saveMarkup(mockMarkup, null, null, newFieldsFromLT)

      expect(mapVersionMarkupToLabels).nthCalledWith(
        1,
        mockTemplateVersion.referencePages,
        mockTemplateFields,
      )
    })

    it('should call templatesApi.saveVersionMarkup with correct arguments when calling to saveMarkup', async () => {
      await wrapper.instance().saveMarkup(mockMarkup, null, null, newFieldsFromLT)

      expect(templatesApi.saveVersionMarkup).nthCalledWith(
        1,
        {
          markup: mockMarkup,
          referencePages: mockTemplateVersion.referencePages,
          templateFields: mockTemplateFields,
          templateId: defaultProps.templateId,
          versionId: defaultProps.versionId,
        },
      )
    })

    it('should call mockSuccess with correct argument when calling to saveMarkup', async () => {
      await wrapper.instance().saveMarkup(mockMarkup, null, null, newFieldsFromLT)

      expect(mockNotification.notifySuccess).nthCalledWith(1, 'Markup was saved successfully')
    })

    it('should call mockWarning with correct arguments in case of templatesApi.saveVersionMarkup rejection when calling to saveMarkup', async () => {
      templatesApi.saveVersionMarkup.mockImplementationOnce(() => Promise.reject(mockError))
      try {
        await wrapper.instance().saveMarkup(mockMarkup, null, null, newFieldsFromLT)
        expect(mockNotification.notifyWarning).nthCalledWith(1, 'Something went wrong during markup saving')
      } catch (err) {
        expect(err.message).toBe(mockErrorMessage)
      }
    })

    it('should call field creation API with correct arguments if there are fieldsToSave', async () => {
      const newField = new DocumentTypeField(
        'testCode',
        'tesField',
        undefined,
        FieldType.STRING,
        false,
        666,
        'tesCode',
        666,
      )

      const fields = [
        ...newFieldsFromLT,
        newField,
      ]

      await wrapper.instance().saveMarkup(mockMarkup, null, null, fields)

      expect(defaultProps.createExtractionField).nthCalledWith(1, {
        documentTypeCode: defaultProps.templateId,
        field: newField,
      })
    })

    it('should call field deletion API with correct arguments if there are fieldsToDelete', async () => {
      const fields = [
        ...newFieldsFromLT,
      ]

      const removedField = fields.pop()

      await wrapper.instance().saveMarkup(mockMarkup, null, null, fields)

      expect(defaultProps.deleteExtractionField).nthCalledWith(1, {
        documentTypeCode: defaultProps.templateId,
        fieldCodes: [removedField.code],
      })
    })

    it('should call fetchDocumentType three times if there are fieldsToDelete', async () => {
      const fields = [
        ...newFieldsFromLT,
      ]

      fields.pop()

      await wrapper.instance().saveMarkup(mockMarkup, null, null, fields)

      expect(fetchDocumentType).toHaveBeenCalledTimes(3)
    })

    it('should call goBack when call close method', () => {
      wrapper.instance().close()

      expect(goBack).toHaveBeenCalledTimes(1)
    })

    it('should return true if call onDeactivate with force', async () => {
      wrapper.instance().force = true

      const result = await wrapper.instance().onDeactivate()

      expect(result).toBe(false)
    })

    it('should render CreateOrChangeTypeFieldDrawerButton when call getAddFieldForm method', () => {
      const Form = wrapper.instance().getAddFieldForm({
        onSave: jest.fn(),
        children: 'Test',
      })

      expect(<div>{Form}</div>).toMatchSnapshot()
    })

    it('should return correct value when call getDocument method', () => {
      const value = wrapper.instance().getDocument()

      expect(value).toEqual({
        pages: [
          `http://mockUrl.com/v5/file/${mockTemplateVersion.referencePages[0].blobName}`,
        ],
        name: mockTemplateVersion.name,
        extraName: mockDocumentType.name,
      })
    })

    it('should call goTo if fetchTemplateVersion fails with 404 code', async () => {
      const error = new Error()
      error.response = {
        status: StatusCode.NOT_FOUND,
      }

      templatesApi.fetchTemplateVersion.mockImplementationOnce(() => Promise.reject(error))

      try {
        await wrapper.instance().componentDidMount()
        expect(goTo).nthCalledWith(1, navigationMap.error.notFound())
      } catch (err) {
        expect(err.message).toBe(mockErrorMessage)
      }
    })

    it('should call fetchDocumentType when component did mount', () => {
      const extras = [
        DocumentTypeExtras.EXTRACTION_FIELDS,
        DocumentTypeExtras.LLM_EXTRACTORS,
      ]

      expect(fetchDocumentType).nthCalledWith(1, defaultProps.templateId, extras)
    })

    it('should not call FileCache.requestAndStore when component did mount if ENV.FEATURE_FILE_CACHE is disabled', () => {
      jest.clearAllMocks()
      ENV.FEATURE_FILE_CACHE = false

      wrapper = shallow(<ConnectedComponent {...defaultProps} />)

      expect(FileCache.requestAndStore).not.toHaveBeenCalled()
    })

    it('should call fetchImage when call getImage method if ENV.FEATURE_FILE_CACHE is disabled', async () => {
      jest.clearAllMocks()

      ENV.FEATURE_FILE_CACHE = false

      await wrapper.instance().getImage(mockImageUrl)

      expect(fetchImage).nthCalledWith(1, mockImageUrl)
    })

    it('should call fetchImage when call getImage method if FileCache.get do not return a blob', async () => {
      jest.clearAllMocks()

      await wrapper.instance().getImage(mockImageUrl)

      expect(fetchImage).nthCalledWith(1, mockImageUrl)
    })

    it('should call createObjectUrl with cached blob if FileCache.get returns a blob and FEATURE_FILE_CACHE is enabled', async () => {
      jest.clearAllMocks()

      const mockBlob = new Blob()

      FileCache.get.mockImplementationOnce(() => mockBlob)

      await wrapper.instance().getImage(mockImageUrl)

      expect(URL.createObjectURL).nthCalledWith(1, mockBlob)
    })
  })

  describe('mapDispatchToProps', () => {
    it('should dispatch correct action when calling to createExtractionField prop', () => {
      const { props } = mapDispatchToProps()
      props.createExtractionField()
      expect(extractionFieldsApi.endpoints.createExtractionField.initiate).toHaveBeenCalled()
    })

    it('should dispatch correct action when calling to deleteExtractionField prop', () => {
      const { props } = mapDispatchToProps()
      props.deleteExtractionField()
      expect(extractionFieldsApi.endpoints.deleteExtractionField.initiate).toHaveBeenCalled()
    })
  })
})
