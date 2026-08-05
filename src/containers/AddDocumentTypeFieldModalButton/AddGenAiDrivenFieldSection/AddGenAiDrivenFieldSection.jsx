
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDocumentType } from '@/actions/documentType'
import { useCreateLLMExtractorQueryMutation } from '@/apiRTK/documentTypeApi'
import { useCreateExtractionFieldMutation } from '@/apiRTK/extractionFieldsApi'
import { ModalOptionTrigger } from '@/components/ModalOptionTrigger'
import { GenAIDrivenFieldModal } from '@/containers/GenAIDrivenFieldModal'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { FieldType } from '@/enums/FieldType'
import { localize, Localization } from '@/localization/i18n'
import {
  LLMQueryCardinality,
  LLMExtractionQuery,
  LLMExtractionQueryFormat,
  FIELD_TYPE_TO_LLM_QUERY_DATA_TYPE,
} from '@/models/LLMExtractor'
import { documentTypeStateSelector } from '@/selectors/documentType'
import { notifySuccess, notifyWarning } from '@/utils/notification'

const getDictionaryMeta = ({ displayCharLimit }) => ({
  keyType: FieldType.STRING,
  valueType: FieldType.STRING,
  ...(displayCharLimit != null && { valueMeta: { displayCharLimit } }),
})

const getStringMeta = ({ displayCharLimit }) => displayCharLimit && { displayCharLimit }

const getListMeta = ({ baseType, baseTypeMeta }) => ({
  baseType,
  baseTypeMeta,
})

const FIELD_TYPE_TO_META_FIELDS_MAPPING = {
  [FieldType.DICTIONARY]: getDictionaryMeta,
  [FieldType.STRING]: getStringMeta,
}

const mapFieldDataToExtractionField = ({
  name,
  readOnly,
  confidential,
  displayCharLimit,
  extractorId,
  fieldType,
  cardinality,
  required,
}) => {
  const getMetaFn = FIELD_TYPE_TO_META_FIELDS_MAPPING[fieldType]
  const fieldTypeMeta = getMetaFn && getMetaFn({ displayCharLimit })

  const fieldMeta = cardinality === LLMQueryCardinality.LIST
    ? getListMeta({
      baseType: fieldType,
      baseTypeMeta: fieldTypeMeta || {},
    })
    : fieldTypeMeta

  return ({
    confidential,
    fieldMeta: fieldMeta || {},
    fieldType: cardinality === LLMQueryCardinality.LIST ? FieldType.LIST : fieldType,
    extractorId,
    name,
    readOnly,
    required,
  })
}

const mapFieldDataToQuery = (code, fieldData) =>
  new LLMExtractionQuery({
    code,
    shape: new LLMExtractionQueryFormat({
      cardinality: fieldData.cardinality,
      includeAliases: fieldData.includeAliases,
      dataType: FIELD_TYPE_TO_LLM_QUERY_DATA_TYPE[fieldData.fieldType],
    }),
    workflow: fieldData.llmWorkflow,
  })

const AddGenAiDrivenFieldSection = () => {
  const dispatch = useDispatch()
  const documentType = useSelector(documentTypeStateSelector)

  const [isModalVisible, setIsModalVisible] = useState(false)

  const refreshDocumentType = () => {
    dispatch(fetchDocumentType(
      documentType.code,
      [
        DocumentTypeExtras.EXTRACTION_FIELDS,
        DocumentTypeExtras.LLM_EXTRACTORS,
      ]),
    )
  }

  const [
    createExtractionField,
    { isLoading: isFieldCreation },
  ] = useCreateExtractionFieldMutation()
  const [
    createLLMExtractorQuery,
    { isLoading: isLLMExtractorQueryCreation },
  ] = useCreateLLMExtractorQueryMutation()

  const toggleModal = () => {
    setIsModalVisible((prev) => !prev)
  }

  const createField = async (fieldData) => {
    try {
      const extractionField = await createExtractionField({
        documentTypeCode: documentType.code,
        field: mapFieldDataToExtractionField(fieldData),
      }).unwrap()

      await createLLMExtractorQuery({
        documentTypeId: documentType.code,
        extractorId: fieldData.extractorId,
        data: { ...mapFieldDataToQuery(extractionField.code, fieldData) },
      }).unwrap()

      notifySuccess(localize(Localization.FIELD_CREATION_SUCCESS_MESSAGE))
      toggleModal()
      await refreshDocumentType()
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }

  return (
    <>
      <ModalOptionTrigger
        description={localize(Localization.GEN_AI_DRIVEN_FIELD_DESCRIPTION)}
        onClick={toggleModal}
        title={localize(Localization.GEN_AI_DRIVEN_FIELD)}
      />
      <GenAIDrivenFieldModal
        closeModal={toggleModal}
        isLoading={isFieldCreation || isLLMExtractorQueryCreation}
        onSubmit={createField}
        visible={isModalVisible}
      />
    </>
  )
}

export {
  AddGenAiDrivenFieldSection,
}
