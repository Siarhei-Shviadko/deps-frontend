
import {
  useCallback,
  useMemo,
  useEffect,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDocumentsByFilter } from '@/actions/documentsListPage'
import { fetchDocumentTypes } from '@/actions/documentTypes'
import { Spin } from '@/components/Spin'
import { PaginationKeys } from '@/constants/navigation'
import { DocumentsStatesChart } from '@/containers/DocumentsStatesChart'
import { FieldEditsTable } from '@/containers/FieldEditsTable'
import { ExtractionType } from '@/enums/ExtractionType'
import { BASE_DOCUMENTS_FILTER_CONFIG } from '@/models/DocumentsFilterConfig'
import { DefaultPaginationConfig } from '@/models/PaginationConfig'
import { documentsTotalSelector } from '@/selectors/documentsListPage'
import { documentTypesStateSelector } from '@/selectors/documentTypes'
import { areDocumentsFetchingSelector, areTypesFetchingSelector } from '@/selectors/requests'
import { ENV } from '@/utils/env'
import { ChartsRowWrapper, ChartsWrapper } from './DashboardCharts.styles'
import { DocumentsByTypeChart } from './DocumentsByTypeChart'
import { EmptyDashboard } from './EmptyDashboard'

const mapStoreTypesToDocTypeList = (documentTypes, enabledExtractionTypes) =>
  Object.values(documentTypes || {})
    .filter((type) => (
      enabledExtractionTypes.includes(type.extractionType) ||
      (type.extractionType === null && enabledExtractionTypes.includes(ExtractionType.AI_PROMPTED))
    ))
    .map((type) => ({
      ...type,
      id: type.code,
      documentType: type.name,
    }))

const DashboardCharts = () => {
  const dispatch = useDispatch()
  const documentTypes = useSelector(documentTypesStateSelector)
  const totalDocuments = useSelector(documentsTotalSelector)
  const areDocumentsFetching = useSelector(areDocumentsFetchingSelector)
  const areDocTypesFetching = useSelector(areTypesFetchingSelector)

  const documentsFilterConfig = useMemo(() => ({
    ...BASE_DOCUMENTS_FILTER_CONFIG,
    ...DefaultPaginationConfig,
    [PaginationKeys.PER_PAGE]: 1,
  }), [])

  const getExtractionTypes = useCallback(() => {
    const extractionTypes = []
    ENV.FEATURE_PROTOTYPES && extractionTypes.push(ExtractionType.PROTOTYPE)
    ENV.FEATURE_TEMPLATES && extractionTypes.push(ExtractionType.TEMPLATE)
    ENV.FEATURE_MACHINE_LEARNING_MODELS && extractionTypes.push(ExtractionType.PLUGIN)
    ENV.FEATURE_AI_PROMPTED_EXTRACTORS && extractionTypes.push(ExtractionType.AI_PROMPTED)
    ENV.FEATURE_AZURE_CLOUD_NATIVE_EXTRACTOR && extractionTypes.push(ExtractionType.AZURE_CLOUD_EXTRACTOR)

    return extractionTypes
  }, [])

  const docTypesList = mapStoreTypesToDocTypeList(documentTypes, getExtractionTypes())

  useEffect(() => {
    dispatch(fetchDocumentsByFilter(documentsFilterConfig))
    dispatch(fetchDocumentTypes())
  }, [
    documentsFilterConfig,
    dispatch,
  ])

  const docTypesConfig = useMemo(() => ({
    docTypesList,
    isFetching: areDocTypesFetching,
  }), [
    docTypesList,
    areDocTypesFetching,
  ])

  const isEmpty = (
    !docTypesList.length &&
    !totalDocuments
  )

  const isFetching = (
    areDocTypesFetching ||
    areDocumentsFetching
  )

  if (isFetching) {
    return (
      <ChartsWrapper>
        <Spin.Centered spinning />
      </ChartsWrapper>
    )
  }

  if (isEmpty) {
    return <EmptyDashboard />
  }

  return (
    <ChartsWrapper>
      <ChartsRowWrapper>
        <DocumentsStatesChart />
        <FieldEditsTable />
      </ChartsRowWrapper>
      <DocumentsByTypeChart {...docTypesConfig} />
    </ChartsWrapper>
  )
}

export {
  DashboardCharts,
}
