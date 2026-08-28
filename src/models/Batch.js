
import PropTypes from 'prop-types'
import { BatchFileStatus } from '@/enums/BatchFileStatus'
import { BatchStatus } from '@/enums/BatchStatus'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'

export class BatchFile {
  constructor ({
    id,
    documentId,
    documentTypeId,
    engine,
    error,
    llmType,
    name,
    parsingFeatures,
    status,
  }) {
    this.id = id
    this.documentId = documentId
    this.documentTypeId = documentTypeId
    this.engine = engine
    this.error = error
    this.llmType = llmType
    this.name = name
    this.parsingFeatures = parsingFeatures
    this.status = status
  }

  static getMinimized = ({ error, name, status }) => {
    return {
      error,
      name,
      status,
    }
  }
}

export const batchFileShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  documentId: PropTypes.string,
  documentTypeId: PropTypes.string,
  engine: PropTypes.oneOf(
    Object.values(KnownProcessingEngines),
  ),
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
  }),
  llmType: PropTypes.string,
  name: PropTypes.string.isRequired,
  parsingFeatures: PropTypes.arrayOf(
    PropTypes.oneOf(
      Object.values(KnownParsingFeature),
    ).isRequired,
  ),
  status: PropTypes.oneOf(
    Object.values(BatchFileStatus),
  ).isRequired,
})

export const batchFileMinimizedShape = PropTypes.shape({
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
  }),
  name: PropTypes.string.isRequired,
  status: PropTypes.oneOf(
    Object.values(BatchFileStatus),
  ).isRequired,
})

export class Batch {
  constructor ({
    id,
    files,
    group,
    name,
    status,
    createdAt,
  }) {
    this.id = id
    this.name = name
    this.group = group
    this.status = status
    this.createdAt = createdAt
    this.files = files
  }
}

export const batchShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  group: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  status: PropTypes.oneOf(
    Object.values(BatchStatus),
  ).isRequired,
  createdAt: PropTypes.string.isRequired,
  files: PropTypes.oneOfType([
    PropTypes.arrayOf(
      batchFileShape.isRequired,
    ).isRequired,
    PropTypes.arrayOf(
      batchFileMinimizedShape.isRequired,
    ).isRequired,
  ]),
})
