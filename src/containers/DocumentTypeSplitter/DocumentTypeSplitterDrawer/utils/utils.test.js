
import { mockEnv } from '@/mocks/mockEnv'
import {
  DEFAULT_VALUES,
  FIELD_CODE,
  FORM_FIELD_PREFIX,
} from '@/containers/DocumentTypeSplitter/shared/constants'
import { SplittingContextAttachments } from '@/enums/SplittingContextAttachments'
import { SPLITTING_MODE } from '@/enums/SplittingMode'
import { Splitter } from '@/models/Splitter'
import { getFormDefaultValues, mapSplitterToFormValues } from './utils'

jest.mock('@/utils/env', () => mockEnv)

const getFieldCode = (code) => `${FORM_FIELD_PREFIX}.${code}`

const mockSplitter = new Splitter({
  id: 'splitter-1',
  groupId: 'group-1',
  documentTypeId: 'doc-type-1',
  name: 'Splitter Name',
  llmType: 'provider/model',
  splittingQuery: 'Test query',
  description: 'Test description',
  splittingContextAttachments: [SplittingContextAttachments.FILE_IMAGES],
  splittingMode: SPLITTING_MODE.SECTION_BASED,
})

test('maps splitter to form values correctly', () => {
  const result = mapSplitterToFormValues(mockSplitter)

  expect(result).toEqual({
    [getFieldCode(FIELD_CODE.DOCUMENT_TYPE_ID)]: mockSplitter.documentTypeId,
    [getFieldCode(FIELD_CODE.NAME)]: mockSplitter.name,
    [getFieldCode(FIELD_CODE.LLM_TYPE)]: mockSplitter.llmType,
    [getFieldCode(FIELD_CODE.QUERY)]: mockSplitter.splittingQuery,
    [getFieldCode(FIELD_CODE.DESCRIPTION)]: mockSplitter.description,
    [getFieldCode(FIELD_CODE.SPLITTING_CONTEXT_ATTACHMENTS)]: mockSplitter.splittingContextAttachments,
    [getFieldCode(FIELD_CODE.SPLITTING_MODE)]: mockSplitter.splittingMode,
  })
})

test('maps null splittingContextAttachments to file layout default', () => {
  const splitter = new Splitter({
    id: 'splitter-1',
    groupId: 'group-1',
    documentTypeId: 'doc-type-1',
    name: 'Splitter Name',
    llmType: 'provider/model',
    splittingQuery: 'Test query',
    splittingContextAttachments: null,
  })

  const result = mapSplitterToFormValues(splitter)

  expect(result[getFieldCode(FIELD_CODE.SPLITTING_CONTEXT_ATTACHMENTS)]).toEqual([
    SplittingContextAttachments.FILE_LAYOUT,
  ])
})

test('returns default form values with document type id when splitter is not provided', () => {
  const documentTypeId = 'doc-type-id'

  const result = getFormDefaultValues(null, documentTypeId)

  expect(result).toEqual({
    splitter: {
      ...DEFAULT_VALUES,
      [getFieldCode(FIELD_CODE.DOCUMENT_TYPE_ID)]: documentTypeId,
    },
  })
})

test('returns mapped splitter values when splitter is provided', () => {
  const result = getFormDefaultValues(mockSplitter, 'ignored-doc-type-id')

  expect(result).toEqual({
    splitter: mapSplitterToFormValues(mockSplitter),
  })
})
