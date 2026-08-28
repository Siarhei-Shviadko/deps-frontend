
import get from 'lodash/get'
import { createSelector } from 'reselect'
import {
  extractArea,
  saveDocument,
  startReview,
  completeReview,
  runPipelineFromStep,
  updateDocumentType,
  skipValidation,
  detectTableData,
  getDocumentState,
  getDocumentError,
  saveExtractedDataField,
  extractAreaWithAlgorithm,
} from '@/actions/documentReviewPage'
import {
  fetchDocumentData,
  addLabel,
  removeLabel,
  extractData,
  deleteDocuments,
} from '@/actions/documents'
import { fetchDocumentsByFilter, updateDocumentsType } from '@/actions/documentsListPage'
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

const rootSelector = (state) => get(state, 'requests')

const pendingSelector = createSelector(
  [rootSelector],
  (request) => get(request, 'pending'),
)

const isFetchingSelector = (action) => createSelector(
  [pendingSelector],
  (pending) => pending.includes(action.toString()),
)

const areLanguagesFetchingSelector = isFetchingSelector(fetchAvailableLanguages)

const areLabelsFetchingSelector = isFetchingSelector(fetchLabels)
const areEnginesFetchingSelector = isFetchingSelector(fetchProcessingEngines)
const areDocumentStatesFetchingSelector = isFetchingSelector(fetchDocumentStates)
const areTypesFetchingSelector = isFetchingSelector(fetchDocumentTypes)
const isDocumentTypeFetchingSelector = isFetchingSelector(fetchDocumentType)
const areDocumentsFetchingSelector = isFetchingSelector(fetchDocumentsByFilter)
const areDocumentsTypeUpdatingSelector = isFetchingSelector(updateDocumentsType)
const areDocumentsDataExtractingSelector = isFetchingSelector(extractData)
const areDocumentsReviewStartingSelector = isFetchingSelector(startReview)
const areDocumentsDeletingSelector = isFetchingSelector(deleteDocuments)
const isLabelAddingSelector = isFetchingSelector(addLabel)
const isLabelCreatingSelector = isFetchingSelector(createLabel)
const isLabelDeletingSelector = isFetchingSelector(removeLabel)
const isDocumentErrorGettingSelector = isFetchingSelector(getDocumentError)
const isDocumentDataFetchingSelector = isFetchingSelector(fetchDocumentData)
const isDocumentSavingSelector = isFetchingSelector(saveDocument)
const isReviewStartingSelector = isFetchingSelector(startReview)
const isReviewCompletingSelector = isFetchingSelector(completeReview)
const isPipelineRunningSelector = isFetchingSelector(runPipelineFromStep)
const isDocumentTypeUpdatingSelector = isFetchingSelector(updateDocumentType)
const isDataExtractingSelector = isFetchingSelector(extractData)
const isDocumentValidationSkippingSelector = isFetchingSelector(skipValidation)
const isTableDataDetectingSelector = isFetchingSelector(detectTableData)
const isAreaExtractingSelector = isFetchingSelector(extractArea)
const isAreaExtractingWithAlgorithmSelector = isFetchingSelector(extractAreaWithAlgorithm)
const isDocumentStateGettingSelector = isFetchingSelector(getDocumentState)
const isExtractedDataFieldSavingSelector = isFetchingSelector(saveExtractedDataField)

const isTrialLimitationsInfoFetchingSelector = isFetchingSelector(fetchTrialLimitationsInfo)

const areGenAiFieldsFetchingSelector = isFetchingSelector(fetchGenAiFields)
const areGenAiFieldsDeletingSelector = isFetchingSelector(deleteGenAiFields)

export {
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
  isAreaExtractingWithAlgorithmSelector,
  isDocumentStateGettingSelector,
  isDocumentErrorGettingSelector,
  isExtractedDataFieldSavingSelector,
  isTrialLimitationsInfoFetchingSelector,
  areGenAiFieldsFetchingSelector,
  areGenAiFieldsDeletingSelector,
}
