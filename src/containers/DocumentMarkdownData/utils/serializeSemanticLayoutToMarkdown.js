import { SEMANTIC_CONTENT_ELEMENT_TYPE } from '@/models/DocumentParsingInfo'

const serializeContentElement = ({ type, content }) => {
  if (
    type === SEMANTIC_CONTENT_ELEMENT_TYPE.PARAGRAPH ||
    type === SEMANTIC_CONTENT_ELEMENT_TYPE.LIST
  ) {
    return content.markdown?.trim() ?? ''
  }

  if (type === SEMANTIC_CONTENT_ELEMENT_TYPE.TABLE) {
    return content.markdownTable?.trim() ?? ''
  }

  if (type === SEMANTIC_CONTENT_ELEMENT_TYPE.IMAGE) {
    return `![${content.name?.trim() ?? ''}](${content.data})`
  }

  return null
}

const serializeSection = (section) => {
  const parts = section.contentElements.reduce((acc, contentElement) => {
    const content = serializeContentElement(contentElement)

    content && acc.push(content)

    return acc
  }, [])

  return parts.join('\n\n')
}

export const serializeSemanticLayoutToMarkdown = (semanticLayout) => (
  semanticLayout?.sections
    .map(serializeSection)
    .filter(Boolean)
    .join('\n\n') ?? ''
)
