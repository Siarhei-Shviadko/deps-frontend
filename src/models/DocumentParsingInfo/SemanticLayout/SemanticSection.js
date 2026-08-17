import PropTypes from 'prop-types'
import { semanticContentElementShape } from './SemanticContentElement'

class SemanticSection {
  constructor ({
    id,
    order,
    title,
    contentElements,
  }) {
    this.id = id
    this.order = order
    this.title = title
    this.contentElements = contentElements
  }
}

const semanticSectionShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  order: PropTypes.number.isRequired,
  title: PropTypes.string,
  contentElements: PropTypes.arrayOf(semanticContentElementShape).isRequired,
})

export {
  SemanticSection,
  semanticSectionShape,
}
