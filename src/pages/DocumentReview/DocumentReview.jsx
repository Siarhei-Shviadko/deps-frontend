
import PropTypes from 'prop-types'
import { Resizable } from 're-resizable'
import { useCallback, useEffect } from 'react'
import { connect } from 'react-redux'
import { useParams } from 'react-router'
import {
  addActivePolygons,
  clearActivePolygons,
  highlightPolygonCoordsField,
  highlightTableCoordsField,
} from '@/actions/documentReviewPage'
import { fetchDocumentData } from '@/actions/documents'
import { fetchDocumentType } from '@/actions/documentType'
import { Grid } from '@/components/Grid'
import { Content, Layout } from '@/components/Layout'
import { ReviewLayout } from '@/components/Layout/ReviewLayout'
import { UiKeys } from '@/constants/navigation'
import { PAGE_SEPARATOR_POSITION } from '@/constants/storage'
import { DocumentData } from '@/containers/DocumentData'
import { DocumentPreview } from '@/containers/DocumentPreview'
import { DocumentPromptCalibrationStudio } from '@/containers/DocumentPromptCalibrationStudio'
import { DocumentViewHeader } from '@/containers/DocumentViewHeader'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { documentShape } from '@/models/Document'
import { UNKNOWN_DOCUMENT_TYPE } from '@/models/DocumentType'
import { highlightedFieldShape } from '@/models/HighlightedField'
import { pointShape } from '@/models/Point'
import { documentSelector, highlightedFieldSelector } from '@/selectors/documentReviewPage'
import { uiSelector } from '@/selectors/navigation'
import { isDocumentDataFetchingSelector } from '@/selectors/requests'
import { activePolygonsSelector } from '@/selectors/reviewPage'
import { ENV } from '@/utils/env'
import { sessionStorageWrapper } from '@/utils/sessionStorageWrapper'
import {
  Column,
  RightResizablePage,
  ResizableWrapper,
  PageSeparator,
} from './DocumentReview.styles'

const CONTAINER_CLASS_NAME = 'antdModalContainer'
const PAGE_HALF_COLSPAN = 12
const MIN_WIDTH_LEFT = 500
const MAX_WIDTH_LEFT = '65%'
const DEFAULT_WIDTH = '45%'
const DEFAULT_HEIGHT = '100%'

const DocumentReview = ({
  document,
  fetchDocumentData,
  fetchDocumentType,
  highlightPolygonCoordsField,
  highlightTableCoordsField,
  addActivePolygons,
  clearActivePolygons,
  fetching,
  activePage,
  activeSourceId,
  activePolygons,
  highlightedField,
}) => {
  const { documentId } = useParams()

  const leftColumnWidth = sessionStorageWrapper.getItem(PAGE_SEPARATOR_POSITION)

  useEffect(() => {
    if (document.documentType.code === UNKNOWN_DOCUMENT_TYPE.code) {
      return
    }

    const extras = [
      DocumentTypeExtras.EXTRACTION_FIELDS,
      DocumentTypeExtras.WORKFLOW_CONFIGURATIONS,
    ]
    ENV.FEATURE_OUTPUT_PROFILES && extras.push(DocumentTypeExtras.PROFILES)
    ENV.FEATURE_ENRICHMENT && extras.push(DocumentTypeExtras.EXTRA_FIELDS)
    ENV.FEATURE_LLM_EXTRACTORS && extras.push(DocumentTypeExtras.LLM_EXTRACTORS)

    fetchDocumentType(document.documentType.code, extras)
  }, [
    document._id,
    document.documentType,
    fetchDocumentType,
  ])

  const handleRefreshPage = useCallback(async () => {
    if (documentId) {
      await fetchDocumentData(documentId)
    }
  }, [fetchDocumentData, documentId])

  const onChangeActiveExcelPage = useCallback((page) => {
    highlightTableCoordsField({ page })
  }, [highlightTableCoordsField])

  const onChangeActiveImagePage = useCallback((page) => {
    highlightPolygonCoordsField({ page })
  }, [highlightPolygonCoordsField])

  const onResizeStop = useCallback((_, __, ref) => {
    const relativeWidth = ref.style.width
    sessionStorageWrapper.setItem(PAGE_SEPARATOR_POSITION, relativeWidth)
  }, [])

  return (
    <>
      <DocumentPromptCalibrationStudio />
      <Content>
        <ReviewLayout>
          <DocumentViewHeader document={document} />
          <Layout.Content>
            <Grid.Row>
              <ResizableWrapper>
                <Resizable
                  defaultSize={
                    {
                      width: leftColumnWidth || DEFAULT_WIDTH,
                      height: DEFAULT_HEIGHT,
                    }
                  }
                  enable={
                    {
                      right: true,
                    }
                  }
                  maxWidth={MAX_WIDTH_LEFT}
                  minWidth={MIN_WIDTH_LEFT}
                  onResizeStop={onResizeStop}
                >
                  <Column
                    span={PAGE_HALF_COLSPAN}
                  >
                    <DocumentPreview
                      activePage={activePage}
                      activePolygons={activePolygons}
                      activeSourceId={activeSourceId}
                      addActivePolygons={addActivePolygons}
                      clearActivePolygons={clearActivePolygons}
                      document={document}
                      fetching={fetching}
                      highlightedField={highlightedField}
                      onChangeActiveExcelPage={onChangeActiveExcelPage}
                      onChangeActiveImagePage={onChangeActiveImagePage}
                      onRefreshPage={handleRefreshPage}
                    />
                  </Column>
                </Resizable>
                <PageSeparator />
                <RightResizablePage>
                  <Column
                    className={CONTAINER_CLASS_NAME}
                    span={PAGE_HALF_COLSPAN}
                  >
                    <DocumentData />
                  </Column>
                </RightResizablePage>
              </ResizableWrapper>
            </Grid.Row>
          </Layout.Content>
        </ReviewLayout>
      </Content>
    </>
  )
}

DocumentReview.propTypes = {
  document: documentShape.isRequired,
  highlightPolygonCoordsField: PropTypes.func.isRequired,
  highlightTableCoordsField: PropTypes.func.isRequired,
  addActivePolygons: PropTypes.func.isRequired,
  clearActivePolygons: PropTypes.func.isRequired,
  fetchDocumentData: PropTypes.func.isRequired,
  fetchDocumentType: PropTypes.func.isRequired,
  fetching: PropTypes.bool.isRequired,
  activePage: PropTypes.number,
  activeSourceId: PropTypes.string,
  activePolygons: PropTypes.arrayOf(
    PropTypes.arrayOf(pointShape),
  ),
  highlightedField: highlightedFieldShape,
}

const mapStateToProps = (state) => ({
  document: documentSelector(state),
  fetching: isDocumentDataFetchingSelector(state),
  highlightedField: highlightedFieldSelector(state),
  activePolygons: activePolygonsSelector(state),
  activePage: uiSelector(state)[UiKeys.ACTIVE_PAGE] || 1,
  activeSourceId: uiSelector(state)[UiKeys.ACTIVE_SOURCE_ID],
})

const ConnectedComponent = connect(mapStateToProps, {
  fetchDocumentData,
  fetchDocumentType,
  highlightPolygonCoordsField,
  highlightTableCoordsField,
  addActivePolygons,
  clearActivePolygons,
})(DocumentReview)

export {
  ConnectedComponent as DocumentReview,
}
