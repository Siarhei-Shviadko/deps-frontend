
import PropTypes from 'prop-types'
import { Badge } from '@/components/Badge'
import { LabelingIcon } from '@/components/Icons/LabelingIcon'
import { useHighlightCoords } from '@/containers/ParsingLayout/EntityLayout/hooks'
import { DOCUMENT_LAYOUT_PARSING_TYPE } from '@/enums/DocumentLayoutType'
import { Placement } from '@/enums/Placement'
import { Localization, localize } from '@/localization/i18n'
import { paragraphLayoutShape } from '@/models/DocumentLayout'
import { LineLayout } from '../LineLayout'
import {
  LinesWrapper,
  ParagraphWrapper,
  IconButton,
  InView,
} from './ParagraphField.styles'

const PARAGRAPH_FIELD_TOOLTIP = {
  placement: Placement.TOP,
  title: localize(Localization.HIGHLIGHT_PARAGRAPH),
}

const ParagraphField = ({
  page,
  paragraph,
  pageId,
  parsingType,
}) => {
  const { highlightCoords } = useHighlightCoords()

  const onClickHandler = () => {
    highlightCoords({
      field: [paragraph.polygon],
      page,
    })
  }

  return (
    <InView>
      <ParagraphWrapper>
        <Badge>
          <IconButton
            icon={<LabelingIcon />}
            onClick={onClickHandler}
            tooltip={PARAGRAPH_FIELD_TOOLTIP}
          />
        </Badge>
        <LinesWrapper>
          {
            paragraph.lines.map((line, index) => (
              <LineLayout
                key={index}
                line={line}
                page={page}
                pageId={pageId}
                paragraphId={paragraph.id}
                parsingType={parsingType}
              />
            ))
          }
        </LinesWrapper>
      </ParagraphWrapper>
    </InView>
  )
}

ParagraphField.propTypes = {
  page: PropTypes.number.isRequired,
  paragraph: paragraphLayoutShape.isRequired,
  pageId: PropTypes.string.isRequired,
  parsingType: PropTypes.oneOf(
    Object.values(DOCUMENT_LAYOUT_PARSING_TYPE),
  ).isRequired,
}

export { ParagraphField }
