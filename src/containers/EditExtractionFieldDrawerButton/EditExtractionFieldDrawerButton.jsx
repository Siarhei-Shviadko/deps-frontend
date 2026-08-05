
import PropTypes from 'prop-types'
import { useUpdateExtractionFieldMutation } from '@/apiRTK/extractionFieldsApi'
import { PenIcon } from '@/components/Icons/PenIcon'
import { TableActionIcon } from '@/components/TableActionIcon'
import { CreateOrChangeTypeFieldDrawerButton } from '@/containers/CreateOrChangeTypeFieldDrawerButton'
import { FieldType } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import { documentTypeFieldShape } from '@/models/DocumentTypeField'
import { notifySuccess, notifyWarning } from '@/utils/notification'

const SUPPORTED_FIELD_TYPES = [
  FieldType.STRING,
  FieldType.CHECKMARK,
  FieldType.DATE,
  FieldType.ENUM,
  FieldType.DICTIONARY,
]

const EditExtractionFieldDrawerButton = ({
  documentTypeCode,
  onAfterEditing,
  field,
}) => {
  const [
    updateExtractionField,
    { isLoading },
  ] = useUpdateExtractionFieldMutation()

  const onSaveExtractionField = async (updatedField) => {
    try {
      await updateExtractionField({
        documentTypeCode,
        fieldCode: field.code,
        data: updatedField,
      }).unwrap()
      notifySuccess(localize(Localization.FIELD_UPDATE_SUCCESS_MESSAGE))
      onAfterEditing()
    } catch {
      notifyWarning(localize(Localization.DEFAULT_ERROR))
    }
  }

  const renderTrigger = (onClick) => (
    <TableActionIcon
      disabled={isLoading}
      icon={<PenIcon />}
      onClick={onClick}
    />
  )

  return (
    <CreateOrChangeTypeFieldDrawerButton
      allowedFieldTypes={SUPPORTED_FIELD_TYPES}
      fetching={isLoading}
      field={field}
      onSave={onSaveExtractionField}
      renderTrigger={renderTrigger}
    />
  )
}

EditExtractionFieldDrawerButton.propTypes = {
  onAfterEditing: PropTypes.func.isRequired,
  field: documentTypeFieldShape.isRequired,
  documentTypeCode: PropTypes.string.isRequired,
}

export {
  EditExtractionFieldDrawerButton,
}
