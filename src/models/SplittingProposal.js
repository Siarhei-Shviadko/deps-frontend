import PropTypes from 'prop-types'

export class BoundingBox {
  constructor ({ x, y, width, height }) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }
}

export class ContentRegion {
  constructor ({ pageNumber, boundingBox }) {
    this.pageNumber = pageNumber
    this.boundingBox = boundingBox
  }
}

export class ProposalSegment {
  constructor ({ name, contentRegions, documentTypeId }) {
    this.name = name
    this.contentRegions = contentRegions
    this.documentTypeId = documentTypeId
  }
}

export class SplittingProposal {
  constructor ({
    id,
    tenantId,
    groupId,
    documentTypeId,
    status,
    batchName,
    segments,
    totalPages,
    createdAt,
    updatedAt,
    errorMessage,
  }) {
    this.id = id
    this.tenantId = tenantId
    this.groupId = groupId
    this.documentTypeId = documentTypeId
    this.status = status
    this.batchName = batchName
    this.segments = segments
    this.totalPages = totalPages
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.errorMessage = errorMessage ?? null
  }
}

export const boundingBoxShape = PropTypes.shape({
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
})

const contentRegionShape = PropTypes.shape({
  pageNumber: PropTypes.number.isRequired,
  boundingBox: boundingBoxShape.isRequired,
})

const proposalSegmentShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  contentRegions: PropTypes.arrayOf(contentRegionShape).isRequired,
  documentTypeId: PropTypes.string,
})

export const splittingProposalShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  tenantId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  documentTypeId: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  batchName: PropTypes.string.isRequired,
  segments: PropTypes.arrayOf(proposalSegmentShape).isRequired,
  totalPages: PropTypes.number.isRequired,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
})
