
import { mockEnv } from '@/mocks/mockEnv'
import {
  extractArea,
  saveDocument,
  completeReview,
  runPipelineFromStep,
  updateDocumentType,
  skipValidation,
  detectTableData,
  getDocumentState,
  saveExtractedDataField,
  startReview,
} from '@/actions/documentReviewPage'
import {
  fetchDocumentData,
  addLabel,
  removeLabel,
  extractData,
  deleteDocuments,
} from '@/actions/documents'
import {
  fetchDocumentsByFilter,
  updateDocumentsType,
} from '@/actions/documentsListPage'
import { fetchDocumentStates } from '@/actions/documentStates'
import {
  fetchDocumentType,
} from '@/actions/documentType'
import { fetchDocumentTypes } from '@/actions/documentTypes'
import { fetchProcessingEngines } from '@/actions/engines'
import { deleteFields as deleteGenAiFields, fetchGenAiFields } from '@/actions/genAiData'
import { fetchLabels, createLabel } from '@/actions/labels'
import { fetchAvailableLanguages } from '@/actions/languages'
import { fetchTrialLimitationsInfo } from '@/actions/trial'
import {
  areLanguagesFetchingSelector,
  areLabelsFetchingSelector,
  areEnginesFetchingSelector,
  areDocumentStatesFetchingSelector,
  areTypesFetchingSelector,
  isDocumentTypeFetchingSelector,
  areDocumentsFetchingSelector,
  areDocumentsTypeUpdatingSelector,
  areDocumentsDataExtractingSelector,
  areDocumentsReviewStartingSelector,
  areDocumentsDeletingSelector,
  isLabelAddingSelector,
  isLabelCreatingSelector,
  isLabelDeletingSelector,
  isDocumentDataFetchingSelector,
  isDocumentSavingSelector,
  isReviewCompletingSelector,
  isReviewStartingSelector,
  isPipelineRunningSelector,
  isDocumentTypeUpdatingSelector,
  isDataExtractingSelector,
  isDocumentValidationSkippingSelector,
  isTableDataDetectingSelector,
  isAreaExtractingSelector,
  isDocumentStateGettingSelector,
  isExtractedDataFieldSavingSelector,
  isTrialLimitationsInfoFetchingSelector,
  areGenAiFieldsFetchingSelector,
  areGenAiFieldsDeletingSelector,
} from './requests'

jest.mock('@/utils/env', () => mockEnv)

describe('Selectors: requests', () => {
  let state

  beforeEach(() => {
    state = {
      requests: {
        pending: [
          extractArea.toString(),
          saveDocument.toString(),
          completeReview.toString(),
          runPipelineFromStep.toString(),
          updateDocumentType.toString(),
          skipValidation.toString(),
          detectTableData.toString(),
          fetchDocumentData.toString(),
          addLabel.toString(),
          removeLabel.toString(),
          startReview.toString(),
          extractData.toString(),
          deleteDocuments.toString(),
          fetchDocumentsByFilter.toString(),
          updateDocumentsType.toString(),
          fetchDocumentType.toString(),
          fetchDocumentTypes.toString(),
          fetchDocumentStates.toString(),
          fetchProcessingEngines.toString(),
          fetchLabels.toString(),
          createLabel.toString(),
          fetchAvailableLanguages.toString(),
          getDocumentState.toString(),
          saveExtractedDataField.toString(),
          fetchTrialLimitationsInfo.toString(),
          fetchGenAiFields.toString(),
          deleteGenAiFields.toString(),
        ],
      },
    }
  })

  it('selector: areLanguagesFetchingSelector', () => {
    expect(areLanguagesFetchingSelector(state)).toBe(true)
  })

  it('selector: areLabelsFetchingSelector', () => {
    expect(areLabelsFetchingSelector(state)).toBe(true)
  })

  it('selector: areEnginesFetchingSelector', () => {
    expect(areEnginesFetchingSelector(state)).toBe(true)
  })

  it('selector: areDocumentStatesFetchingSelector', () => {
    expect(areDocumentStatesFetchingSelector(state)).toBe(true)
  })

  it('selector: areTypesFetchingSelector', () => {
    expect(areTypesFetchingSelector(state)).toBe(true)
  })

  it('selector: isDocumentTypeFetchingSelector', () => {
    expect(isDocumentTypeFetchingSelector(state)).toBe(true)
  })

  it('selector: areDocumentsFetchingSelector', () => {
    expect(areDocumentsFetchingSelector(state)).toBe(true)
  })

  it('selector: areDocumentsTypeUpdatingSelector', () => {
    expect(areDocumentsTypeUpdatingSelector(state)).toBe(true)
  })

  it('selector: areDocumentsDataExtractingSelector', () => {
    expect(areDocumentsDataExtractingSelector(state)).toBe(true)
  })

  it('selector: areDocumentsReviewStartingSelector', () => {
    expect(areDocumentsReviewStartingSelector(state)).toBe(true)
  })

  it('selector: areDocumentsDeletingSelector', () => {
    expect(areDocumentsDeletingSelector(state)).toBe(true)
  })

  it('selector: isLabelAddingSelector', () => {
    expect(isLabelAddingSelector(state)).toBe(true)
  })

  it('selector: isLabelCreatingSelector', () => {
    expect(isLabelCreatingSelector(state)).toBe(true)
  })

  it('selector: isLabelDeletingSelector', () => {
    expect(isLabelDeletingSelector(state)).toBe(true)
  })

  it('selector: isDocumentDataFetchingSelector', () => {
    expect(isDocumentDataFetchingSelector(state)).toBe(true)
  })

  it('selector: isDocumentSavingSelector', () => {
    expect(isDocumentSavingSelector(state)).toBe(true)
  })

  it('selector: isReviewCompletingSelector', () => {
    expect(isReviewCompletingSelector(state)).toBe(true)
  })

  it('selector: isReviewStartingSelector', () => {
    expect(isReviewStartingSelector(state)).toBe(true)
  })

  it('selector: isPipelineRunningSelector', () => {
    expect(isPipelineRunningSelector(state)).toBe(true)
  })

  it('selector: isDocumentTypeUpdatingSelector', () => {
    expect(isDocumentTypeUpdatingSelector(state)).toBe(true)
  })

  it('selector: isDataExtractingSelector', () => {
    expect(isDataExtractingSelector(state)).toBe(true)
  })

  it('selector: isDocumentValidationSkippingSelector', () => {
    expect(isDocumentValidationSkippingSelector(state)).toBe(true)
  })

  it('selector: isTableDataDetectingSelector', () => {
    expect(isTableDataDetectingSelector(state)).toBe(true)
  })

  it('selector: isAreaExtractingSelector', () => {
    expect(isAreaExtractingSelector(state)).toBe(true)
  })

  it('selector: isDocumentStateGettingSelector', () => {
    expect(isDocumentStateGettingSelector(state)).toBe(true)
  })

  it('selector: isExtractedDataFieldSavingSelector', () => {
    expect(isExtractedDataFieldSavingSelector(state)).toBe(true)
  })

  it('selector: isTrialLimitationsInfoFetchingSelector', () => {
    expect(isTrialLimitationsInfoFetchingSelector(state)).toBe(true)
  })

  it('selector: areGenAiFieldsFetchingSelector', () => {
    expect(areGenAiFieldsFetchingSelector(state)).toBe(true)
  })

  it('selector: areGenAiFieldsDeletingSelector', () => {
    expect(areGenAiFieldsDeletingSelector(state)).toBe(true)
  })
})
