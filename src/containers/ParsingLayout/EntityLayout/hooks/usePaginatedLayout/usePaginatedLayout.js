
import { useEffect } from 'react'
import { PAGINATION_PAGE_SIZE } from '@/containers/ParsingLayout/EntityLayout/constants'
import { DOCUMENT_LAYOUT_FEATURE_TO_LAYOUT_TYPE } from '@/enums/DocumentLayoutType'
import { Localization, localize } from '@/localization/i18n'
import { notifyWarning } from '@/utils/notification'
import { useFetchLayout } from '../useFetchLayout'
import { mapDocumentLayoutPagesToLayouts } from './mappers'

export const usePaginatedLayout = ({ batchIndex, parsingFeature, parsingType }) => {
  const {
    data: layoutBatch,
    isFetching,
    isError,
  } = useFetchLayout({
    parsingFeature,
    parsingType,
    batchIndex,
    batchSize: PAGINATION_PAGE_SIZE,
  })

  useEffect(() => {
    if (isError) {
      notifyWarning(localize(Localization.DEFAULT_ERROR))
    }
  }, [isError])

  const documentLayoutType = DOCUMENT_LAYOUT_FEATURE_TO_LAYOUT_TYPE[parsingFeature]

  const layoutData = layoutBatch
    ? mapDocumentLayoutPagesToLayouts(layoutBatch)[documentLayoutType] ?? []
    : []

  return {
    layoutData,
    isFetching,
  }
}
