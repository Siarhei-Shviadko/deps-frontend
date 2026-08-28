
import { FieldType as FieldTypeLT } from 'labeling-tool/lib/enums/FieldType'
import { Field } from 'labeling-tool/lib/models/Field'
import { ListFieldMeta, PairFieldMeta, EnumFieldMeta } from 'labeling-tool/lib/models/FieldMeta'
import PropTypes from 'prop-types'
import { PureComponent } from 'react'
import { connect } from 'react-redux'
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
import { LabelingTool, Panel, Tool, Feature, Mode } from '@/components/LabelingTool'
import { Spin } from '@/components/Spin'
import { UiKeys } from '@/constants/navigation'
import { LocationChange } from '@/containers/LocationChange'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { FieldType } from '@/enums/FieldType'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { KnownTableEngine } from '@/enums/KnownTableEngine'
import { localize, Localization } from '@/localization/i18n'
import { Document, documentShape } from '@/models/Document'
import { documentTypeShape, UNKNOWN_DOCUMENT_TYPE } from '@/models/DocumentType'
import { Engine, engineShape } from '@/models/Engine'
import { EventEmitter } from '@/models/EventEmitter'
import { languageShape } from '@/models/Language'
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
import { apiMap } from '@/utils/apiMap'
import { ENV } from '@/utils/env'
import { fetchImage } from '@/utils/image'
import {
  notifyRequest,
  notifyWarning,
  notifySuccess,
  notifyError,
  notifyInfo,
} from '@/utils/notification'
import { goBack } from '@/utils/routerActions'
import { mapExtractedDataToMarkup, mapMarkupToExtractedData } from './mappers'
import { mapLtTableToEdTableData } from './mappers/mapTableToExtractedData'
import { mapTableToMarkup } from './mappers/mapTableToMarkup'

const SUPPORTED_FIELD_TYPES = [
  FieldType.CHECKMARK,
  FieldType.DICTIONARY,
  FieldType.STRING,
  FieldType.LIST,
  FieldType.TABLE,
  FieldType.ENUM,
  FieldType.DATE,
]

const SUPPORTED_LIST_SUB_FIELD_TYPES = [
  FieldType.TABLE,
  FieldType.STRING,
  FieldType.DICTIONARY,
  FieldType.CHECKMARK,
  FieldType.ENUM,
]

const FIELD_TYPE_TO_LT_TYPE_MAP = {
  [FieldType.DICTIONARY]: FieldTypeLT.PAIR,
}

const GETTER_FIELD_META = {
  [FieldTypeLT.PAIR]: (docTypeField) => new PairFieldMeta(docTypeField.fieldMeta.keyType, docTypeField.fieldMeta.valueType),
  [FieldTypeLT.LIST]: (docTypeField, baseType) => new ListFieldMeta(baseType, docTypeField.fieldMeta.baseTypeMeta),
  [FieldTypeLT.ENUM]: (docTypeField) => new EnumFieldMeta(docTypeField.fieldMeta.options),
}

const EMPTY_RECOGNIZE = {
  content: '',
  confidence: null,
}

const EMPTY_OMR_RECOGNIZE = {
  content: null,
  confidence: null,
}

const AUTOSAVE_INTERVAL_MS = 180_000

const cacheDocumentImages = (document) => {
  if (!document.unifiedData) {
    return
  }

  const blobNames = Document.getBlobNames(document) ?? []
  const urls = blobNames.map((blobName) => apiMap.apiGatewayV2.v5.file.blob(blobName))

  FileCache.requestAndStore(urls)
}

class DocumentLabelingTool extends PureComponent {
  static propTypes = {
    extractArea: PropTypes.func.isRequired,
    extractTable: PropTypes.func.isRequired,
    detectTables: PropTypes.func.isRequired,
    documentType: documentTypeShape,
    engines: PropTypes.arrayOf(engineShape).isRequired,
    omrArea: PropTypes.func.isRequired,
    languages: PropTypes.arrayOf(languageShape),
    fetchDocumentType: PropTypes.func.isRequired,
    fetchDocumentData: PropTypes.func.isRequired,
    fetchProcessingEngines: PropTypes.func.isRequired,
    fetchAvailableLanguages: PropTypes.func.isRequired,
    documentId: PropTypes.string.isRequired,
    document: documentShape,
    initialPage: PropTypes.number.isRequired,
  }

  onClose = new EventEmitter()

  state = {
    fetching: true,
  }

  getDocumentName = () => this.props.document.title.replace(/(\.\w+$)/gim, '')

  getDocument = () => ({
    pages: Document.getPreviewUrls(this.props.document),
    language: this.props.document.language,
    name: this.getDocumentName(),
    engine: this.props.document.engine || this.props.documentType.engine,
  })

  getFields = () => {
    return this.props.documentType.fields
      .filter((f) => {
        if (f.fieldType === FieldType.LIST) {
          return SUPPORTED_LIST_SUB_FIELD_TYPES.includes(f.fieldMeta.baseType)
        }
        return SUPPORTED_FIELD_TYPES.includes(f.fieldType)
      })
      .map((f) => {
        const fieldType = FIELD_TYPE_TO_LT_TYPE_MAP[f.fieldType] ?? f.fieldType
        const baseType = FIELD_TYPE_TO_LT_TYPE_MAP[f.fieldMeta?.baseType] || f.fieldMeta?.baseType || null
        const fieldMeta = GETTER_FIELD_META[fieldType]?.(f, baseType)
        return new Field(f.code, f.name, fieldType, fieldMeta, f.required)
      })
  }

  notifyExtraction = async (cb) => notifyRequest(cb())({
    fetching: localize(Localization.EXTRACTING_DATA),
    warning: localize(Localization.EXTRACTING_DATA_ERROR),
  })

  save = async (markup, _rotationAngles, language, notifyExtraction) => {
    const docTypeEngine = this.props.documentType.engine === UNKNOWN_DOCUMENT_TYPE.engine ? null : this.props.documentType.engine

    const mapAndExtract = () => mapMarkupToExtractedData(
      markup,
      this.props.documentType,
      this.props.document.processingDocuments,
      language || this.props.document.language || this.props.documentType.language,
      this.props.document.engine || docTypeEngine || KnownProcessingEngines.TESSERACT,
      !notifyExtraction,
      this.props.document.unifiedData,
      this.props.document.extractedData,
    )

    try {
      const newExtractedData = notifyExtraction
        ? await notifyExtraction(mapAndExtract)
        : await mapAndExtract()

      await notifyRequest(documentsApi.saveExtractedData(newExtractedData, this.props.documentId))({
        fetching: localize(Localization.MARKUP_SAVING),
        success: localize(Localization.MARKUP_SAVING_SUCCESS),
        warning: localize(Localization.MARKUP_SAVING_ERROR),
      })

      return mapExtractedDataToMarkup(
        newExtractedData,
        this.props.documentType.fields,
        this.props.document.unifiedData,
      )
    } catch (e) {
      notifyWarning(localize(Localization.MARKUP_SAVING_ERROR))
    }
  }

  getPageByUrl = (imageUrl) => {
    if (this.props.document.unifiedData) {
      const [page] = Object.entries(this.props.document.unifiedData).find(([, ud]) => {
        const blobUnifiedData = ud.filter((d) => !!d.blobName)
        const { blobName } = blobUnifiedData[blobUnifiedData.length - 1]
        return apiMap.apiGatewayV2.v5.file.blob(blobName) === imageUrl
      })
      return page
    }

    const [[page]] = Object.entries(this.props.document.previewDocuments).filter(([, preview]) =>
      apiMap.apiGatewayV2.v5.file.blob(preview.blobName) === imageUrl,
    )
    return page
  }

  omrArea = async (imageUrl, labelCoords) => {
    const page = this.getPageByUrl(imageUrl)
    const blobName = Document.getUnifiedDataBlobName(this.props.document, page) ?? Document.getProcessingBlobName(this.props.document, page)

    try {
      const { content, confidence } = await notifyRequest(this.props.omrArea(
        blobName,
        labelCoords,
      ))({
        fetching: localize(Localization.RECOGNIZE_FETCHING),
        success: localize(Localization.RECOGNIZE_SUCCESS),
        warning: localize(Localization.RECOGNIZE_FAILURE),
      })
      return content !== null ? {
        content,
        confidence,
      } : EMPTY_OMR_RECOGNIZE
    } catch {
      return EMPTY_OMR_RECOGNIZE
    }
  }

  extractDataAreaWithAlgorithm = async ({
    language,
    engine,
    blobName,
    labelCoords,
  }) => {
    const edLabelData = await notifyRequest(extractDataAreaWithAlgorithm({
      language,
      engine,
      blobName,
      labelCoords,
    }))({
      fetching: localize(Localization.RECOGNIZE_FETCHING),
      success: localize(Localization.RECOGNIZE_SUCCESS),
      warning: localize(Localization.RECOGNIZE_FAILURE),
    })

    return edLabelData
  }

  extractDataArea = async ({
    blobName,
    labelCoords,
    engine,
    language,
  }) => {
    const edLabelData = await notifyRequest(this.props.extractArea(
      blobName,
      labelCoords,
      engine,
      language,
    ))({
      fetching: localize(Localization.RECOGNIZE_FETCHING),
      success: localize(Localization.RECOGNIZE_SUCCESS),
      warning: localize(Localization.RECOGNIZE_FAILURE),
    })

    return edLabelData
  }

  ocrText = async (engine, imageUrl, labelCoords, language) => {
    try {
      const page = this.getPageByUrl(imageUrl)
      const blobName = Document.getUnifiedDataBlobName(this.props.document, page) ?? Document.getProcessingBlobName(this.props.document, page)

      let edLabelData

      if (ENV.FEATURE_OCR_INTERSECTION_ALGORITHM) {
        edLabelData = await this.extractDataAreaWithAlgorithm({
          language,
          engine,
          blobName,
          labelCoords,
        })
      } else {
        edLabelData = await this.extractDataArea({
          blobName,
          labelCoords,
          engine,
          language,
        })
      }

      const { content, confidence } = edLabelData

      return content ? {
        content,
        confidence,
      } : EMPTY_RECOGNIZE
    } catch {
      return EMPTY_RECOGNIZE
    }
  }

  extractDataTableWithAlgorithm = async ({
    engine,
    blobName,
    markupTable,
    language,
    tableData,
  }) => {
    const edTableData = await notifyRequest(extractDataTableWithAlgorithm({
      engine,
      blobName,
      markupTable,
      language,
      tableData,
    }))({
      fetching: localize(Localization.RECOGNIZE_FETCHING),
      success: localize(Localization.RECOGNIZE_SUCCESS),
      warning: localize(Localization.RECOGNIZE_FAILURE),
    })

    return edTableData
  }

  extractDataTable = async ({
    blobName,
    tableData,
    engine,
    language,
  }) => {
    const edTableData = await notifyRequest(this.props.extractTable(
      blobName,
      tableData,
      engine,
      language,
    ))({
      fetching: localize(Localization.RECOGNIZE_FETCHING),
      success: localize(Localization.RECOGNIZE_SUCCESS),
      warning: localize(Localization.RECOGNIZE_FAILURE),
    })

    return edTableData
  }

  ocrTable = async (engine, imageUrl, markupTable, language) => {
    try {
      const page = this.getPageByUrl(imageUrl)
      const blobName = Document.getUnifiedDataBlobName(this.props.document, page) ?? Document.getProcessingBlobName(this.props.document, page)
      const tableData = mapLtTableToEdTableData(markupTable, page, this.props.document.unifiedData)

      let edTableData

      if (ENV.FEATURE_OCR_INTERSECTION_ALGORITHM) {
        edTableData = await this.extractDataTableWithAlgorithm({
          engine,
          blobName,
          markupTable,
          language,
          tableData,
        })
      } else {
        edTableData = await this.extractDataTable({
          blobName,
          tableData,
          engine,
          language,
        })
      }

      const markupChunk = mapTableToMarkup(
        edTableData,
        markupTable.fieldCode,
        this.props.document.unifiedData,
        markupTable.index,
        markupTable.uid,
      ) || {}
      const [content] = Object.values(markupChunk)[0].tables
      return content
    } catch {
      return null
    }
  }

  detectTables = async (
    imageUrl,
    detectCoords,
    detectEngine = KnownTableEngine.DEPS_DETECTOR,
    ocrEngine,
    language,
    rotation = 0,
  ) => {
    try {
      const page = this.getPageByUrl(imageUrl)
      const blobFile = Document.getUnifiedDataBlobName(this.props.document, page) ?? Document.getProcessingBlobName(this.props.document, page)
      const edTables = await notifyRequest(
        this.props.detectTables(
          blobFile,
          page,
          detectCoords,
          detectEngine,
          ocrEngine,
          language,
          rotation,
        ),
      )({
        fetching: localize(Localization.DETECT_FETCHING),
        warning: localize(Localization.DETECT_FAILURE),
      })

      if (!edTables?.length) {
        notifyWarning(localize(Localization.NO_TABLES_FOUND))
        return null
      }

      return edTables.map((edTable) => mapTableToMarkup(edTable))
        .map((markupChunk) => Object.values(markupChunk))
        .map((pageMarkup) => pageMarkup.map((m) => m.tables))
        .flat(Infinity)
    } catch {
      return null
    }
  }

  close = (force = true) => {
    this.force = force
    goBack()
  }

  onDeactivate = () => {
    if (this.force) {
      this.force = false
      return Promise.resolve(false)
    }

    return Promise.resolve(this.onClose.fire())
  }

  saveMarkup = (markup, _rotationAngles, language) => this.save(markup, _rotationAngles, language)

  saveWithExtraction = (markup, _rotationAngles, language) => this.save(markup, _rotationAngles, language, this.notifyExtraction)

  getImage = async (url) => {
    let cachedBlob

    if (ENV.FEATURE_FILE_CACHE) {
      cachedBlob = await FileCache.get(url)
    }

    if (cachedBlob) {
      return URL.createObjectURL(cachedBlob)
    }

    const blob = await fetchImage(url)
    return blob
  }

  getApi = () => {
    const api = {
      close: this.close,
      detectTables: this.detectTables,
      getImage: this.getImage,
      save: this.saveWithExtraction,
      saveMarkup: this.saveMarkup,
      notify: {
        success: notifySuccess,
        warning: notifyWarning,
        error: notifyError,
        info: notifyInfo,
      },
    }

    if (ENV.FEATURE_DATA_EXTRACTION) {
      return {
        ...api,
        ocrText: this.ocrText,
        ocrTable: this.ocrTable,
        ...(ENV.FEATURE_OMR_AREA && { omrArea: this.omrArea }),
      }
    }

    return api
  }

  getTools = () => {
    const tools = [
      Tool.LABEL,
      Tool.TABLE,
      Tool.MERGE,
      Tool.SPLIT,
      Tool.POINTER,
      Tool.GRABBING,
    ]

    if (ENV.FEATURE_TABLE_DETECTION) {
      return [
        Tool.DETECT_TABLES,
        ...tools,
      ]
    }

    return tools
  }

  getLabelingToolSettings = () => ({
    mode: Mode.DEFAULT,
    features: [
      Feature.EXPORT,
      Feature.IMPORT,
      {
        code: Feature.PAGING,
        data: {
          initialPage: this.props.initialPage,
        },
      },
      Feature.LANGUAGE,
      Feature.SPECIAL_SYMBOLS,
      {
        code: Feature.AUTO_SAVE,
        data: { interval: AUTOSAVE_INTERVAL_MS },
      },
    ],
    panels: [
      Panel.TOOLBAR,
      Panel.MARKUP_SIDEBAR,
      Panel.LEFT_SIDEBAR,
    ],
    tools: this.getTools(),
  })

  getOCRLanguages = () => this.props.languages

  getOCR = () => ({
    languages: this.getOCRLanguages(),
    engines: Engine.getAvailableEngines(this.props.engines),
  })

  getConfig = () => ({
    document: this.getDocument(),
    fields: this.getFields(),
    api: this.getApi(),
    ocr: this.getOCR(),
    markup: mapExtractedDataToMarkup(
      this.props.document.extractedData,
      this.props.documentType.fields,
      this.props.document.unifiedData,
    ),
    settings: this.getLabelingToolSettings(),
    events: {
      onClose: this.onClose.subscribe,
    },
  })

  componentDidMount = async () => {
    const {
      documentId,
      fetchProcessingEngines,
      fetchDocumentType,
      fetchDocumentData,
      fetchAvailableLanguages,
    } = this.props

    await fetchProcessingEngines()
    await fetchAvailableLanguages()
    const document = await fetchDocumentData(documentId, true)
    await fetchDocumentType(
      document.documentType.code,
      [DocumentTypeExtras.EXTRACTION_FIELDS],
    )
    this.setState({
      fetching: false,
    })

    ENV.FEATURE_FILE_CACHE && cacheDocumentImages(this.props.document)
  }

  render = () => {
    if (this.state.fetching) {
      return <Spin.Centered spinning />
    }

    return (
      <>
        <LabelingTool config={this.getConfig()} />
        <LocationChange
          onDeactivate={this.onDeactivate}
        />
      </>
    )
  }
}

const mapStateToProps = (state) => ({
  document: documentSelector(state),
  documentType: documentTypeStateSelector(state),
  engines: processingEnginesSelector(state),
  languages: languagesSelector(state),
  initialPage: uiSelector(state)[UiKeys.ACTIVE_PAGE] || 1,
})

const mapDispatchToProps = {
  extractArea,
  extractTable,
  detectTables,
  fetchDocumentData,
  fetchDocumentType,
  fetchProcessingEngines,
  fetchAvailableLanguages,
  omrArea,
}

const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(DocumentLabelingTool)

export {
  ConnectedComponent as DocumentLabelingTool,
}
