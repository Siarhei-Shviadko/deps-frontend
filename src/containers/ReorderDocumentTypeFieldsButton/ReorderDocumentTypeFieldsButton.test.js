
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { fetchDocumentType } from '@/actions/documentType'
import { updateExtraFields } from '@/api/enrichmentApi'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { ExtractionType } from '@/enums/ExtractionType'
import { FieldType } from '@/enums/FieldType'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { DocumentTypeExtraField } from '@/models/DocumentTypeExtraField'
import { DocumentTypeField } from '@/models/DocumentTypeField'
import { DocumentTypeFieldMeta } from '@/models/DocumentTypeFieldMeta'
import { ExtendedDocumentType } from '@/models/ExtendedDocumentType'
import { notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { ReorderDocumentTypeFieldsButton } from './ReorderDocumentTypeFieldsButton'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/api/enrichmentApi', () => ({
  updateExtraFields: jest.fn(),
}))

const mockUpdateExtractionFields = jest.fn(() => ({
  unwrap: jest.fn(),
}))

jest.mock('@/apiRTK/extractionFieldsApi', () => ({
  useUpdateExtractionFieldsMutation: jest.fn(() => ([
    mockUpdateExtractionFields,
    { isLoading: false },
  ])),
}))

jest.mock('@/utils/notification', () => mockNotification)

jest.mock('@/actions/documentType', () => ({
  fetchDocumentType: jest.fn(),
}))

const mockExtractionField = new DocumentTypeField(
  'mockCode1',
  'mockFieldName1',
  new DocumentTypeFieldMeta(),
  FieldType.STRING,
  false,
  1,
  'code',
  2,
)

const mockExtraField = new DocumentTypeExtraField({
  code: 'mockCode2',
  name: 'mockFieldName2',
  order: 2,
})

const mockFields = [
  mockExtractionField,
  mockExtraField,
]

const mockDocumentType = new ExtendedDocumentType({
  code: 'code',
  name: 'name',
  engine: KnownProcessingEngines.TESSERACT,
  extractionType: ExtractionType.TEMPLATE,
  fields: [mockExtractionField],
  llmExtractors: [],
})

const reorderFieldsAndSave = async () => {
  const initialFields = [mockExtraField, mockExtractionField]
  const reorderedFields = [mockExtractionField, mockExtraField]

  const useStateSpy = jest.spyOn(React, 'useState')
  useStateSpy.mockImplementationOnce(() => [reorderedFields, jest.fn()])
  useStateSpy.mockImplementationOnce(() => [true, jest.fn()])

  render(
    <ReorderDocumentTypeFieldsButton
      documentType={mockDocumentType}
      fields={initialFields}
    />,
  )

  const saveButton = screen.getByRole('button', {
    name: localize(Localization.SAVE),
  })

  await userEvent.click(saveButton)
}

test('shows drawer with fields on trigger button click', async () => {
  render(
    <ReorderDocumentTypeFieldsButton
      documentType={mockDocumentType}
      fields={mockFields}
    />,
  )

  const triggerButton = screen.getByRole('button', {
    name: localize(Localization.FIELDS_ORDER),
  })

  await userEvent.click(triggerButton)

  const drawer = screen.getByTestId('drawer')
  const drawerTitle = screen.getByText(localize(Localization.CHANGE_FIELDS_ORDER))

  expect(drawer).toBeInTheDocument()
  expect(drawerTitle).toBeInTheDocument()
  expect(drawerTitle).toBeInTheDocument()

  mockFields.forEach((f) => {
    expect(screen.getByText(f.name)).toBeInTheDocument()
  })
})

test('disable save button if fields order was not changed', async () => {
  render(
    <ReorderDocumentTypeFieldsButton
      documentType={mockDocumentType}
      fields={mockFields}
    />,
  )

  const triggerButton = screen.getByRole('button', {
    name: localize(Localization.FIELDS_ORDER),
  })

  await userEvent.click(triggerButton)

  const saveButton = screen.getByRole('button', {
    name: localize(Localization.SAVE),
  })

  expect(saveButton).toBeDisabled()
})

test('calls correct API when fields were reordered and user clicked save button', async () => {
  await reorderFieldsAndSave()

  expect(mockUpdateExtractionFields).nthCalledWith(
    1,
    {
      documentTypeCode: mockDocumentType.code,
      fields: [{
        code: mockExtractionField.code,
        name: mockExtractionField.name,
        order: mockExtractionField.order,
      }],
    },
  )

  expect(updateExtraFields).nthCalledWith(
    1,
    mockDocumentType.code,
    [{
      code: mockExtraField.code,
      name: mockExtraField.name,
      order: mockExtraField.order,
    }],
  )
})

test('refetches document type after successful fields update', async () => {
  await reorderFieldsAndSave()

  expect(fetchDocumentType).nthCalledWith(
    1,
    mockDocumentType.code,
    [
      DocumentTypeExtras.EXTRACTION_FIELDS,
      DocumentTypeExtras.EXTRA_FIELDS,
    ],
  )
})

test('shows warning message when something went wrong during fields update', async () => {
  const mockError = new Error('')
  updateExtraFields.mockImplementationOnce(
    () => Promise.reject(mockError),
  )

  await reorderFieldsAndSave()

  expect(notifyWarning).nthCalledWith(1, localize(Localization.UNABLE_TO_SAVE_FIELD_ORDER))
})
