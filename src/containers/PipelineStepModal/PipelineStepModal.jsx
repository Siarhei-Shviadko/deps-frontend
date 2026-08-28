
import PropTypes from 'prop-types'
import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { runPipelineFromStep } from '@/actions/documentReviewPage'
import { fetchProcessingEngines } from '@/actions/engines'
import { CustomSelect } from '@/components/Select'
import {
  ALLOW_TO_START_PIPELINE_DOCUMENT_STATES,
  FORBIDDEN_STATES_TO_EXTRACT_DATA,
  ERROR_IN_STATE_TO_ALLOWED_TO_RESTART_STEPS,
} from '@/constants/document'
import { ExtractionLLMSelect } from '@/containers/ExtractionLLMSelect'
import { ParsingFeaturesSwitch } from '@/containers/ParsingFeaturesSwitch'
import { DocumentState } from '@/enums/DocumentState'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { RESOURCE_PIPELINE_STEP, PipelineStep } from '@/enums/PipelineStep'
import { localize, Localization } from '@/localization/i18n'
import { documentErrorShape } from '@/models/Document'
import { Engine } from '@/models/Engine'
import { LLMSettings } from '@/models/LLMProvider'
import { processingEnginesSelector } from '@/selectors/engines'
import { areEnginesFetchingSelector } from '@/selectors/requests'
import { ENV } from '@/utils/env'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { ModalFormButton } from './PipelineStepModal.styles'

const FieldProperty = {
  PARSING_FEATURES: 'parsingFeatures',
  ENGINE: 'engine',
  LLM_TYPE: 'llmType',
}

const DEFAULT_PARSING_FEATURES = [KnownParsingFeature.TEXT]

const getLLMTypeValue = (documentLLMType) => {
  if (!documentLLMType || !LLMSettings.isLLMTypeFormatValid(documentLLMType)) {
    return null
  }

  return documentLLMType
}

export const PipelineStepModal = ({
  step,
  documentId,
  documentState,
  documentEngine,
  documentLLMType,
  error,
  selectedEngine,
  renderTrigger,
  disabled = false,
  modalTitle,
}) => {
  const engines = useSelector(processingEnginesSelector)
  const areEnginesFetching = useSelector(areEnginesFetchingSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchProcessingEngines())
  }, [dispatch])

  const [isLoading, setIsLoading] = useState(false)
  const [currentEngine, setCurrentEngine] = useState(selectedEngine ?? documentEngine)

  const handleEngineChange = useCallback(
    (value) => {
      setCurrentEngine(value)
      return value
    },
    [],
  )

  const isForbiddenIfError = useCallback(
    (step) => {
      if (documentState !== DocumentState.FAILED || !error) {
        return false
      }

      const allowedSteps = ERROR_IN_STATE_TO_ALLOWED_TO_RESTART_STEPS[error.inState]

      return !(allowedSteps && allowedSteps.includes(step))
    }, [documentState, error])

  const isForbiddenToExtract = useCallback(
    (step) => (
      step === PipelineStep.EXTRACTION && FORBIDDEN_STATES_TO_EXTRACT_DATA.includes(documentState)
    ), [documentState])

  const isDisabledPipelineStep = useCallback(
    (step) => (
      !ALLOW_TO_START_PIPELINE_DOCUMENT_STATES.includes(documentState) ||
      isForbiddenToExtract(step) ||
      isForbiddenIfError(step)
    ),
    [
      documentState,
      isForbiddenToExtract,
      isForbiddenIfError,
    ])

  const runPipeline = useCallback(
    async (step, settings) => {
      if (isLoading) {
        return
      }

      setIsLoading(true)

      try {
        await dispatch(runPipelineFromStep(documentId, step, settings))
        notifySuccess(
          localize(Localization.PIPELINE_SUCCESS_FROM_STEP,
            { stepNumber: RESOURCE_PIPELINE_STEP[step] }),
        )
      } catch {
        notifyWarning(localize(Localization.DEFAULT_ERROR))
      } finally {
        setIsLoading(false)
      }
    },
    [
      dispatch,
      documentId,
      isLoading,
    ],
  )

  const getFields = useCallback(
    (step) => ({
      ...(step === PipelineStep.PARSING && {
        [FieldProperty.PARSING_FEATURES]: {
          label: localize(Localization.PARSING_FEATURES),
          render: (props) => (
            <ParsingFeaturesSwitch
              {...props}
              engineCode={currentEngine}
            />
          ),
          initialValue: DEFAULT_PARSING_FEATURES,
        },
      }),
      [FieldProperty.ENGINE]: {
        label: localize(Localization.ENGINE),
        render: (props) => (
          <CustomSelect
            {...props}
            allowClear
            fetching={areEnginesFetching}
            onChange={handleEngineChange}
            options={Engine.toAllEnginesOptions(engines)}
            placeholder={localize(Localization.SELECT_ENGINE)}
          />
        ),
        initialValue: selectedEngine ?? documentEngine,
      },
      ...(ENV.FEATURE_LLM_DATA_EXTRACTION && {
        [FieldProperty.LLM_TYPE]: {
          label: localize(Localization.LLM_TYPE),
          render: (props) => (
            <ExtractionLLMSelect
              {...props}
              allowClear
              allowSearch
              placeholder={localize(Localization.SELECT_LLM_TYPE)}
            />
          ),
          initialValue: getLLMTypeValue(documentLLMType),
        },
      }),
    }),
    [
      areEnginesFetching,
      currentEngine,
      documentEngine,
      documentLLMType,
      engines,
      selectedEngine,
      handleEngineChange,
    ],
  )

  const isStepDisabled = isDisabledPipelineStep(step) || disabled

  return (
    <ModalFormButton
      fetching={isLoading}
      fields={getFields(step)}
      okButtonProps={
        {
          text: localize(Localization.OK),
          loading: isLoading,
        }
      }
      onOk={(settings) => runPipeline(step, settings)}
      renderOpenTrigger={(open) => renderTrigger(open, isStepDisabled)}
      text={
        (
          <h4>
            {localize(Localization.CONFIRM_START_PIPELINE_HINT)}
          </h4>
        )
      }
      title={
        modalTitle || localize(Localization.CONFIRM_START_PIPELINE, { stepNumber: RESOURCE_PIPELINE_STEP[step] })
      }
    />
  )
}

PipelineStepModal.propTypes = {
  step: PropTypes.oneOf(Object.values(PipelineStep)).isRequired,
  documentId: PropTypes.string.isRequired,
  documentState: PropTypes.oneOf(Object.values(DocumentState)),
  documentEngine: PropTypes.oneOf(Object.values(KnownProcessingEngines)),
  documentLLMType: PropTypes.string,
  error: documentErrorShape,
  selectedEngine: PropTypes.oneOf(Object.values(KnownProcessingEngines)),
  renderTrigger: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  modalTitle: PropTypes.string,
}
