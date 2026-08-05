import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { DOCUMENT_LAYOUT_FEATURE, DOCUMENT_LAYOUT_PARSING_TYPE } from '@/enums/DocumentLayoutType'
import { Localization, localize } from '@/localization/i18n'
import { PageLayout, ParagraphLayout } from '@/models/DocumentLayout'
import { notifyWarning } from '@/utils/notification'
import { PAGINATION_PAGE_SIZE } from '../../constants'
import { useFetchLayout } from '../useFetchLayout'
import { usePaginatedLayout } from './usePaginatedLayout'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('../useFetchLayout', () => ({
  useFetchLayout: jest.fn(() => ({
    data: null,
    isFetching: false,
    isError: false,
  })),
}))

const mockParagraph = new ParagraphLayout({
  id: 'p1',
  order: 1,
  content: 'paragraph',
  confidence: 1,
  role: 'role',
  polygon: [],
  lines: [],
})

const mockLayout = {
  pages: [
    new PageLayout({
      id: 'page1',
      paragraphs: [mockParagraph],
      tables: [],
      keyValuePairs: [],
      images: [],
      pageNumber: 1,
    }),
  ],
}

const defaultParams = {
  batchIndex: 0,
  parsingFeature: DOCUMENT_LAYOUT_FEATURE.TEXT,
  parsingType: DOCUMENT_LAYOUT_PARSING_TYPE.TESSERACT,
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('calls useFetchLayout with correct parameters', () => {
  renderHook(() => usePaginatedLayout(defaultParams))

  expect(useFetchLayout).toHaveBeenCalledWith({
    parsingFeature: DOCUMENT_LAYOUT_FEATURE.TEXT,
    parsingType: DOCUMENT_LAYOUT_PARSING_TYPE.TESSERACT,
    batchIndex: 0,
    batchSize: PAGINATION_PAGE_SIZE,
  })
})

test('returns mapped layout data when batch is loaded', () => {
  useFetchLayout.mockReturnValueOnce({
    data: mockLayout,
    isFetching: false,
    isError: false,
  })

  const { result } = renderHook(() => usePaginatedLayout(defaultParams))

  expect(result.current.layoutData).toEqual([
    {
      pageId: 'page1',
      page: 1,
      layout: mockParagraph,
    },
  ])
  expect(result.current.isFetching).toBe(false)
})

test('returns empty layout data when layout is null', () => {
  const { result } = renderHook(() => usePaginatedLayout(defaultParams))

  expect(result.current.layoutData).toEqual([])
  expect(result.current.isFetching).toBe(false)
})

test('returns empty layout data when layout has no data for the parsing feature', () => {
  useFetchLayout.mockReturnValueOnce({
    data: {
      pages: [
        new PageLayout({
          id: 'page1',
          paragraphs: [],
          tables: [],
          keyValuePairs: [],
          images: [],
          pageNumber: 1,
        }),
      ],
    },
    isFetching: false,
    isError: false,
  })

  const { result } = renderHook(() => usePaginatedLayout(defaultParams))

  expect(result.current.layoutData).toEqual([])
})

test('returns isFetching true when layout is loading', () => {
  useFetchLayout.mockReturnValueOnce({
    data: null,
    isFetching: true,
    isError: false,
  })

  const { result } = renderHook(() => usePaginatedLayout(defaultParams))

  expect(result.current.isFetching).toBe(true)
  expect(result.current.layoutData).toEqual([])
})

test('calls notifyWarning when layout retrieving failed', async () => {
  useFetchLayout.mockReturnValueOnce({
    data: null,
    isFetching: false,
    isError: true,
  })

  renderHook(() => usePaginatedLayout(defaultParams))

  await waitFor(() => {
    expect(notifyWarning).toHaveBeenCalledWith(localize(Localization.DEFAULT_ERROR))
  })
})
