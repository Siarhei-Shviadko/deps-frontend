import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useHighlightCoords, usePaginatedLayout } from '@/containers/ParsingLayout/EntityLayout/hooks'
import { DOCUMENT_LAYOUT_FEATURE, DOCUMENT_LAYOUT_PARSING_TYPE } from '@/enums/DocumentLayoutType'
import { Localization, localize } from '@/localization/i18n'
import { ImageLayout as ImageLayoutModel } from '@/models/DocumentLayout'
import { Point } from '@/models/Point'
import { render } from '@/utils/rendererRTL'
import { ImageLayout } from './ImageLayout'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/components/Spin', () => ({
  Spin: () => <div data-testid="spin" />,
}))

jest.mock('@/containers/ParsingLayout/EntityLayout/hooks', () => ({
  useHighlightCoords: jest.fn(),
  usePaginatedLayout: jest.fn(),
}))

jest.mock('./ImageField', () => ({
  ImageField: jest.fn(({ imageLayout, onClick }) => (
    <div
      data-testid={imageLayout.id}
      onClick={onClick}
    >
      <span>{imageLayout.title}</span>
      <span>{imageLayout.description}</span>
    </div>
  )),
}))

const mockHighlightCoords = jest.fn()
const mockUnhighlightCoords = jest.fn()

const mockImage1 = new ImageLayoutModel({
  id: 'img1',
  order: 1,
  title: 'Image 1',
  description: 'Description 1',
  filePath: 'mockPath1',
  polygon: [
    new Point(0.111, 0.222),
    new Point(0.333, 0.444),
  ],
})

const mockImage2 = new ImageLayoutModel({
  id: 'img2',
  order: 2,
  title: 'Image 2',
  description: 'Description 2',
  filePath: 'mockPath2',
  polygon: [
    new Point(0.555, 0.666),
    new Point(0.777, 0.888),
  ],
})

const mockData = [
  {
    layout: mockImage1,
    page: 1,
    pageId: 'page-1',
  },
  {
    layout: mockImage2,
    page: 2,
    pageId: 'page-2',
  },
]

const defaultProps = {
  batchIndex: 0,
  parsingType: DOCUMENT_LAYOUT_PARSING_TYPE.AWS_TEXTRACT,
}

beforeEach(() => {
  jest.clearAllMocks()
  useHighlightCoords.mockReturnValue({
    highlightCoords: mockHighlightCoords,
    unhighlightCoords: mockUnhighlightCoords,
  })
  usePaginatedLayout.mockReturnValue({
    layoutData: mockData,
    isFetching: false,
  })
})

test('calls usePaginatedLayout with correct parameters', () => {
  render(<ImageLayout {...defaultProps} />)

  expect(usePaginatedLayout).toHaveBeenCalledWith({
    batchIndex: 0,
    parsingFeature: DOCUMENT_LAYOUT_FEATURE.IMAGES,
    parsingType: DOCUMENT_LAYOUT_PARSING_TYPE.AWS_TEXTRACT,
  })
})

test('renders correct layout for images', () => {
  render(<ImageLayout {...defaultProps} />)

  const image1 = screen.getByTestId(mockImage1.id)
  const image2 = screen.getByTestId(mockImage2.id)

  expect(image1).toBeInTheDocument()
  expect(screen.getByText(mockImage1.title)).toBeInTheDocument()
  expect(screen.getByText(mockImage1.description)).toBeInTheDocument()
  expect(image2).toBeInTheDocument()
  expect(screen.getByText(mockImage2.title)).toBeInTheDocument()
  expect(screen.getByText(mockImage2.description)).toBeInTheDocument()
})

test('highlights coords on image click', async () => {
  render(<ImageLayout {...defaultProps} />)

  await userEvent.click(screen.getByTestId('img1'))

  expect(mockHighlightCoords).toHaveBeenCalledWith({
    field: [mockImage1.polygon],
    page: 1,
  })
})

test('calls unhighlightCoords when toggling off image', async () => {
  render(<ImageLayout {...defaultProps} />)

  await userEvent.click(screen.getByTestId('img1'))
  await userEvent.click(screen.getByTestId('img1'))

  expect(mockUnhighlightCoords).toHaveBeenCalled()
})

test('highlights new image when clicking on different image', async () => {
  render(<ImageLayout {...defaultProps} />)

  await userEvent.click(screen.getByTestId('img1'))

  expect(mockHighlightCoords).toHaveBeenCalledWith({
    field: [mockImage1.polygon],
    page: 1,
  })

  jest.clearAllMocks()

  await userEvent.click(screen.getByTestId('img2'))

  expect(mockHighlightCoords).toHaveBeenCalledWith({
    field: [mockImage2.polygon],
    page: 2,
  })
})

test('calls unhighlightCoords when batchIndex changes', () => {
  const { rerender } = render(<ImageLayout {...defaultProps} />)

  jest.clearAllMocks()

  const props = {
    ...defaultProps,
    batchIndex: 1,
  }

  rerender(<ImageLayout {...props} />)

  expect(mockUnhighlightCoords).toHaveBeenCalled()
})

test('renders spinner when layout is fetching', () => {
  usePaginatedLayout.mockReturnValueOnce({
    layoutData: [],
    isFetching: true,
  })

  render(<ImageLayout {...defaultProps} />)

  expect(screen.getByTestId('spin')).toBeInTheDocument()
  expect(screen.queryByTestId(mockImage1.id)).not.toBeInTheDocument()
})

test('renders no data message when layout data is empty', () => {
  usePaginatedLayout.mockReturnValueOnce({
    layoutData: [],
    isFetching: false,
  })

  render(<ImageLayout {...defaultProps} />)

  expect(screen.getByText(localize(Localization.NO_DATA))).toBeInTheDocument()
})
