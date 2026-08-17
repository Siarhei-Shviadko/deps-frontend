import PropTypes from 'prop-types'
import { semanticLayoutMetadataShape } from './SemanticLayoutMetadata'

class SemanticLayoutInfo {
  constructor ({
    id,
    createdAt,
    provider,
    metadata,
  }) {
    this.id = id
    this.createdAt = createdAt
    this.provider = provider
    this.metadata = metadata
  }
}

const semanticLayoutInfoShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  provider: PropTypes.string.isRequired,
  metadata: semanticLayoutMetadataShape.isRequired,
})

export {
  SemanticLayoutInfo,
  semanticLayoutInfoShape,
}
