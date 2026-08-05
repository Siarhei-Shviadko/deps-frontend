
import PropTypes from 'prop-types'
import { ExtractionType } from '@/enums/ExtractionType'
import { genAiClassifierShape } from '@/models/DocumentTypesGroup'
import { splitterShape } from '@/models/Splitter'

class GroupDocumentType {
  constructor ({
    id,
    groupId,
    name,
    extractionType = ExtractionType.ML,
    classifier,
    splitter,
  }) {
    this.id = id
    this.groupId = groupId
    this.name = name
    this.extractionType = extractionType
    this.classifier = classifier
    this.splitter = splitter
  }
}

const groupDocumentTypeShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  extractionType: PropTypes.oneOf(
    Object.values(ExtractionType),
  ).isRequired,
  classifier: genAiClassifierShape,
  splitter: splitterShape,
})

export {
  GroupDocumentType,
  groupDocumentTypeShape,
}
