import PropTypes from 'prop-types'
import { semanticLayoutMetadataShape } from './SemanticLayoutMetadata'
import { semanticSectionShape } from './SemanticSection'

class SemanticLayout {
  constructor ({
    id,
    createdAt,
    metadata,
    sections,
  }) {
    this.id = id
    this.createdAt = createdAt
    this.metadata = metadata
    this.sections = sections
  }
}

const semanticLayoutShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  metadata: semanticLayoutMetadataShape.isRequired,
  sections: PropTypes.arrayOf(semanticSectionShape).isRequired,
})

export {
  SemanticLayout,
  semanticLayoutShape,
}
