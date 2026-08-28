import {
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addActivePolygons,
  clearActivePolygons,
  getDocumentState,
  highlightPolygonCoordsField,
  highlightTableCoordsField,
} from '@/actions/documentReviewPage'
import { extractData } from '@/actions/documents'
import { fetchDocumentType } from '@/actions/documentType'
import { Button } from '@/components/Button'
import { Spin } from '@/components/Spin'
import { UiKeys, DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY } from '@/constants/navigation'
import { DocumentPreview } from '@/containers/DocumentPreview'
import { PromptCalibrationStudio } from '@/containers/PromptCalibrationStudio'
import { useManageDocumentType } from '@/containers/PromptCalibrationStudio/hooks'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { useQueryParams } from '@/hooks/useQueryParams'
import { localize, Localization } from '@/localization/i18n'
import {
  documentSelector,
  documentTypeSelector,
  highlightedFieldSelector,
} from '@/selectors/documentReviewPage'
import { uiSelector } from '@/selectors/navigation'
import {
  isDocumentDataFetchingSelector,
  isDocumentTypeFetchingSelector,
} from '@/selectors/requests'
import { activePolygonsSelector } from '@/selectors/reviewPage'
import { notifyWarning } from '@/utils/notification'
import {
  mapLLMExtractorsToStudioExtractors,
  mapGenAiFieldsToStudioFields,
} from '../mappers'
import { SaveDocumentTypeModal } from '../SaveDocumentTypeModal'
import {
  Modal,
  ModalContent,
  ModalTitle,
  LeftPanel,
  RightPanel,
  Footer,
} from './DocumentPromptCalibrationStudioModal.styles'

const PROMPT_CALIBRATION_MODAL_WIDTH = 'calc(100vw - 4.8rem)'

const DocumentPromptCalibrationStudioModal = () => {
  const [isEditDocumentTypeModalVisible, setIsEditDocumentTypeModalVisible] = useState(false)
  const [calibrationValues, setCalibrationValues] = useState(null)
  const [isModalRendered, setIsModalRendered] = useState(false)

  const dispatch = useDispatch()
  const { queryParams, setQueryParams } = useQueryParams()

  const fetching = useSelector(isDocumentDataFetchingSelector)
  const document = useSelector(documentSelector)
  const documentType = useSelector(documentTypeSelector)
  const highlightedField = useSelector(highlightedFieldSelector)
  const activePolygons = useSelector(activePolygonsSelector)
  const activePage = useSelector(uiSelector)[UiKeys.ACTIVE_PAGE] || 1
  const activeSourceId = useSelector(uiSelector)[UiKeys.ACTIVE_SOURCE_ID]
  const isDocumentTypeFetching = useSelector(isDocumentTypeFetchingSelector)

  const { manageDocumentType, isManaging } = useManageDocumentType()

  const isVisible = !!queryParams[DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]

  const onAddActivePolygons = useCallback((polygon) => {
    dispatch(addActivePolygons(polygon))
  }, [dispatch])

  const onClearActivePolygons = useCallback(() => {
    dispatch(clearActivePolygons())
  }, [dispatch])

  const close = useCallback(() => {
    setQueryParams({
      [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: undefined,
    })

    setIsModalRendered(false)
  }, [setQueryParams])

  const onModalRender = useCallback((node) => {
    if (node) {
      setIsModalRendered(true)
    }
  }, [])

  const toggleCommitDocumentTypeModalVisibility = useCallback(() => {
    setIsEditDocumentTypeModalVisible((visible) => !visible)
  }, [])

  const reExtractData = useCallback(async () => {
    await dispatch(extractData(
      [document._id],
      document.engine || KnownProcessingEngines.TESSERACT,
    ))

    await dispatch(getDocumentState(document._id))
  }, [
    dispatch,
    document._id,
    document.engine,
  ])

  const onAfterEdit = useCallback(async (needsReExtraction) => {
    setIsEditDocumentTypeModalVisible(false)
    close()

    try {
      await dispatch(fetchDocumentType(
        documentType.code,
        [
          DocumentTypeExtras.EXTRACTION_FIELDS,
          DocumentTypeExtras.LLM_EXTRACTORS,
        ]),
      )

      needsReExtraction && await reExtractData()
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }, [
    dispatch,
    documentType.code,
    close,
    reExtractData,
  ])

  const onSave = useCallback(async (needsReExtraction) => {
    const data = {
      documentTypeId: documentType.code,
      documentTypeName: documentType.name,
      ...calibrationValues,
    }

    await manageDocumentType(data)

    onAfterEdit(needsReExtraction)
  }, [
    calibrationValues,
    onAfterEdit,
    documentType.code,
    manageDocumentType,
    documentType.name,
  ])

  const onChangeActiveImagePage = useCallback((page) => {
    dispatch(highlightPolygonCoordsField({ page }))
  }, [dispatch])

  const onChangeActiveExcelPage = useCallback((page) => {
    dispatch(highlightTableCoordsField({ page }))
  }, [dispatch])

  const renderFooter = useCallback(() => (
    <Footer>
      <Button.Secondary onClick={close}>
        {localize(Localization.CLOSE_STUDIO)}
      </Button.Secondary>
      <SaveDocumentTypeModal
        isDisabled={!calibrationValues?.fields.length || !!calibrationValues.calibrationMode}
        isLoading={isManaging}
        isVisible={isEditDocumentTypeModalVisible}
        onSave={onSave}
        toggleModalVisibility={toggleCommitDocumentTypeModalVisibility}
      />
    </Footer>
  ), [
    close,
    isEditDocumentTypeModalVisible,
    toggleCommitDocumentTypeModalVisibility,
    calibrationValues?.fields.length,
    calibrationValues?.calibrationMode,
    isManaging,
    onSave,
  ])

  const Title = useMemo(() => (
    <ModalTitle>{localize(Localization.FEATURE_PROMPT_CALIBRATION_STUDIO)}</ModalTitle>
  ), [])

  const extractors = useMemo(() => (
    mapLLMExtractorsToStudioExtractors(documentType.llmExtractors)
  ), [documentType.llmExtractors])

  const renderContent = useCallback(() => (
    <ModalContent>
      <LeftPanel>
        <DocumentPreview
          activePage={activePage}
          activePolygons={activePolygons}
          activeSourceId={activeSourceId}
          addActivePolygons={onAddActivePolygons}
          clearActivePolygons={onClearActivePolygons}
          document={document}
          fetching={fetching}
          highlightedField={highlightedField}
          onChangeActiveExcelPage={onChangeActiveExcelPage}
          onChangeActiveImagePage={onChangeActiveImagePage}
        />
      </LeftPanel>
      <RightPanel>
        <PromptCalibrationStudio
          initialFields={mapGenAiFieldsToStudioFields(document.extractedData, documentType)}
          setCalibrationValues={setCalibrationValues}
          {...(extractors.length && { initialExtractors: extractors })}
        />
      </RightPanel>
    </ModalContent>
  ), [
    activePage,
    activePolygons,
    activeSourceId,
    document,
    documentType,
    fetching,
    highlightedField,
    onAddActivePolygons,
    onClearActivePolygons,
    onChangeActiveExcelPage,
    onChangeActiveImagePage,
    setCalibrationValues,
    extractors,
  ])

  return (
    <Modal
      centered
      closable={false}
      destroyOnClose
      footer={renderFooter()}
      keyboard={false}
      maskClosable={false}
      onCancel={close}
      open={isVisible}
      title={Title}
      width={PROMPT_CALIBRATION_MODAL_WIDTH}
    >
      <div ref={onModalRender}>
        <Spin spinning={isDocumentTypeFetching}>
          {isModalRendered && renderContent()}
        </Spin>
      </div>
    </Modal>
  )
}

export {
  DocumentPromptCalibrationStudioModal,
}
