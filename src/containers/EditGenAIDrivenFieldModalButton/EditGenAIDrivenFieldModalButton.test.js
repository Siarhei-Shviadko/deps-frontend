
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { ErrorCode } from '@/enums/Errors'
import { FieldType } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import { DocumentTypeField } from '@/models/DocumentTypeField'
import { ExtendedDocumentType } from '@/models/ExtendedDocumentType'
import {
  LLMExtractor,
  LLMExtractionParams,
  LLMReference,
  LLMQueryDataType,
  LLMQueryCardinality,
  LLMExtractionQuery,
  LLMExtractionQueryNode,
  LLMExtractionQueryWorkflow, LLMExtractionQueryFormat,
} from '@/models/LLMExtractor'
import { documentTypeStateSelector } from '@/selectors/documentType'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { EditGenAIDrivenFieldModalButton } from './EditGenAIDrivenFieldModalButton'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('@/selectors/documentType')

const mockUpdateExtractionField = jest.fn(() => ({
  unwrap: jest.fn(),
}))

const mockUpdateLLMExtractorQuery = jest.fn(() => ({
  unwrap: jest.fn(),
}))

const mockMoveLLMExtractorQuery = jest.fn(() => ({
  unwrap: jest.fn(),
}))

jest.mock('@/apiRTK/documentTypeApi', () => ({
  useMoveLLMExtractorQueryMutation: jest.fn(() => ([
    mockMoveLLMExtractorQuery,
    { isLoading: false },
  ])),
  useUpdateLLMExtractorQueryMutation: jest.fn(() => ([
    mockUpdateLLMExtractorQuery,
    { isLoading: false },
  ])),
}))

jest.mock('@/apiRTK/extractionFieldsApi', () => ({
  useUpdateExtractionFieldMutation: jest.fn(() => ([
    mockUpdateExtractionField,
    { isLoading: false },
  ])),
}))

const editIconTestId = 'edit-icon'
const genAiFieldModalTestId = 'genAi-field-modal'

jest.mock('@/components/Icons/PenIcon', () => ({
  PenIcon: () => <div data-testid={editIconTestId} />,
}))

jest.mock('@/containers/GenAIDrivenFieldModal', () => ({
  GenAIDrivenFieldModal: ({ onSubmit, visible }) => {
    onFieldSave = onSubmit
    return (
      visible
        ? <div data-testid={genAiFieldModalTestId} />
        : null
    )
  },
}))

const mockDocumentTypeCode = '12345'

const mockDocumentTypeField = new DocumentTypeField(
  'verticalReference',
  'Vertical Reference',
  {},
  FieldType.STRING,
  false,
  1,
  'mockDocumentTypeCode',
  1,
)

const mockLlmWorkflow = new LLMExtractionQueryWorkflow({
  nodes: [
    new LLMExtractionQueryNode({
      id: 'mockId',
      name: 'mockNodeName',
      prompt: 'Prompt',
    }),
  ],
  edges: [],
  startNodeId: 'mockId',
  endNodeId: 'mockId',
})

const mockLLMExtractor = new LLMExtractor({
  extractorId: 'id',
  name: 'LLM Extractor Name 1',
  extractionParams: new LLMExtractionParams({
    customInstruction: 'Test Instructions 1',
    groupingFactor: 1,
    temperature: 0.5,
    topP: 0.3,
  }),
  llmReference: new LLMReference({
    model: 'modelCode',
    provider: 'providerCode',
  }),
  queries: [
    new LLMExtractionQuery({
      code: mockDocumentTypeField.code,
      shape: new LLMExtractionQueryFormat({
        dataType: LLMQueryDataType.STRING,
        cardinality: LLMQueryCardinality.SCALAR,
        includeAliases: false,
      }),
      workflow: mockLlmWorkflow,
    }),
  ],
})

const mockDocumentType = new ExtendedDocumentType({
  code: mockDocumentTypeCode,
  name: 'Doc Type 1',
  engine: null,
  fields: [mockDocumentTypeField],
  llmExtractors: [mockLLMExtractor],
})

documentTypeStateSelector.mockReturnValue(mockDocumentType)

const mockField = {
  name: 'Name',
  llmWorkflow: mockLlmWorkflow,
  required: true,
  fieldType: FieldType.STRING,
  extractorId: mockLLMExtractor.extractorId,
  confidential: false,
  cardinality: LLMQueryCardinality.SCALAR,
  displayCharLimit: 5,
  readOnly: true,
  includeAliases: false,
}

let onFieldSave = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

test('checks if the trigger button to open the modal is displayed', async () => {
  const props = {
    documentTypeCode: mockDocumentTypeCode,
    onAfterEditing: jest.fn(),
    field: mockDocumentTypeField,
  }

  render(<EditGenAIDrivenFieldModalButton {...props} />)

  const button = screen.getByTestId(editIconTestId)

  expect(button).toBeInTheDocument()
})

test('shows modal when click on edit button', async () => {
  const props = {
    documentTypeCode: mockDocumentTypeCode,
    onAfterEditing: jest.fn(),
    field: mockDocumentTypeField,
  }

  render(<EditGenAIDrivenFieldModalButton {...props} />)

  const editButton = screen.getByTestId(editIconTestId)

  await userEvent.click(editButton)

  expect(screen.getByTestId(genAiFieldModalTestId)).toBeInTheDocument()
})

test('calls updateExtractionField and updateLLMExtractorQuery when click on submit button', async () => {
  const props = {
    documentTypeCode: mockDocumentTypeCode,
    onAfterEditing: jest.fn(),
    field: mockDocumentTypeField,
  }

  render(<EditGenAIDrivenFieldModalButton {...props} />)

  const editButton = screen.getByTestId(editIconTestId)

  await userEvent.click(editButton)
  await act(async () => await onFieldSave(mockField))

  expect(mockUpdateExtractionField).nthCalledWith(1, {
    documentTypeCode: mockDocumentTypeCode,
    extractorId: mockField.extractorId,
    fieldCode: mockDocumentTypeField.code,
    data: {
      ...mockDocumentTypeField,
      name: mockField.name,
      confidential: mockField.confidential,
      fieldMeta: {
        displayCharLimit: mockField.displayCharLimit,
      },
      readOnly: mockField.readOnly,
      required: mockField.required,
    },
  })

  expect(mockUpdateLLMExtractorQuery).nthCalledWith(1, {
    documentTypeId: mockDocumentTypeCode,
    extractorId: mockField.extractorId,
    fieldCode: mockDocumentTypeField.code,
    data: {
      ...mockLLMExtractor.queries[0],
      workflow: mockField.llmWorkflow,
    },
  })
})

test('calls moveLLMExtractorQuery if LLM Extractor was changed', async () => {
  const newExtractorId = 'new-extractor-id'
  const formValues = {
    ...mockField,
    extractorId: newExtractorId,
  }

  const props = {
    documentTypeCode: mockDocumentTypeCode,
    onAfterEditing: jest.fn(),
    field: mockDocumentTypeField,
  }

  render(<EditGenAIDrivenFieldModalButton {...props} />)

  const editButton = screen.getByTestId(editIconTestId)

  await userEvent.click(editButton)
  await act(async () => await onFieldSave(formValues))

  expect(mockMoveLLMExtractorQuery).nthCalledWith(1, {
    documentTypeId: mockDocumentTypeCode,
    data: {
      sourceExtractorId: mockLLMExtractor.extractorId,
      targetExtractorId: newExtractorId,
      fieldsCodes: [mockDocumentTypeField.code],
    },
  })
})

test('calls notifySuccess when click on submit button', async () => {
  const props = {
    documentTypeCode: mockDocumentTypeCode,
    onAfterEditing: jest.fn(),
    field: mockDocumentTypeField,
  }

  render(<EditGenAIDrivenFieldModalButton {...props} />)

  const editButton = screen.getByTestId(editIconTestId)

  await userEvent.click(editButton)
  await act(async () => await onFieldSave(mockField))

  expect(notifySuccess).toHaveBeenNthCalledWith(1, localize(Localization.FIELD_UPDATE_SUCCESS_MESSAGE))
})

test('calls onAfterEditing prop when click on submit button', async () => {
  const props = {
    documentTypeCode: mockDocumentTypeCode,
    onAfterEditing: jest.fn(),
    field: mockDocumentTypeField,
  }

  render(<EditGenAIDrivenFieldModalButton {...props} />)

  const editButton = screen.getByTestId(editIconTestId)

  await userEvent.click(editButton)
  await act(async () => await onFieldSave(mockField))

  expect(props.onAfterEditing).toHaveBeenCalled()
})

test('calls notifyWarning with correct message when field update fails with a unknown error code', async () => {
  mockUpdateExtractionField.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => Promise.reject(new Error())),
  }))

  const props = {
    documentTypeCode: mockDocumentTypeCode,
    onAfterEditing: jest.fn(),
    field: mockDocumentTypeField,
  }

  render(<EditGenAIDrivenFieldModalButton {...props} />)

  const editButton = screen.getByTestId(editIconTestId)

  await userEvent.click(editButton)
  await act(async () => await onFieldSave(mockField))

  expect(notifyWarning).toHaveBeenNthCalledWith(1, localize(Localization.DEFAULT_ERROR))
})

test('calls notifyWarning with correct message when field update fails with a known error code', async () => {
  const errorCode = ErrorCode.invariantViolationError
  const mockError = {
    data: {
      code: errorCode,
    },
  }

  mockUpdateExtractionField.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => Promise.reject(mockError)),
  }))

  const props = {
    documentTypeCode: mockDocumentTypeCode,
    onAfterEditing: jest.fn(),
    field: mockDocumentTypeField,
  }

  render(<EditGenAIDrivenFieldModalButton {...props} />)

  const editButton = screen.getByTestId(editIconTestId)

  await userEvent.click(editButton)
  await act(async () => await onFieldSave(mockField))

  expect(notifyWarning).toHaveBeenNthCalledWith(1, localize(Localization.INVARIANT_VIOLATION_ERROR))
})

test('calls updateExtractionField with displayCharLimit in valueMeta when editing Dictionary field', async () => {
  const mockDictionaryField = new DocumentTypeField(
    'dictionaryCode',
    'Dictionary Field',
    {
      keyType: FieldType.STRING,
      valueType: FieldType.STRING,
    },
    FieldType.DICTIONARY,
    false,
    1,
    mockDocumentTypeCode,
    1,
  )

  const mockDictionaryLLMExtractor = new LLMExtractor({
    extractorId: 'id',
    name: 'LLM Extractor Name 1',
    extractionParams: mockLLMExtractor.extractionParams,
    llmReference: mockLLMExtractor.llmReference,
    queries: [
      new LLMExtractionQuery({
        code: mockDictionaryField.code,
        shape: new LLMExtractionQueryFormat({
          dataType: LLMQueryDataType.KAY_VALUE_PAIR,
          cardinality: LLMQueryCardinality.SCALAR,
          includeAliases: false,
        }),
        workflow: mockLlmWorkflow,
      }),
    ],
  })

  const mockDictionaryDocumentType = new ExtendedDocumentType({
    code: mockDocumentTypeCode,
    name: 'Doc Type 1',
    engine: null,
    fields: [mockDictionaryField],
    llmExtractors: [mockDictionaryLLMExtractor],
  })

  documentTypeStateSelector.mockReturnValue(mockDictionaryDocumentType)

  const mockDisplayCharLimit = 5
  const dictionaryFormValues = {
    name: 'Dictionary Field',
    llmWorkflow: mockLlmWorkflow,
    required: false,
    fieldType: FieldType.DICTIONARY,
    extractorId: mockDictionaryLLMExtractor.extractorId,
    confidential: true,
    cardinality: LLMQueryCardinality.SCALAR,
    displayCharLimit: mockDisplayCharLimit,
    readOnly: false,
    includeAliases: false,
  }

  const props = {
    documentTypeCode: mockDocumentTypeCode,
    onAfterEditing: jest.fn(),
    field: mockDictionaryField,
  }

  render(<EditGenAIDrivenFieldModalButton {...props} />)

  const editButton = screen.getByTestId(editIconTestId)

  await userEvent.click(editButton)
  await act(async () => await onFieldSave(dictionaryFormValues))

  expect(mockUpdateExtractionField).nthCalledWith(1, {
    documentTypeCode: mockDocumentTypeCode,
    extractorId: dictionaryFormValues.extractorId,
    fieldCode: mockDictionaryField.code,
    data: {
      ...mockDictionaryField,
      name: dictionaryFormValues.name,
      confidential: dictionaryFormValues.confidential,
      fieldMeta: {
        keyType: FieldType.STRING,
        valueType: FieldType.STRING,
        valueMeta: {
          displayCharLimit: mockDisplayCharLimit,
        },
      },
      readOnly: dictionaryFormValues.readOnly,
      required: dictionaryFormValues.required,
    },
  })

  documentTypeStateSelector.mockReturnValue(mockDocumentType)
})
