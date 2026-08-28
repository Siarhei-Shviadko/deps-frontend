
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import {
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '@/components/Modal'
import { ExtractionType } from '@/enums/ExtractionType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { DocumentType } from '@/models/DocumentType'
import { render } from '@/utils/rendererRTL'
import { DeleteDocumentTypeButton } from './DeleteDocumentTypeButton'

const deleteDocumentTypeUnwrappedFn = jest.fn(() => Promise.resolve())
const mockDeleteDocumentTypeFunction = jest.fn(() => ({
  unwrap: deleteDocumentTypeUnwrappedFn,
}))
jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/apiRTK/documentTypeApi', () => ({
  useDeleteDocumentTypeMutation: jest.fn(() => [mockDeleteDocumentTypeFunction]),
}))
jest.mock('@/utils/notification', () => mockNotification)
Modal.confirm = jest.fn()

const MockContent = (onClick) => (
  <button
    data-testid='delete-trigger'
    onClick={onClick}
  />
)

const mockDocumentType = new DocumentType(
  'TestPrototype',
  'Test Prototype',
  KnownProcessingEngines.TESSERACT,
  KnownLanguage.ENGLISH,
  ExtractionType.PROTOTYPE,
)

test('show content according renderTrigger prop', async () => {
  render(
    <DeleteDocumentTypeButton
      documentType={mockDocumentType}
      onAfterDelete={jest.fn()}
      renderTrigger={MockContent}
    />,
  )

  await waitFor(() => {
    expect(screen.getByTestId('delete-trigger')).toBeInTheDocument()
  })
})

test('call Modal.confirm with correct arguments in case of button click', async () => {
  render(
    <DeleteDocumentTypeButton
      documentType={mockDocumentType}
      onAfterDelete={jest.fn()}
      renderTrigger={MockContent}
    />,
  )

  await userEvent.click(screen.getByTestId('delete-trigger'))

  expect(Modal.confirm).nthCalledWith(1, {
    title: localize(Localization.DELETE_CONFIRM_MESSAGE, { name: mockDocumentType.name }),
    onOk: expect.any(Function),
  })
})

test('should call deleteDocumentType with correct argument when clicking on modal confirm', async () => {
  Modal.confirm.mockImplementationOnce((config) => config.onOk())

  render(
    <DeleteDocumentTypeButton
      documentType={mockDocumentType}
      onAfterDelete={jest.fn()}
      renderTrigger={MockContent}
    />,
  )

  await userEvent.click(screen.getByTestId('delete-trigger'))

  expect(mockDeleteDocumentTypeFunction).nthCalledWith(1, mockDocumentType.code)
})

test('should call notifySuccess with correct message in case successful deletion', async () => {
  jest.clearAllMocks()

  Modal.confirm.mockImplementationOnce((config) => config.onOk())

  render(
    <DeleteDocumentTypeButton
      documentType={mockDocumentType}
      onAfterDelete={jest.fn()}
      renderTrigger={MockContent}
    />,
  )

  await userEvent.click(screen.getByTestId('delete-trigger'))

  expect(mockNotification.notifySuccess).nthCalledWith(
    1,
    localize(Localization.DELETE_SUCCESS, { name: mockDocumentType.name }),
  )
})

test('should call notifyWarning with correct message in case of delete rejection', async () => {
  jest.clearAllMocks()

  const mockError = new Error('test')
  const mockRejectedUnwrapFn = () => Promise.reject(mockError)
  mockDeleteDocumentTypeFunction.mockImplementationOnce(() => ({
    unwrap: mockRejectedUnwrapFn,
  }))

  Modal.confirm.mockImplementationOnce((config) => config.onOk())

  render(
    <DeleteDocumentTypeButton
      documentType={mockDocumentType}
      onAfterDelete={jest.fn()}
      renderTrigger={MockContent}
    />,
  )

  await userEvent.click(screen.getByTestId('delete-trigger'))

  expect(mockNotification.notifyWarning).nthCalledWith(
    1,
    localize(Localization.DEFAULT_ERROR),
  )
})

test('should call notifyWarning with correct message in case of delete rejection with known code', async () => {
  jest.clearAllMocks()

  const mockError = {
    data: {
      code: 'prototype_has_document',
    },
  }

  const mockRejectedUnwrapFn = () => Promise.reject(mockError)
  mockDeleteDocumentTypeFunction.mockImplementationOnce(() => ({
    unwrap: mockRejectedUnwrapFn,
  }))

  Modal.confirm.mockImplementationOnce((config) => config.onOk())

  render(
    <DeleteDocumentTypeButton
      documentType={mockDocumentType}
      onAfterDelete={jest.fn()}
      renderTrigger={MockContent}
    />,
  )

  await userEvent.click(screen.getByTestId('delete-trigger'))

  expect(mockNotification.notifyWarning).nthCalledWith(
    1,
    localize(Localization.PROTOTYPE_HAS_DOCUMENT_ERROR_MESSAGE),
  )
})

it('should call onAfterDelete after success deletion', async () => {
  const mockOnAfterDelete = jest.fn()
  Modal.confirm.mockImplementationOnce((config) => config.onOk())

  render(
    <DeleteDocumentTypeButton
      documentType={mockDocumentType}
      onAfterDelete={mockOnAfterDelete}
      renderTrigger={MockContent}
    />,
  )

  await userEvent.click(screen.getByTestId('delete-trigger'))

  expect(mockOnAfterDelete).toHaveBeenCalledTimes(1)
})
