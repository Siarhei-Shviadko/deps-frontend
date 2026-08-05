
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { Localization, localize } from '@/localization/i18n'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { render } from '@/utils/rendererRTL'
import { PdfSegment, UserPage } from '../models'
import { PdfSegments } from './PdfSegments'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/selectors/documentTypesListPage')

jest.mock('@/containers/DocumentTypesGroupsSelect', () => ({
  DocumentTypesGroupsSelect: ({ disabled }) => (
    <div
      data-disabled={disabled}
      data-testid="DocumentTypesGroupsSelect"
    />
  ),
}))

jest.mock('uuid', () => ({
  v4: jest.fn(() => mockUUID),
}))

const mockSetSelectedGroup = jest.fn()

jest.mock('../hooks', () => ({
  usePdfSegments: () => ({
    segments: mockSegments,
    setSegments: mockSetSegments,
    initialSegment: mockSegments[0],
    setActiveUserPage: mockSetActiveUserPage,
    setBatchName: mockSetBatchName,
    batchName: mockBatchName,
    selectedGroup: null,
    setSelectedGroup: mockSetSelectedGroup,
  }),
}))

const mockUUID = 'mocked-uuid'
const mockBatchName = 'mockBatchName'
const mockSetSegments = jest.fn()
const mockSetActiveUserPage = jest.fn()
const mockSetBatchName = jest.fn()

const mockSegments = [
  new PdfSegment({
    id: 'test',
    documentTypeId: 'docType1',
    userPages: [new UserPage({
      page: 0,
      segmentId: 'test',
    })],
  }),
  new PdfSegment({
    id: 'test2',
    documentTypeId: 'docType2',
    userPages: [
      new UserPage({
        page: 1,
        segmentId: 'test2',
      }),
      new UserPage({
        page: 2,
        segmentId: 'test2',
      }),
    ],
  }),
]

test('renders PdfSegments correctly', () => {
  const props = {
    onCancel: jest.fn(),
    onSave: jest.fn(),
  }

  render(<PdfSegments {...props} />)

  const batchInput = screen.getByRole('textbox')
  const segmentsTitle = screen.getByText(localize(Localization.SEGMENTS))
  const saveBtn = screen.getByRole('button', { name: localize(Localization.SAVE) })
  const cancelBtn = screen.getByRole('button', { name: localize(Localization.CANCEL) })

  expect(batchInput).toBeInTheDocument()
  expect(segmentsTitle).toBeInTheDocument()
  expect(saveBtn).toBeInTheDocument()
  expect(cancelBtn).toBeInTheDocument()
})

test('calls onCancel prop when click on cancel button', async () => {
  const props = {
    onCancel: jest.fn(),
    onSave: jest.fn(),
  }

  render(<PdfSegments {...props} />)

  const cancelBtn = screen.getByRole('button', { name: localize(Localization.CANCEL) })
  await userEvent.click(cancelBtn)

  expect(props.onCancel).toHaveBeenCalled()
})

test('calls setSegments with correct arg when click on reset button', async () => {
  jest.clearAllMocks()

  const props = {
    onCancel: jest.fn(),
    onSave: jest.fn(),
  }

  render(<PdfSegments {...props} />)

  const clearBtn = screen.getByRole('button', { name: localize(Localization.RESET) })
  await userEvent.click(clearBtn)

  expect(mockSetSegments).nthCalledWith(1, [mockSegments[0]])
})

test('calls setActiveUserPage with correct arg when click on reset button', async () => {
  jest.clearAllMocks()

  const props = {
    onCancel: jest.fn(),
    onSave: jest.fn(),
  }

  render(<PdfSegments {...props} />)

  const clearBtn = screen.getByRole('button', { name: localize(Localization.RESET) })
  await userEvent.click(clearBtn)

  expect(mockSetActiveUserPage).nthCalledWith(1, null)
})

test('calls setSelectedGroup when click on reset button', async () => {
  jest.clearAllMocks()

  const props = {
    onCancel: jest.fn(),
    onSave: jest.fn(),
  }

  render(<PdfSegments {...props} />)

  const clearBtn = screen.getByRole('button', { name: localize(Localization.RESET) })
  await userEvent.click(clearBtn)

  expect(mockSetSelectedGroup).toHaveBeenCalledWith(null)
})

test('calls setSegments when remove segment', async () => {
  jest.clearAllMocks()

  const props = {
    onCancel: jest.fn(),
    onSave: jest.fn(),
  }

  render(<PdfSegments {...props} />)

  const [, deleteButton] = screen.getAllByRole('button')
  await userEvent.click(deleteButton)

  expect(mockSetSegments).nthCalledWith(1, [{
    ...mockSegments[0],
    userPages: [
      ...mockSegments[0].userPages,
      {
        ...mockSegments[1].userPages[0],
        segmentId: mockSegments[0].id,
      },
      {
        ...mockSegments[1].userPages[1],
        segmentId: mockSegments[0].id,
      },
    ],
  }])
})

test('calls setSegments when toggle segment selection', async () => {
  jest.clearAllMocks()

  const props = {
    onCancel: jest.fn(),
    onSave: jest.fn(),
  }

  render(<PdfSegments {...props} />)

  const title = screen.getByText(localize(Localization.SEGMENT, { index: 1 }))
  await userEvent.click(title)

  expect(mockSetSegments).nthCalledWith(1, [
    {
      ...mockSegments[0],
      isSelected: true,
    },
    mockSegments[1],
  ])
})

test('calls setSegments when change document type for segment', async () => {
  jest.clearAllMocks()

  const props = {
    onCancel: jest.fn(),
    onSave: jest.fn(),
  }

  render(<PdfSegments {...props} />)

  const [documentType] = documentTypesSelector.getSelectorMockValue()

  const comboboxes = screen.getAllByRole('combobox')
  const selectElement = comboboxes[0]
  await userEvent.click(selectElement)

  const option = screen.getByText(documentType.name)
  await userEvent.click(option, {
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  })

  expect(mockSetSegments).nthCalledWith(1, [
    {
      ...mockSegments[0],
      documentTypeId: documentType.code,
    },
    mockSegments[1],
  ])
})

test('passes disabled prop to group select when disableDocumentTypeGroup is true', () => {
  const props = {
    onCancel: jest.fn(),
    onSave: jest.fn(),
    disableDocumentTypeGroup: true,
  }

  render(<PdfSegments {...props} />)

  expect(screen.getByTestId('DocumentTypesGroupsSelect')).toHaveAttribute('data-disabled', 'true')
})

test('calls onSave when click on save btn', async () => {
  jest.clearAllMocks()

  const props = {
    onCancel: jest.fn(),
    onSave: jest.fn(),
  }

  render(<PdfSegments {...props} />)

  const saveBtn = screen.getByRole('button', { name: localize(Localization.SAVE) })
  await userEvent.click(saveBtn)

  expect(props.onSave).nthCalledWith(1, mockBatchName)
})
