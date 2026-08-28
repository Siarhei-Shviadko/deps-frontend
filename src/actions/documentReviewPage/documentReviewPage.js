
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import { batch } from 'react-redux'
import { createAction } from 'redux-actions'
import {
  storeComment,
  saveDocumentData,
  setDataByProp,
  updateExtractedData,
  storeValidation,
  fetchDocumentData,
} from '@/actions/documents'
import { setUi } from '@/actions/navigation'
import { createRequestAction } from '@/actions/requests'
import { documentsApi } from '@/api/documentsApi'
import { UiKeys } from '@/constants/navigation'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Document } from '@/models/Document'
import { UNKNOWN_DOCUMENT_TYPE } from '@/models/DocumentType'
import { HighlightedField } from '@/models/HighlightedField'
import { mapRectsToPolygons } from '@/models/mappers/mapRectsToPolygons'
import { UnifiedData } from '@/models/UnifiedData'
import {
  idSelector,
  documentSelector,
  documentTypeSelector,
} from '@/selectors/documentReviewPage'
import { uiSelector } from '@/selectors/navigation'
import { extractDataAreaWithAlgorithm } from '@/services/OCRExtractionService'
import { ENV } from '@/utils/env'
import { sendRequests } from '@/utils/sendRequests'

export const FEATURE_NAME = 'DOCUMENT_REVIEW_PAGE'

export const changeActiveTab = createAction(
  `${FEATURE_NAME}/CHANGE_ACTIVE_TAB`,
)

export const updateConfidenceView = createAction(
  `${FEATURE_NAME}/UPDATE_CONFIDENCE_VIEW`,
)

export const setHighlightedField = createAction(
  `${FEATURE_NAME}/SET_HIGHLIGHTED_FIELD`,
)

export const changeFieldsGrouping = createAction(
  `${FEATURE_NAME}/CHANGE_FIELDS_GROUPING`,
)

export const clearDocumentStore = createAction(
  `${FEATURE_NAME}/CLEAR_DOCUMENT_STORE`,
)

export const addActivePolygons = createAction(
  `${FEATURE_NAME}/ADD_ACTIVE_POLYGONS`,
)

export const clearActivePolygons = createAction(
  `${FEATURE_NAME}/CLEAR_ACTIVE_POLYGONS`,
)

export const setActiveFieldTypes = createAction(
  `${FEATURE_NAME}/SET_ACTIVE_FIELD_TYPES`,
)

export const addComment = createRequestAction(
  'addComment',
  (documentId, comment) => async (dispatch) => {
    const result = await documentsApi.addComment(documentId, comment)
    dispatch(storeComment(documentId, result))
    return result
  },
)

export const completeReview = createRequestAction(
  'completeReview',
  (documentId) => async (dispatch, getState) => {
    const documentData = await documentsApi.completeReview(documentId)
    const extractedData = await documentsApi.getDocumentExtractedData(documentId)
    const currentDocumentState = getState().documents[documentId]?.state
    dispatch(saveDocumentData({
      ...documentData,
      extractedData,
      state: currentDocumentState ?? documentData.state,
    }))
  },
)

export const startReview = createRequestAction(
  'startReview',
  (documentId) => async (dispatch) => {
    const documentData = await documentsApi.startReview(documentId)
    const extractedData = await documentsApi.getDocumentExtractedData(documentId)
    dispatch(saveDocumentData({
      ...documentData,
      extractedData,
    }))
  },
)

export const fetchDocumentValidation = createRequestAction(
  'fetchDocumentValidation',
  () => async (dispatch, getState) => {
    const document = documentSelector(getState())
    const validation = await documentsApi.getDocumentValidation(document._id)
    dispatch(storeValidation(document._id, validation))
    return validation
  },
)

export const skipValidation = createRequestAction(
  'skipValidation',
  (documentId, extractedData) => async (dispatch) => {
    await documentsApi.skipValidation(documentId, extractedData)
    const results = await documentsApi.getDocument(documentId)
    dispatch(saveDocumentData(results))
  },
)

export const detectTableData = createRequestAction(
  'detectTableData',
  (region) => async (dispatch, getState) => {
    const state = getState()
    const document = documentSelector(state)
    const activePage = uiSelector(state)[UiKeys.ACTIVE_PAGE] || 1
    const blobName = Document.getProcessingBlobName(document, activePage)
    const language = document.language || documentTypeSelector(state).language
    const tableFields = await documentsApi.detectTableData(blobName, region, language)
    if (tableFields && tableFields.length) {
      const extractedData = cloneDeep(document.extractedData ?? [])
      const newED = extractedData.concat(tableFields)
      dispatch(updateExtractedData(idSelector(state), newED))
    }
    return tableFields
  },
)

export const retryLastStep = createRequestAction(
  'retryLastStep',
  (documentId) => async (dispatch) => {
    await documentsApi.retryLastStep(documentId)
    const result = await documentsApi.getDocument(documentId)
    dispatch(saveDocumentData(result))
  },
)

export const updateDocumentType = createRequestAction(
  'updateDocumentType',
  (newType) => async (dispatch, getState) => {
    const documentId = idSelector(getState())
    const [document] = await documentsApi.assignDocumentType([documentId], newType)
    if (document) {
      setUi({ [UiKeys.RECT_COORDS]: null })
    }

    const result = await documentsApi.getDocument(documentId)
    dispatch(saveDocumentData(result))
  },
)

export const getDocumentExtractedData = createRequestAction(
  'getDocumentExtractedData',
  () => async (dispatch, getState) => {
    const document = documentSelector(getState())
    const data = await documentsApi.getDocumentExtractedData(document._id)

    dispatch(
      setDataByProp({
        documentId: document._id,
        prop: 'extractedData',
        data,
      }),
    )
  },
)

export const getDocumentError = createRequestAction(
  'getDocumentError',
  () => async (dispatch, getState) => {
    const document = documentSelector(getState())
    const { error: data } = await documentsApi.getDocumentDetail(document._id)

    dispatch(
      setDataByProp({
        documentId: document._id,
        prop: 'error',
        data,
      }),
    )
  },
)

export const getDocumentState = createRequestAction(
  'getDocumentState',
  (documentId) => async (dispatch) => {
    const { state: data } = await documentsApi.getDocumentDetail(documentId)

    dispatch(
      setDataByProp({
        documentId,
        prop: 'state',
        data,
      }),
    )
    return data
  },
)

export const updateDocument = createRequestAction(
  'updateDocument',
  (newValue, id) => async (dispatch, getState) => {
    const documentId = id || idSelector(getState())
    await documentsApi.updateDocument(documentId, newValue)
    const results = await documentsApi.getDocument(documentId)
    dispatch(saveDocumentData(results))
  },
)

export const runPipelineFromStep = createRequestAction(
  'runPipelineFromStep',
  (
    documentId,
    step,
    settings,
  ) => async (dispatch) => {
    await documentsApi.runPipelineFromStep([documentId], step, settings)
    dispatch(fetchDocumentData(documentId))
  },
)

export const saveDocument = createRequestAction(
  'saveDocument',
  (documentToSave) => async (dispatch) => {
    if (ENV.FEATURE_PAGINATED_TABLES) {
      const paginatedFields = []
      const nonPaginatedFields = []
      documentToSave.extractedData?.forEach((edField) => {
        const field = {
          aliases: edField.aliases,
          data: edField.data,
          documentPk: documentToSave._id,
          fieldPk: edField.fieldPk,
        }
        if (
          (Array.isArray(field.data) && field.data[0].meta) ||
          edField.data.meta
        ) {
          return paginatedFields.push(field)
        }
        return nonPaginatedFields.push(field)
      })

      const mappedNonPaginatedFieldsToModifiedFields = nonPaginatedFields.filter((field) => {
        const initialField = documentToSave.initialDocumentData.extractedData.find((data) => data.fieldPk === field.fieldPk)
        return !isEqual(initialField?.data, field.data) && field
      })
      const mappedPaginatedFieldsToCells = paginatedFields
        .map((field) => {
          if (Array.isArray(field.data)) {
            const fieldCells = field.data
              .map((data) => data.cells)
              .reduce((acc, cells) => {
                acc.cells = acc.cells.concat(cells)
                return acc
              }, {
                cells: [],
              })
            field.data = fieldCells
          }
          return field
        })

      const updateEdFieldRequests = mappedPaginatedFieldsToCells.map((field) => () => documentsApi.updateEdField(field))
      await sendRequests(updateEdFieldRequests, true)
      const saveEdFieldRequests = mappedNonPaginatedFieldsToModifiedFields.map((field) => () => documentsApi.saveEdField(field))
      await sendRequests(saveEdFieldRequests, true)

      return dispatch(saveDocumentData(documentToSave))
    }
    const id = documentToSave._id
    const { extractedData } = await documentsApi.saveData(documentToSave)
    const document = await documentsApi.getDocument(id)
    const updatedDocument = {
      ...document,
      extractedData,
    }
    dispatch(saveDocumentData(updatedDocument))
  },
)

export const setActiveField = (activeFieldPk = null) => (dispatch) => {
  dispatch(setUi({ [UiKeys.ACTIVE_FIELD_PK]: activeFieldPk }))
}

export const setRectCoords = (rectCoords = null, activePage = 1) => (dispatch) => {
  dispatch(setUi({
    [UiKeys.ACTIVE_PAGE]: activePage,
    [UiKeys.RECT_COORDS]: rectCoords,
  }))
}

export const setVisiblePdfPage = (page) => (dispatch) => {
  dispatch(setUi({
    [UiKeys.VISIBLE_PDF_PAGE]: page,
  }))
}

export const setActivePdfPage = (page) => (dispatch) => {
  dispatch(setUi({
    [UiKeys.ACTIVE_PAGE]: page,
  }))
}

export const highlightPolygonCoordsField = ({
  field,
  page,
  sourceId,
  unifiedData,
}) => (dispatch, getState) => {
  const state = getState()
  const document = documentSelector(state)
  const sourceUnifiedData = unifiedData ?? document.unifiedData
  const activePage = page ?? UnifiedData.getPageBySourceId(sourceUnifiedData, sourceId)
  const activeSourceId = sourceId ?? UnifiedData.getBboxSourceIdByPage(sourceUnifiedData, page)
  const highlightedField = (!field || HighlightedField.arePolygonCoords(field)) ? field : mapRectsToPolygons(field)

  batch(() => {
    dispatch(setUi({
      [UiKeys.ACTIVE_PAGE]: activePage,
      [UiKeys.ACTIVE_SOURCE_ID]: activeSourceId,
    }))
    dispatch(setHighlightedField(highlightedField))
    dispatch(clearActivePolygons())
  })
}

export const highlightTableCoordsField = ({
  field,
  page,
  sourceId,
}) => (dispatch, getState) => {
  const state = getState()
  const document = documentSelector(state)
  const activePage = page ?? Document.getPageBySourceId(document, sourceId)
  const activeSourceId = sourceId ?? Document.getTableSourceIdByPage(document, page)

  batch(() => {
    dispatch(setUi({
      [UiKeys.ACTIVE_PAGE]: activePage,
      [UiKeys.ACTIVE_SOURCE_ID]: activeSourceId,
    }))
    dispatch(setHighlightedField(field))
    dispatch(clearActivePolygons())
  })
}

export const highlightTextCoordsField = ({
  field,
  sourceId,
}) => (dispatch, getState) => {
  const state = getState()
  const document = documentSelector(state)
  const page = Document.getPageBySourceId(document, sourceId)

  batch(() => {
    dispatch(setUi({
      [UiKeys.ACTIVE_PAGE]: page,
      [UiKeys.ACTIVE_SOURCE_ID]: sourceId,
    }))
    dispatch(setHighlightedField(field))
    dispatch(clearActivePolygons())
  })
}

export const goToError = (errorsPages, activePage) => async (dispatch) => {
  let newActivePage = errorsPages[0]
  for (let i = 0; i < errorsPages.length; i++) {
    if (errorsPages[i] > activePage) {
      newActivePage = errorsPages[i]
      break
    }
  }

  if (newActivePage !== activePage) {
    dispatch(setUi({ [UiKeys.ACTIVE_PAGE]: newActivePage }))
  }
}

export const extractAreaWithAlgorithm = createRequestAction(
  'extractAreaWithAlgorithm',
  (
    blobName,
    labelCoords,
    language,
    engine,
  ) => (dispatch, getState) => {
    const state = getState()
    const document = documentSelector(state)
    const documentType = documentTypeSelector(state)
    language ??= document.language || documentType.language
    engine ??= document.engine || documentType.engine || KnownProcessingEngines.TESSERACT

    return extractDataAreaWithAlgorithm({
      language,
      engine,
      blobName,
      labelCoords,
    })
  },
)

export const extractArea = createRequestAction(
  'extractArea',
  (
    blobFile,
    area,
    engine,
    language,
  ) => (dispatch, getState) => {
    const state = getState()
    const document = documentSelector(state)
    const documentType = documentTypeSelector(state)
    language ??= document.language || documentType.language
    engine ??= document.engine || documentType.engine || KnownProcessingEngines.TESSERACT

    return documentsApi.extractDataArea(
      area,
      blobFile,
      engine,
      language,
    )
  },
)

export const omrArea = createRequestAction(
  'omrArea',
  (blobFile, area) => () => documentsApi.omrArea(
    area,
    blobFile,
  ),
)

export const extractTable = createRequestAction(
  'extractTable',
  (blobFile, tableData, selectedEngineCode, language) => (dispatch, getState) => {
    const state = getState()
    language ??= documentSelector(state).language || documentTypeSelector(state).language
    return documentsApi.extractTableData(tableData, blobFile, selectedEngineCode, language)
  },
)

export const detectTables = createRequestAction(
  'detectTables',
  (
    blobFile,
    page,
    detectCoords,
    detectEngine,
    ocrEngine,
    language,
    rotation,
  ) => (dispatch, getState) => {
    const state = getState()
    const docType = documentTypeSelector(state)
    const docTypeEngine = docType.engine === UNKNOWN_DOCUMENT_TYPE.engine ? null : docType.engine

    language ??= (documentSelector(state).language || documentTypeSelector(state).language)
    ocrEngine ??= (documentSelector(state).engine || docTypeEngine || KnownProcessingEngines.TESSERACT)

    return documentsApi.detectTables(
      blobFile,
      page,
      detectCoords,
      detectEngine,
      ocrEngine,
      language,
      rotation,
    )
  },
)

export const saveExtractedDataField = createRequestAction(
  'saveExtractedDataField',
  (aliases, data, fieldPk, documentPk) => () => {
    return documentsApi.saveEdField(
      aliases,
      data,
      fieldPk,
      documentPk,
    )
  },
)
