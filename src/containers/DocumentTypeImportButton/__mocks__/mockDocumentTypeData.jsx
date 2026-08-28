
import { EXPORT_FIELDS } from '@/constants/documentType'
import { ExtractionType } from '@/enums/ExtractionType'
import { FieldType } from '@/enums/FieldType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { ValidationRuleSeverity } from '@/enums/ValidationRuleSeverity'
import { CrossFieldValidator, IssueMessage } from '@/models/CrossFieldValidator'
import { DocumentTypeField } from '@/models/DocumentTypeField'
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

const mockGenAIFieldCode1 = 'genAIFieldCode1'
const mockGenAIFieldCode2 = 'genAIFieldCode2'
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

const mockLLMExtractor1 = new LLMExtractor({
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

const mockLLMExtractor2 = new LLMExtractor({
  extractorId: 'id2',
  name: 'LLM Extractor Name 2',
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
  queries: [],
})

const mockDocumentTypeData = {
  [EXPORT_FIELDS.NAME]: 'Document Type Name',
  [EXPORT_FIELDS.DESCRIPTION]: 'Document Type Description',
  [EXPORT_FIELDS.ENGINE]: KnownProcessingEngines.TESSERACT,
  [EXPORT_FIELDS.EXTRACTION_TYPE]: ExtractionType.PROTOTYPE,
  [EXPORT_FIELDS.LANGUAGE]: KnownLanguage.ENGLISH,
  [EXPORT_FIELDS.GEN_AI_FIELDS]: [
    {
      ...mockGenAIField1,
      extractorId: mockLLMExtractor1.extractorId,
    },
    {
      ...mockGenAIField2,
      extractorId: mockLLMExtractor1.extractorId,
    },
  ],
  [EXPORT_FIELDS.CROSS_FIELD_VALIDATORS]: [mockGenAIFieldValidator],
  [EXPORT_FIELDS.LLM_EXTRACTORS]: [mockLLMExtractor1, mockLLMExtractor2],
}

export {
  mockDocumentTypeData,
}
