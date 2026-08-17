import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useFetchSemanticLayoutQuery } from '@/apiRTK/semanticLayoutApi'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NoData } from '@/components/NoData'
import { Spin } from '@/components/Spin'
import { Localization, localize } from '@/localization/i18n'
import { documentSelector } from '@/selectors/documentReviewPage'
import { notifyWarning } from '@/utils/notification'
import {
  LocalBoundary,
  MarkdownContent,
} from './DocumentMarkdownData.styles'
import {
  renderMarkdownToSafeHtml,
  serializeSemanticLayoutToMarkdown,
} from './utils'

const renderLocalBoundary = () => (
  <LocalBoundary>
    {localize(Localization.DEFAULT_ERROR_MESSAGE)}
  </LocalBoundary>
)

const DocumentMarkdownDataContent = () => {
  const document = useSelector(documentSelector)
  const layoutId = document.parsingInfo?.layoutId

  const {
    data: semanticLayout,
    isFetching,
    isError,
  } = useFetchSemanticLayoutQuery(
    { layoutId },
    { skip: !layoutId },
  )

  useEffect(() => {
    if (isError) {
      notifyWarning(localize(Localization.MARKDOWN_ERROR))
    }
  }, [isError])

  if (isFetching) {
    return <Spin.Centered spinning />
  }

  const markdownContent = serializeSemanticLayoutToMarkdown(semanticLayout)

  if (!markdownContent) {
    return (
      <NoData
        description={localize(Localization.MARKDOWN_DATA_IS_EMPTY)}
      />
    )
  }

  return (
    <MarkdownContent
      dangerouslySetInnerHTML={
        {
          __html: renderMarkdownToSafeHtml(markdownContent),
        }
      }
    />
  )
}

export const DocumentMarkdownData = () => (
  <ErrorBoundary localBoundary={renderLocalBoundary}>
    <DocumentMarkdownDataContent />
  </ErrorBoundary>
)
