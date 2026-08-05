
import { TableSortDirection } from '@/components/Table/TableSorter'

const SELECTED_RECORDS = 'selection'
const FILTERS = 'filters'
const PAGINATION = 'pagination'

const DocumentFilterKeys = {
  SORT_DIRECT: 'sortDirect',
  SORT_FIELD: 'sortField',
  TITLE: 'title',
  REVIEWER: 'reviewer',
  STATES: 'states',
  TYPES: 'types',
  DATE_RANGE: 'dateRange',
  LABELS: 'labels',
  ENGINES: 'engines',
  SEARCH: 'search',
  LANGUAGES: 'languages',
  GROUPS: 'groups',
  FILTER_IDS: 'filterIds',
}

const OrgUserFilterKeys = {
  SORT_DIRECT: 'sortDirect',
  SORT_FIELD: 'sortField',
  USER: 'user',
}

const InviteesFilterKeys = {
  SORT_DIRECT: 'sortDirect',
  SORT_FIELD: 'sortField',
  EMAIL: 'email',
}

const SortDirection = {
  ASC: 'asc',
  DESC: 'desc',
}

const PaginationKeys = {
  PAGE: 'page',
  PER_PAGE: 'perPage',
}

const OrgWaitingsFilterKeys = {
  SORT_DIRECT: 'sortDirect',
  SORT_FIELD: 'sortField',
  USER: 'user',
}

const UiKeys = {
  ACTIVE_SOURCE_ID: 'activeSourceId',
  RECT_COORDS: 'rectCoords',
  ACTIVE_PAGE: 'activePage',
  ACTIVE_FIELD_PK: 'activeFieldPk',
  CELL_RANGES: 'cellRanges',
  SCROLL_ID: 'scrollId',
  VISIBLE_PDF_PAGE: 'visiblePdfPage',
}

const DocumentTypeFilterKey = {
  SORT_DIRECT: 'sortDirect',
  SORT_FIELD: 'sortField',
  NAME: 'name',
  DATE_RANGE: 'dateRange',
  ENGINE: 'engine',
  LANGUAGE: 'language',
  EXTRACTION_TYPE: 'extractionType',
}

const GroupDocumentTypesFilterKey = {
  SORT_DIRECT: 'sortDirect',
  SORT_FIELD: 'sortField',
  NAME: 'name',
  EXTRACTION_TYPE: 'extractionType',
  CLASSIFIER: 'classifier',
  SPLITTER: 'splitter',
}

const BatchFilterKey = {
  DATE_START: 'dateStart',
  DATE_END: 'dateEnd',
  NAME: 'name',
  GROUP: 'group',
  SORT_ORDER: 'sortOrder',
  SORT_BY: 'sortBy',
  STATUS: 'status',
}

const FileFilterKey = {
  DATE_START: 'dateStart',
  DATE_END: 'dateEnd',
  NAME: 'name',
  SORT_ORDER: 'sortOrder',
  SORT_BY: 'sortBy',
  STATE: 'state',
  REFERENCE: 'reference',
  LABELS: 'labels',
  REFERENCE_AVAILABLE: 'referenceAvailable',
}

const EXTRACTION_TYPE_FILTER_KEY = {
  templates: 'templates',
  mlModels: 'mlModels',
  prototypes: 'prototypes',
  aiPrompted: 'aiPrompted',
  azureCloudExtractor: 'azureCloudExtractor',
}

const TABLE_SORT_DIRECT_KEY_TO_DATA_FILTER_KEY = {
  [TableSortDirection.ASCEND]: SortDirection.ASC,
  [TableSortDirection.DESCEND]: SortDirection.DESC,
}

const DATA_FILTER_KEY_TO_TABLE_SORT_DIRECT_KEY = {
  [SortDirection.ASC]: TableSortDirection.ASCEND,
  [SortDirection.DESC]: TableSortDirection.DESCEND,
}

const DocumentTypesGroupsFilterKey = {
  NAME: 'name',
  DATE_START: 'dateStart',
  DATE_END: 'dateEnd',
  DOCUMENT_TYPE_ID: 'documentTypeId',
  SORT_ORDER: 'sortOrder',
  SORT_BY: 'sortBy',
}

const AgentConversationsFilterKey = {
  TITLE: 'title',
  PAGE: 'page',
  SIZE: 'size',
  AGENT_VENDOR_ID: 'agentVendorId',
  DOCUMENT_ID: 'documentId',
}

const UI_ENV_SETTINGS_QUERY_KEY = 'uiEnvSettings'

const DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY = 'documentPromptCalibrationStudio'
const FILE_PROMPT_CALIBRATION_STUDIO_QUERY_KEY = 'filePromptCalibrationStudio'

export {
  BatchFilterKey,
  SELECTED_RECORDS,
  FILTERS,
  PAGINATION,
  SortDirection,
  UiKeys,
  DocumentFilterKeys,
  PaginationKeys,
  OrgUserFilterKeys,
  InviteesFilterKeys,
  OrgWaitingsFilterKeys,
  DocumentTypeFilterKey,
  TABLE_SORT_DIRECT_KEY_TO_DATA_FILTER_KEY,
  DATA_FILTER_KEY_TO_TABLE_SORT_DIRECT_KEY,
  GroupDocumentTypesFilterKey,
  EXTRACTION_TYPE_FILTER_KEY,
  DocumentTypesGroupsFilterKey,
  UI_ENV_SETTINGS_QUERY_KEY,
  DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY,
  FILE_PROMPT_CALIBRATION_STUDIO_QUERY_KEY,
  FileFilterKey,
  AgentConversationsFilterKey,
}
