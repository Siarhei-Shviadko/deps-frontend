
import isObject from 'lodash/isObject'
import { documentTypesApi } from '@/api/documentTypesApi'
import { DocumentExtras } from '@/enums/DocumentExtras'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { StatusCode } from '@/enums/StatusCode'
import { Document } from '@/models/Document'
import { ExtractedDataFieldV2 } from '@/models/ExtractedData'
import { defaultChunkSize, TablePagination } from '@/models/ExtractedData/TablePagination'
import { apiMap } from '@/utils/apiMap'
import { apiRequest } from '@/utils/apiRequest'
import { ENV } from '@/utils/env'

const EXTRAS_TO_REQUEST_PARAMETER = {
  [DocumentExtras.CONVERSATION]: 'conversation',
  [DocumentExtras.METADATA]: 'metadata',
  [DocumentExtras.OUTPUTS]: 'outputs',
  [DocumentExtras.PARSING_INFO]: 'parsing-info',
  [DocumentExtras.VALIDATION_RESULTS]: 'validation-results',
}

const mapDTOToDocument = async (document) => {
  const documentTypes = await documentTypesApi.fetchDocumentTypes()
  return Document.fromDTO(document, documentTypes)
}

const mapDTOsToDocuments = async (documents) => {
  const documentTypes = await documentTypesApi.fetchDocumentTypes()
  return documents.map((document) => Document.fromDTO(document, documentTypes))
}

const mapUDtoDocuments = async (documents) => {
  const updatedDocuments = await mapDTOsToDocuments(documents)
  return await Promise.all(
    updatedDocuments.map(async (document) => {
      const unifiedData = await getUnifiedData(document._id)
      if (unifiedData) {
        document.unifiedData = unifiedData
      }
      return document
    }),
  )
}

const mapUDtoDocument = async (doc) => {
  const [document, unifiedData] = await Promise.all([
    mapDTOToDocument(doc),
    getUnifiedData(doc._id),
  ])

  if (unifiedData) {
    document.unifiedData = unifiedData
  }
  return document
}

const _createDocument = (file, data, onSuccess, onError, onProgress, documentsEndpoint) => {
  const formData = new FormData()
  formData.append('file', file, file.name)

  Object.keys(data).forEach((key) => {
    let value = data[key]
    const empty = value == null
    if (isObject(value)) {
      value = JSON.stringify(value)
    }
    !empty && formData.append(key, value)
  })

  return apiRequest.formPost(documentsEndpoint, formData, {
    onSuccess,
    onError,
    onProgress,
  })
}

const createDocumentLegacy = (file, data, onSuccess, onError, onProgress) =>
  _createDocument(file, data, onSuccess, onError, onProgress, apiMap.apiGatewayV2.v5.documents())

const createDocument = (file, data, onSuccess, onError, onProgress) =>
  _createDocument(file, data, onSuccess, onError, onProgress, apiMap.apiGatewayV2.v6.documents())

const getDocuments = (filter, opts) => apiRequest.get(apiMap.apiGatewayV2.v5.documents(filter), opts)

const getDocumentList = async (filter) => {
  const response = await getDocuments(filter)

  const documents = await mapDTOsToDocuments(response.result)

  return {
    documents,
    meta: response.meta,
  }
}

const assignDocumentType = async (documentIds, typeName) => {
  const documents = await apiRequest.post(apiMap.backend.v1.documents.assignType(), {
    documentIds,
    typeName,
  })
  return mapUDtoDocuments(documents)
}

const updateDocument = (documentId, newData) => apiRequest.patch(
  apiMap.apiGatewayV2.v5.documents.document(documentId),
  newData,
)

const extractData = async (documentIds, engineCode) => {
  const documents = await apiRequest.post(apiMap.backend.v1.documents.extractData(), {
    documentIds,
    engineName: engineCode,
  })
  return mapUDtoDocuments(documents)
}

const startReview = async (documentId) => {
  const [updatedDocument] = await apiRequest.post(apiMap.apiGatewayV2.v5.documents.document.review.start(documentId))
  return mapUDtoDocument(updatedDocument)
}

const getUnifiedData = async (documentId) => {
  let unifiedData

  const apiUrl = apiMap.apiGatewayV2.v5.documents.document.unifiedData(documentId)

  try {
    const data = await apiRequest.get(apiUrl)
    unifiedData = data.elements.reduce((acc, d) => {
      acc[d.page]
        ? acc[d.page] = [...acc[d.page], d]
        : acc[d.page] = [d]
      return acc
    }, {})
  } catch (e) {
    if (e.request.status === StatusCode.NOT_FOUND || ENV.IS_DEV) {
      return null
    }
    throw e
  }
  return unifiedData
}

const getUnifiedDataTableCells = (
  documentId,
  tableId,
  lastRow,
  lastColumn,
) => {
  const config = {
    firstRow: 0,
    firstColumn: 0,
    lastRow,
    lastColumn,
  }
  const apiUrl = apiMap.apiGatewayV2.v5.documents.document.unifiedData.tables.table.cells(documentId, tableId, config)

  return apiRequest.get(apiUrl)
}

const getDocumentDetail = async (documentId, extras = [], opts) => {
  const extrasParameters = extras.map((extra) => EXTRAS_TO_REQUEST_PARAMETER[extra])
  const document = await apiRequest.get(apiMap.apiGatewayV2.v5.documents.document.extras(documentId, extrasParameters), opts)
  return {
    ...document,
    validation: document.validationResults,
  }
}

const getDocument = async (documentId, withoutPagination) => {
  const response = await getDocumentDetail(
    documentId,
    [
      DocumentExtras.VALIDATION_RESULTS,
      DocumentExtras.PARSING_INFO,
    ],
  )

  const [
    { value: extractedData, reason: edReason },
    { value: document, reason: documentReason },
  ] = await Promise.allSettled([
    getDocumentExtractedData(documentId, withoutPagination),
    mapUDtoDocument(response),
  ])

  if (edReason) {
    throw edReason
  }

  if (documentReason) {
    throw documentReason
  }

  return {
    ...document,
    extractedData,
  }
}

const getDocumentWithoutExtraction = async (documentId) => {
  const response = await getDocumentDetail(documentId)
  return mapUDtoDocument(response)
}

const getDocumentExtractedData = async (documentId, withoutPagination) => {
  const paginationConfig = !withoutPagination &&
    ENV.FEATURE_PAGINATED_TABLES &&
    new TablePagination({ rowsPerChunk: defaultChunkSize })

  let extractedData

  try {
    const url = apiMap.apiGatewayV2.v5.documents.document.extractedData(documentId, paginationConfig)
    extractedData = await apiRequest.get(url)
  } catch (e) {
    if (e.request.status === StatusCode.NOT_FOUND || ENV.IS_DEV) {
      return []
    }
    throw e
  }

  return extractedData.fields.map(ExtractedDataFieldV2.toExtractedDataFieldV1)
}

const getPaginatedEdTable = async (documentPK, fieldPK, paginationConfig) => {
  if (!ENV.FEATURE_PAGINATED_TABLES) {
    return null
  }
  let extractedData
  try {
    const url = apiMap.apiGatewayV2.v5.documents.document.extractedData.field.tableChunk(documentPK, fieldPK, paginationConfig)

    extractedData = await apiRequest.get(url)
  } catch (e) {
    if (e.request.status === StatusCode.NOT_FOUND || ENV.IS_DEV) {
      return null
    }
    throw e
  }

  return extractedData
}

const updateEdField = async ({ data, documentPk, fieldPk }) => {
  let updatedField
  try {
    const url = apiMap.extraction.v2.extractedData.fields(documentPk, fieldPk)

    updatedField = await apiRequest.patch(url, data)
  } catch (e) {
    throw new Error(e)
  }

  return updatedField
}

const saveEdField = async ({
  aliases,
  data,
  documentPk,
  fieldPk,
}) => {
  let savedField
  try {
    const url = apiMap.extraction.v1.extractedData.field(documentPk)

    savedField = await apiRequest.put(url, {
      aliases,
      data,
      fieldPk,
    })
  } catch (e) {
    throw new Error(e)
  }

  return savedField
}

const deleteEdFields = ({ documentPk, fieldPks }) => {
  const url = apiMap.extraction.v1.extractedData.fields(documentPk)

  apiRequest.delete(url, { data: { fieldPks } })
}

const updateExtractedData = (document) => {
  const url = apiMap.extraction.v1.extractedData(document._id)

  apiRequest.put(url, document.extractedData)
}

const saveData = async (document) => {
  const request = {
    documentId: document._id,
    extractedData: document.extractedData,
  }
  const url = apiMap.extraction.v1.extractedData(document._id)

  await apiRequest.put(url, document.extractedData)

  return request
}

const saveExtractedData = (extractedData, documentId) => {
  const url = apiMap.extraction.v1.extractedData(documentId)

  apiRequest.put(url, extractedData)
}

const completeReview = async (documentId) => {
  const response = await apiRequest.post(apiMap.apiGatewayV2.v5.documents.document.review.complete(documentId))
  return mapUDtoDocument(response)
}

const getDocumentValidation = async (documentId) => {
  try {
    return await apiRequest.get(
      apiMap.apiGatewayV2.v5.documents.document.validationResult(documentId),
    )
  } catch (e) {
    if (e.request.status === StatusCode.NOT_FOUND || ENV.IS_DEV) {
      return null
    }
    throw e
  }
}

const skipValidation = (documentId, extractedData) => apiRequest.post(apiMap.backend.v1.documents.skipValidation(), {
  documentId,
  extractedData,
})

const retryLastStep = (documentId) => apiRequest.post(apiMap.apiGatewayV2.v5.documents.document.pipelines.retryLastStep(documentId), {
  documentId,
})

const addComment = (documentId, text) => apiRequest.post(
  apiMap.apiGatewayV2.v5.documents.document.comments(documentId),
  { text },
)

const addLabel = (labelId, documentIds) => apiRequest.post(apiMap.backend.v1.documents.addLabel(), {
  documentIds,
  labelId,
})

const removeLabel = (labelId, documentId) => apiRequest.delete(
  apiMap.apiGatewayV2.v5.documents.document.labels.label(documentId, labelId),
)

const createMultiUploadSession = () => apiRequest.post(apiMap.backend.v1.documents.createMultiUploadSession())

const runPipeline = (documentIds, extractData) => apiRequest.post(apiMap.backend.v1.documents.runPipeline(), {
  documentIds,
  extractData,
})

const runPipelineFromStep = (
  documentIds,
  step,
  settings,
) => {
  const { engine, llmType, parsingFeatures } = settings
  const data = {
    documentIds,
    step,
  }

  if (engine) {
    data.engineName = engine
  }

  if (llmType) {
    data.llmType = llmType
  }

  if (parsingFeatures) {
    data.parsingFeatures = parsingFeatures
  }

  return apiRequest.post(apiMap.apiGatewayV2.v5.documents.pipelines.fromStep(), data)
}

const deleteDocuments = (documentIds) => apiRequest.delete(apiMap.apiGatewayV2.v5.documents.delete(documentIds))

const extractDataArea = (area, blobFile, engine, language) => {
  let body = {
    area,
    blobFile,
    engine,
    // engineSettings: {}
  }

  if (language) {
    body = {
      ...body,
      language,
    }
  }

  return apiRequest.post(apiMap.apiGatewayV2.v5.tools.ocr.extractArea(), body)
}

const omrArea = (area, blobFile) => apiRequest.post(
  apiMap.omr.v2.omrArea(),
  {
    area,
    blobFile,
  },
)

const extractTableData = (table, blobFile, ocrEngine = KnownProcessingEngines.TESSERACT, language) => {
  let body = {
    ocrEngine,
    table,
    blobFile,
    transformation: {
      rotation: 0,
    },
  }

  if (language) {
    body = {
      ...body,
      language,
    }
  }

  return apiRequest.post(apiMap.tables.v1.extractTableData(), body)
}

const detectTables = (
  blobFile,
  page,
  detectCoords,
  detectEngine,
  ocrEngine,
  language,
  rotation,
) => {
  let body = {
    ocrEngine,
    tableDetectionEngine: detectEngine,
    blobFile,
    area: {
      ...detectCoords,
      page,
    },
  }

  if (language) {
    body = {
      ...body,
      language,
    }
  }

  if (rotation) {
    body = {
      ...body,
      transformations: {
        rotation,
      },
    }
  }

  return apiRequest.post(apiMap.tables.v1.detectTableData(), body)
}

const detectTableData = (blobFile, area, language) => apiRequest.post(apiMap.tables.v1.detectTableData(), {
  language,
  blobFile,
  area,
})

const extractImagePage = ({ engine, language, blobName }) => apiRequest.post(apiMap.apiGatewayV2.v5.tools.ocr.extractImagePage(), {
  engine,
  blobName,
  ...(language && { language }),
})

const importDocuments = (documentsData) => (
  apiRequest.post(apiMap.apiGateway.v1.documents.import(), documentsData)
)

const updateFieldAliases = ({
  documentId,
  fieldCode,
  updatedAliases,
}) => (
  apiRequest.patch(
    apiMap.apiGatewayV2.v5.documents.document.extractedData.field.aliases(documentId, fieldCode),
    { updatedAliases },
  )
)

export {
  createDocument,
  createDocumentLegacy,
  detectTables,
  getDocumentList,
  getDocumentDetail,
  getDocuments,
  omrArea,
  assignDocumentType,
  updateDocument,
  getDocumentWithoutExtraction,
  extractData,
  startReview,
  getDocument,
  getDocumentExtractedData,
  updateExtractedData,
  saveData,
  saveExtractedData,
  completeReview,
  getDocumentValidation,
  skipValidation,
  retryLastStep,
  addComment,
  addLabel,
  removeLabel,
  createMultiUploadSession,
  runPipeline,
  runPipelineFromStep,
  getUnifiedData,
  deleteDocuments,
  extractDataArea,
  extractTableData,
  detectTableData,
  getPaginatedEdTable,
  updateEdField,
  saveEdField,
  deleteEdFields,
  getUnifiedDataTableCells,
  extractImagePage,
  importDocuments,
  updateFieldAliases,
}
