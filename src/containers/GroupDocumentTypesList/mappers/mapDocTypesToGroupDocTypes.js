
import { ExtractionType } from '@/enums/ExtractionType'
import { GroupDocumentType } from '../GroupDocumentType'

const CustomModelTypes = [
  ExtractionType.ML,
  ExtractionType.PLUGIN,
  ExtractionType.PULLABLE_ML,
]

const getExtractionType = (extractionType) => {
  if (!extractionType) {
    return ExtractionType.AI_PROMPTED
  }

  if (CustomModelTypes.includes(extractionType)) {
    return ExtractionType.CUSTOM_MODEL
  }

  return extractionType
}

const getClassifier = (documentTypeId, classifiersList) => (
  classifiersList.find((classifier) => classifier.documentTypeId === documentTypeId)
)

const getSplitter = (documentTypeId, splittersList) => (
  splittersList.find((splitter) => splitter.documentTypeId === documentTypeId)
)

export const mapDocTypeToGroupDocType = ({
  documentType,
  classifiers,
  splitters,
  groupId,
}) =>
  new GroupDocumentType({
    id: documentType.code,
    groupId,
    name: documentType.name,
    classifier: getClassifier(documentType.code, classifiers),
    splitter: getSplitter(documentType.code, splitters),
    extractionType: getExtractionType(documentType.extractionType),
  })
