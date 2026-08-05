import { mockEnv } from '@/mocks/mockEnv'
import { screen, waitFor } from '@testing-library/dom'
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { usePdfSegments } from '@/containers/PdfSplitting/hooks'
import { PdfSegment, UserPage } from '@/containers/PdfSplitting/models'
import { ComponentSize } from '@/enums/ComponentSize'
import { Localization, localize } from '@/localization/i18n'
import { render } from '@/utils/rendererRTL'
import { Controls } from './Controls'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/components/Icons/OpenedEyeIcon', () => ({
  OpenedEyeIcon: () => <span>{mockOpenEyeIconContent}</span>,
}))

jest.mock('@/components/Icons/XMarkIcon', () => ({
  XMarkIcon: () => <span>{mockXMarkIconContent}</span>,
}))

jest.mock('@/components/Icons/CopyIcon', () => ({
  CopyIcon: () => <span>{mockCopyIconContent}</span>,
}))

jest.mock('@/components/Icons/AlternativeArrowsIcon', () => ({
  AlternativeArrowsIcon: () => <span>{mockAlternativeArrowsIconContent}</span>,
}))

jest.mock('@/components/Icons/PenToSquareIcon', () => ({
  PenToSquareIcon: () => <span>{mockPenToSquareIconContent}</span>,
}))

jest.mock('@/components/Icons/TrashIcon', () => ({
  TrashIcon: () => <span>{mockTrashIconContent}</span>,
}))

jest.mock('@/containers/AreaSelector', () => ({
  useAreaCreate: jest.fn(() => ({
    isCreating: false,
    startCreating: mockStartCreating,
    deleteArea: mockDeleteArea,
  })),
}))

jest.mock('@/containers/PdfSplitting/hooks', () => ({
  usePdfSegments: jest.fn(() => ({
    segments: [mockSegment],
    setSegments: mockSetSegments,
    setActiveUserPage: mockSetActiveUserPage,
  })),
}))

jest.mock('uuid', () => ({
  v4: jest.fn(() => mockUUID),
}))

const mockUUID = 'mocked-uuid'
const mockOpenEyeIconContent = 'open-eye'
const mockXMarkIconContent = 'x-mark'
const mockCopyIconContent = 'copy'
const mockAlternativeArrowsIconContent = 'alternative'
const mockPenToSquareIconContent = 'pen-to-square'
const mockTrashIconContent = 'trash'
const mockSetSegments = jest.fn()
const mockSetActiveUserPage = jest.fn()
const mockStartCreating = jest.fn()
const mockDeleteArea = jest.fn()

const mockUserPage1 = new UserPage({
  page: 0,
  segmentId: '1',
})

const mockUserPage2 = new UserPage({
  page: 1,
  segmentId: '1',
})

const mockSegment = new PdfSegment({
  id: '1',
  documentTypeId: '1',
  userPages: [mockUserPage1, mockUserPage2],
})

test('renders Controls correctly', () => {
  const props = {
    isVertical: true,
    size: ComponentSize.SMALL,
    userPage: mockUserPage1,
  }

  render(<Controls {...props} />)

  const openEyeBtn = screen.getByRole('button', { name: mockOpenEyeIconContent })
  const copyBtn = screen.getByRole('button', { name: mockCopyIconContent })
  const closeBtn = screen.queryByRole('button', { name: mockXMarkIconContent })

  expect(closeBtn).not.toBeInTheDocument()
  expect(openEyeBtn).toBeInTheDocument()
  expect(copyBtn).toBeInTheDocument()
})

test('renders close button if closable prop is provided', () => {
  const props = {
    closable: true,
    isVertical: true,
    size: ComponentSize.SMALL,
    userPage: mockUserPage1,
  }

  render(<Controls {...props} />)

  const closeBtn = screen.getByRole('button', { name: mockXMarkIconContent })

  expect(closeBtn).toBeInTheDocument()
})

test('renders drag button if onEnableDragging prop is provided', () => {
  const props = {
    closable: true,
    isVertical: true,
    size: ComponentSize.SMALL,
    userPage: mockUserPage1,
    onEnableDragging: jest.fn(),
  }

  render(<Controls {...props} />)

  const dragBtn = screen.getByRole('button', { name: mockAlternativeArrowsIconContent })

  expect(dragBtn).toBeInTheDocument()
})

test('calls onEnableDragging callback when click on drag button', async () => {
  const props = {
    closable: true,
    isVertical: true,
    size: ComponentSize.SMALL,
    userPage: mockUserPage1,
    onEnableDragging: jest.fn(),
  }

  render(<Controls {...props} />)

  const dragBtn = screen.getByRole('button', { name: mockAlternativeArrowsIconContent })
  await userEvent.click(dragBtn)

  expect(props.onEnableDragging).toHaveBeenCalled()
})

test('calls setActiveUserPage callback when click on close button', async () => {
  const props = {
    closable: true,
    isVertical: true,
    size: ComponentSize.SMALL,
    userPage: mockUserPage1,
  }

  render(<Controls {...props} />)

  const closeBtn = screen.getByRole('button', { name: mockXMarkIconContent })
  await userEvent.click(closeBtn)

  expect(mockSetActiveUserPage).nthCalledWith(1, null)
})

test('calls setSegments when click on copy button', async () => {
  jest.clearAllMocks()

  const props = {
    closable: true,
    isVertical: true,
    size: ComponentSize.SMALL,
    userPage: mockUserPage1,
  }

  render(<Controls {...props} />)

  const copyBtn = screen.getByRole('button', { name: mockCopyIconContent })
  await userEvent.click(copyBtn)

  expect(mockSetSegments).nthCalledWith(1, [{
    ...mockSegment,
    userPages: [
      mockUserPage1,
      mockUserPage1,
      mockUserPage2,
    ],
  }])
})

test('calls setSegments when click on eye button', async () => {
  jest.clearAllMocks()

  const props = {
    closable: true,
    isVertical: true,
    size: ComponentSize.SMALL,
    userPage: mockUserPage1,
  }

  render(<Controls {...props} />)

  const openEyeBtn = screen.getByRole('button', { name: mockOpenEyeIconContent })
  await userEvent.click(openEyeBtn)

  expect(mockSetSegments).nthCalledWith(1, [{
    ...mockSegment,
    userPages: [
      {
        ...mockUserPage1,
        isExcluded: true,
      },
      mockUserPage2,
    ],
  }])
})

test('disables eye button if only one enabled user page', async () => {
  jest.clearAllMocks()

  usePdfSegments.mockReturnValueOnce({
    segments: [
      {
        ...mockSegment,
        userPages: [mockUserPage1],
      },
    ],
    setSegments: mockSetSegments,
    setActiveUserPage: mockSetActiveUserPage,
  })

  const props = {
    closable: true,
    isVertical: true,
    size: ComponentSize.SMALL,
    userPage: mockUserPage1,
  }

  render(<Controls {...props} />)

  const openEyeBtn = screen.getByRole('button', { name: mockOpenEyeIconContent })

  expect(openEyeBtn).toBeDisabled()
})

test('shows tooltip with message when hover on eye button if only one enabled user page', async () => {
  jest.clearAllMocks()

  usePdfSegments.mockReturnValueOnce({
    segments: [
      {
        ...mockSegment,
        userPages: [mockUserPage1],
      },
    ],
    setSegments: mockSetSegments,
    setActiveUserPage: mockSetActiveUserPage,
  })

  const props = {
    closable: true,
    isVertical: true,
    size: ComponentSize.SMALL,
    userPage: mockUserPage1,
  }

  render(<Controls {...props} />)

  const openEyeBtn = screen.getByRole('button', { name: mockOpenEyeIconContent })

  await userEvent.hover(openEyeBtn, { pointerEventsCheck: PointerEventsCheckLevel.Never })

  await waitFor(() => {
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent(localize(Localization.PAGE_CANNOT_BE_EXCLUDED))
  })
})

test('renders drag button as disabled with tooltip if disabledTooltip prop is provided', () => {
  jest.clearAllMocks()

  const props = {
    closable: true,
    isVertical: true,
    size: ComponentSize.SMALL,
    userPage: mockUserPage1,
    onEnableDragging: jest.fn(),
    disabledTooltip: 'Message',
  }

  render(<Controls {...props} />)

  const dragBtn = screen.getByRole('button', { name: mockAlternativeArrowsIconContent })
  expect(dragBtn).toBeDisabled()
})

test('shows tooltip with message when hover on drag button if disabledTooltip prop is provided', async () => {
  jest.clearAllMocks()

  const props = {
    closable: true,
    isVertical: true,
    size: ComponentSize.SMALL,
    userPage: mockUserPage1,
    onEnableDragging: jest.fn(),
    disabledTooltip: 'Message',
  }

  render(<Controls {...props} />)

  const dragBtn = screen.getByRole('button', { name: mockAlternativeArrowsIconContent })
  await userEvent.hover(dragBtn, { pointerEventsCheck: PointerEventsCheckLevel.Never })

  await waitFor(() => {
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent(props.disabledTooltip)
  })
})

test('renders select area button when user page has no coordinates', () => {
  const props = {
    userPage: mockUserPage1,
    showAreaControls: true,
  }

  render(<Controls {...props} />)

  const selectAreaBtn = screen.getByRole('button', { name: mockPenToSquareIconContent })

  expect(selectAreaBtn).toBeInTheDocument()
})

test('calls startCreating when select area button is clicked', async () => {
  jest.clearAllMocks()

  const props = {
    userPage: mockUserPage1,
    showAreaControls: true,
  }

  render(<Controls {...props} />)

  const selectAreaBtn = screen.getByRole('button', { name: mockPenToSquareIconContent })
  await userEvent.click(selectAreaBtn)

  expect(mockStartCreating).toHaveBeenCalledTimes(1)
})

test('renders delete area button when user page has coordinates', () => {
  const props = {
    showAreaControls: true,
    userPage: new UserPage({
      page: 0,
      segmentId: '1',
      coordinates: {
        x: 0,
        y: 0.2,
        width: 1,
        height: 0.4,
      },
    }),
  }

  render(<Controls {...props} />)

  expect(screen.getByRole('button', { name: mockTrashIconContent })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: mockPenToSquareIconContent })).not.toBeInTheDocument()
})

test('calls deleteArea when delete area button is clicked', async () => {
  jest.clearAllMocks()

  const props = {
    showAreaControls: true,
    userPage: new UserPage({
      page: 0,
      segmentId: '1',
      coordinates: {
        x: 0,
        y: 0.2,
        width: 1,
        height: 0.4,
      },
    }),
  }

  render(<Controls {...props} />)

  const deleteAreaBtn = screen.getByRole('button', { name: mockTrashIconContent })
  await userEvent.click(deleteAreaBtn)

  expect(mockDeleteArea).toHaveBeenCalledTimes(1)
})
