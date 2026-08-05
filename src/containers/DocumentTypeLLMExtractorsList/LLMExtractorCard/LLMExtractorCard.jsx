
import PropTypes from 'prop-types'
import { useMemo } from 'react'
import { ExtractorLLMType } from '@/containers/ExtractorLLMType'
import { useExpandableText } from '@/hooks/useExpandableText'
import {
  EXTRACTION_PARAMS_KEYS,
  llmExtractorShape,
} from '@/models/LLMExtractor'
import { LLMExtractorCommandBar } from '../LLMExtractorCommandBar'
import {
  Badge,
  BaseFieldsWrapper,
  Details,
  ExtractionName,
  ExtractionParamsWrapper,
  HorizontalDivider,
  InstructionText,
  Wrapper,
  VerticalDivider,
  ExpandCollapseIconWrapper,
} from './LLMExtractorCard.styles'
import { getExtractionParameter } from './utils'

const LLMExtractorCard = ({
  documentTypeId,
  llmExtractor,
  refreshData,
}) => {
  const { ExpandableContainer, ToggleExpandIcon } = useExpandableText()

  const ExtractionParams = useMemo(() => {
    const parameters = Object.values(EXTRACTION_PARAMS_KEYS)

    return (
      <ExtractionParamsWrapper>
        {
          parameters.map((key, index) => {
            const showDivider = index !== parameters.length - 1

            return getExtractionParameter(
              key,
              llmExtractor.extractionParams[key],
              showDivider,
            )
          })
        }
      </ExtractionParamsWrapper>
    )
  }, [llmExtractor.extractionParams])

  const BaseFields = useMemo(() => (
    <BaseFieldsWrapper>
      <ExtractionName>
        {llmExtractor.name}
      </ExtractionName>
      {ExtractionParams}
    </BaseFieldsWrapper>
  ), [
    llmExtractor.name,
    ExtractionParams,
  ])

  const renderLLMType = (extractorName) => (
    <Badge>
      {extractorName}
    </Badge>
  )

  return (
    <Wrapper>
      <Details>
        {BaseFields}
        <ExtractorLLMType
          llmReference={llmExtractor.llmReference}
          render={renderLLMType}
        />
        <VerticalDivider />
        <LLMExtractorCommandBar
          documentTypeId={documentTypeId}
          llmExtractor={llmExtractor}
          refreshData={refreshData}
        />
      </Details>
      <HorizontalDivider />
      <div>
        <ExpandableContainer>
          <InstructionText>
            {llmExtractor.extractionParams.customInstruction}
          </InstructionText>
        </ExpandableContainer>
        <ExpandCollapseIconWrapper>
          <ToggleExpandIcon />
        </ExpandCollapseIconWrapper>
      </div>
    </Wrapper>
  )
}

LLMExtractorCard.propTypes = {
  documentTypeId: PropTypes.string.isRequired,
  llmExtractor: llmExtractorShape.isRequired,
  refreshData: PropTypes.func.isRequired,
}

export {
  LLMExtractorCard,
}
