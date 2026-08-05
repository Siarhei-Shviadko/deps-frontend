
import { useMemo, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setFilters } from '@/actions/navigation'
import {
  GroupDocumentTypesFilterKey,
  TABLE_SORT_DIRECT_KEY_TO_DATA_FILTER_KEY,
} from '@/constants/navigation'
import { GroupDocumentTypesFilterConfig } from '@/models/GroupDocumentTypesFilterConfig'
import { GROUP_DOC_TYPE_COLUMN_TO_FILTER_KEY } from '../columns/GroupDocTypeColumn'

const useFilterGroupDocTypes = ({
  groupDocTypes,
  filters,
  filterConfig,
  changePagination,
}) => {
  const dispatch = useDispatch()

  const filterByName = useCallback((type) => (
    !filters[GroupDocumentTypesFilterKey.NAME] ||
    type.name?.toLowerCase().includes(filters[GroupDocumentTypesFilterKey.NAME]?.toLowerCase())
  ), [filters])

  const filterByExtractionType = useCallback((type) => (
    !filters[GroupDocumentTypesFilterKey.EXTRACTION_TYPE] ||
    filters[GroupDocumentTypesFilterKey.EXTRACTION_TYPE]?.includes(type.extractionType)
  ), [filters])

  const filterByClassifier = useCallback((type) => (
    !filters[GroupDocumentTypesFilterKey.CLASSIFIER] ||
      type.classifier?.name.toLowerCase().includes(filters[GroupDocumentTypesFilterKey.CLASSIFIER]?.toLowerCase())
  ), [filters])

  const filterBySplitter = useCallback((type) => (
    !filters[GroupDocumentTypesFilterKey.SPLITTER] ||
      type.splitter?.name.toLowerCase().includes(filters[GroupDocumentTypesFilterKey.SPLITTER]?.toLowerCase())
  ), [filters])

  const filteredList = useMemo(() => (
    groupDocTypes
      .filter(filterByName)
      .filter(filterByExtractionType)
      .filter(filterByClassifier)
      .filter(filterBySplitter)
  )
  , [
    groupDocTypes,
    filterByName,
    filterByExtractionType,
    filterByClassifier,
    filterBySplitter,
  ])

  const filterHandler = useCallback((
    pagination,
    filters,
    sorter,
  ) => {
    const { current, pageSize } = pagination

    changePagination(current, pageSize)
    const sortDirect = TABLE_SORT_DIRECT_KEY_TO_DATA_FILTER_KEY[sorter?.order]
    const newFilterConfig = new GroupDocumentTypesFilterConfig({
      ...filterConfig,
      [GroupDocumentTypesFilterKey.SORT_DIRECT]: sortDirect || '',
      [GroupDocumentTypesFilterKey.SORT_FIELD]: sortDirect ? sorter.columnKey : '',
    })

    Object.entries(filters).forEach(([key, val]) => {
      if (GROUP_DOC_TYPE_COLUMN_TO_FILTER_KEY[key]) {
        newFilterConfig[GROUP_DOC_TYPE_COLUMN_TO_FILTER_KEY[key]] = val || ''
      }
    })

    dispatch(setFilters(newFilterConfig))
  }, [
    dispatch,
    filterConfig,
    changePagination,
  ])

  return [filteredList, filterHandler]
}

export {
  useFilterGroupDocTypes,
}
