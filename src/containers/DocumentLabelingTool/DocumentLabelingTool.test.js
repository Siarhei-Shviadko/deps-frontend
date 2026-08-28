
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { mockUuid } from '@/mocks/mockUuid'
import { shallow } from 'enzyme'
import { FieldType as FieldTypeLT } from 'labeling-tool/lib/enums/FieldType'
import { Field } from 'labeling-tool/lib/models/Field'
import { ListFieldMeta } from 'labeling-tool/lib/models/FieldMeta'
import {
  CellValue,
  Table,
} from 'labeling-tool/lib/models/Table'
import {
  extractArea,
  extractTable,
  detectTables,
  omrArea,
} from '@/actions/documentReviewPage'
import { fetchDocumentData } from '@/actions/documents'
import { fetchDocumentType } from '@/actions/documentType'
import { fetchProcessingEngines } from '@/actions/engines'
import { fetchAvailableLanguages } from '@/actions/languages'
import { documentsApi } from '@/api/documentsApi'
import { Tool, Panel, Feature, Mode } from '@/components/LabelingTool'
import { LabelingTool } from '@/components/LabelingTool/LabelingTool'
import { UiKeys } from '@/constants/navigation'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { FieldType } from '@/enums/FieldType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { Engine } from '@/models/Engine'
import {
  TableData,
  Cell,
} from '@/models/ExtractedData'
import { Rect } from '@/models/Rect'
import {
  documentSelector,
} from '@/selectors/documentReviewPage'
import { documentTypeStateSelector } from '@/selectors/documentType'
import { processingEnginesSelector } from '@/selectors/engines'
import { languagesSelector } from '@/selectors/languages'
import { uiSelector } from '@/selectors/navigation'
import { FileCache } from '@/services/FileCache'
import {
  extractDataAreaWithAlgorithm,
  extractDataTableWithAlgorithm,
} from '@/services/OCRExtractionService'
import { ENV } from '@/utils/env'
import { fetchImage } from '@/utils/image'
import { notifyWarning } from '@/utils/notification'
import { mapMarkupToExtractedData } from './mappers'
import { mapLtTableToEdTableData } from './mappers/mapTableToExtractedData'
import { mockMarkupTables } from './mappers/mocks/validMarkup'
import { DocumentLabelingTool } from '.'

const mockMarkup = { 1: {} }
const mockNewExtractedData = []
const mockEngine = 'mockEngine'
const mockTableEngine = 'mockEngine'
const mockImageUrl = 'http://mockUrl.com/v5/file/test/preview/0.png'
const mockLabelCoords = new Rect(0.1, 0.1, 0.2, 0.2)
const mockDetectCoords = new Rect(0.2, 0.2, 0.3, 0.3)
const mockLanguage = KnownLanguage.RUSSIAN
const mockRotationAngle = 90
const mockRotationAngles = {}
const mockWithoutExtraction = true

jest.mock('@/utils/env', () => ({
  ENV: {
    ...mockEnv.ENV,
  },
}))
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('react-redux', () => mockReactRedux)
jest.mock('uuid', () => mockUuid)
jest.mock('@/selectors/documentReviewPage')
jest.mock('@/selectors/documentType')
jest.mock('@/selectors/engines')
jest.mock('@/selectors/languages')
jest.mock('@/selectors/navigation')
jest.mock('./mappers', () => ({
  mapExtractedDataToMarkup: jest.fn(() => mockMarkup),
  mapMarkupToExtractedData: jest.fn(() => mockNewExtractedData),
}))

jest.mock('@/utils/routerActions', () => ({
  goBack: jest.fn(),
}))

jest.mock('@/utils/image', () => ({
  fetchImage: jest.fn(),
}))

jest.mock('@/api/documentsApi', () => ({
  documentsApi: {
    saveExtractedData: jest.fn(() => Promise.resolve({})),
  },
}))

jest.mock('@/actions/documentType', () => ({
  fetchDocumentType: jest.fn(),
}))

jest.mock('@/actions/documents', () => ({
  fetchDocumentData: jest.fn(),
}))

jest.mock('@/actions/engines', () => ({
  fetchProcessingEngines: jest.fn(),
}))

jest.mock('@/actions/languages', () => ({
  fetchAvailableLanguages: jest.fn(),
}))

jest.mock('@/actions/documentReviewPage', () => ({
  detectTables: jest.fn(),
  extractArea: jest.fn(),
  extractTable: jest.fn(),
  omrArea: jest.fn(),
}))

jest.mock('@/services/OCRExtractionService', () => ({
  extractDataAreaWithAlgorithm: jest.fn(),
  extractDataTableWithAlgorithm: jest.fn(),
  OCRGridCache: new Map(),
}))

jest.mock('@/services/FileCache', () => ({
  FileCache: {
    requestAndStore: jest.fn(),
    get: jest.fn(),
  },
}))

const { mapStateToProps, mapDispatchToProps, ConnectedComponent } = DocumentLabelingTool

describe('Container: DocumentLabelingTool', () => {
  describe('mapStateToProps', () => {
    let props

    beforeEach(() => {
      props = mapStateToProps().props
    })

    it('should map documentType property from the application state', () => {
      expect(props.documentType).toBe(documentTypeStateSelector.getSelectorMockValue())
    })

    it('should map previewDocuments property from the application state', () => {
      expect(props.document.previewDocuments).toBe(documentSelector.getSelectorMockValue().previewDocuments)
    })

    it('should map processingDocuments property from the application state', () => {
      expect(props.document.processingDocuments).toBe(documentSelector.getSelectorMockValue().processingDocuments)
    })

    it('should map extractedData property from the application state', () => {
      expect(props.document.extractedData).toBe(documentSelector.getSelectorMockValue().extractedData)
    })

    it('should map initialPage property from the application state', () => {
      expect(props.initialPage).toBe(uiSelector.getSelectorMockValue()[UiKeys.ACTIVE_PAGE])
    })

    it('should map engines property from the application state', () => {
      expect(props.engines).toBe(processingEnginesSelector.getSelectorMockValue())
    })

    it('should map languages property from the application state', () => {
      expect(props.languages).toBe(languagesSelector.getSelectorMockValue())
    })
  })

  describe('mapDispatchToProps', () => {
    let props
    beforeEach(() => {
      props = mapDispatchToProps().props
    })

    it('should pass extractArea action as extractArea property', () => {
      props.extractArea()
      expect(extractArea).toHaveBeenCalledTimes(1)
    })

    it('should pass extractTable action as extractArea property', () => {
      props.extractTable()
      expect(extractTable).toHaveBeenCalledTimes(1)
    })

    it('should pass fetchProcessingEngines action as fetchProcessingEngines property', () => {
      props.fetchProcessingEngines()
      expect(fetchProcessingEngines).toHaveBeenCalledTimes(1)
    })

    it('should pass fetchAvailableLanguages action as fetchAvailableLanguages property', () => {
      props.fetchAvailableLanguages()
      expect(fetchAvailableLanguages).toHaveBeenCalledTimes(1)
    })

    it('should pass detectTables action as detectTables property', () => {
      props.detectTables()
      expect(detectTables).toHaveBeenCalledTimes(1)
    })

    it('should pass omrArea action as omrArea property', () => {
      props.omrArea()
      expect(omrArea).toHaveBeenCalledTimes(1)
    })

    it('should pass fetchDocumentData action as fetchDocumentData property', () => {
      props.fetchDocumentData()
      expect(fetchDocumentData).toHaveBeenCalledTimes(1)
    })

    it('should pass fetchDocumentType action as fetchDocumentType property', () => {
      props.fetchDocumentType()
      expect(fetchDocumentType).toHaveBeenCalledTimes(1)
    })
  })

  describe('connected Component', () => {
    let wrapper, defaultProps

    URL.createObjectURL = jest.fn()

    const mockRecognized = {
      content: 'testValue',
      confidence: 0.99,
    }
    const mockBoolRecognized = {
      content: false,
      confidence: 0.11,
    }

    beforeEach(() => {
      jest.clearAllMocks()

      defaultProps = {
        detectTables: jest.fn(),
        extractTable: jest.fn(),
        extractArea: jest.fn(() => Promise.resolve(mockRecognized)),
        omrArea: jest.fn(() => Promise.resolve(mockBoolRecognized)),
        document: documentSelector.getSelectorMockValue(),
        documentId: 'mockDocumentId',
        engines: processingEnginesSelector.getSelectorMockValue(),
        languages: languagesSelector.getSelectorMockValue(),
        documentType: documentTypeStateSelector.getSelectorMockValue(),
        fetchDocumentType: jest.fn(),
        fetchDocumentData: jest.fn(() =>
          Promise.resolve(documentSelector.getSelectorMockValue()),
        ),
        fetchProcessingEngines: jest.fn(),
        fetchAvailableLanguages: jest.fn(),
        initialPage: uiSelector.getSelectorMockValue()[UiKeys.ACTIVE_PAGE],
      }

      ENV.FEATURE_OCR_INTERSECTION_ALGORITHM = false
      ENV.FEATURE_FILE_CACHE = true

      wrapper = shallow(<ConnectedComponent {...defaultProps} />)
    })

    it('should call props.fetchProcessingEngines when component did mount', () => {
      expect(defaultProps.fetchProcessingEngines).toHaveBeenCalled()
    })

    it('should call props.fetchAvailableLanguages when component did mount', () => {
      expect(defaultProps.fetchAvailableLanguages).toHaveBeenCalled()
    })

    it('should not call FileCache.requestAndStore when component did mount if ENV.FEATURE_FILE_CACHE is disabled', () => {
      jest.clearAllMocks()
      ENV.FEATURE_FILE_CACHE = false

      wrapper = shallow(<ConnectedComponent {...defaultProps} />)

      expect(FileCache.requestAndStore).not.toHaveBeenCalled()
    })

    it('should render spinner', async () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('should render correct layout', async () => {
      wrapper.setState({ fetching: false })
      expect(wrapper).toMatchSnapshot()
    })

    it('should call props.fetchDocumentData with document id from match.params', () => {
      expect(defaultProps.fetchDocumentData).nthCalledWith(1, defaultProps.documentId, true)
    })

    it('should call props.fetchDocumentType with correct arguments', () => {
      expect(defaultProps.fetchDocumentType).nthCalledWith(
        1,
        defaultProps.document.documentType.code,
        [DocumentTypeExtras.EXTRACTION_FIELDS],
      )
    })

    it('should create correct config for LabelingTool', () => {
      const expectedConfig = {
        document: {
          pages: Object.values(defaultProps.document.previewDocuments).map((preview) => `http://mockUrl.com/v5/file/${preview.blobName}`),
          language: defaultProps.document.language,
          name: wrapper.instance().getDocumentName(defaultProps.document.title),
          engine: defaultProps.document.engine,
        },
        fields: [
          new Field('verticalReference', 'Vertical Reference', FieldTypeLT.STRING),
          new Field('glElevation', 'GL Elevation', FieldTypeLT.STRING),
          new Field('table', 'Table', FieldTypeLT.TABLE),
          new Field('listOfTables', 'List Of Tables', FieldTypeLT.LIST, new ListFieldMeta(FieldType.TABLE)),
          new Field('fieldCode', 'Field Name', FieldTypeLT.STRING),
          new Field('listOfCheckboxes', 'List Of Checkboxes', FieldTypeLT.LIST, new ListFieldMeta(FieldType.CHECKMARK)),
        ],
        events: {
          onClose: wrapper.instance().onClose.subscribe,
        },
        api: {
          close: wrapper.instance().close,
          detectTables: wrapper.instance().detectTables,
          getImage: wrapper.instance().getImage,
          notify: {
            error: mockNotification.notifyError,
            info: mockNotification.notifyInfo,
            success: mockNotification.notifySuccess,
            warning: mockNotification.notifyWarning,
          },
          save: wrapper.instance().saveWithExtraction,
          saveMarkup: wrapper.instance().saveMarkup,
          omrArea: wrapper.instance().omrArea,
          ocrText: wrapper.instance().ocrText,
          ocrTable: wrapper.instance().ocrTable,
        },
        ocr: {
          engines: Engine.getAvailableEngines(processingEnginesSelector.getSelectorMockValue()),
          languages: defaultProps.languages,
        },
        markup: mockMarkup,
        settings: {
          mode: Mode.DEFAULT,
          features: [
            Feature.EXPORT,
            Feature.IMPORT,
            {
              code: Feature.PAGING,
              data: {
                initialPage: 1,
              },
            },
            Feature.LANGUAGE,
            Feature.SPECIAL_SYMBOLS,
            {
              code: Feature.AUTO_SAVE,
              data: {
                interval: 180000,
              },
            },
          ],
          panels: [
            Panel.TOOLBAR,
            Panel.MARKUP_SIDEBAR,
            Panel.LEFT_SIDEBAR,
          ],
          tools: [
            Tool.DETECT_TABLES,
            Tool.LABEL,
            Tool.TABLE,
            Tool.MERGE,
            Tool.SPLIT,
            Tool.POINTER,
            Tool.GRABBING,
          ],
        },
      }

      expect(wrapper.instance().getConfig()).toEqual(expectedConfig)
    })

    it('should get correct document object from LabelingTool config', () => {
      const expectedDocumentObject = {
        pages: Object.values(defaultProps.document.previewDocuments).map((preview) => `http://mockUrl.com/v5/file/${preview.blobName}`),
        language: defaultProps.document.language,
        name: wrapper.instance().getDocumentName(defaultProps.document.title),
        engine: defaultProps.document.engine,
      }
      const { document } = wrapper.find(LabelingTool).props().config
      expect(document).toEqual(expectedDocumentObject)
    })

    it('should call notifyRequest with correct argument when calling to save', async () => {
      await wrapper.find(LabelingTool).props().config.api.save(mockMarkup, mockRotationAngles, mockLanguage, wrapper.instance().notifyExtraction)
      expect(mockNotification.notifyProgress).nthCalledWith(1, 'Extracting data...')
      expect(mockNotification.notifyProgress).nthCalledWith(2, 'Saving markup ...')
    })

    it('should call mapMarkupToExtractedData with correct arguments when calling to save', async () => {
      await wrapper.find(LabelingTool).props().config.api.save(mockMarkup, mockRotationAngles, mockLanguage, wrapper.instance().notifyExtraction)

      expect(mapMarkupToExtractedData).nthCalledWith(
        1,
        mockMarkup,
        defaultProps.documentType,
        defaultProps.document.processingDocuments,
        mockLanguage,
        defaultProps.document.engine,
        false,
        defaultProps.document.unifiedData,
        defaultProps.document.extractedData,
      )
    })

    it('should call mapMarkupToExtractedData with correct arguments when calling to saveMarkup', async () => {
      await wrapper.find(LabelingTool).props().config.api.saveMarkup(mockMarkup, mockRotationAngles, mockLanguage)

      expect(mapMarkupToExtractedData).nthCalledWith(
        1,
        mockMarkup,
        defaultProps.documentType,
        defaultProps.document.processingDocuments,
        mockLanguage,
        defaultProps.document.engine,
        mockWithoutExtraction,
        defaultProps.document.unifiedData,
        defaultProps.document.extractedData,
      )
    })

    it('should call notifyRequest with correct argument when calling to saveMarkup', async () => {
      await wrapper.find(LabelingTool).props().config.api.saveMarkup(mockMarkup, mockRotationAngles, mockLanguage)
      expect(mockNotification.notifyProgress).nthCalledWith(1, 'Saving markup ...')
    })

    it('should call mapMarkupToExtractedData with language from document when calling to save', async () => {
      await wrapper.find(LabelingTool).props().config.api.save(mockMarkup, mockRotationAngles, undefined, wrapper.instance().notifyExtraction)

      expect(mapMarkupToExtractedData).nthCalledWith(
        1,
        mockMarkup,
        defaultProps.documentType,
        defaultProps.document.processingDocuments,
        defaultProps.document.language,
        defaultProps.document.engine,
        false,
        defaultProps.document.unifiedData,
        defaultProps.document.extractedData,
      )
    })

    it('should call mapMarkupToExtractedData with language from documentType when calling to save', async () => {
      defaultProps.document.language = undefined
      wrapper.setProps(defaultProps)
      await wrapper.find(LabelingTool).props().config.api.save(mockMarkup, mockRotationAngles, undefined, wrapper.instance().notifyExtraction)

      expect(mapMarkupToExtractedData).nthCalledWith(
        1,
        mockMarkup,
        defaultProps.documentType,
        defaultProps.document.processingDocuments,
        defaultProps.documentType.language,
        defaultProps.document.engine,
        false,
        defaultProps.document.unifiedData,
        defaultProps.document.extractedData,
      )
    })

    it('should call documentsApi.saveExtractedData with correct arguments when calling to save', async () => {
      await wrapper.find(LabelingTool).props().config.api.save(mockMarkup, mockRotationAngles, mockLanguage, wrapper.instance().notifyExtraction)

      expect(documentsApi.saveExtractedData).nthCalledWith(1, mockNewExtractedData, defaultProps.documentId)
    })

    it('should call mockSuccess with correct argument when calling to save', async () => {
      await wrapper.find(LabelingTool).props().config.api.save(mockMarkup, mockRotationAngles, mockLanguage, wrapper.instance().notifyExtraction)

      expect(mockNotification.notifySuccess).nthCalledWith(1, 'Markup was saved successfully')
    })

    it('should return new markup after calling to save', async () => {
      const markup = await wrapper.find(LabelingTool).props().config.api.save(mockMarkup, mockRotationAngles, mockLanguage, wrapper.instance().notifyExtraction)

      expect(markup).toEqual(mockMarkup)
    })

    it('should call mockWarning with correct arguments in case of documentsApi.saveExtractedData rejection when calling to save', async () => {
      documentsApi.saveExtractedData.mockImplementationOnce(() => Promise.reject(new Error('error')))
      await wrapper.find(LabelingTool).props().config.api.save(mockMarkup, mockRotationAngles, mockLanguage, wrapper.instance().notifyExtraction)

      expect(mockNotification.notifyWarning).nthCalledWith(1, 'Something went wrong during markup saving')
    })

    it('should call mockWarning with correct arguments in case of mapMarkupToExtractedData rejection when calling to save', async () => {
      mapMarkupToExtractedData.mockImplementationOnce(() => Promise.reject(new Error('error')))
      await wrapper.find(LabelingTool).props().config.api.save(mockMarkup, mockRotationAngles, mockLanguage, wrapper.instance().notifyExtraction)

      expect(mockNotification.notifyWarning).nthCalledWith(1, 'Something went wrong during markup mapping to the extracted data')
    })

    it('should call mock Warning with correct arguments in case of error when saving', async () => {
      mapMarkupToExtractedData.mockImplementationOnce(() => Promise.reject(new Error('error')))
      documentsApi.saveExtractedData.mockImplementationOnce(() => Promise.reject(new Error('error')))
      await wrapper.instance().save(mockMarkup, undefined, undefined, wrapper.instance().notifyExtraction)

      expect(mockNotification.notifyWarning).nthCalledWith(2, 'Something went wrong during markup saving')
    })

    it('should call notifyRequest with correct argument when calling to ocrText', async () => {
      await wrapper.instance().ocrText(mockEngine, mockImageUrl, mockLabelCoords)
      expect(mockNotification.notifyProgress).nthCalledWith(1, 'Value extracting')
    })

    it('should call notifyRequest with correct argument when calling to omrArea', async () => {
      await wrapper.instance().omrArea(mockImageUrl, mockLabelCoords)
      expect(mockNotification.notifyProgress).nthCalledWith(1, 'Value extracting')
    })

    it('should call props extractArea with correct arguments when calling to ocrText and empty unified data', async () => {
      defaultProps.document = {
        ...defaultProps.document,
        unifiedData: undefined,
      }
      wrapper.setProps(defaultProps)
      await wrapper.instance().ocrText(mockEngine, mockImageUrl, mockLabelCoords, mockLanguage)

      const { blobName } = defaultProps.document.processingDocuments['1']

      expect(defaultProps.extractArea).nthCalledWith(1, blobName, mockLabelCoords, mockEngine, mockLanguage)
    })

    it('should call props omrArea with correct arguments when calling to omrArea and empty unified data', async () => {
      defaultProps.document = {
        ...defaultProps.document,
        unifiedData: undefined,
      }
      wrapper.setProps(defaultProps)
      await wrapper.instance().omrArea(mockImageUrl, mockLabelCoords)

      const { blobName } = defaultProps.document.processingDocuments['1']

      expect(defaultProps.omrArea).nthCalledWith(1, blobName, mockLabelCoords)
    })

    it('should call props extractArea with correct arguments when calling to ocrText and unified data exists', async () => {
      const mockUnifiedData = {
        22: [
          {
            appliedTransformation: {
              name: 'rotation',
              parameters: {
                args: [],
                kwargs: { angle: 0 },
              },
            },
            blobName: 'test/preview/22.png',
            height: 3509,
            id: 'c626d5ee3c964e31aaf2e2c7170823ba',
            originalImageId: null,
            page: 22,
            width: 2480,
          },
        ],
      }

      const mockImageUrl = 'http://mockUrl.com/v5/file/test/preview/22.png'

      defaultProps.document = {
        ...defaultProps.document,
        unifiedData: mockUnifiedData,
      }

      wrapper.setProps(defaultProps)
      await wrapper.instance().ocrText(mockEngine, mockImageUrl, mockLabelCoords, mockLanguage)

      const { blobName } = defaultProps.document.unifiedData['22'][0]

      expect(defaultProps.extractArea).nthCalledWith(1, blobName, mockLabelCoords, mockEngine, mockLanguage)
    })

    it('should call props omrArea with correct arguments when calling to omrArea and unified data exists', async () => {
      const mockUnifiedData = {
        22: [
          {
            appliedTransformation: {
              name: 'rotation',
              parameters: {
                args: [],
                kwargs: { angle: 0 },
              },
            },
            blobName: 'test/preview/22.png',
            height: 3509,
            id: 'c626d5ee3c964e31aaf2e2c7170823ba',
            originalImageId: null,
            page: 22,
            width: 2480,
          },
        ],
      }

      const mockImageUrl = 'http://mockUrl.com/v5/file/test/preview/22.png'

      defaultProps.document = {
        ...defaultProps.document,
        unifiedData: mockUnifiedData,
      }

      wrapper.setProps(defaultProps)
      await wrapper.instance().omrArea(mockImageUrl, mockLabelCoords)

      const { blobName } = defaultProps.document.unifiedData['22'][0]

      expect(defaultProps.omrArea).nthCalledWith(1, blobName, mockLabelCoords)
    })

    it('should call mockSuccess with correct argument when calling to ocrText', async () => {
      await wrapper.instance().ocrText(mockEngine, mockImageUrl, mockLabelCoords)

      expect(mockNotification.notifySuccess).nthCalledWith(1, 'New value was set')
    })

    it('should call mockSuccess with correct argument when calling to omrArea', async () => {
      await wrapper.instance().omrArea(mockImageUrl, mockLabelCoords)

      expect(mockNotification.notifySuccess).nthCalledWith(1, 'New value was set')
    })

    it('should return correct value when calling to ocrText', async () => {
      const value = await wrapper.instance().ocrText(mockEngine, mockImageUrl, mockLabelCoords)

      expect(value).toEqual(mockRecognized)
    })

    it('should call extractDataAreaWithAlgorithm when calling to ocrText with enabled FEATURE_OCR_INTERSECTION_ALGORITHM', async () => {
      ENV.FEATURE_OCR_INTERSECTION_ALGORITHM = true

      await wrapper.instance().ocrText(
        mockEngine,
        mockImageUrl,
        mockLabelCoords,
        mockLanguage,
      )

      expect(extractDataAreaWithAlgorithm).nthCalledWith(1, {
        blobName: 'test/preview/0.png',
        engine: mockEngine,
        labelCoords: mockLabelCoords,
        language: mockLanguage,
      })
    })

    it('should return correct value when calling to omrArea', async () => {
      const value = await wrapper.instance().omrArea(mockImageUrl, mockLabelCoords)

      expect(value).toEqual(mockBoolRecognized)
    })

    it('should return correct empty value when calling to ocrText in case null recognized value', async () => {
      defaultProps.extractArea.mockImplementationOnce(() => Promise.resolve({ content: null }))
      wrapper.setProps(defaultProps)
      const value = await wrapper.instance().ocrText(mockEngine, mockImageUrl, mockLabelCoords)

      expect(value).toEqual({
        confidence: null,
        content: '',
      })
    })

    it('should return correct empty value when calling to omrArea in case null recognized value', async () => {
      defaultProps.omrArea.mockImplementationOnce(() => Promise.resolve({
        content: null,
        confidence: null,
      }))
      wrapper.setProps(defaultProps)
      const value = await wrapper.instance().omrArea(mockImageUrl, mockLabelCoords)

      expect(value).toEqual({
        confidence: null,
        content: null,
      })
    })

    it('should return correct empty value when calling to ocrText in case documentsApi.extractDataArea rejection', async () => {
      defaultProps.extractArea.mockImplementationOnce(() => Promise.reject(new Error('error')))
      wrapper.setProps(defaultProps)
      const value = await wrapper.instance().ocrText(mockEngine, mockImageUrl, mockLabelCoords)

      expect(value).toEqual({
        confidence: null,
        content: '',
      })
    })

    it('should return correct empty value when calling to ocrText in case documentsApi.extractDataArea rejection', async () => {
      defaultProps.omrArea.mockImplementationOnce(() => Promise.reject(new Error('error')))
      wrapper.setProps(defaultProps)
      const value = await wrapper.instance().omrArea(mockImageUrl, mockLabelCoords)

      expect(value).toEqual({
        confidence: null,
        content: null,
      })
    })

    it('should call mockWarning with correct arguments in case of documentsApi.extractDataArea rejection when calling to ocrText', async () => {
      defaultProps.extractArea.mockImplementationOnce(() => Promise.reject(new Error('error')))
      wrapper.setProps(defaultProps)
      await wrapper.instance().ocrText(mockEngine, mockImageUrl, mockLabelCoords)

      expect(mockNotification.notifyWarning).nthCalledWith(1, 'Failed to extract value')
    })

    it('should call mockWarning with correct arguments in case of documentsApi.omrArea rejection when calling to omrArea', async () => {
      defaultProps.omrArea.mockImplementationOnce(() => Promise.reject(new Error('error')))
      wrapper.setProps(defaultProps)
      await wrapper.instance().omrArea(mockImageUrl, mockLabelCoords)

      expect(mockNotification.notifyWarning).nthCalledWith(1, 'Failed to extract value')
    })

    it('should call notifyRequest with correct argument when calling to detectTables', async () => {
      await wrapper.instance().detectTables(
        mockImageUrl,
        mockDetectCoords,
        mockTableEngine,
        mockEngine,
        mockLanguage,
        mockRotationAngle,
      )
      expect(mockNotification.notifyProgress).nthCalledWith(1, 'Detecting tables')
    })

    it('should call props detectTables with correct arguments when calling to detectTables', async () => {
      await wrapper.instance().detectTables(
        mockImageUrl,
        mockDetectCoords,
        mockTableEngine,
        mockEngine,
        mockLanguage,
        mockRotationAngle,
      )

      const { blobName } = defaultProps.document.unifiedData['1'][0]
      const page = '1'
      expect(defaultProps.detectTables).nthCalledWith(
        1,
        blobName,
        page,
        mockDetectCoords,
        mockTableEngine,
        mockEngine,
        mockLanguage,
        mockRotationAngle,
      )
    })

    it('should return call notifyWarning in case nothing was detected when calling to detectTables', async () => {
      defaultProps.extractArea.mockImplementationOnce(() => Promise.resolve([]))
      wrapper.setProps(defaultProps)
      await wrapper.instance().detectTables(
        mockImageUrl,
        mockDetectCoords,
        mockTableEngine,
        mockEngine,
        mockLanguage,
        mockRotationAngle,
      )
      expect(notifyWarning).nthCalledWith(1, 'No tables were found')
    })

    it('should return correct empty value when calling to detectTables in case null recognized value', async () => {
      defaultProps.extractArea.mockImplementationOnce(() => Promise.resolve([]))
      wrapper.setProps(defaultProps)
      const value = await wrapper.instance().detectTables(
        mockImageUrl,
        mockDetectCoords,
        mockTableEngine,
        mockEngine,
        mockLanguage,
        mockRotationAngle,
      )
      expect(value).toEqual(null)
    })

    it('should return correct empty null value when calling to detectTables in case documentsApi.detectTables rejection', async () => {
      defaultProps.detectTables.mockImplementationOnce(() => Promise.reject(new Error('error')))
      wrapper.setProps(defaultProps)
      const value = await wrapper.instance().detectTables(
        mockImageUrl,
        mockDetectCoords,
        mockTableEngine,
        mockEngine,
        mockLanguage,
        mockRotationAngle,
      )

      expect(value).toEqual(null)
    })

    it('should return correct value when calling to detectTables in case documentsApi.detectTables returns array of tables', async () => {
      const mockCell = new Cell(0, 0, '321')
      defaultProps.detectTables.mockImplementationOnce(() => Promise.resolve([
        new TableData(
          1,
          [{ y: 0 }],
          [{ x: 0 }],
          [mockCell],
          new Rect(0.5, 0.5, 0.6, 0.7),
        ),
      ]))
      wrapper.setProps(defaultProps)
      const value = await wrapper.instance().detectTables(
        mockImageUrl,
        mockDetectCoords,
        mockTableEngine,
        mockEngine,
        mockLanguage,
        mockRotationAngle,
      )
      const {
        coordinates: { row: mockRow, column: mockColumn },
        value: mockValue,
        confidence: mockConfidence,
      } = mockCell

      expect(value).toEqual(
        [
          new Table(
            [0.5, 1.1],
            [0.5, 1.2],
            [],
            [new CellValue(mockRow, mockColumn, mockValue, mockConfidence)],
            new TableData(
              1,
              [{ y: 0 }],
              [{ x: 0 }],
              [new Cell(0, 0, '321')],
              new Rect(0.5, 0.5, 0.6, 0.7),
            ),
            '',
            undefined,
            '27',
          ),
        ],
      )
    })

    it('should call extractDataTableWithAlgorithm when calling to ocrTable with enabled FEATURE_OCR_INTERSECTION_ALGORITHM', async () => {
      ENV.FEATURE_OCR_INTERSECTION_ALGORITHM = true

      const tableData = mapLtTableToEdTableData(
        mockMarkupTables[0],
        '1',
        defaultProps.document.unifiedData,
      )

      await wrapper.instance().ocrTable(
        mockEngine,
        mockImageUrl,
        mockMarkupTables[0],
        mockLanguage,
      )

      expect(extractDataTableWithAlgorithm).nthCalledWith(1, {
        blobName: 'test/preview/0.png',
        markupTable: mockMarkupTables[0],
        engine: mockEngine,
        language: mockLanguage,
        tableData,
      })
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
})
