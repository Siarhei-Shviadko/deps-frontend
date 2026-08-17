import PropTypes from 'prop-types'
import { documentLayoutInfoShape } from './DocumentLayoutInfo'
import { semanticLayoutInfoShape } from './SemanticLayout'
import { tabularLayoutInfoShape } from './TabularLayoutInfo'

class DocumentParsingInfo {
  constructor ({
    layoutId,
    documentLayoutInfo,
    tabularLayoutInfo,
    semanticLayoutInfo,
  }) {
    this.layoutId = layoutId
    this.documentLayoutInfo = documentLayoutInfo
    this.tabularLayoutInfo = tabularLayoutInfo
    this.semanticLayoutInfo = semanticLayoutInfo
  }
}

const documentParsingInfoShape = PropTypes.shape({
  layoutId: PropTypes.string,
  documentLayoutInfo: documentLayoutInfoShape,
  tabularLayoutInfo: tabularLayoutInfoShape,
  semanticLayoutInfo: PropTypes.objectOf(semanticLayoutInfoShape),
})

export {
  DocumentParsingInfo,
  documentParsingInfoShape,
}
