
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { Localization, localize } from '@/localization/i18n'
import { documentSelector } from '@/selectors/documentReviewPage'
import { FileCache } from '@/services/FileCache'
import { notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { PdfSegment, UserPage } from '../models'
import { PdfSplitter } from '../services'
import { PdfSplittingButton } from './PdfSplittingButton'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/selectors/documentReviewPage')
jest.mock('@/selectors/documentTypesListPage')
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('@/containers/DocumentTypesGroupsSelect', () => ({
  DocumentTypesGroupsSelect: () => (
    <div data-testid="DocumentTypesGroupsSelect" />
  ),
}))

jest.mock('../services', () => ({
  PdfSplitter: {
    getSplittedFilesData: jest.fn(() => mockFilesData),
  },
}))

jest.mock('../PdfThumbnailsMap', () => ({
  PdfThumbnailsMap: () => <div data-testid={thumbnailsMapId} />,
}))

jest.mock('@/apiRTK/batchesApi', () => ({
  useCreateBatchMutation: () => [mockCreateBatch],
}))

jest.mock('@/services/FileCache', () => ({
  FileCache: {
    get: jest.fn(async () => null),
    requestAndStore: jest.fn(async (urls) => ({ [urls[0]]: mockPdf })),
  },
}))

jest.mock('../hooks', () => ({
  usePdfSegments: () => ({
    segments: mockSegments,
    setSegments: jest.fn(),
    setInitialSegment: jest.fn(),
    initialSegment: mockSegments[0],
    batchName: mockBatchName,
    setBatchName: jest.fn(),
    selectedGroup: null,
    setSelectedGroup: jest.fn(),
  }),
  useUploadFiles: () => ({
    uploadFiles: mockUploadFiles,
  }),
}))

const mockUploadFiles = jest.fn(() => mockUploadReturnValue)
const mockCreateBatch = jest.fn()
const mockUploadReturnValue = 'files'
const thumbnailsMapId = 'thumbnails-id'
const mockPdf = 'mockPdf'
const mockFilesData = 'mockFilesData'
const mockBatchName = 'test'

const mockSegments = [
  new PdfSegment({
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
  }),
]

const openDrawerWithSegments = async () => {
  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_DOCUMENT) })
  await userEvent.click(openBtn)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: localize(Localization.SAVE) })).toBeInTheDocument()
  })
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders PdfSplittingButton correctly', () => {
  render(<PdfSplittingButton />)

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_DOCUMENT) })

  expect(openBtn).toBeInTheDocument()
})

test('opens drawer when click on open button', async () => {
  render(<PdfSplittingButton />)

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_DOCUMENT) })
  const hiddenDrawer = screen.queryByTestId('drawer')

  expect(hiddenDrawer).not.toBeInTheDocument()

  await userEvent.click(openBtn)

  const visibleDrawer = screen.getByTestId('drawer')

  expect(visibleDrawer).toBeInTheDocument()
})

test('calls FileCache.get when click on open button', async () => {
  render(<PdfSplittingButton />)

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_DOCUMENT) })
  await userEvent.click(openBtn)

  const [file] = documentSelector.getSelectorMockValue().files
  const expectedUrl = `${mockEnv.ENV.BASE_API_URL}/v5/file/${file.blobName}`

  await waitFor(() => {
    expect(FileCache.get).nthCalledWith(1, expectedUrl)
  })
})

test('calls FileCache.requestAndStore when FileCache.get returns null', async () => {
  const [file] = documentSelector.getSelectorMockValue().files
  const expectedUrl = `${mockEnv.ENV.BASE_API_URL}/v5/file/${file.blobName}`
  const mockCachedData = { [expectedUrl]: mockPdf }

  FileCache.get.mockResolvedValueOnce(null)
  FileCache.requestAndStore.mockResolvedValueOnce(mockCachedData)

  render(<PdfSplittingButton />)

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_DOCUMENT) })
  await userEvent.click(openBtn)

  await waitFor(() => {
    expect(FileCache.requestAndStore).nthCalledWith(1, [expectedUrl])
  })
})

test('uses cached file when FileCache.get returns a file', async () => {
  FileCache.get.mockResolvedValueOnce(mockPdf)

  render(<PdfSplittingButton />)

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_DOCUMENT) })
  await userEvent.click(openBtn)

  const [file] = documentSelector.getSelectorMockValue().files
  const expectedUrl = `${mockEnv.ENV.BASE_API_URL}/v5/file/${file.blobName}`

  await waitFor(() => {
    expect(FileCache.get).nthCalledWith(1, expectedUrl)
  })
})

test('shows notification message if FileCache.requestAndStore fails with error', async () => {
  FileCache.get.mockResolvedValueOnce(null)
  FileCache.requestAndStore.mockRejectedValueOnce(new Error('test'))

  render(<PdfSplittingButton />)

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_DOCUMENT) })
  await userEvent.click(openBtn)

  await waitFor(() => {
    expect(notifyWarning).nthCalledWith(1, localize(Localization.DEFAULT_ERROR))
  })
})

test('shows LocalBoundary if FileCache.requestAndStore fails with error', async () => {
  FileCache.get.mockResolvedValueOnce(null)
  FileCache.requestAndStore.mockRejectedValueOnce(new Error('test'))

  render(<PdfSplittingButton />)

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_DOCUMENT) })
  await userEvent.click(openBtn)

  await waitFor(() => {
    const errorMessage = screen.getByText(localize(Localization.DEFAULT_ERROR_MESSAGE))

    expect(errorMessage).toBeInTheDocument()
  })
})

test('calls uploadFiles with correct args when click on save button', async () => {
  jest.clearAllMocks()

  const mockText = 'mock'

  render(<PdfSplittingButton />)

  await openDrawerWithSegments()

  const batchInput = screen.getByRole('textbox')
  await userEvent.type(batchInput, mockText)

  const saveBtn = screen.getByRole('button', { name: localize(Localization.SAVE) })
  await userEvent.click(saveBtn)

  expect(mockUploadFiles).nthCalledWith(1, mockFilesData)
})

test('calls createBatch with correct args when click on save button', async () => {
  jest.clearAllMocks()

  render(<PdfSplittingButton />)

  await openDrawerWithSegments()

  const saveBtn = screen.getByRole('button', { name: localize(Localization.SAVE) })
  await userEvent.click(saveBtn)

  expect(mockCreateBatch).nthCalledWith(1, {
    files: mockUploadReturnValue,
    groupId: undefined,
    name: mockBatchName,
  })
})

test('calls notifyWarning if createBatch fails with error', async () => {
  const mockText = 'mock'
  mockCreateBatch.mockRejectedValue(new Error('test'))

  render(<PdfSplittingButton />)

  await openDrawerWithSegments()

  const batchInput = screen.getByRole('textbox')
  await userEvent.type(batchInput, mockText)

  const saveBtn = screen.getByRole('button', { name: localize(Localization.SAVE) })
  await userEvent.click(saveBtn)

  expect(notifyWarning).nthCalledWith(1, localize(Localization.DEFAULT_ERROR))
})

test('calls PdfSplitter.getSplittedFilesData with correct parameters', async () => {
  const mockText = 'mock'
  const activeDocument = documentSelector.getSelectorMockValue()

  render(<PdfSplittingButton />)

  await openDrawerWithSegments()

  const batchInput = screen.getByRole('textbox')
  await userEvent.type(batchInput, mockText)

  const saveBtn = screen.getByRole('button', { name: localize(Localization.SAVE) })
  await userEvent.click(saveBtn)

  expect(PdfSplitter.getSplittedFilesData).nthCalledWith(1, {
    documentName: activeDocument.title,
    pdfFile: mockPdf,
    segments: mockSegments,
  })
})
