import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/dom'
import { PdfSegment, UserPage } from '@/containers/PdfSplitting/models'
import { render } from '@/utils/rendererRTL'
import { PageViewer } from './PageViewer'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/components/Icons/XMarkIcon', () => ({
  XMarkIcon: () => <span>{mockXMarkIconContent}</span>,
}))

jest.mock('react-pdf', () => ({
  Page: () => <div data-testid={mockPageId} />,
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

const mockPageId = 'page-id'
const mockXMarkIconContent = 'x-mark'

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
