import PropTypes from 'prop-types'
import { SplittingContextAttachments } from '@/enums/SplittingContextAttachments'
import { SPLITTING_MODE } from '@/enums/SplittingMode'

export class Splitter {
  constructor ({
    id,
    groupId,
    documentTypeId,
    name,
    description,
    splittingQuery,
    llmType,
    splittingContextAttachments,
    splittingMode,
  }) {
    this.id = id
    this.groupId = groupId
    this.documentTypeId = documentTypeId
    this.name = name
    this.description = description
    this.splittingQuery = splittingQuery
    this.llmType = llmType
    this.splittingContextAttachments = splittingContextAttachments
    this.splittingMode = splittingMode
  }
}

export const splitterShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  documentTypeId: PropTypes.string,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  splittingQuery: PropTypes.string.isRequired,
  llmType: PropTypes.string.isRequired,
  splittingContextAttachments: PropTypes.arrayOf(
    PropTypes.oneOf(Object.values(SplittingContextAttachments)),
  ),
  splittingMode: PropTypes.oneOf(Object.values(SPLITTING_MODE)),
})
