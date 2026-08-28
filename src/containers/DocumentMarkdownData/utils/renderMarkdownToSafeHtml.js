import katex from 'katex'
import MarkdownIt from 'markdown-it'
import taskLists from 'markdown-it-task-lists'
import texmath from 'markdown-it-texmath'
import sanitizeHtml from 'sanitize-html'

const markdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
}).use(taskLists, {
  label: true,
}).use(texmath, {
  engine: katex,
  delimiters: 'dollars',
  katexOptions: {
    output: 'html',
    throwOnError: false,
  },
})

const SANITIZE_OPTIONS = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    'img',
    'input',
    'th',
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ['href', 'name', 'target', 'rel'],
    input: ['type', 'checked', 'disabled'],
    th: ['align', 'colspan', 'rowspan'],
    td: ['align', 'colspan', 'rowspan'],
    span: ['class', 'style', 'aria-hidden'],
  },
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
}

const normalizeProviderHtmlArtifacts = (value) => value
  .replace(/<td\$[^>]*>/gi, '<td>')
  .replace(/<th\$[^>]*>/gi, '<th>')

export const renderMarkdownToSafeHtml = (markdown) => (
  sanitizeHtml(
    markdownIt.render(normalizeProviderHtmlArtifacts(markdown)),
    SANITIZE_OPTIONS,
  )
)
