
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDocumentType } from '@/actions/documentType'
import { Button, ButtonType } from '@/components/Button'
import { Spin } from '@/components/Spin'
import { AddLLMExtractorModalButton } from '@/containers/AddLLMExtractorModalButton'
import { EmptyState } from '@/containers/EmptyState'
import { InfoPanel } from '@/containers/InfoPanel'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { Localization, localize } from '@/localization/i18n'
import { documentTypeStateSelector } from '@/selectors/documentType'
import { isDocumentTypeFetchingSelector } from '@/selectors/requests'
import {
  ExtractorsListWrapper,
  NewPlusIcon,
  Wrapper,
} from './DocumentTypeLLMExtractorsList.styles'
import { LLMExtractorCard } from './LLMExtractorCard'

const DocumentTypeLLMExtractorsList = () => {
  const documentType = useSelector(documentTypeStateSelector)
  const isLoading = useSelector(isDocumentTypeFetchingSelector)
  const dispatch = useDispatch()

  const { llmExtractors } = documentType
  const total = llmExtractors?.length

  const refreshData = useCallback(() => {
    dispatch(fetchDocumentType(
      documentType.code,
      [
        DocumentTypeExtras.LLM_EXTRACTORS,
        DocumentTypeExtras.EXTRACTION_FIELDS,
      ],
    ))
  }, [documentType.code, dispatch])

  const renderAddLLMExtractorTrigger = (onClick) => (
    <Button
      onClick={onClick}
      type={ButtonType.PRIMARY}
    >
      <NewPlusIcon />
      {localize(Localization.ADD_LLM_EXTRACTOR)}
    </Button>
  )

  const renderActions = () => (
    <AddLLMExtractorModalButton
      documentTypeName={documentType.name}
      onAfterAdding={refreshData}
      renderTrigger={renderAddLLMExtractorTrigger}
    />
  )

  if (isLoading && !total) {
    return <Spin.Centered spinning />
  }

  const getContent = () => {
    if (!total) {
      return (
        <EmptyState
          title={localize(Localization.LLM_EXTRACTORS_WERE_NOT_FOUND)}
        />
      )
    }

    return (
      <ExtractorsListWrapper>
        {
          llmExtractors.map((llmExtractor) => (
            <LLMExtractorCard
              key={llmExtractor.name}
              documentTypeId={documentType.code}
              llmExtractor={llmExtractor}
              refreshData={refreshData}
            />
          ))
        }
      </ExtractorsListWrapper>
    )
  }

  return (
    <Wrapper>
      <InfoPanel
        fetching={isLoading}
        renderActions={renderActions}
        total={total}
      />
      {getContent()}
    </Wrapper>
  )
}

export {
  DocumentTypeLLMExtractorsList,
}
