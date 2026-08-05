import { mockEnv } from '@/mocks/mockEnv'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { mapProcessingParamsToFormValues } from './mappers'

jest.mock('@/utils/env', () => mockEnv)

test('maps processing params to form values with provided fields', () => {
  const mockGroup = {
    id: 'group-1',
    name: 'Group 1',
  }
  const result = mapProcessingParamsToFormValues({
    group: mockGroup,
    workflowParams: {
      documentTypeId: 'doc-type-1',
      engine: 'tesseract',
      llmType: 'gpt-4',
      parsingFeatures: [KnownParsingFeature.TABLES],
    },
  })

  expect(result).toEqual({
    group: mockGroup,
    engine: 'tesseract',
    llmType: 'gpt-4',
    parsingFeatures: [KnownParsingFeature.TABLES],
    needsSplittingProposalReview: true,
  })
})

test('maps processing params to form values with defaults when fields are missing', () => {
  const result = mapProcessingParamsToFormValues({})

  expect(result).toEqual({
    group: null,
    engine: null,
    llmType: null,
    parsingFeatures: [KnownParsingFeature.TEXT],
    needsSplittingProposalReview: true,
  })
})
