
import PropTypes from 'prop-types'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { ReviewPolicy } from '@/enums/ReviewPolicy'

class WorkflowConfiguration {
  constructor ({
    engine = KnownProcessingEngines.TESSERACT,
    parsingFeatures = [],
    needsPostprocessing = false,
    needsExtraction = false,
    needsValidation = false,
    needsReview = ReviewPolicy.ALWAYS_REVIEW,
    needsOutputExporting = false,
  } = {}) {
    this.engine = engine
    this.parsingFeatures = parsingFeatures
    this.needsPostprocessing = needsPostprocessing
    this.needsExtraction = needsExtraction
    this.needsValidation = needsValidation
    this.needsReview = needsReview
    this.needsOutputExporting = needsOutputExporting
  }
}

const workflowConfigurationShape = PropTypes.shape({
  parsingFeatures: PropTypes.arrayOf(PropTypes.string),
  needsPostprocessing: PropTypes.bool,
  needsExtraction: PropTypes.bool,
  needsValidation: PropTypes.bool,
  needsReview: PropTypes.oneOf(Object.values(ReviewPolicy)),
  needsOutputExporting: PropTypes.bool,
})

export {
  WorkflowConfiguration,
  workflowConfigurationShape,
}
