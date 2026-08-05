
import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Localization, localize } from '@/localization/i18n'
import { notifyWarning } from '@/utils/notification'
import { FieldName } from '../FieldName'
import { useFieldCalibration, useRetrieveInsights } from '../hooks'
import { InsightsComparison } from '../InsightsComparison'
import { InsightsErrorBoundary } from '../InsightsErrorBoundary'
import { LLMExtractorInfo } from '../LLMExtractorInfo'
import {
  InsightsParseError,
  mapResponseValue,
  mapNodesToRequestedInsights,
} from '../mappers'
import { Query } from '../viewModels'
import {
  ActionsWrapper,
  Divider,
  MainContentWrapper,
  StyledSpin,
  Wrapper,
} from './FieldAdvancedCalibration.styles'
import { FieldFooter } from './FieldFooter'
import { FieldsSwitcher } from './FieldsSwitcher'
import { LLMExtractorDrawer } from './LLMExtractorDrawer'
import { PromptChain } from './PromptChain'

export const FieldAdvancedCalibration = () => {
  const {
    activeField,
    setActiveField,
    extractors,
  } = useFieldCalibration()

  const [hasInsightsError, setHasInsightsError] = useState(false)
  const [executionIndex, setExecutionIndex] = useState(0)

  const executedValue = activeField?.query.value

  useEffect(() => {
    if (!activeField?.id) return

    setHasInsightsError(false)
    setExecutionIndex(0)
  }, [activeField?.id])

  const [
    retrieveInsights,
    isRetrievingInsights,
  ] = useRetrieveInsights()

  const updateActiveField = useCallback((nodes, extractedData) => {
    const { value, reasoning = null } = extractedData

    setActiveField((prevField) => {
      const query = Query.updateQuery({
        query: prevField.query,
        nodes,
        value,
        reasoning,
        executedNodes: nodes,
      })

      return {
        ...prevField,
        query,
      }
    })
  }, [setActiveField])

  const onExecuteHandler = useCallback(async ({
    nodes,
    extractor,
    onAfterExecute,
  }) => {
    setHasInsightsError(false)

    try {
      const requestedInsights = mapNodesToRequestedInsights(activeField, nodes)
      const fieldExtractor = extractor ?? extractors.find((extractor) => extractor.id === activeField.extractorId)
      const {
        model,
        customInstruction,
        contextAttachments,
        stop,
        ...rest
      } = fieldExtractor

      const elements = await retrieveInsights({
        model,
        requestedInsights,
        customInstructions: customInstruction,
        params: {
          contextAttachments: contextAttachments || null,
          stop: stop?.length ? stop : null,
          ...rest,
        },
      }).unwrap()

      const elementData = elements[activeField.id]

      if (elementData.errorOccurred) {
        notifyWarning(elementData.content)
        return
      }

      const extractedData = mapResponseValue(elementData.content)
      updateActiveField(nodes, extractedData)
      setExecutionIndex((prev) => prev + 1)
      onAfterExecute?.()
    } catch (e) {
      if (InsightsParseError.isInsightsParseError(e)) {
        setHasInsightsError(true)
        return
      }

      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)

      notifyWarning(message)
    }
  }, [
    activeField,
    extractors,
    retrieveInsights,
    updateActiveField,
  ])

  const onSaveNodes = useCallback((nodes) => {
    setActiveField((prevField) => {
      const query = Query.updateQuery({
        query: prevField.query,
        nodes,
        value: prevField.query.value,
        reasoning: prevField.query.reasoning,
      })

      return {
        ...prevField,
        query,
      }
    })
  }, [setActiveField])

  return (
    <>
      <Wrapper>
        <FieldName />
        <ActionsWrapper>
          <LLMExtractorInfo />
          <LLMExtractorDrawer
            onExecute={onExecuteHandler}
          />
          <Divider />
          <FieldsSwitcher />
        </ActionsWrapper>
      </Wrapper>
      <MainContentWrapper>
        <StyledSpin spinning={isRetrievingInsights}>
          <InsightsErrorBoundary
            key={executionIndex}
            onError={setHasInsightsError}
          >
            <InsightsComparison
              executedValue={executedValue}
              field={activeField}
            />
          </InsightsErrorBoundary>
          <PromptChain
            key={activeField.id}
            onSaveNodes={onSaveNodes}
            queryNodes={activeField.query.nodes}
          />
        </StyledSpin>
      </MainContentWrapper>
      <FieldFooter
        hasInsightsError={hasInsightsError}
        isDisabled={isRetrievingInsights}
        onExecute={onExecuteHandler}
      />
    </>
  )
}
