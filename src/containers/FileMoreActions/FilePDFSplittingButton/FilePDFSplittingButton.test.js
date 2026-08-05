
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { PdfSegment, UserPage } from '@/containers/PdfSplitting/models'
import { Localization, localize } from '@/localization/i18n'
import { FileCache } from '@/services/FileCache'
import { notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { FilePDFSplittingButton } from './FilePDFSplittingButton'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('@/containers/PdfSplitting/services', () => ({
  PdfSplitter: {
    getSplittedFilesData: jest.fn(() => mockFilesData),
  },
}))

jest.mock('@/containers/PdfSplitting/PdfThumbnailsMap', () => ({
  PdfThumbnailsMap: () => <div data-testid={thumbnailsMapId} />,
}))

jest.mock('@/containers/PdfSplitting/PdfSegments', () => ({
  PdfSegments: ({ onCancel, onSave }) => (
    <div data-testid="pdf-segments">
      <input role="textbox" />
      <button
        data-testid="cancel-btn"
        onClick={onCancel}
      />
      <button
        data-testid="save-btn"
        onClick={() => onSave(mockBatchName)}
      />
    </div>
  ),
}))

const mockUnwrap = jest.fn()
const mockCreateBatchFromFile = jest.fn(() => ({ unwrap: mockUnwrap }))

jest.mock('@/apiRTK/filesApi', () => ({
  useCreateBatchFromFileMutation: () => [mockCreateBatchFromFile],
}))

jest.mock('@/services/FileCache', () => ({
  FileCache: {
    get: jest.fn(async () => null),
    requestAndStore: jest.fn(async (urls) => ({ [urls[0]]: mockPdf })),
  },
}))

jest.mock('@/containers/PdfSplitting/hooks', () => ({
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

const mockUploadFiles = jest.fn(() => mockUploadedFiles)
const mockUploadedFiles = [
  {
    path: 'uploaded/path/file_1.pdf',
    name: 'file_1.pdf',
    documentTypeId: '1',
  },
]
const mockFilesData = [{
  file: {},
  name: 'file_1.pdf',
  documentTypeId: '1',
}]
const thumbnailsMapId = 'thumbnails-id'
const mockPdf = 'mockPdf'
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

const mockFile = {
  id: 'test-file-id',
  tenantId: 'test-tenant-id',
  name: 'test-document.pdf',
  path: 'test/path/document.pdf',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  labels: [],
}

const defaultProps = {
  file: mockFile,
  children: localize(Localization.SPLIT_FILE),
}

const openDrawerWithSegments = async () => {
  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_FILE) })
  await userEvent.click(openBtn)
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders FilePDFSplittingButton correctly', () => {
  render(<FilePDFSplittingButton {...defaultProps} />)

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_FILE) })

  expect(openBtn).toBeInTheDocument()
})

test('renders button with custom children', () => {
  const customText = 'Custom Split Text'
  render(
    <FilePDFSplittingButton {...defaultProps}>
      {customText}
    </FilePDFSplittingButton>,
  )

  const openBtn = screen.getByRole('button', { name: customText })

  expect(openBtn).toBeInTheDocument()
})

test('disables button when disabled prop is true', () => {
  render(
    <FilePDFSplittingButton
      {...defaultProps}
      disabled
    />,
  )

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_FILE) })

  expect(openBtn).toBeDisabled()
})

test('opens drawer when click on open button', async () => {
  render(<FilePDFSplittingButton {...defaultProps} />)

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_FILE) })
  const hiddenDrawer = screen.queryByTestId('drawer')

  expect(hiddenDrawer).not.toBeInTheDocument()

  await userEvent.click(openBtn)

  const visibleDrawer = screen.getByTestId('drawer')

  expect(visibleDrawer).toBeInTheDocument()
})

test('does not open drawer when button is disabled', async () => {
  render(
    <FilePDFSplittingButton
      {...defaultProps}
      disabled
    />,
  )

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_FILE) })
  await userEvent.click(openBtn)

  const hiddenDrawer = screen.queryByTestId('drawer')

  expect(hiddenDrawer).not.toBeInTheDocument()
})

test('calls FileCache.get when click on open button', async () => {
  render(<FilePDFSplittingButton {...defaultProps} />)

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_FILE) })
  await userEvent.click(openBtn)

  const expectedUrl = `${mockEnv.ENV.BASE_API_URL}/v5/file/${mockFile.path}`

  await waitFor(() => {
    expect(FileCache.get).nthCalledWith(1, expectedUrl)
  })
})

test('calls FileCache.requestAndStore when FileCache.get returns null', async () => {
  const expectedUrl = `${mockEnv.ENV.BASE_API_URL}/v5/file/${mockFile.path}`
  const mockCachedData = { [expectedUrl]: mockPdf }

  FileCache.get.mockResolvedValueOnce(null)
  FileCache.requestAndStore.mockResolvedValueOnce(mockCachedData)

  render(<FilePDFSplittingButton {...defaultProps} />)

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_FILE) })
  await userEvent.click(openBtn)

  await waitFor(() => {
    expect(FileCache.requestAndStore).nthCalledWith(1, [expectedUrl])
  })
})

test('uses cached file when FileCache.get returns a file', async () => {
  FileCache.get.mockResolvedValueOnce(mockPdf)

  render(<FilePDFSplittingButton {...defaultProps} />)

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_FILE) })
  await userEvent.click(openBtn)

  const expectedUrl = `${mockEnv.ENV.BASE_API_URL}/v5/file/${mockFile.path}`

  await waitFor(() => {
    expect(FileCache.get).nthCalledWith(1, expectedUrl)
  })
})

test('shows notification message if FileCache.requestAndStore fails with error', async () => {
  FileCache.get.mockResolvedValueOnce(null)
  FileCache.requestAndStore.mockRejectedValueOnce(new Error('test'))

  render(<FilePDFSplittingButton {...defaultProps} />)

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_FILE) })
  await userEvent.click(openBtn)

  await waitFor(() => {
    expect(notifyWarning).nthCalledWith(1, localize(Localization.DEFAULT_ERROR))
  })
})

test('shows LocalBoundary if FileCache.requestAndStore fails with error', async () => {
  FileCache.get.mockResolvedValueOnce(null)
  FileCache.requestAndStore.mockRejectedValueOnce(new Error('test'))

  render(<FilePDFSplittingButton {...defaultProps} />)

  const openBtn = screen.getByRole('button', { name: localize(Localization.SPLIT_FILE) })
  await userEvent.click(openBtn)

  await waitFor(() => {
    const errorMessage = screen.getByText(localize(Localization.DEFAULT_ERROR_MESSAGE))

    expect(errorMessage).toBeInTheDocument()
  })
})

test('calls createBatchFromFile with correct args when click on save button', async () => {
  jest.clearAllMocks()

  render(<FilePDFSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  const saveBtn = screen.getByTestId('save-btn')
  await userEvent.click(saveBtn)

  expect(mockCreateBatchFromFile).nthCalledWith(1, {
    fileId: mockFile.id,
    data: {
      batchName: mockBatchName,
      groupId: undefined,
      files: [
        {
          path: 'uploaded/path/file_1.pdf',
          name: 'file_1.pdf',
          documentTypeId: '1',
          processingParams: {},
        },
      ],
    },
  })
})

test('calls notifyWarning if createBatchFromFile fails with error', async () => {
  const mockText = 'mock'
  mockUnwrap.mockRejectedValueOnce(new Error('test'))

  render(<FilePDFSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  const batchInput = screen.getByRole('textbox')
  await userEvent.type(batchInput, mockText)

  const saveBtn = screen.getByTestId('save-btn')
  await userEvent.click(saveBtn)

  await waitFor(() => {
    expect(notifyWarning).nthCalledWith(1, localize(Localization.DEFAULT_ERROR))
  })
})

test('closes drawer when cancel button is clicked', async () => {
  render(<FilePDFSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  const visibleDrawer = screen.getByTestId('drawer')
  expect(visibleDrawer).toBeInTheDocument()

  const cancelBtn = screen.getByTestId('cancel-btn')
  await userEvent.click(cancelBtn)

  await waitFor(() => {
    const hiddenDrawer = screen.queryByTestId('drawer')
    expect(hiddenDrawer).not.toBeInTheDocument()
  })
})
