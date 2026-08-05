import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PdfSegment, UserPage } from '@/containers/PdfSplitting/models'
import { Localization, localize } from '@/localization/i18n'
import { FileCache } from '@/services/FileCache'
import { notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { FileReviewSplittingButton } from './FileReviewSplittingButton'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('@/containers/PdfSplitting/PdfThumbnailsMap', () => ({
  PdfThumbnailsMap: () => <div data-testid={thumbnailsMapId} />,
}))

jest.mock('@/components/Spin', () => ({
  Spin: ({ children }) => <div data-testid="spin">{children}</div>,
}))

const mockFetchUnwrap = jest.fn()
const mockFetchProposals = jest.fn(() => ({ unwrap: mockFetchUnwrap }))
const mockUpdateUnwrap = jest.fn()
const mockUpdateProposals = jest.fn(() => ({ unwrap: mockUpdateUnwrap }))
const mockConfirmUnwrap = jest.fn()
const mockConfirmProposals = jest.fn(() => ({ unwrap: mockConfirmUnwrap }))

jest.mock('@/apiRTK/splittingApi', () => ({
  useLazyFetchSplittingProposalsQuery: () => [mockFetchProposals],
  useUpdateSplittingProposalsMutation: () => [mockUpdateProposals],
  useConfirmSplittingProposalsMutation: () => [mockConfirmProposals],
}))

const mockFetchGroupUnwrap = jest.fn()
const mockFetchGroup = jest.fn(() => ({ unwrap: mockFetchGroupUnwrap }))

jest.mock('@/apiRTK/documentTypesGroupsApi', () => ({
  useLazyFetchDocumentTypesGroupQuery: () => [mockFetchGroup],
}))

jest.mock('@/containers/PdfSplitting/PdfSegments', () => ({
  PdfSegments: ({ onCancel, onSave, isSaveDisabled }) => (
    <div data-testid="pdf-segments">
      <button
        data-testid="cancel-btn"
        onClick={onCancel}
      />
      <button
        data-testid="save-btn"
        disabled={isSaveDisabled}
        onClick={onSave}
      />
    </div>
  ),
}))

jest.mock('@/services/FileCache', () => ({
  FileCache: {
    get: jest.fn(async () => null),
    requestAndStore: jest.fn(async (urls) => ({ [urls[0]]: mockPdf })),
  },
}))

const mockSetSegments = jest.fn()
const mockSetBatchName = jest.fn()
const mockSetSelectedGroup = jest.fn()
const mockSetActiveUserPage = jest.fn()

jest.mock('@/containers/PdfSplitting/hooks', () => ({
  usePdfSegments: () => ({
    segments: mockSegments,
    setSegments: mockSetSegments,
    batchName: mockBatchName,
    setBatchName: mockSetBatchName,
    setSelectedGroup: mockSetSelectedGroup,
    setActiveUserPage: mockSetActiveUserPage,
  }),
}))

const thumbnailsMapId = 'thumbnails-id'
const mockPdf = 'mockPdf'
const mockBatchName = 'test-batch'
const mockGroupId = 'group-id'
const mockGroup = {
  id: mockGroupId,
  name: 'Test Group',
}

const mockProposals = {
  batchName: mockBatchName,
  groupId: mockGroupId,
  segments: [
    {
      contentRegions: [
        { pageNumber: 1 },
        { pageNumber: 2 },
      ],
    },
  ],
}

const mockSegments = [
  new PdfSegment({
    id: '1',
    documentTypeId: 'doc-type-1',
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
}

const openDrawerWithSegments = async () => {
  const openBtn = screen.getByRole('button')
  await userEvent.click(openBtn)
}

beforeEach(() => {
  jest.clearAllMocks()
  mockFetchUnwrap.mockResolvedValue(mockProposals)
  mockFetchGroupUnwrap.mockResolvedValue({ group: mockGroup })
  mockUpdateUnwrap.mockResolvedValue({})
  mockConfirmUnwrap.mockResolvedValue({})
})

test('renders review splitting proposals button', () => {
  render(<FileReviewSplittingButton {...defaultProps} />)

  const openBtn = screen.getByRole('button')

  expect(openBtn).toBeInTheDocument()
})

test('opens drawer when click on review splitting proposals button', async () => {
  render(<FileReviewSplittingButton {...defaultProps} />)

  const hiddenDrawer = screen.queryByTestId('drawer')

  expect(hiddenDrawer).not.toBeInTheDocument()

  await openDrawerWithSegments()

  const visibleDrawer = screen.getByTestId('drawer')

  expect(visibleDrawer).toBeInTheDocument()
})

test('calls FileCache.get when click on review splitting proposals button', async () => {
  render(<FileReviewSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  const expectedUrl = `${mockEnv.ENV.BASE_API_URL}/v5/file/${mockFile.path}`

  await waitFor(() => {
    expect(FileCache.get).toHaveBeenNthCalledWith(1, expectedUrl)
  })
})

test('calls FileCache.requestAndStore when FileCache.get returns null', async () => {
  const expectedUrl = `${mockEnv.ENV.BASE_API_URL}/v5/file/${mockFile.path}`
  const mockCachedData = { [expectedUrl]: mockPdf }

  FileCache.get.mockResolvedValueOnce(null)
  FileCache.requestAndStore.mockResolvedValueOnce(mockCachedData)

  render(<FileReviewSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  await waitFor(() => {
    expect(FileCache.requestAndStore).toHaveBeenNthCalledWith(1, [expectedUrl])
  })
})

test('calls fetchProposals with file id when click on review splitting proposals button', async () => {
  render(<FileReviewSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  await waitFor(() => {
    expect(mockFetchProposals).toHaveBeenNthCalledWith(1, mockFile.id)
  })
})

test('calls setBatchName with proposals batch name when fetch succeeds', async () => {
  render(<FileReviewSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  await waitFor(() => {
    expect(mockSetBatchName).toHaveBeenNthCalledWith(1, mockBatchName)
  })
})

test('calls fetchGroup with proposals group id when fetch succeeds', async () => {
  render(<FileReviewSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  await waitFor(() => {
    expect(mockFetchGroup).toHaveBeenNthCalledWith(1, { groupId: mockGroupId })
  })
})

test('calls setSelectedGroup with fetched group when fetch succeeds', async () => {
  render(<FileReviewSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  await waitFor(() => {
    expect(mockSetSelectedGroup).toHaveBeenNthCalledWith(1, mockGroup)
  })
})

test('shows notification message if fetch fails with error', async () => {
  FileCache.get.mockResolvedValueOnce(null)
  FileCache.requestAndStore.mockRejectedValueOnce(new Error('test'))

  render(<FileReviewSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  await waitFor(() => {
    expect(notifyWarning).toHaveBeenNthCalledWith(1, localize(Localization.DEFAULT_ERROR))
  })
})

test('shows LocalBoundary if fetch fails with error', async () => {
  FileCache.get.mockResolvedValueOnce(null)
  FileCache.requestAndStore.mockRejectedValueOnce(new Error('test'))

  render(<FileReviewSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  await waitFor(() => {
    const errorMessage = screen.getByText(localize(Localization.DEFAULT_ERROR_MESSAGE))

    expect(errorMessage).toBeInTheDocument()
  })
})

test('calls updateProposals and confirmProposals when click on save button', async () => {
  jest.clearAllMocks()
  mockFetchUnwrap.mockResolvedValue(mockProposals)
  mockUpdateUnwrap.mockResolvedValue({})
  mockConfirmUnwrap.mockResolvedValue({})

  render(<FileReviewSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  const saveBtn = await screen.findByTestId('save-btn')

  await waitFor(() => {
    expect(saveBtn).toBeEnabled()
  })

  await userEvent.click(saveBtn)

  await waitFor(() => {
    expect(mockUpdateProposals).toHaveBeenNthCalledWith(1, {
      fileId: mockFile.id,
      segments: [
        {
          name: localize(Localization.SEGMENT, { index: 1 }),
          contentRegions: [
            {
              pageNumber: 1,
              boundingBox: null,
            },
            {
              pageNumber: 2,
              boundingBox: null,
            },
          ],
          documentTypeId: 'doc-type-1',
        },
      ],
      batchName: mockBatchName,
    })
  })
})

test('calls notifyWarning if updateProposals fails with error', async () => {
  mockUpdateUnwrap.mockRejectedValueOnce(new Error('test'))

  render(<FileReviewSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  const saveBtn = await screen.findByTestId('save-btn')

  await waitFor(() => {
    expect(saveBtn).toBeEnabled()
  })

  await userEvent.click(saveBtn)

  await waitFor(() => {
    expect(notifyWarning).toHaveBeenNthCalledWith(1, localize(Localization.DEFAULT_ERROR))
  })
})

test('closes drawer when cancel button is clicked', async () => {
  render(<FileReviewSplittingButton {...defaultProps} />)

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

test('calls setActiveUserPage with null when review splitting proposals button is clicked', async () => {
  render(<FileReviewSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  await waitFor(() => {
    expect(mockSetActiveUserPage).toHaveBeenNthCalledWith(1, null)
  })
})

test('calls setActiveUserPage with null when cancel button is clicked', async () => {
  render(<FileReviewSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  jest.clearAllMocks()

  const cancelBtn = screen.getByTestId('cancel-btn')
  await userEvent.click(cancelBtn)

  await waitFor(() => {
    expect(mockSetActiveUserPage).toHaveBeenNthCalledWith(1, null)
  })
})

test('calls notifyWarning with overlapping regions message when update fails with overlapping_regions', async () => {
  mockUpdateUnwrap.mockRejectedValueOnce({
    data: {
      code: 'overlapping_regions',
    },
  })

  render(<FileReviewSplittingButton {...defaultProps} />)

  await openDrawerWithSegments()

  const saveBtn = await screen.findByTestId('save-btn')

  await waitFor(() => {
    expect(saveBtn).toBeEnabled()
  })

  await userEvent.click(saveBtn)

  await waitFor(() => {
    expect(notifyWarning).toHaveBeenNthCalledWith(1, localize(Localization.OVERLAPPING_REGIONS))
  })
})
