/* eslint-disable no-undef */
import { mockEnv } from '@/mocks/mockEnv'
import { screen, waitFor } from '@testing-library/dom'
import { PdfSegment, UserPage } from '@/containers/PdfSplitting/models'
import { render } from '@/utils/rendererRTL'
import { PageViewer } from './PageViewer'

const mockPageId = 'page-id'
const mockPageWidth = 800
const mockXMarkIconContent = 'x-mark'
const mockPage = jest.fn(() => <div data-testid={mockPageId} />)

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/components/Icons/XMarkIcon', () => ({
  XMarkIcon: () => <span>{mockXMarkIconContent}</span>,
}))

jest.mock('react-pdf', () => ({
  Page: (props) => mockPage(props),
}))

jest.mock('@/containers/AreaSelector', () => ({
  AreaSelector: {
    Provider: ({ children }) => <div data-testid="AreaSelectorProvider">{children}</div>,
    Container: ({ children }) => <div data-testid="AreaSelectorContainer">{children}</div>,
    Overlay: () => <div data-testid="AreaSelectorOverlay" />,
  },
  useAreaCreate: () => ({
    isCreating: false,
    startCreating: jest.fn(),
    deleteArea: jest.fn(),
  }),
}))

const mockUserPage = new UserPage({
  page: 1,
  segmentId: '1',
})

const mockSegment = new PdfSegment({
  id: '1',
  documentTypeId: '1',
  userPages: [mockUserPage],
})

jest.mock('@/containers/PdfSplitting/hooks', () => ({
  usePdfSegments: () => ({
    segments: [mockSegment],
    setSegments: jest.fn(),
    activeUserPage: mockUserPage,
    setActiveUserPage: jest.fn(),
    updateActiveUserPage: jest.fn(),
    allowAreaSelection: true,
  }),
}))

beforeEach(() => {
  jest.clearAllMocks()

  global.ResizeObserver = jest.fn((onResize) => ({
    observe: jest.fn(() => {
      onResize([{
        contentRect: { width: mockPageWidth },
      }])
    }),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))
})

test('renders PageViewer correctly', () => {
  render(<PageViewer />)

  const activePage = screen.getByText(mockUserPage.page + 1)
  const page = screen.getByTestId(mockPageId)
  const closeBtn = screen.getByRole('button', { name: mockXMarkIconContent })
  const areaSelectorOverlay = screen.getByTestId('AreaSelectorOverlay')

  expect(closeBtn).toBeInTheDocument()
  expect(activePage).toBeInTheDocument()
  expect(page).toBeInTheDocument()
  expect(areaSelectorOverlay).toBeInTheDocument()
})

test('passes container width to Page component when page wrapper is resized', async () => {
  render(<PageViewer />)

  await waitFor(() => {
    expect(mockPage).toHaveBeenLastCalledWith(expect.objectContaining({
      width: mockPageWidth,
    }))
  })
})
