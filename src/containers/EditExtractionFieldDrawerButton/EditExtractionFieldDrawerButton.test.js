
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExtractionType } from '@/enums/ExtractionType'
import { FieldType } from '@/enums/FieldType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { DocumentType } from '@/models/DocumentType'
import { DocumentTypeField } from '@/models/DocumentTypeField'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { EditExtractionFieldDrawerButton } from './EditExtractionFieldDrawerButton'

jest.mock('@/utils/env', () => mockEnv)

const mockUpdateExtractionField = jest.fn(() => ({
  unwrap: jest.fn(),
}))

const editIconTestId = 'edit-icon'
jest.mock('@/components/Icons/PenIcon', () => ({
  PenIcon: () => <div data-testid={editIconTestId} />,
}))

jest.mock('@/apiRTK/extractionFieldsApi', () => ({
  useUpdateExtractionFieldMutation: jest.fn(() => ([
    mockUpdateExtractionField,
    { isLoading: false },
  ])),
}))

const mockFieldCode = 'mockFieldCode'

jest.mock('@/utils/notification')

const mockDocumentType = new DocumentType(
  'DocType1',
  'Doc Type 1',
  KnownProcessingEngines.TESSERACT,
  KnownLanguage.ENGLISH,
  ExtractionType.TEMPLATE,
)

const mockDocumentTypeField = new DocumentTypeField(
  mockFieldCode,
  'stringName',
  {},
  FieldType.STRING,
  true,
  0,
  'documentTypeCode',
  0,
  false,
  false,
)

const mockOnUpdateSuccess = jest.fn()
const mockNewName = 'mockNewName'

const updateFieldName = async () => {
  const editButton = screen.getByTestId(editIconTestId)

  await userEvent.click(editButton)

  const input = screen.getByDisplayValue('stringName')

  await userEvent.click()
  await userEvent.clear(input)
  await userEvent.keyboard(mockNewName)

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.SUBMIT),
  }))
}

test('call field update api on save call', async () => {
  const props = {
    documentTypeCode: mockDocumentType.code,
    field: mockDocumentTypeField,
    onAfterEditing: mockOnUpdateSuccess,
  }

  render(<EditExtractionFieldDrawerButton {...props} />)

  await updateFieldName()

  expect(mockUpdateExtractionField).nthCalledWith(1, {
    documentTypeCode: mockDocumentType.code,
    fieldCode: mockDocumentTypeField.code,
    data: {
      name: mockNewName,
      fieldType: mockDocumentTypeField.fieldType,
      fieldMeta: mockDocumentTypeField.fieldMeta,
      confidential: mockDocumentTypeField.confidential,
      readOnly: mockDocumentTypeField.readOnly,
      required: mockDocumentTypeField.required,
    },
  })
})

test('onUpdateSuccess is called after successful field update', async () => {
  jest.clearAllMocks()

  const props = {
    documentTypeCode: mockDocumentType.code,
    field: mockDocumentTypeField,
    onAfterEditing: mockOnUpdateSuccess,
  }

  render(<EditExtractionFieldDrawerButton {...props} />)

  await updateFieldName()

  expect(mockOnUpdateSuccess).toHaveBeenCalledTimes(1)
})

test('notifySuccess is called with correct message after successful field update', async () => {
  jest.clearAllMocks()

  const props = {
    documentTypeCode: mockDocumentType.code,
    field: mockDocumentTypeField,
    onAfterEditing: mockOnUpdateSuccess,
  }

  render(<EditExtractionFieldDrawerButton {...props} />)

  await updateFieldName()

  expect(notifySuccess).nthCalledWith(1, localize(Localization.FIELD_UPDATE_SUCCESS_MESSAGE))
})

test('notifyWarning is called with correct message if field update failed', async () => {
  mockUpdateExtractionField.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => Promise.reject(new Error())),
  }))

  const props = {
    documentTypeCode: mockDocumentType.code,
    field: mockDocumentTypeField,
    onAfterEditing: mockOnUpdateSuccess,
  }

  render(<EditExtractionFieldDrawerButton {...props} />)

  await updateFieldName()

  expect(notifyWarning).nthCalledWith(1, localize(Localization.DEFAULT_ERROR))
})
