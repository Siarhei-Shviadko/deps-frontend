
import PropTypes from 'prop-types'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useMoveLLMExtractorQueryMutation, useUpdateLLMExtractorQueryMutation } from '@/apiRTK/documentTypeApi'
import { useUpdateExtractionFieldMutation } from '@/apiRTK/extractionFieldsApi'
import { PenIcon } from '@/components/Icons/PenIcon'
import { TableActionIcon } from '@/components/TableActionIcon'
import { GenAIDrivenFieldModal } from '@/containers/GenAIDrivenFieldModal'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { FieldType } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import { documentTypeFieldShape } from '@/models/DocumentTypeField'
import {
  FIELD_TYPE_TO_LLM_QUERY_DATA_TYPE,
  LLMExtractionQuery,
  LLMExtractionQueryFormat,
} from '@/models/LLMExtractor'
import { documentTypeStateSelector } from '@/selectors/documentType'
import { notifySuccess, notifyWarning } from '@/utils/notification'

const getStringMeta = ({ displayCharLimit }) => displayCharLimit != null && { displayCharLimit }

const getDictionaryMeta = ({ displayCharLimit }) => displayCharLimit != null && { valueMeta: { displayCharLimit } }

const FIELD_TYPE_TO_META_FIELDS_MAPPING = {
  [FieldType.STRING]: getStringMeta,
  [FieldType.DICTIONARY]: getDictionaryMeta,
}

const mapFieldDataToExtractionField = (
  field,
  {
    name,
    confidential,
    displayCharLimit,
    readOnly,
    required,
  },
) => {
  const type = field.fieldType === FieldType.LIST ? field.fieldMeta.baseType : field.fieldType
  const getMetaFn = FIELD_TYPE_TO_META_FIELDS_MAPPING[type]
  const fieldTypeMeta = getMetaFn && getMetaFn({ displayCharLimit })

  const fieldMeta = field.fieldType === FieldType.LIST
    ? {
      ...field.fieldMeta,
      baseTypeMeta: {
        ...field.fieldMeta.baseTypeMeta,
        ...(fieldTypeMeta || {}),
      },
    }
    : {
      ...field.fieldMeta,
      ...(fieldTypeMeta || {}),
    }

  return ({
    ...field,
    confidential,
    fieldMeta,
    name,
    readOnly,
    required,
  })
}

const getExtractionQueryDto = (fieldCode, fieldFormData) => (
  new LLMExtractionQuery({
    code: fieldCode,
    shape: new LLMExtractionQueryFormat({
      cardinality: fieldFormData.cardinality,
      includeAliases: fieldFormData.includeAliases,
      dataType: FIELD_TYPE_TO_LLM_QUERY_DATA_TYPE[fieldFormData.fieldType],
    }),
    workflow: fieldFormData.llmWorkflow,
  })
)

const EditGenAIDrivenFieldModalButton = ({
  field,
  documentTypeCode,
  onAfterEditing,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { llmExtractors } = useSelector(documentTypeStateSelector)

  const llmExtractor = llmExtractors.find((extractor) => (
    extractor.queries.some((query) => query.code === field.code)),
  )

  const [
    updateExtractionField,
    { isLoading: isFieldUpdating },
  ] = useUpdateExtractionFieldMutation()

  const [
    moveLLMExtractorQuery,
    { isLoading: isLLMExtractorQueryMoving },
  ] = useMoveLLMExtractorQueryMutation()

  const [
    updateLLMExtractorQuery,
    { isLoading: isLLMExtractorQueryUpdating },
  ] = useUpdateLLMExtractorQueryMutation()

  const toggleModal = () => setIsModalVisible((prev) => !prev)

  const updateField = async (formValues) => {
    try {
      if (llmExtractor.extractorId !== formValues.extractorId) {
        await moveLLMExtractorQuery({
          documentTypeId: documentTypeCode,
          data: {
            sourceExtractorId: llmExtractor.extractorId,
            targetExtractorId: formValues.extractorId,
            fieldsCodes: [field.code],
          },
        }).unwrap()
      }

      await updateExtractionField({
        documentTypeCode,
        extractorId: formValues.extractorId,
        fieldCode: field.code,
        data: mapFieldDataToExtractionField(field, formValues),
      }).unwrap()

      await updateLLMExtractorQuery({
        documentTypeId: documentTypeCode,
        extractorId: formValues.extractorId,
        fieldCode: field.code,
        data: { ...getExtractionQueryDto(field.code, formValues) },
      }).unwrap()

      await onAfterEditing()
      notifySuccess(localize(Localization.FIELD_UPDATE_SUCCESS_MESSAGE))
      toggleModal()
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }

  return (
    <>
      <TableActionIcon
        disabled={isFieldUpdating || isLLMExtractorQueryUpdating}
        icon={<PenIcon />}
        onClick={toggleModal}
      />
      <GenAIDrivenFieldModal
        closeModal={toggleModal}
        field={field}
        isLoading={
          isFieldUpdating ||
          isLLMExtractorQueryUpdating ||
          isLLMExtractorQueryMoving
        }
        onSubmit={updateField}
        visible={isModalVisible}
      />
    </>
  )
}

EditGenAIDrivenFieldModalButton.propTypes = {
  onAfterEditing: PropTypes.func.isRequired,
  documentTypeCode: PropTypes.string.isRequired,
  field: documentTypeFieldShape.isRequired,
}

export {
  EditGenAIDrivenFieldModalButton,
}
