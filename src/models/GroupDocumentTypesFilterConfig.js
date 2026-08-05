
class GroupDocumentTypesFilterConfig {
  constructor ({
    name = '',
    extractionType = [],
    sortDirect = '',
    sortField = '',
    classifier = '',
    splitter = '',
  } = {}) {
    this.name = name
    this.extractionType = extractionType
    this.classifier = classifier
    this.splitter = splitter
    this.sortDirect = sortDirect
    this.sortField = sortField
  }
}

const BASE_GROUP_DOCUMENT_TYPES_FILTER_CONFIG = new GroupDocumentTypesFilterConfig()

export {
  GroupDocumentTypesFilterConfig,
  BASE_GROUP_DOCUMENT_TYPES_FILTER_CONFIG,
}
