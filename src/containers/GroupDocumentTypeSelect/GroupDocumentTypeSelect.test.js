
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { DocumentType } from '@/models/DocumentType'
import { render } from '@/utils/rendererRTL'
import { GroupDocumentTypeSelect } from './GroupDocumentTypeSelect'

jest.mock('@/utils/env', () => mockEnv)

const mockDocumentTypes = [
  new DocumentType('id1', 'name1'),
  new DocumentType('id2', 'name2'),
]

test('shows document types names, and prev and next buttons', async () => {
  const props = {
    documentTypes: mockDocumentTypes,
    onChange: jest.fn(),
    isFetching: false,
    allowSelectDocumentType: true,
  }

  render(
    <GroupDocumentTypeSelect {...props} />,
  )

  const buttons = screen.getAllByRole('button')

  mockDocumentTypes.forEach((dt) => {
    const [docTypeName] = screen.getAllByDisplayValue(dt.name)

    expect(docTypeName).toBeInTheDocument()
    expect(docTypeName).toBeDisabled()
  })

  expect(buttons).toHaveLength(2)
})

test('calls onChange prop if user clicked control button', async () => {
  const mockOnChange = jest.fn()

  const props = {
    documentTypes: mockDocumentTypes,
    onChange: mockOnChange,
    isFetching: false,
    allowSelectDocumentType: true,
  }

  render(
    <GroupDocumentTypeSelect {...props} />,
  )

  const [prevButton] = screen.getAllByRole('button')

  await userEvent.click(prevButton)

  expect(mockOnChange).nthCalledWith(1, mockDocumentTypes[1].code)
})

test('disables prev and next buttons when there is only one document type', async () => {
  const props = {
    documentTypes: [
      new DocumentType('id1', 'name1'),
    ],
    onChange: jest.fn(),
    isFetching: false,
    allowSelectDocumentType: true,
  }

  render(
    <GroupDocumentTypeSelect {...props} />,
  )

  const [prevButton, nextButton] = screen.getAllByRole('button')

  expect(prevButton).toBeDisabled()
  expect(nextButton).toBeDisabled()
})

test('shows just document type if selection is not allowed', async () => {
  const mockDocTypes = [
    new DocumentType('id1', 'name1'),
    new DocumentType('id2', 'name2'),
  ]

  const props = {
    documentTypes: mockDocTypes,
    onChange: jest.fn(),
    isFetching: false,
    allowSelectDocumentType: false,
  }

  render(
    <GroupDocumentTypeSelect {...props} />,
  )

  const docTypeInputs = screen.getAllByRole('textbox')
  const controls = screen.queryAllByRole('button')

  expect(docTypeInputs[0]).toHaveValue(mockDocTypes[0].name)
  expect(docTypeInputs).toHaveLength(1)
  expect(controls).toHaveLength(0)
})
