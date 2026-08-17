import PropTypes from 'prop-types'

const SEMANTIC_CONTENT_ELEMENT_TYPE = {
  PARAGRAPH: 'paragraph',
  LIST: 'list',
  TABLE: 'table',
  IMAGE: 'image',
}

class SerializedParagraphContent {
  constructor ({
    markdown,
  }) {
    this.markdown = markdown
  }
}

class SerializedListContent {
  constructor ({
    items,
    markdown,
  }) {
    this.items = items
    this.markdown = markdown
  }
}

class SerializedTableContent {
  constructor ({
    markdownTable,
    rows,
    columns,
  }) {
    this.markdownTable = markdownTable
    this.rows = rows
    this.columns = columns
  }
}

class SerializedImageContent {
  constructor ({
    name,
    data,
  }) {
    this.name = name
    this.data = data
  }
}

class SemanticContentElement {
  constructor ({
    id,
    order,
    type,
    content,
  }) {
    this.id = id
    this.order = order
    this.type = type
    this.content = content
  }
}

const serializedParagraphContentShape = PropTypes.shape({
  markdown: PropTypes.string.isRequired,
})

const serializedListContentShape = PropTypes.shape({
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  markdown: PropTypes.string.isRequired,
})

const serializedTableContentShape = PropTypes.shape({
  markdownTable: PropTypes.string.isRequired,
  rows: PropTypes.number.isRequired,
  columns: PropTypes.number.isRequired,
})

const serializedImageContentShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  data: PropTypes.string.isRequired,
})

const semanticContentElementShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  order: PropTypes.number.isRequired,
  type: PropTypes.oneOf(Object.values(SEMANTIC_CONTENT_ELEMENT_TYPE)).isRequired,
  content: PropTypes.oneOfType([
    serializedParagraphContentShape,
    serializedListContentShape,
    serializedTableContentShape,
    serializedImageContentShape,
  ]).isRequired,
})

export {
  SEMANTIC_CONTENT_ELEMENT_TYPE,
  SerializedParagraphContent,
  SerializedListContent,
  SerializedTableContent,
  SerializedImageContent,
  SemanticContentElement,
  serializedParagraphContentShape,
  serializedListContentShape,
  serializedTableContentShape,
  serializedImageContentShape,
  semanticContentElementShape,
}
