
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { setScrollId } from '@/actions/navigation'
import { TrashIcon } from '@/components/Icons/TrashIcon'
import { CustomSelect } from '@/components/Select'
import { usePdfSegments } from '@/containers/PdfSplitting/hooks'
import { pdfSegmentShape } from '@/containers/PdfSplitting/models'
import { getRangeDescription } from '@/containers/PdfSplitting/utils'
import { Localization, localize } from '@/localization/i18n'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import {
  CardHeader,
  SegmentCard,
  SegmentPagesRange,
  SegmentTitle,
  TitleWrapper,
  IconButton,
} from './PdfSegment.styles'

export const PdfSegment = ({
  segment,
  onDelete,
  onSelect,
  onDocTypeIdChange,
  index,
}) => {
  const documentTypes = useSelector(documentTypesSelector)
  const dispatch = useDispatch()
  const { segments, selectedGroup } = usePdfSegments()

  const typesToDisplay = selectedGroup
    ? documentTypes?.filter(({ code }) => selectedGroup.documentTypeIds?.includes(code))
    : documentTypes

  const onSelectDocumentType = (documentTypeId) => {
    onDocTypeIdChange(segment.id, documentTypeId)
  }

  const onSelectSegment = () => {
    !segment.isSelected && dispatch(setScrollId(segment.userPages[0].id))
    onSelect(segment.id)
  }

  const onDeleteHandler = (e) => {
    e.stopPropagation()

    onDelete(segment.id)
  }

  const options = typesToDisplay
    ?.map((type) => ({
      text: type.name,
      value: type.code,
    })) ?? []

  return (
    <SegmentCard
      $isSelected={segment.isSelected}
      onClick={onSelectSegment}
    >
      <CardHeader>
        <TitleWrapper>
          <SegmentTitle
            text={segment.name ?? localize(Localization.SEGMENT, { index: index + 1 })}
          />
          <SegmentPagesRange
            content={getRangeDescription(segment)}
            ellipsis={{ tooltip: getRangeDescription(segment) }}
          />
        </TitleWrapper>
        {
          segments.length > 1 && (
            <IconButton
              icon={<TrashIcon />}
              onClick={onDeleteHandler}
            />
          )
        }
      </CardHeader>
      <CustomSelect
        allowClear
        onChange={onSelectDocumentType}
        options={options}
        placeholder={localize(Localization.SET_DOCUMENT_TYPE)}
        value={segment.documentTypeId}
      />
    </SegmentCard>

  )
}

PdfSegment.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDocTypeIdChange: PropTypes.func.isRequired,
  segment: pdfSegmentShape.isRequired,
  index: PropTypes.number.isRequired,
}
