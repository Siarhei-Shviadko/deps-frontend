import { mockEnv } from '@/mocks/mockEnv'
import {
  DocumentLayout,
  PageLayout,
  TableLayout,
  ParagraphLayout,
  LineLayout,
  ImageLayout,
  KeyValuePairLayout,
  KeyValuePairElementLayout,
} from '@/models/DocumentLayout'
import { Point } from '@/models/Point'
import { mapDocumentLayoutPagesToLayouts } from './mapDocumentLayoutPagesToLayouts'

const mockTable = new TableLayout({
  order: 1,
  cells: [],
  confidence: 0,
  columnCount: 1,
  rowCount: 1,
  polygon: [],
})

const mockLine = new LineLayout({
  order: 1,
  content: 'line',
  confidence: 1,
  polygon: [new Point(0, 0)],
})

const mockParagraph = new ParagraphLayout({
  id: 'p1',
  order: 1,
  content: 'paragraph',
  confidence: 1,
  role: 'role',
  polygon: [new Point(1, 1)],
  lines: [mockLine],
})

const mockImage = new ImageLayout({
  id: 'img1',
  order: 1,
  title: 'img',
  description: 'desc',
  filePath: '/img.png',
  polygon: [new Point(2, 2)],
})

const mockKeyValue = new KeyValuePairLayout({
  id: 'kv1',
  key: new KeyValuePairElementLayout('key', [new Point(3, 3)]),
  value: new KeyValuePairElementLayout('value', [new Point(4, 4)]),
  confidence: 1,
})

const mockLayout = new DocumentLayout({
  id: 'id',
  tenantId: 'id',
  pages: [
    new PageLayout({
      id: 'page1',
      pageNumber: 1,
      images: [mockImage],
      paragraphs: [mockParagraph],
      keyValuePairs: [mockKeyValue],
      tables: [mockTable],
    }),
    new PageLayout({
      id: 'page2',
      pageNumber: 2,
      images: [],
      paragraphs: [],
      keyValuePairs: [],
      tables: [mockTable],
    }),
  ],
})

jest.mock('@/utils/env', () => mockEnv)

test('maps all layout types into correct structure with page and pageId', () => {
  const mappedData = mapDocumentLayoutPagesToLayouts(mockLayout)

  expect(mappedData.tables).toEqual([
    {
      page: 1,
      pageId: 'page1',
      layout: mockTable,
    },
    {
      page: 2,
      pageId: 'page2',
      layout: mockTable,
    },
  ])
  expect(mappedData.paragraphs).toEqual([
    {
      page: 1,
      pageId: 'page1',
      layout: mockParagraph,
    },
  ])
  expect(mappedData.images).toEqual([
    {
      page: 1,
      pageId: 'page1',
      layout: mockImage,
    },
  ])
  expect(mappedData.keyValuePairs).toEqual([
    {
      page: 1,
      pageId: 'page1',
      layout: mockKeyValue,
    },
  ])
})

test('returns empty arrays for missing layout types', () => {
  const emptyLayout = new DocumentLayout({
    id: 'id2',
    tenantId: 'id2',
    pages: [
      new PageLayout({
        id: 'page3',
        pageNumber: 3,
        images: [],
        paragraphs: [],
        keyValuePairs: [],
        tables: [],
      }),
    ],
  })
  const mappedData = mapDocumentLayoutPagesToLayouts(emptyLayout)
  expect(mappedData.tables).toEqual([])
  expect(mappedData.paragraphs).toEqual([])
  expect(mappedData.images).toEqual([])
  expect(mappedData.keyValuePairs).toEqual([])
})
