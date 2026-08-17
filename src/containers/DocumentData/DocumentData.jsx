
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getDocumentState } from '@/actions/documentReviewPage'
import { NoData } from '@/components/NoData'
import { Tab } from '@/components/Tabs'
import { DocumentConsolidatedData } from '@/containers/DocumentConsolidatedData'
import { DocumentEnrichment } from '@/containers/DocumentEnrichment'
import { DocumentExtractedData } from '@/containers/DocumentExtractedData'
import { DocumentMarkdownData } from '@/containers/DocumentMarkdownData'
import { DocumentParsedData } from '@/containers/DocumentParsedData'
import { GenAiData } from '@/containers/GenAiData'
import { GenAIModalButton } from '@/containers/GenAIModalButton'
import {
  useEventSource,
  KnownBusinessEvent,
} from '@/hooks/useEventSource'
import { Localization, localize } from '@/localization/i18n'
import { documentSelector, documentTypeSelector } from '@/selectors/documentReviewPage'
import { isDocumentStateGettingSelector } from '@/selectors/requests'
import { ENV } from '@/utils/env'
import { Tabs } from './DocumentData.styles'

const DocumentData = () => {
  const dispatch = useDispatch()
  const document = useSelector(documentSelector)
  const documentType = useSelector(documentTypeSelector)
  const [activeTab, setActiveTab] = useState('')
  const fetching = useSelector(isDocumentStateGettingSelector)
  const [isChatVisible, setIsChatVisible] = useState(false)
  const addEvent = useEventSource('DocumentData')

  const toggleChatVisibility = () => setIsChatVisible((visible) => !visible)

  const onDocumentStateChanged = useCallback(async (eventData) => {
    if (eventData.documentId !== document._id) {
      return
    }

    if (!fetching) {
      await dispatch(getDocumentState(document._id))
    }
  }, [document._id, dispatch, fetching])

  useEffect(() => {
    if (!ENV.FEATURE_SERVER_SENT_EVENTS) {
      return
    }
    addEvent(KnownBusinessEvent.DOCUMENT_STATE_UPDATED, onDocumentStateChanged)
  }, [addEvent, onDocumentStateChanged])

  const tabs = useMemo(
    () => {
      const tabs = []

      if (
        ENV.FEATURE_CONSOLIDATED_DOCUMENT_TYPE_FIELDS &&
        ENV.FEATURE_ENRICHMENT
      ) {
        tabs.push(new Tab(
          Localization.OVERVIEW,
          localize(Localization.OVERVIEW),
          <DocumentConsolidatedData />,
        ))
      }

      if (documentType.fields?.length) {
        tabs.push(new Tab(
          Localization.EXTRACTED_DATA,
          localize(Localization.EXTRACTED_DATA),
          <DocumentExtractedData />,
        ))
      }

      if (ENV.FEATURE_DOCUMENT_LAYOUT) {
        tabs.push(
          new Tab(
            Localization.DOCUMENT_LAYOUT,
            localize(Localization.DOCUMENT_LAYOUT),
            <DocumentParsedData />,
          ),
        )
      }

      if (
        ENV.FEATURE_MARKDOWN_LAYOUT &&
        document.parsingInfo?.semanticLayoutInfo
      ) {
        tabs.push(
          new Tab(
            Localization.MARKDOWN,
            localize(Localization.MARKDOWN),
            <DocumentMarkdownData />,
          ),
        )
      }

      if (ENV.FEATURE_ENRICHMENT) {
        tabs.push(
          new Tab(
            Localization.EXTRA_FIELDS,
            localize(Localization.EXTRA_FIELDS),
            <DocumentEnrichment
              documentId={document._id}
              documentState={document.state}
              documentTypeCode={documentType.code}
              documentTypeExtraFields={documentType.extraFields}
            />,
          ),
        )
      }

      ENV.FEATURE_GEN_AI_KEY_VALUE_FIELDS && ENV.FEATURE_GEN_AI_CHAT && (
        tabs.push(
          new Tab(
            Localization.GEN_AI_FIELDS,
            localize(Localization.GEN_AI_FIELDS),
            <GenAiData openChat={toggleChatVisibility} />,
          ),
        )
      )

      return tabs
    },
    [
      documentType.fields?.length,
      documentType.code,
      documentType.extraFields,
      document._id,
      document.state,
      document.parsingInfo?.semanticLayoutInfo,
    ],
  )

  if (!tabs.length) {
    return (
      <NoData
        description={localize(Localization.DATA_TO_DISPLAY_IS_EMPTY)}
      />
    )
  }

  return (
    <Tabs
      activeKey={activeTab || tabs[0]?.key}
      animated={false}
      extra={
        ENV.FEATURE_GEN_AI_CHAT && (
          <GenAIModalButton
            isModalVisible={isChatVisible}
            toggleModal={toggleChatVisibility}
          />
        )
      }
      onChange={setActiveTab}
      tabs={tabs}
    />
  )
}

export {
  DocumentData,
}
