
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { UserPage, PdfSegment } from '@/containers/PdfSplitting/models'
import { render } from '@/utils/rendererRTL'
import { PdfThumbnail } from './PdfThumbnail'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('react-pdf', () => ({
  Thumbnail: () => <div>{mockContent}</div>,
}))

jest.mock('@/containers/InView', () => ({
  InView: jest.fn(({ children }) => (
    <div>{children}</div>
  )),
}))

jest.mock('@/containers/PdfSplitting/hooks', () => ({
  usePdfSegments: jest.fn(() => ({
    segments: [mockSegment],
    setSegments: mockSetSegments,
    setActiveUserPage: mockSetActiveUserPage,
    setIsDraggable: mockSetIsDraggable,
  })),
}))

jest.mock('./PdfThumbnail.styles', () => {
  const actual = jest.requireActual('./PdfThumbnail.styles')

  return {
    ...actual,
    BoundingBoxOverlay: () => <div data-testid="bounding-box-overlay" />,
  }
})

const mockContent = 'Thumbnail'
const mockBoundingBoxOverlayId = 'bounding-box-overlay'
const mockSetSegments = jest.fn()
const mockSetActiveUserPage = jest.fn()
const mockSetIsDraggable = jest.fn()

const mockCoordinates = {
  x: 0.1,
  y: 0.2,
  width: 0.3,
  height: 0.4,
}

const mockUserPage = new UserPage({
  page: 0,
  segmentId: '1',
})

const mockSegment = new PdfSegment({
  id: '1',
  documentTypeId: '1',
  userPages: [mockUserPage],
})

test('renders PdfThumbnail correctly', () => {
  const props = {
    userPage: mockUserPage,
    isActive: false,
    isSelected: false,
    onClick: jest.fn(),
  }

  render(<PdfThumbnail {...props} />)

  const currentPage = screen.getByText(props.userPage.page + 1)
  const thumbnail = screen.getByText(mockContent)

  expect(thumbnail).toBeInTheDocument()
  expect(currentPage).toBeInTheDocument()
})

test('calls setActiveUserPage when click on thumbnail', async () => {
  const props = {
    userPage: mockUserPage,
    isActive: false,
    isSelected: false,
    onClick: jest.fn(),
  }

  render(<PdfThumbnail {...props} />)

  const thumbnail = screen.getByText(mockContent)
  await userEvent.click(thumbnail)

  expect(mockSetActiveUserPage).nthCalledWith(1, props.userPage)
})

test('renders icon button if user page is disabled', () => {
  jest.clearAllMocks()

  const props = {
    userPage: {
      ...mockUserPage,
      isExcluded: true,
    },
    isActive: false,
    isSelected: false,
    onClick: jest.fn(),
  }

  render(<PdfThumbnail {...props} />)

  const closeEyeBtn = screen.getByRole('button')

  expect(closeEyeBtn).toBeInTheDocument()
})

test('calls setSegments when click on close eye icon', async () => {
  jest.clearAllMocks()

  const props = {
    userPage: {
      ...mockUserPage,
      isExcluded: true,
    },
    isActive: false,
    isSelected: false,
    onClick: jest.fn(),
  }

  render(<PdfThumbnail {...props} />)

  const closeEyeBtn = screen.getByRole('button')
  await userEvent.click(closeEyeBtn)

  expect(mockSetSegments).nthCalledWith(1, [mockSegment])
})

test('calls setIsDraggable when click on drag icon', async () => {
  jest.clearAllMocks()

  const props = {
    userPage: mockUserPage,
    isActive: false,
    isSelected: false,
    onClick: jest.fn(),
  }

  render(<PdfThumbnail {...props} />)

  const closeEyeBtn = screen.getAllByRole('button', { hidden: true })[0]
  await userEvent.click(closeEyeBtn)

  expect(mockSetIsDraggable).nthCalledWith(1, true)
})

test('renders bounding box overlay when user page has coordinates', () => {
  const props = {
    userPage: {
      ...mockUserPage,
      coordinates: mockCoordinates,
    },
    isActive: false,
    isSelected: false,
  }

  render(<PdfThumbnail {...props} />)

  expect(screen.getByTestId(mockBoundingBoxOverlayId)).toBeInTheDocument()
})

test('does not render bounding box overlay when user page has no coordinates', () => {
  const props = {
    userPage: mockUserPage,
    isActive: false,
    isSelected: false,
  }

  render(<PdfThumbnail {...props} />)

  expect(screen.queryByTestId(mockBoundingBoxOverlayId)).not.toBeInTheDocument()
})
