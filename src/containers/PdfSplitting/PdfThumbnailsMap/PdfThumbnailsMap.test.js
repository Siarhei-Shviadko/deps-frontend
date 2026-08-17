
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Localization, localize } from '@/localization/i18n'
import { render } from '@/utils/rendererRTL'
import { usePdfSegments } from '../hooks'
import { UserPage } from '../models'
import { PdfThumbnailsMap } from './PdfThumbnailsMap'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('./initPdfWorker', () => ({
  initPdfWorker: jest.fn(),
}))

jest.mock('./PdfThumbnail', () => ({
  PdfThumbnail: jest.fn(({ onClick }) => (
    <div
      data-testid={mockThumbnailId}
      onClick={() => onClick(mockSegments[0].userPages[0])}
    />
  )),
}))

jest.mock('./SegmentsSeparator', () => ({
  SegmentsSeparator: jest.fn(() => <div data-testid={mockSeparatorId} />),
}))

jest.mock('./PageViewer', () => mockShallowComponent('PageViewer'))

jest.mock('react-pdf', () => ({
  Document: ({
    children,
    onLoadSuccess,
    file,
  }) => (
    <div data-testid={mockDocumentId}>
      {
        file
          ? (
            <>
              <button onClick={() => onLoadSuccess({ numPages: mockNumPages })}>
                {mockLoadButton}
              </button>
              {children}
            </>
          ) : <div data-testid="no-data" />
      }
    </div>
  ),
  Page: () => <div data-testid={mockPageId} />,
}))

jest.mock('../models', () => {
  const actual = jest.requireActual('../models')

  return {
    ...actual,
    PdfSegment: {
      fromPagesCount: jest.fn(() => mockSegments[0]),
      isPageExcludeDisabled: jest.fn(() => false),
      withMissingPages: jest.fn((...args) => actual.PdfSegment.withMissingPages(...args)),
    },
  }
})

jest.mock('../hooks', () => ({
  useUserPageDnD: jest.fn(() => ({
    onUserPageDnD: mockOnUserPageDnD,
  })),
  usePdfSegments: jest.fn(() => ({
    segments: mockSegments,
    setSegments: mockSetSegments,
    setInitialSegment: mockSetInitialSegment,
    initialSegment: mockSegments[0],
    activeUserPage: null,
    setActiveUserPage: mockSetActiveUserPage,
    isDraggable: true,
    setIsDraggable: mockSetIsDraggable,
  })),
}))

const mockSetActiveUserPage = jest.fn()
const mockSetInitialSegment = jest.fn()
const mockSetSegments = jest.fn()
const mockOnUserPageDnD = jest.fn()
const mockSetIsDraggable = jest.fn()
const mockDocumentId = 'pdf-document'
const mockSeparatorId = 'segments-separator'
const mockThumbnailId = 'pdf-thumbnail'
const mockPageId = 'page'
const mockLoadButton = 'Load'
const mockNumPages = 2

const mockSegments = [{
  id: '1',
  documentTypeId: '1',
  userPages: [
    new UserPage({
      page: 0,
      segmentId: '1',
    }),
    new UserPage({
      page: 1,
      segmentId: '1',
    }),
  ],
}]

const { PdfSegment } = jest.requireMock('../models')

test('renders PdfThumbnailsMap correctly', () => {
  const props = {
    pdfFile: new File(['content'], 'file'),
    withTitle: true,
  }

  render(<PdfThumbnailsMap {...props} />)

  const title = screen.getByText(localize(Localization.PAGES_TO_SPLIT))
  const thumbnails = screen.getAllByTestId(mockThumbnailId)

  expect(title).toBeInTheDocument()
  expect(thumbnails.length).toBe(mockSegments[0].userPages.length)
})

test('sets segments after receiving pdfFile', async () => {
  const props = {
    pdfFile: new File(['content'], 'file'),
  }

  render(<PdfThumbnailsMap {...props} />)

  const btn = screen.getByRole('button', { name: mockLoadButton })
  await userEvent.click(btn)

  const thumbnails = screen.getAllByTestId(mockThumbnailId)
  const separator = screen.getByTestId(mockSeparatorId)

  expect(separator).toBeInTheDocument()
  expect(thumbnails.length).toBe(mockSegments[0].userPages.length)
})

test('shows page if there is activeUserPage', () => {
  const mockValue = {
    segments: mockSegments,
    setSegments: mockSetSegments,
    setInitialSegment: mockSetInitialSegment,
    initialSegment: mockSegments[0],
    activeUserPage: mockSegments[0].userPages[0],
    setActiveUserPage: mockSetActiveUserPage,
  }

  usePdfSegments.mockReturnValueOnce(mockValue)
  usePdfSegments.mockReturnValueOnce(mockValue)

  const props = {
    pdfFile: new File(['content'], 'file'),
  }

  render(<PdfThumbnailsMap {...props} />)

  const pageViewer = screen.getByTestId('PageViewer')

  expect(pageViewer).toBeInTheDocument()
})

test('shows no data if pdfFile is not provided', () => {
  render(<PdfThumbnailsMap />)

  const noData = screen.getByTestId('no-data')

  expect(noData).toBeInTheDocument()
})

test('calls setSegments with filled missing pages when fillMissingPages is true and document loads', async () => {
  jest.clearAllMocks()

  const segmentsWithGaps = [{
    id: '1',
    documentTypeId: '1',
    userPages: [
      new UserPage({
        page: 0,
        segmentId: '1',
      }),
      new UserPage({
        page: 2,
        segmentId: '1',
      }),
    ],
  }]

  const mockFilledSegments = [{
    ...segmentsWithGaps[0],
    userPages: [
      ...segmentsWithGaps[0].userPages,
      new UserPage({
        page: 1,
        segmentId: '1',
        isExcluded: true,
      }),
    ],
  }]

  PdfSegment.withMissingPages.mockReturnValueOnce(mockFilledSegments)

  const mockValue = {
    segments: segmentsWithGaps,
    setSegments: mockSetSegments,
    setInitialSegment: mockSetInitialSegment,
    initialSegment: segmentsWithGaps[0],
    activeUserPage: null,
    setActiveUserPage: mockSetActiveUserPage,
    isDraggable: true,
    setIsDraggable: mockSetIsDraggable,
  }

  usePdfSegments.mockReturnValueOnce(mockValue)
  usePdfSegments.mockReturnValueOnce(mockValue)

  const props = {
    pdfFile: new File(['content'], 'file'),
    fillMissingPages: true,
  }

  render(<PdfThumbnailsMap {...props} />)

  const btn = screen.getByRole('button', { name: mockLoadButton })
  await userEvent.click(btn)

  expect(PdfSegment.withMissingPages).toHaveBeenNthCalledWith(1, segmentsWithGaps, mockNumPages)
  expect(mockSetSegments).toHaveBeenNthCalledWith(1, mockFilledSegments)
})

test('does not call withMissingPages when fillMissingPages is not provided and document loads', async () => {
  jest.clearAllMocks()

  const props = {
    pdfFile: new File(['content'], 'file'),
  }

  render(<PdfThumbnailsMap {...props} />)

  const btn = screen.getByRole('button', { name: mockLoadButton })
  await userEvent.click(btn)

  expect(PdfSegment.withMissingPages).not.toHaveBeenCalled()
})
