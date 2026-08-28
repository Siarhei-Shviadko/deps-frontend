
import {
  useMemo,
  useCallback,
  useEffect,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDocumentTypes } from '@/actions/documentTypes'
import { fetchProcessingEngines } from '@/actions/engines'
import { fetchAvailableLanguages } from '@/actions/languages'
import { setFilters, setPagination } from '@/actions/navigation'
import { Content } from '@/components/Layout'
import { Spin } from '@/components/Spin'
import { Tab } from '@/components/Tabs'
import { DocumentTypeFilterKey, EXTRACTION_TYPE_FILTER_KEY } from '@/constants/navigation'
import { AddDocumentTypeModalButton } from '@/containers/AddDocumentTypeModalButton'
import { DocumentTypeImportButton } from '@/containers/DocumentTypeImportButton'
import { DocumentTypes } from '@/containers/DocumentTypes'
import { ExtractionType } from '@/enums/ExtractionType'
import { localize, Localization } from '@/localization/i18n'
import { BASE_DOCUMENT_TYPES_FILTER_CONFIG } from '@/models/DocumentTypesFilterConfig'
import { documentTypesStateSelector } from '@/selectors/documentTypes'
import { filterSelector } from '@/selectors/navigation'
import {
  areEnginesFetchingSelector,
  areLanguagesFetchingSelector,
  areTypesFetchingSelector,
} from '@/selectors/requests'
import { ENV } from '@/utils/env'
import {
  Header,
  Title,
  Tabs,
} from './DocumentTypesPage.styles'

const EXTRACTION_TYPES_BY_TABS = {
  [EXTRACTION_TYPE_FILTER_KEY.templates]: [ExtractionType.TEMPLATE],
  [EXTRACTION_TYPE_FILTER_KEY.mlModels]: [ExtractionType.PLUGIN, ExtractionType.ML],
  [EXTRACTION_TYPE_FILTER_KEY.prototypes]: [ExtractionType.PROTOTYPE],
  [EXTRACTION_TYPE_FILTER_KEY.azureCloudExtractor]: [ExtractionType.AZURE_CLOUD_EXTRACTOR],
  [EXTRACTION_TYPE_FILTER_KEY.aiPrompted]: [null],
}

const DocumentTypesPage = () => {
  const areTypesFetching = useSelector(areTypesFetchingSelector)
  const areEnginesFetching = useSelector(areEnginesFetchingSelector)
  const areLanguagesFetching = useSelector(areLanguagesFetchingSelector)
  const documentTypes = Object.values(useSelector(documentTypesStateSelector))
  const filters = useSelector(filterSelector)

  const dispatch = useDispatch()

  const getTabDocumentTypes = useCallback((tabKey) =>
    documentTypes.filter((documentType) =>
      EXTRACTION_TYPES_BY_TABS[tabKey].includes(documentType.extractionType)),
  [
    documentTypes,
  ])

  const getDocumentTypesToRender = useCallback((tabKey) => (
    <DocumentTypes
      key={tabKey}
      documentTypes={getTabDocumentTypes(tabKey)}
      documentTypesExtractor={tabKey}
    />
  ), [
    getTabDocumentTypes,
  ])

  const tabs = useMemo(() => {
    const tabs = []

    if (ENV.FEATURE_AI_PROMPTED_EXTRACTORS) {
      tabs.push(
        new Tab(
          EXTRACTION_TYPE_FILTER_KEY.aiPrompted,
          localize(Localization.AI_PROMPTED),
          getDocumentTypesToRender(EXTRACTION_TYPE_FILTER_KEY.aiPrompted),
        ),
      )
    }

    if (ENV.FEATURE_AZURE_CLOUD_NATIVE_EXTRACTOR) {
      tabs.push(
        new Tab(
          EXTRACTION_TYPE_FILTER_KEY.azureCloudExtractor,
          localize(Localization.AZURE_CLOUD_NATIVE),
          getDocumentTypesToRender(EXTRACTION_TYPE_FILTER_KEY.azureCloudExtractor),
        ),
      )
    }

    if (ENV.FEATURE_PROTOTYPES) {
      tabs.push(
        new Tab(
          EXTRACTION_TYPE_FILTER_KEY.prototypes,
          localize(Localization.PROTOTYPES),
          getDocumentTypesToRender(EXTRACTION_TYPE_FILTER_KEY.prototypes),
        ),
      )
    }

    if (ENV.FEATURE_TEMPLATES) {
      tabs.push(
        new Tab(
          EXTRACTION_TYPE_FILTER_KEY.templates,
          localize(Localization.TEMPLATES_TITLE),
          getDocumentTypesToRender(EXTRACTION_TYPE_FILTER_KEY.templates),
        ),
      )
    }

    if (ENV.FEATURE_MACHINE_LEARNING_MODELS) {
      tabs.push(
        new Tab(
          EXTRACTION_TYPE_FILTER_KEY.mlModels,
          localize(Localization.CUSTOM_MODELS),
          getDocumentTypesToRender(EXTRACTION_TYPE_FILTER_KEY.mlModels),
        ),
      )
    }

    return tabs
  }, [getDocumentTypesToRender])

  useEffect(() => {
    dispatch(fetchDocumentTypes())
    dispatch(fetchProcessingEngines())
    dispatch(fetchAvailableLanguages())
  }, [dispatch])

  const resetFilter = useCallback((activeKey) => {
    dispatch(setFilters({
      ...BASE_DOCUMENT_TYPES_FILTER_CONFIG,
      [DocumentTypeFilterKey.EXTRACTION_TYPE]: activeKey,
    }))
    dispatch(setPagination({}))
  }, [dispatch])

  const onChangeActiveKey = (key) => {
    resetFilter(key)
  }

  if (
    areTypesFetching ||
    areEnginesFetching ||
    areLanguagesFetching
  ) {
    return <Spin.Centered spinning />
  }

  const shouldRenderAddDocTypeButton = (
    ENV.FEATURE_PROTOTYPES ||
    ENV.FEATURE_TEMPLATES ||
    ENV.FEATURE_AZURE_CLOUD_NATIVE_EXTRACTOR ||
    ENV.FEATURE_AI_PROMPTED_EXTRACTORS
  )

  return (
    <Content>
      <Header>
        <Title>{localize(Localization.DOCUMENT_TYPES)}</Title>
        {ENV.FEATURE_DOCUMENT_TYPE_IMPORT_EXPORT && <DocumentTypeImportButton />}
        {shouldRenderAddDocTypeButton && <AddDocumentTypeModalButton />}
      </Header>
      <Tabs
        activeKey={filters.extractionType ?? tabs[0]?.key}
        animated={false}
        onChange={onChangeActiveKey}
        tabs={tabs}
      />
    </Content>
  )
}

export {
  DocumentTypesPage,
}
