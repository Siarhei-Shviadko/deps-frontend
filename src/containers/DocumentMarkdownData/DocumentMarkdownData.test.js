import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { screen } from '@testing-library/react'
import { useFetchSemanticLayoutQuery } from '@/apiRTK/semanticLayoutApi'
import { Localization, localize } from '@/localization/i18n'
import {
  DocumentParsingInfo,
  SemanticLayout,
  SemanticLayoutMetadata,
} from '@/models/DocumentParsingInfo'
import { documentSelector } from '@/selectors/documentReviewPage'
import { notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { DocumentMarkdownData } from './DocumentMarkdownData'
import {
  renderMarkdownToSafeHtml,
  serializeSemanticLayoutToMarkdown,
} from './utils'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('react-redux', () => mockReactRedux)
jest.mock('@/selectors/documentReviewPage')
jest.mock('@/apiRTK/semanticLayoutApi', () => ({
  useFetchSemanticLayoutQuery: jest.fn(),
}))
jest.mock('@/components/Spin', () => {
  const Spin = ({ children }) => <div data-testid="spin">{children}</div>
  Spin.Centered = () => <div data-testid="spin-centered" />

  return { Spin }
})
jest.mock('./utils', () => ({
  serializeSemanticLayoutToMarkdown: jest.fn(),
  renderMarkdownToSafeHtml: jest.fn(),
}))

const mockLayoutId = 'mockLayoutId'
const mockSemanticLayout = new SemanticLayout({
  id: mockLayoutId,
  createdAt: '2024-01-01T00:00:00Z',
  metadata: new SemanticLayoutMetadata({
    confidence: 0.9,
    processingTimeMs: 100,
    sourceProvider: 'mockProvider',
  }),
  sections: [],
})
const mockParsingInfo = new DocumentParsingInfo({
  layoutId: mockLayoutId,
})

beforeEach(() => {
  jest.clearAllMocks()

  documentSelector.mockImplementation(() => ({
    parsingInfo: mockParsingInfo,
  }))

  useFetchSemanticLayoutQuery.mockReturnValue({
    data: mockSemanticLayout,
    isFetching: false,
    isError: false,
  })

  serializeSemanticLayoutToMarkdown.mockReturnValue('')
  renderMarkdownToSafeHtml.mockReturnValue('')
})

test('renders spinner when semantic layout is fetching', () => {
  useFetchSemanticLayoutQuery.mockReturnValue({
    data: undefined,
    isFetching: true,
    isError: false,
  })

  render(<DocumentMarkdownData />)

  expect(screen.getByTestId('spin-centered')).toBeInTheDocument()
})

test('renders empty state when markdown content is empty', () => {
  serializeSemanticLayoutToMarkdown.mockReturnValue('')

  render(<DocumentMarkdownData />)

  expect(screen.getByText(localize(Localization.MARKDOWN_DATA_IS_EMPTY))).toBeInTheDocument()
})

test('renders markdown html when content is available', () => {
  const markdown = '# Title'
  const html = '<h1>Title</h1>'

  serializeSemanticLayoutToMarkdown.mockReturnValue(markdown)
  renderMarkdownToSafeHtml.mockReturnValue(html)

  render(<DocumentMarkdownData />)

  expect(serializeSemanticLayoutToMarkdown).toHaveBeenNthCalledWith(1, mockSemanticLayout)
  expect(renderMarkdownToSafeHtml).toHaveBeenNthCalledWith(1, markdown)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Title')
})

test('calls notifyWarning when semantic layout fetch fails', () => {
  useFetchSemanticLayoutQuery.mockReturnValue({
    data: undefined,
    isFetching: false,
    isError: true,
  })

  render(<DocumentMarkdownData />)

  expect(notifyWarning).toHaveBeenNthCalledWith(1, localize(Localization.MARKDOWN_ERROR))
  expect(screen.getByText(localize(Localization.MARKDOWN_DATA_IS_EMPTY))).toBeInTheDocument()
})

test('fetches semantic layout with layoutId', () => {
  render(<DocumentMarkdownData />)

  expect(useFetchSemanticLayoutQuery).toHaveBeenNthCalledWith(
    1,
    { layoutId: mockLayoutId },
    { skip: false },
  )
})

test('skips semantic layout fetch when layoutId is missing', () => {
  documentSelector.mockImplementation(() => ({
    parsingInfo: new DocumentParsingInfo({}),
  }))

  render(<DocumentMarkdownData />)

  expect(useFetchSemanticLayoutQuery).toHaveBeenNthCalledWith(
    1,
    { layoutId: undefined },
    { skip: true },
  )
})
