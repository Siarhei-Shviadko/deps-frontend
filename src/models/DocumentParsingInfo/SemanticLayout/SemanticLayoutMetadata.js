import PropTypes from 'prop-types'

class SemanticLayoutMetadata {
  constructor ({
    confidence,
    processingTimeMs,
    sourceProvider,
  }) {
    this.confidence = confidence
    this.processingTimeMs = processingTimeMs
    this.sourceProvider = sourceProvider
  }
}

const semanticLayoutMetadataShape = PropTypes.shape({
  confidence: PropTypes.number,
  processingTimeMs: PropTypes.number,
  sourceProvider: PropTypes.string.isRequired,
})

export {
  SemanticLayoutMetadata,
  semanticLayoutMetadataShape,
}
