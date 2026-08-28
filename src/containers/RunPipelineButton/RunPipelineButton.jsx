
import PropTypes from 'prop-types'
import { useCallback } from 'react'
import { Button } from '@/components/Button'
import { PipelineStepModal } from '@/containers/PipelineStepModal'
import { DocumentState } from '@/enums/DocumentState'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { RESOURCE_PIPELINE_STEP, PipelineStep } from '@/enums/PipelineStep'
import { documentErrorShape } from '@/models/Document'
import { StyledMenuItem } from './RunPipelineButton.styles'

const RunPipelineButton = ({
  documentId,
  documentState,
  documentEngine,
  documentLLMType,
  error,
}) => {
  const renderTrigger = useCallback(
    (step) => (open, disabled) => (
      <Button.Text
        disabled={disabled}
        onClick={open}
      >
        {RESOURCE_PIPELINE_STEP[step]}
      </Button.Text>
    ), [])

  return (
    Object.values(PipelineStep).map((step) => {
      return (
        <StyledMenuItem
          key={step}
          eventKey={step}
        >
          <PipelineStepModal
            documentEngine={documentEngine}
            documentId={documentId}
            documentLLMType={documentLLMType}
            documentState={documentState}
            error={error}
            renderTrigger={renderTrigger(step)}
            step={step}
          />
        </StyledMenuItem>
      )
    })
  )
}

RunPipelineButton.propTypes = {
  documentEngine: PropTypes.oneOf(Object.values(KnownProcessingEngines)),
  documentId: PropTypes.string.isRequired,
  documentLLMType: PropTypes.string,
  documentState: PropTypes.oneOf(Object.values(DocumentState)),
  error: documentErrorShape,
}

export {
  RunPipelineButton,
}
