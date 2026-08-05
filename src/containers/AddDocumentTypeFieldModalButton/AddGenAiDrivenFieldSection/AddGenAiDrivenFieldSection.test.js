
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { fetchDocumentType } from '@/actions/documentType'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { ErrorCode, RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { FieldType } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import { ExtendedDocumentType } from '@/models/ExtendedDocumentType'
import {
  LLMQueryCardinality,
  LLMExtractionQuery,
  LLMExtractionQueryFormat,
  LLMExtractionQueryNode,
  LLMExtractionQueryWorkflow,
  FIELD_TYPE_TO_LLM_QUERY_DATA_TYPE,
} from '@/models/LLMExtractor'
import { documentTypeStateSelector } from '@/selectors/documentType'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { AddGenAiDrivenFieldSection } from './AddGenAiDrivenFieldSection'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('@/selectors/documentType')

jest.mock('@/containers/GenAIDrivenFieldModal', () => ({
  GenAIDrivenFieldModal: ({ onSubmit, visible }) => {
    onFieldSave = onSubmit
    return (
      visible
        ? <div data-testid={'genAi-field-modal'} />
        : null
    )
  },
}))

jest.mock('@/actions/documentType', () => ({
  fetchDocumentType: jest.fn(),
}))

const mockCreateExtractionField = jest.fn(() => ({
  unwrap: jest.fn(() => Promise.resolve({ code: mockExtractionFieldCode })),
}))

const mockCreateLLMExtractorQuery = jest.fn(() => ({
  unwrap: jest.fn(),
}))

jest.mock('@/apiRTK/extractionFieldsApi', () => ({
  useCreateExtractionFieldMutation: jest.fn(() => ([
    mockCreateExtractionField,
    { isLoading: false },
  ])),
}))

jest.mock('@/apiRTK/documentTypeApi', () => ({
  useCreateLLMExtractorQueryMutation: jest.fn(() => ([
    mockCreateLLMExtractorQuery,
    { isLoading: false },
  ])),
}))

let onFieldSave
const mockName = 'Name'
const mockDocumentTypeCode = 'Code'
const mockExtractorId = 'extractorId'
const mockExtractionFieldCode = 'fieldCode'

const mockLlmWorkflow = new LLMExtractionQueryWorkflow({
  nodes: [
    new LLMExtractionQueryNode({
      id: 'mockId',
      name: 'mockNodeName',
      prompt: 'prompt',
    }),
  ],
  edges: [],
  startNodeId: 'mockId',
  endNodeId: 'mockId',
})

const mockFormValues = {
  name: mockName,
  llmWorkflow: mockLlmWorkflow,
  required: false,
  fieldType: FieldType.STRING,
  extractorId: mockExtractorId,
  confidential: false,
  cardinality: LLMQueryCardinality.SCALAR,
  readOnly: false,
  includeAliases: false,
}

const mockDocumentType = new ExtendedDocumentType({
  code: mockDocumentTypeCode,
  name: 'Doc Type 1',
})

beforeEach(() => {
  jest.clearAllMocks()
  documentTypeStateSelector.mockReturnValue(mockDocumentType)
})

const openFormAndSubmit = async (formValues) => {
  const trigger = screen.getByRole('heading', {
    level: 3,
    name: localize(Localization.GEN_AI_DRIVEN_FIELD),
  })

  await userEvent.click(trigger)
  onFieldSave(formValues)
}

test('shows modal on trigger click', async () => {
  render(<AddGenAiDrivenFieldSection />)

  const trigger = screen.getByRole('heading', {
    level: 3,
    name: localize(Localization.GEN_AI_DRIVEN_FIELD),
  })

  await userEvent.click(trigger)

  expect(screen.getByTestId('genAi-field-modal')).toBeInTheDocument()
})

test('calls correct APIs and pass correct STRING field data on form submit', async () => {
  const mockValues = {
    name: mockName,
    required: false,
    fieldType: FieldType.STRING,
    extractorId: mockExtractorId,
    confidential: true,
    displayCharLimit: 5,
    cardinality: LLMQueryCardinality.SCALAR,
    readOnly: true,
    includeAliases: false,
    llmWorkflow: mockLlmWorkflow,
  }

  render(<AddGenAiDrivenFieldSection />)

  await act(async () => await openFormAndSubmit(mockValues))

  expect(mockCreateExtractionField).nthCalledWith(1, {
    documentTypeCode: mockDocumentTypeCode,
    field: {
      confidential: mockValues.confidential,
      extractorId: mockValues.extractorId,
      fieldType: mockValues.fieldType,
      name: mockValues.name,
      required: mockValues.required,
      readOnly: mockValues.readOnly,
      fieldMeta: {
        displayCharLimit: mockValues.displayCharLimit,
      },
    },
  })

  expect(mockCreateLLMExtractorQuery).nthCalledWith(1, {
    documentTypeId: mockDocumentTypeCode,
    extractorId: mockValues.extractorId,
    data: new LLMExtractionQuery({
      code: mockExtractionFieldCode,
      shape: new LLMExtractionQueryFormat({
        cardinality: mockValues.cardinality,
        includeAliases: mockValues.includeAliases,
        dataType: FIELD_TYPE_TO_LLM_QUERY_DATA_TYPE[mockValues.fieldType],
      }),
      workflow: mockValues.llmWorkflow,
    }),
  })
})

test('calls correct APIs and pass correct KEY VALUE PAIR field data on form submit', async () => {
  const mockValues = {
    name: mockName,
    required: false,
    fieldType: FieldType.DICTIONARY,
    extractorId: mockExtractorId,
    confidential: false,
    cardinality: LLMQueryCardinality.SCALAR,
    readOnly: false,
    includeAliases: false,
    llmWorkflow: mockLlmWorkflow,
  }

  render(
    <AddGenAiDrivenFieldSection />,
  )

  await act(async () => await openFormAndSubmit(mockValues))

  expect(mockCreateExtractionField).nthCalledWith(1, {
    documentTypeCode: mockDocumentTypeCode,
    field: {
      confidential: mockValues.confidential,
      extractorId: mockValues.extractorId,
      fieldType: mockValues.fieldType,
      name: mockValues.name,
      required: mockValues.required,
      readOnly: mockValues.readOnly,
      fieldMeta: {
        keyType: FieldType.STRING,
        valueType: FieldType.STRING,
      },
    },
  })

  expect(mockCreateLLMExtractorQuery).nthCalledWith(1, {
    documentTypeId: mockDocumentTypeCode,
    extractorId: mockValues.extractorId,
    data: new LLMExtractionQuery({
      code: mockExtractionFieldCode,
      shape: new LLMExtractionQueryFormat({
        cardinality: mockValues.cardinality,
        includeAliases: mockValues.includeAliases,
        dataType: FIELD_TYPE_TO_LLM_QUERY_DATA_TYPE[mockValues.fieldType],
      }),
      workflow: mockValues.llmWorkflow,
    }),
  })
})

test('calls correct APIs and pass displayCharLimit in DICTIONARY field meta on form submit', async () => {
  const mockValues = {
    name: mockName,
    required: false,
    fieldType: FieldType.DICTIONARY,
    extractorId: mockExtractorId,
    confidential: true,
    displayCharLimit: 5,
    cardinality: LLMQueryCardinality.SCALAR,
    readOnly: false,
    includeAliases: false,
    llmWorkflow: mockLlmWorkflow,
  }

  render(<AddGenAiDrivenFieldSection />)

  await act(async () => await openFormAndSubmit(mockValues))

  expect(mockCreateExtractionField).nthCalledWith(1, {
    documentTypeCode: mockDocumentTypeCode,
    field: {
      confidential: mockValues.confidential,
      extractorId: mockValues.extractorId,
      fieldType: mockValues.fieldType,
      name: mockValues.name,
      required: mockValues.required,
      readOnly: mockValues.readOnly,
      fieldMeta: {
        keyType: FieldType.STRING,
        valueType: FieldType.STRING,
        valueMeta: {
          displayCharLimit: mockValues.displayCharLimit,
        },
      },
    },
  })
})

test('calls correct APIs and pass correct CHECKMARK field data on form submit', async () => {
  const mockValues = {
    name: mockName,
    required: false,
    fieldType: FieldType.CHECKMARK,
    extractorId: mockExtractorId,
    confidential: false,
    cardinality: LLMQueryCardinality.SCALAR,
    readOnly: false,
    includeAliases: false,
    llmWorkflow: mockLlmWorkflow,
  }

  render(<AddGenAiDrivenFieldSection />)

  await act(async () => await openFormAndSubmit(mockValues))

  expect(mockCreateExtractionField).nthCalledWith(1, {
    documentTypeCode: mockDocumentTypeCode,
    field: {
      confidential: mockValues.confidential,
      extractorId: mockValues.extractorId,
      fieldType: mockValues.fieldType,
      name: mockValues.name,
      required: mockValues.required,
      readOnly: mockValues.readOnly,
      fieldMeta: {},
    },
  })

  expect(mockCreateLLMExtractorQuery).nthCalledWith(1, {
    documentTypeId: mockDocumentTypeCode,
    extractorId: mockValues.extractorId,
    data: new LLMExtractionQuery({
      code: mockExtractionFieldCode,
      shape: new LLMExtractionQueryFormat({
        cardinality: mockValues.cardinality,
        includeAliases: mockValues.includeAliases,
        dataType: FIELD_TYPE_TO_LLM_QUERY_DATA_TYPE[mockValues.fieldType],
      }),
      workflow: mockValues.llmWorkflow,
    }),
  })
})

test('calls correct APIs and pass correct LIST field data on form submit', async () => {
  const mockValues = {
    name: mockName,
    required: false,
    fieldType: FieldType.STRING,
    extractorId: mockExtractorId,
    confidential: true,
    displayCharLimit: 5,
    cardinality: LLMQueryCardinality.LIST,
    readOnly: true,
    includeAliases: true,
    llmWorkflow: mockLlmWorkflow,
  }

  render(<AddGenAiDrivenFieldSection />)

  await act(async () => await openFormAndSubmit(mockValues))

  expect(mockCreateExtractionField).nthCalledWith(1, {
    documentTypeCode: mockDocumentTypeCode,
    field: {
      confidential: mockValues.confidential,
      extractorId: mockValues.extractorId,
      fieldType: FieldType.LIST,
      name: mockValues.name,
      required: mockValues.required,
      readOnly: mockValues.readOnly,
      fieldMeta: {
        baseType: FieldType.STRING,
        baseTypeMeta: {
          displayCharLimit: mockValues.displayCharLimit,
        },
      },
    },
  })

  expect(mockCreateLLMExtractorQuery).nthCalledWith(1, {
    documentTypeId: mockDocumentTypeCode,
    extractorId: mockValues.extractorId,
    data: new LLMExtractionQuery({
      code: mockExtractionFieldCode,
      shape: new LLMExtractionQueryFormat({
        cardinality: mockValues.cardinality,
        includeAliases: mockValues.includeAliases,
        dataType: FIELD_TYPE_TO_LLM_QUERY_DATA_TYPE[mockValues.fieldType],
      }),
      workflow: mockValues.llmWorkflow,
    }),
  })
})

test('calls notifySuccess and fetchDocumentType in case field creation was successful', async () => {
  render(<AddGenAiDrivenFieldSection />)

  await act(async () => await openFormAndSubmit(mockFormValues))

  expect(notifySuccess).nthCalledWith(
    1,
    localize(Localization.FIELD_CREATION_SUCCESS_MESSAGE),
  )

  expect(fetchDocumentType).nthCalledWith(
    1,
    mockDocumentTypeCode,
    [
      DocumentTypeExtras.EXTRACTION_FIELDS,
      DocumentTypeExtras.LLM_EXTRACTORS,
    ],
  )
})

test('calls notifyWarning with default message in case adding failed with unknown error code', async () => {
  const mockUnknownError = new Error('')

  mockCreateExtractionField.mockImplementationOnce(() => ({
    unwrap: () => Promise.reject(mockUnknownError),
  }))

  render(<AddGenAiDrivenFieldSection />)

  await act(async () => await openFormAndSubmit(mockFormValues))

  expect(notifyWarning).nthCalledWith(
    1,
    localize(Localization.DEFAULT_ERROR),
  )
})

test('calls notifyWarning with correct message in case adding failed with known error code', async () => {
  const errorCode = ErrorCode.alreadyExistsError
  const mockError = {
    data: {
      code: errorCode,
    },
  }

  mockCreateExtractionField.mockImplementationOnce(() => ({
    unwrap: () => Promise.reject(mockError),
  }))

  render(<AddGenAiDrivenFieldSection />)

  await act(async () => await openFormAndSubmit(mockFormValues))

  expect(notifyWarning).nthCalledWith(
    1,
    RESOURCE_ERROR_TO_DISPLAY[errorCode],
  )
})
