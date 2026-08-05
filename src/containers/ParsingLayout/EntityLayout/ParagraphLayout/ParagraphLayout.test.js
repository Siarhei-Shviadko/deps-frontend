import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import { DOCUMENT_LAYOUT_FEATURE, DOCUMENT_LAYOUT_PARSING_TYPE } from '@/enums/DocumentLayoutType'
import { Localization, localize } from '@/localization/i18n'
import {
  LineLayout,
  ParagraphLayout,
} from '@/models/DocumentLayout'
import { Point } from '@/models/Point'
import { render } from '@/utils/rendererRTL'
import { usePaginatedLayout } from '../hooks'
import { ParagraphLayout as ParagraphLayoutComponent } from './ParagraphLayout'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/components/Spin', () => ({
  Spin: () => <div data-testid="spin" />,
}))

jest.mock('../hooks', () => ({
  usePaginatedLayout: jest.fn(),
}))

jest.mock('./ParagraphField', () => ({
  ParagraphField: jest.fn(({ paragraph }) => (
    <div data-testid={paragraph.id}>
      {
        paragraph.lines.map((line, index) => (
          <span key={index}>
            {line.content}
          </span>
        ))
      }
    </div>
  )),
}))

const mockLine1 = new LineLayout({
  order: 1,
  confidence: 0,
  content: 'Line 1 content',
  polygon: [
    new Point(0.111, 0.222),
    new Point(0.333, 0.444),
  ],
})

const mockLine2 = new LineLayout({
  order: 2,
  confidence: 0,
  content: 'Line 2 content',
  polygon: [
    new Point(0.555, 0.666),
    new Point(0.777, 0.888),
  ],
})

const mockParagraph1 = new ParagraphLayout({
  id: 'id1',
  order: 1,
  content: 'Paragraph 1 content',
  confidence: 0,
  role: 'role1',
  polygon: [
    new Point(0.111, 0.222),
    new Point(0.333, 0.444),
  ],
  lines: [mockLine1],
})

const mockParagraph2 = new ParagraphLayout({
  id: 'id2',
  order: 2,
  content: 'Paragraph 2 content',
  confidence: 0,
  role: 'role2',
  polygon: [
    new Point(0.555, 0.666),
    new Point(0.777, 0.888),
  ],
  lines: [mockLine2],
})

const mockData = [
  {
    layout: mockParagraph1,
    page: 1,
    pageId: 'page-1',
  },
  {
    layout: mockParagraph2,
    page: 2,
    pageId: 'page-2',
  },
]

const defaultProps = {
  batchIndex: 0,
  parsingType: DOCUMENT_LAYOUT_PARSING_TYPE.TESSERACT,
}

beforeEach(() => {
  jest.clearAllMocks()
  usePaginatedLayout.mockReturnValue({
    layoutData: mockData,
    isFetching: false,
  })
})

test('calls usePaginatedLayout with correct parameters', () => {
  render(<ParagraphLayoutComponent {...defaultProps} />)

  expect(usePaginatedLayout).toHaveBeenCalledWith({
    batchIndex: 0,
    parsingFeature: DOCUMENT_LAYOUT_FEATURE.TEXT,
    parsingType: DOCUMENT_LAYOUT_PARSING_TYPE.TESSERACT,
  })
})

test('renders correct layout for paragraphs', () => {
  render(<ParagraphLayoutComponent {...defaultProps} />)

  const paragraph1 = screen.getByTestId(mockParagraph1.id)
  const paragraph2 = screen.getByTestId(mockParagraph2.id)

  expect(paragraph1).toBeInTheDocument()
  expect(screen.getByText(mockLine1.content)).toBeInTheDocument()
  expect(paragraph2).toBeInTheDocument()
  expect(screen.getByText(mockLine2.content)).toBeInTheDocument()
})

test('renders spinner when layout is fetching', () => {
  usePaginatedLayout.mockReturnValueOnce({
    layoutData: [],
    isFetching: true,
  })

  render(<ParagraphLayoutComponent {...defaultProps} />)

  expect(screen.getByTestId('spin')).toBeInTheDocument()
  expect(screen.queryByTestId(mockParagraph1.id)).not.toBeInTheDocument()
})

test('renders no data message when layout data is empty', () => {
  usePaginatedLayout.mockReturnValueOnce({
    layoutData: [],
    isFetching: false,
  })

  render(<ParagraphLayoutComponent {...defaultProps} />)

  expect(screen.getByText(localize(Localization.NO_DATA))).toBeInTheDocument()
})
