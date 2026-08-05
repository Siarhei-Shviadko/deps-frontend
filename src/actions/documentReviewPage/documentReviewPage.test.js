
import { mockCoordinates } from '@/mocks/mockCoordinates'
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import {
  addComment,
  completeReview,
  detectTables,
  detectTableData,
  extractArea,
  highlightTextCoordsField,
  highlightTableCoordsField,
  highlightPolygonCoordsField,
  setHighlightedField,
  setVisiblePdfPage,
  retryLastStep,
  runPipelineFromStep,
  saveDocument,
  skipValidation,
  updateDocument,
  updateDocumentType,
  fetchDocumentValidation,
  setActiveField,
  setRectCoords,
  goToError,
  extractTable,
  getDocumentState,
  clearActivePolygons,
  startReview,
  setActivePdfPage,
} from '@/actions/documentReviewPage'
import {
  saveDocumentData,
  storeComment,
  storeValidation,
  updateExtractedData,
  setDataByProp,
} from '@/actions/documents'
import { setUi } from '@/actions/navigation'
import { documentsApi } from '@/api/documentsApi'
import { UiKeys } from '@/constants/navigation'
import { DocumentState } from '@/enums/DocumentState'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownOCREngine } from '@/enums/KnownOCREngine'
import { KnownTableEngine } from '@/enums/KnownTableEngine'
import { Document } from '@/models/Document'
import { TableField } from '@/models/ExtractedData'
import { Point } from '@/models/Point'
import { Rect } from '@/models/Rect'
import { UnifiedData } from '@/models/UnifiedData'
import {
  documentTypeSelector,
  documentSelector,
} from '@/selectors/documentReviewPage'
import { uiSelector } from '@/selectors/navigation'
import { ENV } from '@/utils/env'

jest.mock('react-redux', () => mockReactRedux)
jest.mock('@/utils/env', () => ({
  ENV: {
    ...mockEnv.ENV,
    FEATURE_PAGINATED_TABLES: false,
  },
}))

const mockDocuments = [
  new Document({ id: 'mockDocumentId1' }),
  new Document({ id: 'mockDocumentId2' }),
]

const mockDocument = new Document({ id: 'mockDocument' })

const mockValidation = 'mockValidation'

const mockDocumentState = 'mockState'

const mockNormalizedResponse = {
  entities: {
    [mockDocuments[0].id]: mockDocuments[0],
    [mockDocuments[1].id]: mockDocuments[1],
  },
}

const mockTableField = new TableField()

jest.mock('@/actions/navigation', () => ({
  setUi: jest.fn(),
}))

jest.mock('@/actions/documents', () => ({
  ...jest.requireActual('@/actions/documents'),
  fetchDocumentData: jest.fn(() => Promise.resolve(mockDocument)),
  saveDocumentData: jest.fn(),
  updateExtractedData: jest.fn(),
  setDataByProp: jest.fn(),
}))

jest.mock('@/utils/apiRequest')
jest.mock('@/selectors/documentReviewPage')
jest.mock('@/selectors/navigation')
jest.mock('@/api/documentsApi', () => ({
  documentsApi: {
    startReview: jest.fn(),
    detectTables: jest.fn(),
    addNewLabel: jest.fn(),
    addLabel: jest.fn(),
    removeLabel: jest.fn(),
    getDocumentList: jest.fn(() => mockDocuments),
    detectTableData: jest.fn(() => Promise.resolve([mockTableField])),
    skipValidation: jest.fn(),
    getDocumentExtractedData: jest.fn(() => Promise.resolve([])),
    getDocumentValidation: jest.fn(() => Promise.resolve(mockValidation)),
    extractTableData: jest.fn(() => Promise.resolve([[]])),
    updateEdField: jest.fn(),
    getDocumentDetail: jest.fn(() => Promise.resolve({
      state: mockDocumentState,
      validation: mockValidation,
    })),
  },
}))

describe('Action creator: saveDocument', () => {
  let dispatch, getState

  const mockData = {
    saveDocument: {
      test: 'test',
    },
    extractedData: [{
      data: {
        meta: {},
      },
    }],
  }

  documentsApi.saveData = jest.fn(() => {
    return mockData
  })

  beforeEach(() => {
    dispatch = jest.fn()
    getState = jest.fn()
  })

  it('should call documentsApi.saveData once', () => {
    const mockDocument = 'mockDocument'
    saveDocument(mockDocument)(dispatch, getState)
    expect(documentsApi.saveData).toHaveBeenCalledTimes(1)
    expect(documentsApi.saveData).nthCalledWith(1, mockDocument)
  })

  it('should call documentsApi.updateEdField once in case of one paginated field should be saved', () => {
    ENV.FEATURE_PAGINATED_TABLES = true
    const mockDocument = mockData
    saveDocument(mockDocument)(dispatch, getState)
    expect(documentsApi.updateEdField).toHaveBeenCalledTimes(1)
  })

  it('should call documentsApi.updateEdField this correct arguments in case of updating list field', () => {
    jest.clearAllMocks()
    ENV.FEATURE_PAGINATED_TABLES = true
    const mockDocument = {
      ...mockData,
      extractedData: [{
        data: [{
          meta: {},
          cells: [[1, 1]],
        },
        {
          meta: {},
          cells: [[2, 2]],
        }],
      }],
    }
    const expectedPaginatedField = {
      data: {
        cells: [[1, 1], [2, 2]],
      },
      documentPk: undefined,
      fieldPk: undefined,
    }

    saveDocument(mockDocument)(dispatch, getState)
    expect(documentsApi.updateEdField).nthCalledWith(1, expectedPaginatedField)
  })

  it('should not call documentsApi.saveData in case of saving paginated data', () => {
    jest.clearAllMocks()
    ENV.FEATURE_PAGINATED_TABLES = true
    const mockDocument = mockData
    saveDocument(mockDocument)(dispatch, getState)
    expect(documentsApi.saveData).toHaveBeenCalledTimes(0)
  })
})

describe('Action creator: completeReview', () => {
  let dispatch, getState

  const documentId = 'test-document-id'
  const mockExtractedData = [{ fieldPk: 'field-1' }]
  const mockData = {
    saveDocument: [],
    previewDocuments: {},
    documentMetadata: {},
    state: DocumentState.VALIDATION,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    dispatch = jest.fn()
    getState = jest.fn(() => ({ documents: {} }))
    documentsApi.completeReview = jest.fn(() => Promise.resolve(mockData))
    documentsApi.getDocumentExtractedData = jest.fn(() => Promise.resolve(mockExtractedData))
  })

  it('should call documentsApi.completeReview once', async () => {
    await completeReview(documentId)(dispatch, getState)
    expect(documentsApi.completeReview).toHaveBeenCalledTimes(1)
    expect(documentsApi.completeReview).nthCalledWith(1, documentId)
  })

  it('should preserve current document state from redux when dispatching saveDocumentData', async () => {
    getState = jest.fn(() => ({
      documents: {
        [documentId]: { state: DocumentState.IN_REVIEW },
      },
    }))

    await completeReview(documentId)(dispatch, getState)

    expect(saveDocumentData).nthCalledWith(1, {
      ...mockData,
      extractedData: mockExtractedData,
      state: DocumentState.IN_REVIEW,
    })
  })

  it('should use documentData.state when current document state is not in redux', async () => {
    await completeReview(documentId)(dispatch, getState)

    expect(saveDocumentData).nthCalledWith(1, {
      ...mockData,
      extractedData: mockExtractedData,
      state: DocumentState.VALIDATION,
    })
  })
})

describe('Action creator: startReview', () => {
  let dispatch, getState

  beforeEach(() => {
    dispatch = jest.fn()
    getState = jest.fn()
  })

  it('should call documentsApi.startReview once', () => {
    const id = 1
    startReview(id)(dispatch, getState)
    expect(documentsApi.startReview).toHaveBeenCalledTimes(1)
    expect(documentsApi.startReview).nthCalledWith(1, id)
  })
})

describe('Action creator: runPipelineFromStep', () => {
  let dispatch, getState

  const mockStep = 'testStep'
  const mockSettings = {
    llmType: 'testLLMType',
    engine: KnownOCREngine.TESSERACT,
    parsingFeatures: [],
  }

  documentsApi.runPipelineFromStep = jest.fn(() => mockNormalizedResponse)

  beforeEach(() => {
    dispatch = jest.fn()
    getState = jest.fn()
  })

  it('should call documentsApi.runPipelineFromStep once', async () => {
    const id = 'id'
    runPipelineFromStep(id, mockStep, mockSettings)(dispatch, getState)
    expect(documentsApi.runPipelineFromStep).toHaveBeenCalledTimes(1)
    expect(documentsApi.runPipelineFromStep).nthCalledWith(1, [id], mockStep, mockSettings)
  })
})

describe('Action creator: updateDocumentType', () => {
  let dispatch, getState

  const type = {
    name: 'test',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    dispatch = jest.fn()
    getState = jest.fn()
    documentsApi.assignDocumentType = jest.fn(() => [mockDocument])
  })

  it('should call setUi', async () => {
    await updateDocumentType(type)(dispatch, getState)
    expect(setUi).toHaveBeenCalled()
  })

  it('should not call setUi in case of undefined document', async () => {
    documentsApi.assignDocumentType = jest.fn().mockImplementationOnce(() => Promise.resolve([undefined]))
    await updateDocumentType(type)(dispatch, getState)
    expect(setUi).not.toHaveBeenCalled()
  })

  it('should call documentsApi.assignDocumentType', async () => {
    await updateDocumentType(type)(dispatch, getState)
    expect(documentsApi.assignDocumentType).nthCalledWith(1, ['id'], type)
  })

  it('should call documentsApi.getDocument once', async () => {
    await updateDocumentType(type)(dispatch, getState)
    expect(documentsApi.getDocument).nthCalledWith(1, 'id')
  })
})

describe('Action creator: skipValidation', () => {
  let dispatch, getState

  const extractedData = []

  beforeEach(() => {
    jest.clearAllMocks()
    dispatch = jest.fn()
    getState = jest.fn()
  })

  it('should call documentsApi.skipValidation once', async () => {
    const mockDocumentID = 'mockDocumentID'

    await skipValidation(mockDocumentID, extractedData)(dispatch, getState)
    expect(documentsApi.skipValidation).toHaveBeenCalledTimes(1)
    expect(documentsApi.skipValidation).nthCalledWith(1, mockDocumentID, extractedData)
  })

  it('should call documentsApi.getDocument once', async () => {
    const mockDocumentID = 'mockDocumentID'

    await skipValidation(mockDocumentID, extractedData)(dispatch, getState)
    expect(documentsApi.getDocument).toHaveBeenCalledTimes(1)
    expect(documentsApi.getDocument).nthCalledWith(1, mockDocumentID)
  })
})

describe('Action creator: detectTableData', () => {
  let dispatch, getState

  const mockRegion = []

  beforeEach(() => {
    dispatch = jest.fn()
    getState = jest.fn()
  })

  it('should call documentsApi.detectTableData once', () => {
    detectTableData(mockRegion)(dispatch, getState)
    const document = documentSelector.getSelectorMockValue()
    const activePage = uiSelector.getSelectorMockValue()[UiKeys.ACTIVE_PAGE]
    const blobName = Document.getProcessingBlobName(document, activePage)
    const language = document.language || documentTypeSelector.getSelectorMockValue().language
    expect(documentsApi.detectTableData).toHaveBeenCalledTimes(1)
    expect(documentsApi.detectTableData).nthCalledWith(1, blobName, mockRegion, language)
  })

  it('should not call documentsApi.detectTableData in case of documentsApi.detectTableData returns undefined', async () => {
    documentsApi.detectTableData = jest.fn().mockImplementationOnce(() => Promise.resolve(undefined))
    await detectTableData(mockRegion)(dispatch, getState)
    expect(dispatch).not.nthCalledWith(2, updateExtractedData())
  })
})

describe('Action creator: retryLastStep', () => {
  let dispatch, getState

  documentsApi.retryLastStep = jest.fn(() => {
    return Promise.resolve()
  })

  documentsApi.getDocument = jest.fn(() => {
    return {
      state: 'test',
    }
  })

  beforeEach(() => {
    dispatch = jest.fn()
    getState = jest.fn()
  })

  it('should call documentsApi.retryLastStep once', async () => {
    const mockDocumentID = 'mockDocumentID'
    retryLastStep(mockDocumentID)(dispatch, getState)
    expect(documentsApi.retryLastStep).toHaveBeenCalledTimes(1)
    expect(documentsApi.retryLastStep).nthCalledWith(1, mockDocumentID)
  })
})

describe('Action creator: addComment', () => {
  let dispatch, getState
  const comment = 'testComment'
  const mockDocumentID = 'mockDocumentID'

  documentsApi.addComment = jest.fn(() => {
    return Promise.resolve(comment)
  })

  beforeEach(() => {
    dispatch = jest.fn()
    getState = jest.fn()
  })

  it('should call documentsApi.addComment once', async () => {
    addComment(mockDocumentID, comment)(dispatch, getState)
    expect(documentsApi.addComment).toHaveBeenCalledTimes(1)
    expect(documentsApi.addComment).nthCalledWith(1, mockDocumentID, comment)
  })

  it('should call dispatch with storeComment action in case of request was successful', async () => {
    await addComment(mockDocumentID, comment)(dispatch, getState)
    expect(dispatch).nthCalledWith(2, storeComment(mockDocumentID, comment))
  })
})

describe('Action creator: extractArea', () => {
  let getState, dispatch

  const blobName = '0.png'

  beforeEach(() => {
    getState = jest.fn()
    dispatch = jest.fn()
    jest.clearAllMocks()
  })

  documentsApi.extractDataArea = jest.fn(() => Promise.resolve([[]]))

  it('should call documentsApi.extractDataArea with correct args in case all args were passed', async () => {
    await extractArea(blobName, mockCoordinates, KnownOCREngine.TESSERACT, KnownLanguage.ENGLISH)(dispatch, getState)
    expect(documentsApi.extractDataArea).nthCalledWith(
      1,
      mockCoordinates,
      blobName,
      KnownOCREngine.TESSERACT,
      KnownLanguage.ENGLISH,
    )
  })

  it('should call documentsApi.extractDataArea with correct args in case language was not passed but document.language is not empty', async () => {
    await extractArea(blobName, mockCoordinates, KnownOCREngine.TESSERACT)(dispatch, getState)
    const document = documentSelector.getSelectorMockValue()
    const language = document.language
    expect(documentsApi.extractDataArea).nthCalledWith(
      1,
      mockCoordinates,
      blobName,
      KnownOCREngine.TESSERACT,
      language,
    )
  })

  it('should call documentsApi.extractDataArea with correct args in case language was not passed and document.language is empty', async () => {
    documentSelector.mockImplementationOnce(() => ({
      ...documentSelector.getSelectorMockValue(),
      language: null,
    }))

    await extractArea(blobName, mockCoordinates, KnownOCREngine.TESSERACT)(dispatch, getState)
    const language = documentTypeSelector.getSelectorMockValue().language
    expect(documentsApi.extractDataArea).nthCalledWith(
      1,
      mockCoordinates,
      blobName,
      KnownOCREngine.TESSERACT,
      language,
    )
  })

  it('should call documentsApi.extractDataArea with correct args in case engine was not passed but document.engine is not empty', async () => {
    await extractArea(blobName, mockCoordinates)(dispatch, getState)
    const document = documentSelector.getSelectorMockValue()
    const engine = document.engine
    expect(documentsApi.extractDataArea).nthCalledWith(
      1,
      mockCoordinates,
      blobName,
      engine,
      document.language,
    )
  })

  it('should call documentsApi.extractDataArea with correct args in case engine was not passed and document.engine is empty', async () => {
    const document = documentSelector.getSelectorMockValue()
    const documentType = documentTypeSelector.getSelectorMockValue()

    documentSelector.mockImplementationOnce(() => ({
      ...document,
      engine: null,
    }))

    await extractArea(blobName, mockCoordinates)(dispatch, getState)
    expect(documentsApi.extractDataArea).nthCalledWith(
      1,
      mockCoordinates,
      blobName,
      documentType.engine,
      document.language,
    )
  })

  it('should call documentsApi.extractDataArea with correct args in case no engine was passed and no engine in document and documentType', async () => {
    const document = documentSelector.getSelectorMockValue()
    documentSelector.mockImplementationOnce(() => ({
      ...documentSelector.getSelectorMockValue(),
      engine: null,
    }))
    documentTypeSelector.mockImplementationOnce(() => ({
      ...documentTypeSelector.getSelectorMockValue(),
      engine: null,
    }))

    await extractArea(blobName, mockCoordinates)(dispatch, getState)
    expect(documentsApi.extractDataArea).nthCalledWith(
      1,
      mockCoordinates,
      blobName,
      KnownOCREngine.TESSERACT,
      document.language,
    )
  })
})

describe('Action creator: detectTables', () => {
  let getState, dispatch
  const blobFile = '100.png'
  const page = '100'
  const detectCoords = new Rect(0.2, 0.3, 0.1, 0.1)
  const detectEngine = KnownTableEngine.DEPS_DETECTOR
  const ocrEngine = KnownOCREngine.TESSERACT
  const lang = KnownLanguage.ENGLISH
  const rotation = 90

  beforeEach(() => {
    getState = jest.fn()
    dispatch = jest.fn()
    jest.clearAllMocks()
  })

  it('should call getState once', async () => {
    await detectTables(
      blobFile,
      page,
      detectCoords,
      detectEngine,
      ocrEngine,
      lang,
      rotation,
    )(dispatch, getState)
    expect(getState).toHaveBeenCalledTimes(1)
  })

  it('should call documentsApi.detectTables once with correct arguments in case everything is provided to action', async () => {
    await detectTables(
      blobFile,
      page,
      detectCoords,
      detectEngine,
      ocrEngine,
      lang,
      rotation,
    )(dispatch, getState)
    expect(documentsApi.detectTables).toHaveBeenCalledTimes(1)
    expect(documentsApi.detectTables).nthCalledWith(
      1,
      blobFile,
      page,
      detectCoords,
      detectEngine,
      ocrEngine,
      lang,
      rotation,
    )
  })

  it('should call documentsApi.detectTables once with correct arguments in case lang is not provided to action and lang is from document', async () => {
    await detectTables(
      blobFile,
      page,
      detectCoords,
      detectEngine,
      ocrEngine,
      undefined,
      rotation,
    )(dispatch, getState)

    const language = documentSelector.getSelectorMockValue().language

    expect(documentsApi.detectTables).toHaveBeenCalledTimes(1)
    expect(documentsApi.detectTables).nthCalledWith(
      1,
      blobFile,
      page,
      detectCoords,
      detectEngine,
      ocrEngine,
      language,
      rotation,
    )
  })

  it('should call documentsApi.detectTables once with correct arguments in case lang is not provided to action no lang in doc, lang is from type', async () => {
    documentSelector.mockImplementationOnce(() => ({}))
    await detectTables(
      blobFile,
      page,
      detectCoords,
      detectEngine,
      ocrEngine,
      undefined,
      rotation,
    )(dispatch, getState)

    const language = documentTypeSelector.getSelectorMockValue().language
    expect(documentsApi.detectTables).toHaveBeenCalledTimes(1)
    expect(documentsApi.detectTables).nthCalledWith(
      1,
      blobFile,
      page,
      detectCoords,
      detectEngine,
      ocrEngine,
      language,
      rotation,
    )
  })

  it('should call documentsApi.detectTables once with correct arguments in case ocrEngine is not provided to action - engine from document', async () => {
    await detectTables(
      blobFile,
      page,
      detectCoords,
      detectEngine,
      undefined,
      lang,
      rotation,
    )(dispatch, getState)

    const engine = documentSelector.getSelectorMockValue().engine
    expect(documentsApi.detectTables).toHaveBeenCalledTimes(1)
    expect(documentsApi.detectTables).nthCalledWith(
      1,
      blobFile,
      page,
      detectCoords,
      detectEngine,
      engine,
      lang,
      rotation,
    )
  })

  it(
    'should call documentsApi.detectTables once with correct arguments in case ocrEngine is not provided to action and no engine in doc - engine form type',
    async () => {
      documentSelector.mockImplementationOnce(() => ({}))
      await detectTables(
        blobFile,
        page,
        detectCoords,
        detectEngine,
        undefined,
        lang,
        rotation,
      )(dispatch, getState)

      const engine = documentTypeSelector.getSelectorMockValue().engine
      expect(documentsApi.detectTables).toHaveBeenCalledTimes(1)
      expect(documentsApi.detectTables).nthCalledWith(
        1,
        blobFile,
        page,
        detectCoords,
        detectEngine,
        engine,
        lang,
        rotation,
      )
    })

  it(
    'should call documentsApi.detectTables once with correct arguments in case ocrEngine is not provided and no engine in document and no engine in type',
    async () => {
      documentSelector.mockImplementationOnce(() => ({}))
      documentTypeSelector.mockImplementationOnce(() => ({}))
      await detectTables(
        blobFile,
        page,
        detectCoords,
        detectEngine,
        undefined,
        lang,
        rotation,
      )(dispatch, getState)

      const engine = KnownOCREngine.TESSERACT
      expect(documentsApi.detectTables).toHaveBeenCalledTimes(1)
      expect(documentsApi.detectTables).nthCalledWith(
        1,
        blobFile,
        page,
        detectCoords,
        detectEngine,
        engine,
        lang,
        rotation,
      )
    })
})

describe('Action creator: updateDocument', () => {
  let dispatch, getState
  const newTitle = 'newTestTitle'
  const documentId = 'id'

  beforeEach(() => {
    dispatch = jest.fn()
    getState = jest.fn()
  })

  documentsApi.updateDocument = jest.fn(() => ({
    _id: 'test',
  }))

  it('should call documentsApi.updateDocument once with correct args', async () => {
    await updateDocument(newTitle)(dispatch, getState)
    expect(documentsApi.updateDocument).toHaveBeenCalledTimes(1)
    expect(documentsApi.updateDocument).nthCalledWith(1, documentId, newTitle)
  })
})

describe('Action creator: fetchDocumentValidation', () => {
  let dispatch, getState

  beforeEach(() => {
    dispatch = jest.fn()
    getState = jest.fn()
  })

  it('should call documentsApi.getDocumentValidation', async () => {
    const mockDocumentID = documentSelector.getSelectorMockValue()._id
    await fetchDocumentValidation()(dispatch, getState)
    expect(documentsApi.getDocumentValidation).nthCalledWith(1, mockDocumentID)
  })

  it('should dispatch with correct args', async () => {
    const mockDocumentID = documentSelector.getSelectorMockValue()._id
    await fetchDocumentValidation()(dispatch, getState)
    expect(dispatch).nthCalledWith(
      2,
      storeValidation(mockDocumentID, mockValidation),
    )
  })
})

describe('Action: setActiveField', () => {
  let dispatch

  beforeEach(() => {
    dispatch = jest.fn()
  })

  it('should dispatch with correct args', () => {
    const mockActiveFieldPK = 'mockPK'
    setActiveField(mockActiveFieldPK)(dispatch)
    expect(dispatch).nthCalledWith(1, setUi({ [UiKeys.ACTIVE_FIELD_PK]: mockActiveFieldPK }))
  })

  it('should dispatch with correct args if called with default values', async () => {
    setActiveField()(dispatch)
    expect(dispatch).nthCalledWith(1, setUi({ [UiKeys.ACTIVE_FIELD_PK]: null }))
  })
})

describe('Action: setRectCoords', () => {
  let dispatch

  beforeEach(() => {
    dispatch = jest.fn()
  })

  it('should dispatch with correct args if called with default values', () => {
    setRectCoords()(dispatch)
    expect(dispatch).nthCalledWith(1, setUi({
      [UiKeys.ACTIVE_PAGE]: 1,
      [UiKeys.RECT_COORDS]: null,
    }))
  })
})

describe('Action: highlightPolygonCoordsField', () => {
  let dispatch, getState

  const mockSourceId = '12345'
  const mockPage = 100
  const mockFoundPageBySourceId = 1
  const mockCoords = [[
    new Point(0, 0),
    new Point(0.1, 0.2),
  ]]

  beforeEach(() => {
    UnifiedData.getPageBySourceId = jest.fn(() => mockFoundPageBySourceId)
    UnifiedData.getBboxSourceIdByPage = jest.fn(() => mockSourceId)
    dispatch = jest.fn()
    getState = jest.fn()
  })

  it('should getState be called once', () => {
    highlightPolygonCoordsField({
      field: mockCoords,
      page: mockPage,
    })(dispatch, getState)
    expect(getState).toHaveBeenCalledTimes(1)
  })

  it('should dispatch setUi with correct args if field and page were passed', () => {
    highlightPolygonCoordsField({
      field: mockCoords,
      page: mockPage,
    })(dispatch, getState)
    expect(dispatch).nthCalledWith(1, setUi({
      [UiKeys.ACTIVE_PAGE]: mockPage,
      [UiKeys.ACTIVE_SOURCE_ID]: mockSourceId,
    }))
  })

  it('should dispatch setUi with correct args if field and sourceId were passed', () => {
    highlightPolygonCoordsField({
      field: mockCoords,
      sourceId: mockSourceId,
    })(dispatch, getState)
    expect(dispatch).nthCalledWith(1, setUi({
      [UiKeys.ACTIVE_PAGE]: mockFoundPageBySourceId,
      [UiKeys.ACTIVE_SOURCE_ID]: mockSourceId,
    }))
  })

  it('should dispatch setHighlightedField with correct args', () => {
    highlightPolygonCoordsField({
      field: mockCoords,
      page: mockPage,
    })(dispatch, getState)
    expect(dispatch).nthCalledWith(
      2,
      setHighlightedField(mockCoords),
    )
  })

  it('should dispatch clearActivePolygons', () => {
    highlightPolygonCoordsField({
      field: mockCoords,
      page: mockPage,
    })(dispatch, getState)
    expect(dispatch).nthCalledWith(3, clearActivePolygons())
  })
})

describe('Action: setVisiblePdfPage', () => {
  let dispatch

  beforeEach(() => {
    dispatch = jest.fn()
  })

  it('should dispatch with correct args', () => {
    const mockPage = 100500
    setVisiblePdfPage(mockPage)(dispatch)
    expect(dispatch).nthCalledWith(
      1,
      setUi({ [UiKeys.VISIBLE_PAGE]: mockPage },
      ),
    )
  })
})

describe('Action: setActivePdfPage', () => {
  let dispatch

  beforeEach(() => {
    dispatch = jest.fn()
  })

  it('should dispatch with correct args', () => {
    const mockPage = 100500
    setActivePdfPage(mockPage)(dispatch)
    expect(dispatch).nthCalledWith(
      1,
      setUi({ [UiKeys.ACTIVE_PAGE]: mockPage },
      ),
    )
  })
})

describe('Action: highlightTableCoordsField', () => {
  let dispatch, getState

  const mockSourceId = '12345'
  const mockPage = 100
  const mockFoundPageBySourceId = 1
  const mockCoords = [[1, 1], [2, 3]]

  beforeEach(() => {
    Document.getPageBySourceId = jest.fn(() => mockFoundPageBySourceId)
    Document.getTableSourceIdByPage = jest.fn(() => mockSourceId)
    dispatch = jest.fn()
    getState = jest.fn()
  })

  it('should getState be called once', () => {
    highlightTableCoordsField({
      field: mockCoords,
      page: mockPage,
    })(dispatch, getState)
    expect(getState).toHaveBeenCalledTimes(1)
  })

  it('should dispatch setUi with correct args if field and page were passed', () => {
    highlightTableCoordsField({
      field: mockCoords,
      page: mockPage,
    })(dispatch, getState)
    expect(dispatch).nthCalledWith(1, setUi({
      [UiKeys.ACTIVE_PAGE]: mockPage,
      [UiKeys.ACTIVE_SOURCE_ID]: mockSourceId,
    }))
  })

  it('should dispatch setUi with correct args if field and sourceId were passed', () => {
    highlightTableCoordsField({
      field: mockCoords,
      sourceId: mockSourceId,
    })(dispatch, getState)
    expect(dispatch).nthCalledWith(1, setUi({
      [UiKeys.ACTIVE_PAGE]: mockFoundPageBySourceId,
      [UiKeys.ACTIVE_SOURCE_ID]: mockSourceId,
    }))
  })

  it('should dispatch setHighlightedField with correct args', () => {
    highlightTableCoordsField({
      field: mockCoords,
      page: mockPage,
    })(dispatch, getState)
    expect(dispatch).nthCalledWith(2, setHighlightedField(mockCoords))
  })

  it('should dispatch clearActivePolygons', () => {
    highlightTableCoordsField({
      field: mockCoords,
      page: mockPage,
    })(dispatch, getState)
    expect(dispatch).nthCalledWith(3, clearActivePolygons())
  })
})

describe('Action: highlightTextCoordsField', () => {
  let dispatch, getState

  const mockSourceId = '12345'
  const mockPage = 100
  const mockCoords = [{
    begin: 1,
    end: 2,
  }]

  beforeEach(() => {
    Document.getPageBySourceId = jest.fn(() => mockPage)
    dispatch = jest.fn()
    getState = jest.fn()
  })

  it('should getState be called once', () => {
    highlightTextCoordsField({
      field: mockCoords,
      sourceId: mockSourceId,
    })(dispatch, getState)
    expect(getState).toHaveBeenCalledTimes(1)
  })

  it('should dispatch setUi with correct args', () => {
    highlightTextCoordsField({
      field: mockCoords,
      sourceId: mockSourceId,
    })(dispatch, getState)
    expect(dispatch).nthCalledWith(1, setUi({
      [UiKeys.ACTIVE_PAGE]: mockPage,
      [UiKeys.ACTIVE_SOURCE_ID]: mockSourceId,
    }))
  })

  it('should dispatch highlightTextCoordsField with correct args', () => {
    highlightTextCoordsField({
      field: mockCoords,
      sourceId: mockSourceId,
    })(dispatch, getState)
    expect(dispatch).nthCalledWith(2, setHighlightedField(mockCoords))
  })

  it('should dispatch clearActivePolygons', () => {
    highlightTextCoordsField({
      field: mockCoords,
      sourceId: mockSourceId,
    })(dispatch, getState)
    expect(dispatch).nthCalledWith(3, clearActivePolygons())
  })
})

describe('Action: goToError', () => {
  let dispatch

  beforeEach(() => {
    dispatch = jest.fn()
  })

  it('should dispatch with correct args', () => {
    const mockErrorsPages = [10, 15, 20]
    const mockActivePage = 6
    goToError(mockErrorsPages, mockActivePage)(dispatch)
    expect(dispatch).nthCalledWith(1, setUi({ [UiKeys.ACTIVE_PAGE]: mockErrorsPages[0] }))
  })

  it('should not dispatch if activePage === errorsPage', () => {
    const mockErrorsPages = [10]
    const mockActivePage = 10
    goToError(mockErrorsPages, mockActivePage)(dispatch)
    expect(dispatch).not.toHaveBeenCalled()
  })
})

describe('Action creator: extractTable', () => {
  let getState, dispatch

  const blobName = '0.png'

  beforeEach(() => {
    getState = jest.fn()
    dispatch = jest.fn()
    jest.clearAllMocks()
  })

  it('should call documentsApi.extractTableData with correct args in case of correct document language', async () => {
    await extractTable(blobName, mockCoordinates, KnownOCREngine.TESSERACT)(dispatch, getState)
    const document = documentSelector.getSelectorMockValue()
    const language = document.language
    expect(documentsApi.extractTableData).nthCalledWith(
      1,
      mockCoordinates,
      blobName,
      KnownOCREngine.TESSERACT,
      language,
    )
  })

  it('should call documentsApi.extractTableData with correct args in case of null document language', async () => {
    documentSelector.mockImplementationOnce(() => ({
      ...documentSelector.getSelectorMockValue(),
      language: null,
    }))

    await extractTable(blobName, mockCoordinates, KnownOCREngine.TESSERACT)(dispatch, getState)
    const language = documentTypeSelector.getSelectorMockValue().language
    expect(documentsApi.extractTableData).nthCalledWith(
      1,
      mockCoordinates,
      blobName,
      KnownOCREngine.TESSERACT,
      language,
    )
  })

  it('should call documentsApi.extractTableData with correct args in case of language as prop', async () => {
    const language = 'someLanguage'
    await extractTable(blobName, mockCoordinates, KnownOCREngine.TESSERACT, language)(dispatch, getState)
    expect(documentsApi.extractTableData).nthCalledWith(
      1,
      mockCoordinates,
      blobName,
      KnownOCREngine.TESSERACT,
      language,
    )
  })
})

describe('Action creator: getDocumentState', () => {
  let dispatch
  const mockId = 'mockId'

  beforeEach(() => {
    dispatch = jest.fn()
  })

  it('should call documentsApi.getDocumentDetail with correct argument', async () => {
    await getDocumentState(mockId)(dispatch)

    expect(documentsApi.getDocumentDetail).nthCalledWith(
      1,
      mockId,
    )
  })

  it('should dispatch setDataByProp with correct arguments', async () => {
    await getDocumentState(mockId)(dispatch)

    expect(dispatch).nthCalledWith(2, setDataByProp({
      documentId: mockId,
      prop: 'state',
      data: mockDocumentState,
    }))
  })

  it('should return document state from getDocumentDetail', async () => {
    const result = await getDocumentState(mockId)(dispatch)

    expect(result).toBe(mockDocumentState)
  })
})
