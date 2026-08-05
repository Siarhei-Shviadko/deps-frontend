
import PropTypes from 'prop-types'
import {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { useDispatch } from 'react-redux'
import { setActivePdfPage, setHighlightedField } from '@/actions/documentReviewPage'
import { NoData } from '@/components/NoData'
import { RadioOptionType, RadioButtonStyle } from '@/components/Radio'
import {
  DOCUMENT_LAYOUT_FEATURE_TO_LAYOUT_TYPE,
  DOCUMENT_LAYOUT_TYPE,
  DOCUMENT_LAYOUT_PARSING_TYPE,
} from '@/enums/DocumentLayoutType'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { localize, Localization } from '@/localization/i18n'
import { INITIAL_PAGE } from './constants'
import {
  StyledRadioGroup,
  StyledRadio,
  SubHeader,
  Wrapper,
  ContentArea,
} from './EntityLayout.styles'
import { ImageLayout } from './ImageLayout'
import { KeyValuePairLayout } from './KeyValuePairLayout'
import { LayoutPagination } from './LayoutPagination'
import { LayoutSelect } from './LayoutSelect'
import { ParagraphLayout } from './ParagraphLayout'
import { TableLayout } from './TableLayout'

const DOCUMENT_LAYOUT_TYPE_TO_TAB_TITLE = {
  [DOCUMENT_LAYOUT_TYPE.TABLES]: localize(Localization.TABLES),
  [DOCUMENT_LAYOUT_TYPE.PARAGRAPHS]: localize(Localization.PARAGRAPHS),
  [DOCUMENT_LAYOUT_TYPE.KEY_VALUE_PAIRS]: localize(Localization.KEY_VALUE_PAIRS),
  [DOCUMENT_LAYOUT_TYPE.IMAGES]: localize(Localization.IMAGES),
}

const DOCUMENT_LAYOUT_DATA_TO_RENDER = {
  [DOCUMENT_LAYOUT_TYPE.PARAGRAPHS]: ParagraphLayout,
  [DOCUMENT_LAYOUT_TYPE.KEY_VALUE_PAIRS]: KeyValuePairLayout,
  [DOCUMENT_LAYOUT_TYPE.TABLES]: TableLayout,
  [DOCUMENT_LAYOUT_TYPE.IMAGES]: ImageLayout,
}

const parsingFeaturesOrder = [
  KnownParsingFeature.TEXT,
  KnownParsingFeature.TABLES,
  KnownParsingFeature.KEY_VALUE_PAIRS,
  KnownParsingFeature.IMAGES,
]

const MERGED_TABLE_ID = 'merged-table'

const getMergedTablesList = (mergedTables = []) => mergedTables
  .flatMap((item, index) =>
    item.tables.map((tableInfo) => ({
      ...tableInfo,
      parentId: `${MERGED_TABLE_ID}-${index}`,
    })),
  )

export const EntityLayout = ({ rawParsingInfoData }) => {
  const dispatch = useDispatch()
  const [selectedParsingType, setSelectedParsingType] = useState('')
  const [activeFeature, setActiveFeature] = useState('')
  const [currentPage, setCurrentPage] = useState(INITIAL_PAGE)

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
    dispatch(setActivePdfPage(page))
    dispatch(setHighlightedField(null))
  }, [dispatch])

  const parsingInfoData = useMemo(() => {
    if (
      !selectedParsingType ||
      !rawParsingInfoData?.documentLayoutInfo ||
      !Object.values(rawParsingInfoData.documentLayoutInfo.parsingFeatures).length
    ) {
      return null
    }

    const parsingFeatures = rawParsingInfoData.documentLayoutInfo.parsingFeatures[selectedParsingType] ?? []

    const mergedTables = rawParsingInfoData.documentLayoutInfo.mergedTables[selectedParsingType]

    const orderedFeatures = [...parsingFeatures].sort((a, b) => parsingFeaturesOrder.indexOf(a) - parsingFeaturesOrder.indexOf(b))

    return {
      features: orderedFeatures,
      mergedTables: getMergedTablesList(mergedTables),
      totalPages: rawParsingInfoData.documentLayoutInfo.pagesInfo[selectedParsingType]?.pagesCount ?? 0,
    }
  }, [rawParsingInfoData, selectedParsingType])

  const handleRadioChange = (e) => {
    setActiveFeature(e.target.value)
  }

  const renderRadioButtons = useCallback(() => {
    if (!parsingInfoData?.features?.length) {
      return null
    }

    return parsingInfoData.features.map((f) => {
      const type = DOCUMENT_LAYOUT_FEATURE_TO_LAYOUT_TYPE[f]
      const title = DOCUMENT_LAYOUT_TYPE_TO_TAB_TITLE[type]

      return (
        <StyledRadio
          key={type}
          optionType={RadioOptionType.BUTTON}
          value={type}
        >
          {title}
        </StyledRadio>
      )
    })
  }, [parsingInfoData])

  const renderSelectedContent = useCallback(() => {
    const DocumentLayoutComponent = DOCUMENT_LAYOUT_DATA_TO_RENDER[activeFeature]

    return (
      <DocumentLayoutComponent
        key={selectedParsingType}
        batchIndex={currentPage - 1}
        parsingType={selectedParsingType}
        {...(
          activeFeature === DOCUMENT_LAYOUT_TYPE.TABLES &&
          { mergedTables: parsingInfoData.mergedTables }
        )}
      />
    )
  }, [
    activeFeature,
    currentPage,
    parsingInfoData,
    selectedParsingType,
  ])

  useEffect(() => {
    if (parsingInfoData?.features?.length && !activeFeature) {
      const firstOption = DOCUMENT_LAYOUT_FEATURE_TO_LAYOUT_TYPE[parsingInfoData.features[0]]
      setActiveFeature(firstOption)
    }
  }, [parsingInfoData, activeFeature])

  useEffect(() => {
    if (rawParsingInfoData?.documentLayoutInfo?.parsingFeatures && !selectedParsingType) {
      const initialOption = Object.keys(rawParsingInfoData.documentLayoutInfo.parsingFeatures)
        .find((parsingType) => parsingType === DOCUMENT_LAYOUT_PARSING_TYPE.USER_DEFINED) ??
        Object.keys(rawParsingInfoData.documentLayoutInfo.parsingFeatures)[0]

      setSelectedParsingType(initialOption)
    }
  }, [rawParsingInfoData, selectedParsingType])

  return (
    <Wrapper>
      <SubHeader>
        <LayoutSelect
          rawParsingInfoData={rawParsingInfoData}
          selectedParsingType={selectedParsingType}
          setSelectedParsingType={setSelectedParsingType}
        />
        {
          activeFeature && (
            <StyledRadioGroup
              buttonStyle={RadioButtonStyle.SOLID}
              onChange={handleRadioChange}
              value={activeFeature}
            >
              {renderRadioButtons()}
            </StyledRadioGroup>
          )
        }
      </SubHeader>
      <ContentArea>
        {activeFeature && renderSelectedContent()}
        {
          !activeFeature && (
            <NoData description={localize(Localization.NOTHING_TO_DISPLAY)} />
          )
        }
      </ContentArea>
      {
        activeFeature && (
          <LayoutPagination
            currentPage={currentPage}
            onPageChange={handlePageChange}
            total={parsingInfoData?.totalPages}
          />
        )
      }
    </Wrapper>
  )
}

EntityLayout.propTypes = {
  rawParsingInfoData: PropTypes.shape({
    documentLayoutInfo: PropTypes.shape({
      parsingFeatures: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
      mergedTables: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.any)),
      pagesInfo: PropTypes.objectOf(PropTypes.shape({
        pagesCount: PropTypes.number,
      })),
    }),
  }),
}
