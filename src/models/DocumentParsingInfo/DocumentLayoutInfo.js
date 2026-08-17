import PropTypes from 'prop-types'
import { DOCUMENT_LAYOUT_PARSING_TYPE } from '@/enums/DocumentLayoutType'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'

class DocumentLayoutInfo {
  constructor ({
    documentLayoutId,
    parsingFeatures,
    pagesInfo,
    mergedTables,
  }) {
    this.documentLayoutId = documentLayoutId
    this.parsingFeatures = parsingFeatures
    this.pagesInfo = pagesInfo
    this.mergedTables = mergedTables
  }

  static getParsingType = (documentLayoutInfo) => Object.keys(documentLayoutInfo.parsingFeatures)

  static getParsingTypeAndFeatures = (documentLayoutInfo) => {
    if (documentLayoutInfo.parsingFeatures.USER_DEFINED) {
      return {
        parsingType: DOCUMENT_LAYOUT_PARSING_TYPE.USER_DEFINED,
        features: documentLayoutInfo.parsingFeatures.USER_DEFINED,
      }
    }

    return (
      Object.entries(documentLayoutInfo.parsingFeatures).reduce(
        (acc, currentItem) => {
          const [type, features] = currentItem

          if (!acc.features || features.length >= acc.features.length) {
            acc.parsingType = type
            acc.features = features
          }
          return acc
        }, {})
    )
  }
}

const documentLayoutInfoShape = PropTypes.shape({
  documentLayoutId: PropTypes.string.isRequired,
  parsingFeatures: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.oneOf(Object.values(KnownParsingFeature)),
    ),
  ),
  pagesInfo: PropTypes.objectOf(
    PropTypes.shape({
      pagesCount: PropTypes.number.isRequired,
    }),
  ),
  mergedTables: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        tables: PropTypes.arrayOf(PropTypes.shape({
          tableId: PropTypes.string.isRequired,
          pageNumber: PropTypes.number.isRequired,
        })),
      }),
    ),
  ),
})

export {
  DocumentLayoutInfo,
  documentLayoutInfoShape,
}
