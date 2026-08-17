
import { ENV } from '@/utils/env'
import {
  getQueryString,
  searchParamsToQueryString,
} from '@/utils/queryString'
import { getUrlWithOrigin } from '@/utils/string'

// TODO: #2795
const deprecatedError = () => {
  throw new Error('This endpoint is deprecated and no longer available on the service')
}

const backend = {
  version: (
    () => `${getUrlWithOrigin(ENV.BACKEND_URL)}/service-info/version`
  )(),
  v1: (() => {
    const v1Root = `${getUrlWithOrigin(ENV.BACKEND_URL)}/v1`
    const documents = (filterObj) => `${v1Root}/documents` + (filterObj ? `${searchParamsToQueryString(filterObj)}` : '')

    documents.document = (id) => documents() + `/${encodeURI(id)}`
    documents.document.export = (id, fileType) => documents.document(id) + '/export' + searchParamsToQueryString({ type: fileType })
    documents.assignType = () => documents() + '/assign-type'
    documents.extractData = () => documents() + '/extract-data'
    documents.documentFile = () => documents() + '/document-file'
    documents.skipValidation = () => deprecatedError()
    documents.addLabel = () => documents() + '/add-label'
    documents.states = () => documents() + '/states'
    documents.createMultiUploadSession = () => documents() + '/multi-upload-session'
    documents.runPipeline = () => documents() + '/run-pipeline'

    const version = () => `${v1Root}/version`

    const documentTemplates = () => deprecatedError()
    documentTemplates.list = () => deprecatedError()
    documentTemplates.documentTemplate = () => deprecatedError()
    documentTemplates.checkExistence = () => deprecatedError()
    documentTemplates.fieldTemplates = () => deprecatedError()
    documentTemplates.saveFieldTemplate = () => deprecatedError()
    documentTemplates.saveFieldTemplates = () => deprecatedError()
    documentTemplates.deleteFieldTemplate = () => deprecatedError()
    documentTemplates.updateFieldTemplate = () => deprecatedError()

    return {
      documents,
      version,
      documentTemplates,
    }
  })(),
}

const workflowManager = {
  version: (
    () => `${getUrlWithOrigin(ENV.WORKFLOW_MANAGER_URL)}/service-info/version`
  )(),
}

const tables = {
  version: (
    () => `${getUrlWithOrigin(ENV.TABLES_URL)}/service-info/version`
  )(),
  v1: (() => {
    const v1Root = `${getUrlWithOrigin(ENV.TABLES_URL)}/v1`
    const storage = () => `${v1Root}/storage`
    const detectTableData = () => `${storage()}/detect`
    const extractTableData = () => `${storage()}/extract`
    const tableEngines = () => `${v1Root}/detection-engines`

    return {
      tableEngines,
      detectTableData,
      extractTableData,
    }
  })(),
}

const ocr = {
  version: (
    () => `${getUrlWithOrigin(ENV.OCR_URL)}/service-info/version`
  )(),
}

const iam = {
  version: (
    () => `${getUrlWithOrigin(ENV.IAM_URL)}/service-info/version`
  )(),
}

const preprocess = {
  version: (
    () => `${getUrlWithOrigin(ENV.PREPROCESS_URL)}/v1/service-info/version`
  )(),
}

const fileStorage = {
  version: (
    () => `${getUrlWithOrigin(ENV.FILE_STORAGE_URL)}/service-info/version`
  )(),
  v1: (() => {
    const v1Root = `${getUrlWithOrigin(ENV.FILE_STORAGE_URL)}/v1`

    const file = () => `${v1Root}/file`
    file.output = (outputPath) => file() + `/${encodeURI(outputPath)}`

    return {
      file,
    }
  })(),
}

const omr = {
  version: (
    () => `${getUrlWithOrigin(ENV.OMR_URL)}/service-info/version`
  )(),
  v2: (() => {
    const v2Root = `${getUrlWithOrigin(ENV.OMR_URL)}/v2`
    const omrArea = () => `${v2Root}/extract-area`

    return {
      omrArea,
    }
  })(),
}

const template = {
  version: (
    () => `${getUrlWithOrigin(ENV.TEMPLATE_URL)}/v1/service-info/version`
  )(),
}

const apiGateway = {
  version: (
    () => `${getUrlWithOrigin(ENV.API_GATEWAY_URL)}/v1/service-info/version`
  )(),
  v1: (() => {
    const v1Root = `${getUrlWithOrigin(ENV.API_GATEWAY_URL)}/v1`

    const documents = () => `${v1Root}/documents`
    documents.import = () => documents() + '/import'

    const trialInfo = () => `${v1Root}/trial-info`

    return {
      documents,
      trialInfo,
    }
  })(),
}

const outputExporting = {
  version: (
    () => `${getUrlWithOrigin(ENV.OUTPUT_EXPORTING_URL)}/service-info/version`
  )(),
  v1: (() => {
    const v1Root = `${getUrlWithOrigin(ENV.OUTPUT_EXPORTING_URL)}/v1`
    const documentTypes = () => `${v1Root}/document-types`
    documentTypes.outputProfiles = (documentTypeId) => documentTypes() + `/${encodeURI(documentTypeId)}/profiles`
    documentTypes.outputProfile = (documentTypeId, profileId) => documentTypes.outputProfiles(documentTypeId) + `/${encodeURI(profileId)}`

    const document = () => `${v1Root}/document`
    document.outputs = (documentId) => document() + `/${encodeURI(documentId)}/outputs`
    document.output = (documentId, outputId) => document.outputs(documentId) + `/${encodeURI(outputId)}`

    return {
      documentTypes,
      document,
    }
  })(),
  v2: (() => {
    const v1Root = `${getUrlWithOrigin(ENV.OUTPUT_EXPORTING_URL)}/v2`

    const document = () => `${v1Root}/document`
    document.outputs = (documentId) => document() + `/${encodeURI(documentId)}/outputs`

    return {
      document,
    }
  })(),
}

const imagePreprocess = {
  version: (
    () => `${getUrlWithOrigin(ENV.IMAGE_PREPROCESS_URL)}/v1/service-info/version`
  )(),
}

const documentType = {
  version: (
    () => `${getUrlWithOrigin(ENV.DOCUMENT_TYPE_URL)}/v1/service-info/version`
  )(),
}

const extraction = {
  version: (
    () => `${getUrlWithOrigin(ENV.EXTRACTION_URL)}/service-info/version`
  )(),
  v1: (() => {
    const v1Root = `${getUrlWithOrigin(ENV.EXTRACTION_URL)}/v1`

    const extractedData = (id, pagination) => `${v1Root}/extracted-data/${encodeURI(id)}${searchParamsToQueryString(pagination)}`
    extractedData.fields = (documentPk, fieldPk) => extractedData(documentPk) + '/fields' + (fieldPk ? `/${encodeURI(fieldPk)}` : '')
    extractedData.field = (documentPk) => extractedData(documentPk) + '/field'

    return {
      extractedData,
    }
  })(),
  v2: (() => {
    const v2Root = `${getUrlWithOrigin(ENV.EXTRACTION_URL)}/v2`

    const extractedData = (id, pagination) => `${v2Root}/extracted-data/${encodeURI(id)}${searchParamsToQueryString(pagination)}`
    extractedData.fields = (documentPk, fieldPk) => extractedData(documentPk) + '/fields' + (fieldPk ? `/${encodeURI(fieldPk)}` : '')
    extractedData.field = (documentPk) => extractedData(documentPk) + '/field'
    extractedData.chunk = (documentPk, fieldPk, pagination) => extractedData.fields(documentPk, fieldPk) + `/chunk${searchParamsToQueryString(pagination)}`

    return {
      extractedData,
    }
  })(),
}

const unifier = {
  version: (
    () => `${getUrlWithOrigin(ENV.UNIFIER_URL)}/v1/service-info/version`
  )(),
}

const resultExporting = {
  version: (
    () => `${getUrlWithOrigin(ENV.RESULT_EXPORTING_URL)}/v1/service-info/version`
  )(),
}

const prototype = {
  version: (
    () => `${getUrlWithOrigin(ENV.PROTOTYPE_URL)}/service-info/version`
  )(),
}

const ner = {
  version: (
    () => `${getUrlWithOrigin(ENV.NER_URL)}/service-info/version`
  )(),
}

const prompter = {
  version: (
    () => `${getUrlWithOrigin(ENV.PROMPTER_URL)}/service-info/version`
  )(),
  v1: (() => {
    const v1Root = `${getUrlWithOrigin(ENV.PROMPTER_URL)}/v1`
    const documents = () => `${v1Root}/documents`
    documents.document = (documentId) => documents() + `/${encodeURI(documentId)}`
    documents.document.keyValues = (documentId) => documents.document(documentId) + '/key-values'
    documents.document.keyValues.keys = (documentId, ids) => documents.document.keyValues(documentId) + getQueryString(ids)

    const dial = () => `${v1Root}/ai-dial`
    dial.contextModels = () => `${dial()}/context-models`
    dial.request = () => `${dial()}/send-request`
    dial.document = (documentId) => `${dial()}/${encodeURI(documentId)}`
    dial.requestWithContext = (documentId) => `${dial.document(documentId)}/send-request`

    return {
      documents,
      dial,
    }
  })(),
}

const createDocumentsApi = (root) => {
  const documents = (filterObj) => `${root}/documents` + (filterObj ? `${getQueryString(filterObj)}` : '')
  documents.document = (documentId) => documents() + `/${encodeURI(documentId)}`
  documents.document.extras = (documentId, extras) =>
    documents.document(documentId) + (extras ? getQueryString({ extras }) : '')
  documents.labels = () => documents() + '/labels'
  documents.document.blob = (documentId) => documents.document(documentId) + '/files'
  documents.document.preprocessedFiles = (documentId) => documents.document(documentId) + '/preprocessed-files'
  documents.document.comments = (documentId) => documents.document(documentId) + '/comments'
  documents.document.labels = (documentId) => documents.document(documentId) + '/labels'
  documents.document.labels.label = (documentId, labelId) => documents.document.labels(documentId) + `/${encodeURI(labelId)}`
  documents.document.conversation = (documentId) => documents.document(documentId) + '/conversation'
  documents.document.parsingInfo = (documentId) => documents.document(documentId) + '/parsing-info'

  documents.document.documentLayout = (documentId, parsingParams) =>
    documents.document(documentId) + '/document-layout' + getQueryString(parsingParams)

  documents.document.documentLayout.userParsingType = (documentId) => documents.document.documentLayout(documentId) + '/user-parsing-type'
  documents.document.documentLayout.pages = (documentId) => documents.document.documentLayout(documentId) + '/pages'
  documents.document.documentLayout.pages.page = (documentId, pageId) => documents.document.documentLayout.pages(documentId) + `/${pageId}`

  documents.document.documentLayout.pages.page.paragraphs = (documentId, pageId) => (
    documents.document.documentLayout.pages.page(documentId, pageId) + '/paragraphs'
  )
  documents.document.documentLayout.pages.page.paragraphs.paragraph = (documentId, pageId, paragraphId) => (
    documents.document.documentLayout.pages.page.paragraphs(documentId, pageId) + `/${paragraphId}`
  )
  documents.document.documentLayout.pages.page.images = (documentId, pageId) => documents.document.documentLayout.pages.page(documentId, pageId) + '/images'
  documents.document.documentLayout.pages.page.images.image = (documentId, pageId, imageId) => (
    documents.document.documentLayout.pages.page.images(documentId, pageId) + `/${imageId}`
  )
  documents.document.documentLayout.pages.page.tables = (documentId, pageId) => documents.document.documentLayout.pages.page(documentId, pageId) + '/tables'
  documents.document.documentLayout.pages.page.tables.table = (documentId, pageId, tableId) => (
    documents.document.documentLayout.pages.page.tables(documentId, pageId) + `/${tableId}`
  )

  documents.document.documentLayout.pages.page.keyValuePairs = (documentId, pageId) =>
    documents.document.documentLayout.pages.page(documentId, pageId) + '/key-value-pairs'
  documents.document.documentLayout.pages.page.keyValuePairs.keyValuePair = (documentId, pageId, keyValuePairId) =>
    documents.document.documentLayout.pages.page.keyValuePairs(documentId, pageId) + `/${encodeURI(keyValuePairId)}`

  documents.document.documentLayout.pages.page.keyValuePairs.keyValuePair.patch = (documentId, pageId, keyValuePairId) =>
    documents.document.documentLayout.pages.page.keyValuePairs.keyValuePair(documentId, pageId, keyValuePairId)

  documents.document.tabularLayout = (documentId, tablesData) =>
    documents.document(documentId) + '/tabular-layout' + getQueryString(tablesData)

  documents.document.conversation.completions = (documentId, completionCodes) => {
    const completionsPath = documents.document.conversation(documentId) + '/completions'

    return completionsPath + `${getQueryString({ completionCodes })}`
  }

  documents.document.extractedData = (documentId, pagination) =>
    documents.document(documentId) + '/extracted-data' + `${searchParamsToQueryString(pagination)}`

  documents.document.extractedData.field = (documentId, fieldCode) =>
    documents.document.extractedData(documentId) + `/${encodeURI(fieldCode)}`

  documents.document.extractedData.field.tableChunk = (documentId, fieldCode, pagination) =>
    documents.document.extractedData.field(documentId, fieldCode) + `/table/chunk${searchParamsToQueryString(pagination)}`

  documents.document.extractedData.field.aliases = (documentId, fieldCode) =>
    documents.document.extractedData.field(documentId, fieldCode) + '/aliases'

  documents.pipelines = () => documents() + '/pipelines'
  documents.pipelines.fromStep = () => documents.pipelines() + '/from-step'

  documents.document.supplement = (documentId) => documents.document(documentId) + '/supplement'
  documents.document.outputs = (documentId) => documents.document(documentId) + '/outputs'
  documents.document.validationResult = (documentId) => documents.document(documentId) + '/validation-result'
  documents.document.review = (documentId) => documents.document(documentId) + '/review'
  documents.document.review.start = (documentId) => documents.document.review(documentId) + '/start'
  documents.document.review.complete = (documentId) => documents.document.review(documentId) + '/complete'

  documents.document.pipelines = (documentId) => documents.document(documentId) + '/pipelines'
  documents.document.pipelines.retryLastStep = (documentId) => documents.document.pipelines(documentId) + '/retry'

  documents.delete = (documentIds) => documents() + getQueryString({ documentIds })

  documents.document.unifiedData = (documentId) => documents.document(documentId) + '/unified-data'
  documents.document.unifiedData.tables = (documentId) => documents.document.unifiedData(documentId) + '/tables'
  documents.document.unifiedData.tables.table = (documentId, tableId) => documents.document.unifiedData.tables(documentId) + `/${encodeURI(tableId)}`
  documents.document.unifiedData.tables.table.cells = (documentId, tableId, tableConfig) =>
    documents.document.unifiedData.tables.table(documentId, tableId) + '/cells' + searchParamsToQueryString(tableConfig)

  documents.document.analysis = (documentId) => documents.document(documentId) + '/analysis'
  documents.document.analysis.retrieveInsights = (documentId) => documents.document.analysis(documentId) + '/retrieve-insights'

  return documents
}

const createDocumentTypesApi = (root) => {
  const documentTypes = (params) => `${root}/document-types` + searchParamsToQueryString(params)
  documentTypes.documentType = (documentTypeId) => documentTypes() + `/${encodeURI(documentTypeId)}`
  documentTypes.documentType.extras = (documentTypeId, extras) =>
    documentTypes.documentType(documentTypeId) + (extras ? getQueryString({ extras }) : '')

  documentTypes.documentType.extractionFields = (documentTypeCode, fieldCodes) => {
    const extractionFieldsRoot = documentTypes.documentType(documentTypeCode) + '/extraction-fields'
    return extractionFieldsRoot + (fieldCodes ? getQueryString({ fieldCodes }) : '')
  }

  documentTypes.documentType.extractionFields.extractionField = (documentTypeCode, fieldCode, extractorId) => {
    const extractionFieldRoot = documentTypes.documentType.extractionFields(documentTypeCode) + `/${encodeURI(fieldCode)}`
    return extractionFieldRoot + (extractorId ? getQueryString({ extractorId }) : '')
  }

  documentTypes.documentType.extraFields = (documentTypeId, extraFieldCodes) => {
    const extraFieldsRoot = documentTypes.documentType(documentTypeId) + '/extra-fields'
    return extraFieldsRoot + (extraFieldCodes ? getQueryString({ extraFieldCodes }) : '')
  }

  documentTypes.prototype = () => documentTypes() + '/prototype'
  documentTypes.documentType.prototype = (prototypeId) => documentTypes.documentType(prototypeId) + '/prototype'

  documentTypes.documentType.prototype.mappings = (prototypeId) => (
    documentTypes.documentType.prototype(prototypeId) + '/mappings'
  )

  documentTypes.documentType.prototype.mappings.field = (prototypeId, fieldCode) => (
    documentTypes.documentType.prototype.mappings(prototypeId) + `/${encodeURI(fieldCode)}`
  )

  documentTypes.documentType.prototype.tabularMappings = (prototypeId) => (
    documentTypes.documentType.prototype(prototypeId) + '/tabular-mappings'
  )

  documentTypes.documentType.prototype.tabularMappings.field = (prototypeId, fieldCode) => (
    documentTypes.documentType.prototype.tabularMappings(prototypeId) + `/${encodeURI(fieldCode)}`
  )

  documentTypes.documentType.prototype.layouts = (prototypeId) => (
    documentTypes.documentType.prototype(prototypeId) + '/layouts'
  )

  documentTypes.documentType.prototype.layouts.layout = (prototypeId, layoutId) => (
    documentTypes.documentType.prototype.layouts(prototypeId) + `/${encodeURI(layoutId)}`
  )

  documentTypes.documentType.prototype.layouts.delete = (prototypeId, layoutIds) => (
    documentTypes.documentType.prototype.layouts(prototypeId) + getQueryString({ layoutIds })
  )

  documentTypes.documentType.prototype.layouts.layout.restart = (prototypeId, layoutId) => (
    documentTypes.documentType.prototype.layouts.layout(prototypeId, layoutId) + '/pipelines/restart'
  )

  documentTypes.template = () => documentTypes() + '/template'
  documentTypes.documentType.template = (templateId) => documentTypes.documentType(templateId) + '/template'
  documentTypes.documentType.template.versions = (templateId) => documentTypes.documentType.template(templateId) + '/versions'
  documentTypes.documentType.template.versions.delete = (templateId, ids) =>
    documentTypes.documentType.template.versions(templateId) + getQueryString({ ids })
  documentTypes.documentType.template.versions.version = (templateId, versionId) =>
    documentTypes.documentType.template.versions(templateId) + `/${encodeURI(versionId)}`
  documentTypes.documentType.template.versions.version.markups = (templateId, versionId) =>
    documentTypes.documentType.template.versions.version(templateId, versionId) + '/markups'

  documentTypes.azureExtractor = () => documentTypes() + '/azure-extractor'
  documentTypes.azureExtractor.validateCredentials = () => documentTypes.azureExtractor() + '/validate-credentials'
  documentTypes.azureExtractor.extractor = (documentTypeId) => documentTypes.documentType(documentTypeId) + '/azure-extractor'
  documentTypes.azureExtractor.extractor.checkup = (documentTypeId) => documentTypes.azureExtractor.extractor(documentTypeId) + '/checkup'
  documentTypes.azureExtractor.extractor.synchronize = (documentTypeId) =>
    documentTypes.azureExtractor.extractor(documentTypeId) + '/synchronize'

  documentTypes.llmExtractor = () => documentTypes() + '/llm-extractor'

  documentTypes.documentType.llmExtractors = (documentTypeId) => documentTypes.documentType(documentTypeId) + '/llm-extractors'
  documentTypes.documentType.llmExtractors.moveQueries = (documentTypeId) =>
    documentTypes.documentType.llmExtractors(documentTypeId) + '/move-queries'
  documentTypes.documentType.llmExtractors.extractor = (documentTypeId, extractorId) =>
    documentTypes.documentType.llmExtractors(documentTypeId) + `/${encodeURI(extractorId)}`
  documentTypes.documentType.llmExtractors.extractor.llm = (documentTypeId, extractorId) =>
    documentTypes.documentType.llmExtractors.extractor(documentTypeId, extractorId) + '/llm'
  documentTypes.documentType.llmExtractors.extractor.extractionQuery = (documentTypeId, extractorId) =>
    documentTypes.documentType.llmExtractors.extractor(documentTypeId, extractorId) + '/extraction-query'
  documentTypes.documentType.llmExtractors.extractor.extractionQuery.field = (documentTypeId, extractorId, fieldCode) =>
    documentTypes.documentType.llmExtractors.extractor.extractionQuery(documentTypeId, extractorId) + `/${encodeURI(fieldCode)}`

  documentTypes.documentType.extractors = (documentTypeId) => documentTypes.documentType(documentTypeId) + '/extractors'
  documentTypes.documentType.extractors.extractor = (documentTypeId, extractorId) =>
    documentTypes.documentType.extractors(documentTypeId) + `/${encodeURI(extractorId)}`

  documentTypes.documentType.crossFieldValidators = (documentTypeId) => documentTypes.documentType(documentTypeId) + '/cross-field-validators'
  documentTypes.documentType.crossFieldValidators.validator = (documentTypeId, validatorId) =>
    documentTypes.documentType.crossFieldValidators(documentTypeId) + `/${encodeURI(validatorId)}`

  documentTypes.documentType.validators = (documentTypeId) => documentTypes.documentType(documentTypeId) + '/validators'
  documentTypes.documentType.validators.validator = (documentTypeId, validatorCode) =>
    documentTypes.documentType.validators(documentTypeId) + `/${encodeURI(validatorCode)}`
  documentTypes.documentType.validators.validator.rules = (documentTypeId, validatorCode) =>
    documentTypes.documentType.validators.validator(documentTypeId, validatorCode) + '/rules'
  documentTypes.documentType.validators.validator.rules.rule = (documentTypeId, validatorCode, ruleName) =>
    documentTypes.documentType.validators.validator.rules(documentTypeId, validatorCode) + `/${encodeURI(ruleName)}`
  documentTypes.documentType.validators.validator.validate = (documentTypeId, validatorCode) =>
    documentTypes.documentType.validators.validator(documentTypeId, validatorCode) + '/validate'

  documentTypes.attachExtractor = () => documentTypes() + '/attach-extractor'

  return documentTypes
}

const createDocumentTypesGroupsApi = (root) => {
  const documentTypesGroups = (params) => `${root}/groups` + getQueryString(params)
  documentTypesGroups.documentTypesGroup = (groupId) => documentTypesGroups() + `/${encodeURI(groupId)}`

  documentTypesGroups.documentTypesGroup.extras = (groupId, extras) => (
    documentTypesGroups.documentTypesGroup(groupId) + (extras ? getQueryString({ extras }) : '')
  )

  documentTypesGroups.documentTypesGroup.documentTypes = (groupId, id) =>
    documentTypesGroups.documentTypesGroup(groupId) + '/document-types' + getQueryString(id)

  documentTypesGroups.documentTypesGroup.documentTypes.documentType = (groupId, documentTypeId) => (
    documentTypesGroups.documentTypesGroup.documentTypes(groupId) + `/${encodeURI(documentTypeId)}`
  )

  documentTypesGroups.documentTypesGroup.documentTypes.documentType.genAiClassifiers = (groupId, documentTypeId) =>
    documentTypesGroups.documentTypesGroup.documentTypes.documentType(groupId, documentTypeId) + '/gen-ai-classifiers'

  documentTypesGroups.genAiClassifiers = () => documentTypesGroups() + '/gen-ai-classifiers'
  documentTypesGroups.genAiClassifiers.genAiClassifier = (id) => {
    const requestParams = Array.isArray(id) ? getQueryString({ id }) : `/${encodeURI(id)}`
    return documentTypesGroups() + '/gen-ai-classifiers' + requestParams
  }

  return documentTypesGroups
}

const createAgenticAiApi = (root) => {
  const agenticAi = () => `${root}/agentic-ai`

  agenticAi.conversations = (params) => agenticAi() + '/conversations' + getQueryString(params)
  agenticAi.conversations.conversation = (conversationId) => agenticAi.conversations() + `/${encodeURI(conversationId)}`
  agenticAi.conversations.conversation.completions = (conversationId) => agenticAi.conversations.conversation(conversationId) + '/completions'
  agenticAi.conversations.conversation.completions.completion = (conversationId, completionId) =>
    agenticAi.conversations.conversation.completions(conversationId) + `/${encodeURI(completionId)}`
  agenticAi.conversations.conversation.completions.completion.editQuestion = ({ conversationId, completionId, userQuestion, chatArguments }) =>
    agenticAi.conversations.conversation.completions.completion(conversationId, completionId) + searchParamsToQueryString({
      userQuestion,
      arguments: chatArguments,
    })
  agenticAi.conversations.conversation.chat = ({ conversationId, userQuestion, chatArguments }) =>
    agenticAi.conversations.conversation(conversationId) + '/chat' + searchParamsToQueryString({
      userQuestion,
      arguments: chatArguments,
    })

  agenticAi.agentVendors = () => agenticAi() + '/agent-vendors'

  return agenticAi
}

const createIamApi = (root) => {
  const iam = () => `${root}/iam`

  iam.users = () => iam() + '/users'
  iam.users.user = (userId) => iam.users() + `/${(userId)}`
  iam.users.me = () => iam.users() + '/me'

  iam.organisations = () => iam() + '/organisations'
  iam.organisation = (orgPk) => iam.organisations() + `/${orgPk}`
  iam.organisation.activate = (orgPk) => iam.organisation(orgPk) + '/activate'
  iam.organisation.users = (orgPk, filters) => iam.organisation(orgPk) + '/users' + (filters ? `${searchParamsToQueryString(filters)}` : '')
  iam.organisation.invite = (orgPk) => iam.organisation(orgPk) + '/invite'
  iam.organisation.invitees = (orgPk, filters) => iam.organisation(orgPk) + '/invitees' + searchParamsToQueryString(filters)
  iam.organisation.join = (orgPk) => iam.organisation(orgPk) + '/join'
  iam.organisation.approvals = (orgPk, filters) => iam.organisation(orgPk) + '/approvals' + searchParamsToQueryString(filters)
  iam.organisation.approve = (orgPk) => iam.organisation(orgPk) + '/approve'

  return iam
}

const apiGatewayV2 = {
  v5: (() => {
    const v5Root = `${getUrlWithOrigin(ENV.BASE_API_URL)}/v5`

    const batches = (filters) => `${v5Root}/batches` + getQueryString(filters)
    batches.withDocuments = (filters) => `${batches()}/with-documents` + getQueryString(filters)
    batches.batch = (id) => batches() + `/${encodeURI(id)}`

    batches.batch.files = (batchId, fileIds) => batches.batch(batchId) + '/files' + (fileIds ? getQueryString({ ids: fileIds }) : '')
    batches.batch.files.withDocuments = (bId, fIds) => batches.batch.files(bId) + '/with-documents' + (fIds ? getQueryString({ ids: fIds }) : '')

    const crossSiteRequestForgery = () => `${v5Root}/csrf`

    const documents = createDocumentsApi(v5Root)
    const documentTypes = createDocumentTypesApi(v5Root)
    const documentTypesGroups = createDocumentTypesGroupsApi(v5Root)
    const agenticAi = createAgenticAiApi(v5Root)
    const iam = createIamApi(v5Root)

    const tools = () => `${v5Root}/tools`
    tools.llms = () => tools() + '/llms'
    tools.ocr = () => tools() + '/ocr'
    tools.ocr.engines = () => tools.ocr() + '/engines'
    tools.ocr.languages = () => tools.ocr() + '/languages'
    tools.ocr.extractArea = () => tools.ocr() + '/extract-area'
    tools.ocr.extractImagePage = () => tools.ocr() + '/extract-image-page'

    const file = () => `${v5Root}/file`
    file.blob = (blobName) => `${file()}/${encodeURI(blobName)}`

    const files = (filters) => `${v5Root}/files` + getQueryString(filters)
    files.split = () => `${files()}/split`
    files.file = (fileId) => `${v5Root}/files/${encodeURI(fileId)}`
    files.file.parsingInfo = (fileId) => files.file(fileId) + '/parsing-info'
    files.file.documentLayout = (fileId, parsingParams) => files.file(fileId) + '/document-layout' + getQueryString(parsingParams)
    files.file.documentLayout.userParsingType = (fileId) => files.file.documentLayout(fileId) + '/user-parsing-type'
    files.file.documentLayout.pages = (fileId) => files.file.documentLayout(fileId) + '/pages'
    files.file.documentLayout.pages.page = (fileId, pageId) => files.file.documentLayout.pages(fileId) + `/${pageId}`
    files.file.documentLayout.pages.page.paragraphs = (fileId, pageId) => (
      files.file.documentLayout.pages.page(fileId, pageId) + '/paragraphs'
    )
    files.file.documentLayout.pages.page.paragraphs.paragraph = (fileId, pageId, paragraphId) => (
      files.file.documentLayout.pages.page.paragraphs(fileId, pageId) + `/${paragraphId}`
    )
    files.file.documentLayout.pages.page.images = (fileId, pageId) => files.file.documentLayout.pages.page(fileId, pageId) + '/images'
    files.file.documentLayout.pages.page.images.image = (fileId, pageId, imageId) => (
      files.file.documentLayout.pages.page.images(fileId, pageId) + `/${imageId}`
    )
    files.file.documentLayout.pages.page.tables = (fileId, pageId) => files.file.documentLayout.pages.page(fileId, pageId) + '/tables'
    files.file.documentLayout.pages.page.tables.table = (fileId, pageId, tableId) => (
      files.file.documentLayout.pages.page.tables(fileId, pageId) + `/${tableId}`
    )
    files.file.documentLayout.pages.page.keyValuePairs = (fileId, pageId) =>
      files.file.documentLayout.pages.page(fileId, pageId) + '/key-value-pairs'
    files.file.documentLayout.pages.page.keyValuePairs.keyValuePair = (fileId, pageId, keyValuePairId) =>
      files.file.documentLayout.pages.page.keyValuePairs(fileId, pageId) + `/${encodeURI(keyValuePairId)}`
    files.file.unifiedData = (fileId) => files.file(fileId) + '/unified-data'
    files.file.unifiedData.tables = (fileId) => files.file.unifiedData(fileId) + '/tables'
    files.file.unifiedData.tables.table = (fileId, tableId) => files.file.unifiedData.tables(fileId) + `/${encodeURI(tableId)}`
    files.file.unifiedData.tables.table.cells = (fileId, tableId, tableConfig) =>
      files.file.unifiedData.tables.table(fileId, tableId) + '/cells' + searchParamsToQueryString(tableConfig)
    files.file.tabularLayout = (fileId, tablesData) =>
      files.file(fileId) + '/tabular-layout' + getQueryString(tablesData)
    files.file.createDocument = (fileId) => files.file(fileId) + '/create-document'
    files.file.createBatch = (fileId) => files.file(fileId) + '/create-batch'
    files.file.restart = (fileId) => files.file(fileId) + '/restart'
    files.file.split = (fileId) => files.file(fileId) + '/split'
    files.process = () => `${files()}/process`
    files.classify = () => `${files()}/classify`

    const eventsStreaming = () => `${v5Root}/event-relay/stream`

    const services = () => `${v5Root}/services`

    const sagas = () => `${v5Root}/sagas`
    sagas.saga = (entityId) => sagas() + `/${encodeURI(entityId)}`
    sagas.saga.state = (entityId) => sagas.saga(entityId) + '/state'

    const workflowConfiguration = (documentTypeId) => `${v5Root}/workflow-configuration/${encodeURI(documentTypeId)}`

    const documentFieldAnalytics = () => `${v5Root}/document-field-analytics`
    documentFieldAnalytics.mostActiveFields = (params) => documentFieldAnalytics() + '/most-active-fields' + getQueryString(params)

    const splitting = () => `${v5Root}/splitting`
    splitting.splitters = () => splitting() + '/splitters'
    splitting.splitter = (splitterId) => splitting.splitters() + `/${encodeURI(splitterId)}`
    splitting.proposals = (fileId) => splitting() + '/splitting-proposals' + `/${encodeURI(fileId)}`
    splitting.proposals.confirm = (fileId) => splitting.proposals(fileId) + '/confirm'

    const litellm = () => `${v5Root}/litellm`
    litellm.models = () => litellm() + '/models'

    const semanticLayout = (layoutId) => `${v5Root}/semantic-layout/${encodeURI(layoutId)}`

    return {
      agenticAi,
      batches,
      crossSiteRequestForgery,
      documents,
      documentTypes,
      documentTypesGroups,
      eventsStreaming,
      tools,
      file,
      services,
      files,
      sagas,
      iam,
      workflowConfiguration,
      documentFieldAnalytics,
      splitting,
      litellm,
      semanticLayout,
    }
  })(),
  v6: (() => {
    const v6Root = `${getUrlWithOrigin(ENV.BASE_API_URL)}/v6`
    const documents = createDocumentsApi(v6Root)

    return {
      documents,
    }
  })(),
}

const agenticAi = {
  version: (
    () => `${getUrlWithOrigin(ENV.AGENTIC_AI_URL)}/service-info/version`
  )(),
  v1: (() => {
    const v1Root = `${getUrlWithOrigin(ENV.AGENTIC_AI_URL)}/v1`

    const modes = (code) => `${v1Root}/modes` + getQueryString({ code })

    return {
      modes,
    }
  })(),
}

export const apiMap = {
  iam,
  backend,
  tables,
  ocr,
  preprocess,
  fileStorage,
  omr,
  template,
  workflowManager,
  apiGateway,
  outputExporting,
  imagePreprocess,
  documentType,
  extraction,
  unifier,
  resultExporting,
  prototype,
  ner,
  prompter,
  apiGatewayV2,
  agenticAi,
}
