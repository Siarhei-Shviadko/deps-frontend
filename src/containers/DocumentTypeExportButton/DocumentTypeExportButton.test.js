
import { mockEnv } from '@/mocks/mockEnv'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EXPORT_FIELDS } from '@/constants/documentType'
import { ExtractionType } from '@/enums/ExtractionType'
import { FieldType } from '@/enums/FieldType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { ValidationRuleSeverity } from '@/enums/ValidationRuleSeverity'
import { Localization, localize } from '@/localization/i18n'
import { CrossFieldValidator, IssueMessage } from '@/models/CrossFieldValidator'
import { DocumentTypeField } from '@/models/DocumentTypeField'
import { ExtendedDocumentType } from '@/models/ExtendedDocumentType'
import {
  LLMQueryCardinality,
  LLMQueryDataType,
  LLMExtractor,
  LLMExtractionParams,
  LLMExtractionQuery,
  LLMExtractionQueryFormat,
  LLMExtractionQueryNode,
  LLMExtractionQueryWorkflow,
  LLMReference,
} from '@/models/LLMExtractor'
import { documentTypeStateSelector } from '@/selectors/documentType'
import { saveToFile } from '@/utils/file'
import { render } from '@/utils/rendererRTL'
import { DocumentTypeExportButton } from './DocumentTypeExportButton'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/selectors/documentType')
jest.mock('@/utils/file', () => ({
  saveToFile: jest.fn(),
}))

const mockGenAIFieldCode1 = 'genAIFieldCode1'
const mockGenAIFieldCode2 = 'genAIFieldCode2'
const mockExtractionFieldCode1 = 'fieldCode1'
const mockExtractionFieldCode2 = 'fieldCode2'
const mockDocumentTypeCode = 'Doc type code'

const mockGenAIField1 = new DocumentTypeField(
  mockGenAIFieldCode1,
  'GenAI Field Name 1',
  {},
  FieldType.STRING,
  false,
  0,
  mockDocumentTypeCode,
  mockGenAIFieldCode1,
  false,
  false,
)

const mockGenAIField2 = new DocumentTypeField(
  mockGenAIFieldCode2,
  'GenAI Field Name 2',
  {},
  FieldType.STRING,
  false,
  0,
  mockDocumentTypeCode,
  mockGenAIFieldCode2,
  false,
  false,
)

const mockExtractionField1 = new DocumentTypeField(
  mockExtractionFieldCode1,
  'Field Name 1',
  {},
  FieldType.STRING,
  false,
  0,
  mockDocumentTypeCode,
  mockExtractionFieldCode1,
  false,
  false,
)

const mockExtractionField2 = new DocumentTypeField(
  mockExtractionFieldCode2,
  'Field Name 1',
  {},
  FieldType.STRING,
  false,
  0,
  mockDocumentTypeCode,
  mockExtractionFieldCode2,
  false,
  false,
)

const mockGenAIFieldValidator = new CrossFieldValidator({
  id: 'validator-1',
  name: 'GenAi Fields validator',
  forAny: false,
  forEach: false,
  issueMessage: new IssueMessage({
    dependentFields: [],
    message: 'Test message',
  }),
  rule: 'Test rule',
  severity: ValidationRuleSeverity.ERROR,
  validatedFields: [mockGenAIField1.code, mockGenAIField2.code],
})

const mockExtractionFieldValidator = new CrossFieldValidator({
  id: 'validator-2',
  name: 'Extraction Fields validator',
  forAny: false,
  forEach: false,
  issueMessage: new IssueMessage({
    dependentFields: [],
    message: 'Test message',
  }),
  rule: 'Test rule',
  severity: ValidationRuleSeverity.ERROR,
  validatedFields: [mockExtractionField1.code, mockExtractionField2.code],
})

const mockLLMExtractor = new LLMExtractor({
  extractorId: 'id1',
  name: 'LLM Extractor Name',
  extractionParams: new LLMExtractionParams({
    customInstruction: 'Test Instructions',
    groupingFactor: 1,
    temperature: 0.5,
    topP: 0.3,
  }),
  llmReference: new LLMReference({
    model: 'mockModel',
    provider: 'mockProvider',
  }),
  queries: [
    new LLMExtractionQuery({
      code: mockGenAIField1.code,
      shape: new LLMExtractionQueryFormat({
        dataType: LLMQueryDataType.STRING,
        cardinality: LLMQueryCardinality.SCALAR,
        includeAliases: false,
      }),
      workflow: new LLMExtractionQueryWorkflow({
        nodes: [
          new LLMExtractionQueryNode({
            id: 'mockId',
            name: 'mockNodeName',
            prompt: 'prompt 1',
          }),
        ],
        edges: [],
        startNodeId: 'mockId',
        endNodeId: 'mockId',
      }),
    }),
    new LLMExtractionQuery({
      code: mockGenAIField2.code,
      shape: new LLMExtractionQueryFormat({
        dataType: LLMQueryDataType.STRING,
        cardinality: LLMQueryCardinality.SCALAR,
        includeAliases: false,
      }),
      workflow: new LLMExtractionQueryWorkflow({
        nodes: [
          new LLMExtractionQueryNode({
            id: 'mockId',
            name: 'mockNodeName',
            prompt: 'prompt 2',
          }),
        ],
        edges: [],
        startNodeId: 'mockId',
        endNodeId: 'mockId',
      }),
    }),
  ],
})

const mockDocumentType = new ExtendedDocumentType({
  code: mockDocumentTypeCode,
  name: 'Doc Type 1',
  extractionType: ExtractionType.PROTOTYPE,
  engine: KnownProcessingEngines.TESSERACT,
  fields: [
    mockExtractionField1,
    mockExtractionField2,
    mockGenAIField1,
    mockGenAIField2,
  ],
  language: KnownLanguage.ENGLISH,
  llmExtractors: [mockLLMExtractor],
  crossFieldValidators: [mockGenAIFieldValidator, mockExtractionFieldValidator],
})

documentTypeStateSelector.mockReturnValue(mockDocumentType)

test('shows tooltip with correct message when hover on Export button', async () => {
  render(<DocumentTypeExportButton />)

  const button = screen.getByRole('button')

  await userEvent.hover(button)

  await waitFor(() => {
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent(localize(Localization.EXPORT_DOCUMENT_TYPE))
  })
})

test('saves correct document type data on export button click', async () => {
  const expectedFields = [
    {
      ...mockGenAIField1,
      extractorId: mockLLMExtractor.extractorId,
    },
    {
      ...mockGenAIField2,
      extractorId: mockLLMExtractor.extractorId,
    },
  ]

  const expectedResult = {
    [EXPORT_FIELDS.NAME]: mockDocumentType.name,
    [EXPORT_FIELDS.DESCRIPTION]: mockDocumentType.description,
    [EXPORT_FIELDS.ENGINE]: mockDocumentType.engine,
    [EXPORT_FIELDS.EXTRACTION_TYPE]: mockDocumentType.extractionType,
    [EXPORT_FIELDS.LANGUAGE]: mockDocumentType.language,
    [EXPORT_FIELDS.GEN_AI_FIELDS]: expectedFields,
    [EXPORT_FIELDS.CROSS_FIELD_VALIDATORS]: [mockGenAIFieldValidator],
    [EXPORT_FIELDS.LLM_EXTRACTORS]: mockDocumentType.llmExtractors,
  }

  render(<DocumentTypeExportButton />)

  const button = screen.getByRole('button')

  await userEvent.click(button)

  expect(saveToFile).nthCalledWith(
    1,
    `${mockDocumentType.name}.json`,
    'UTF-8',
    JSON.stringify(expectedResult))
})
