
import PropTypes from 'prop-types'
import { useFormContext } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { DEFAULT_FORM_VALUES, FIELD_FORM_CODE } from '@/containers/ManageBatch/constants'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { DocTypeSelect } from '../DocTypeSelect'

export const BulkDocTypeSelect = ({ onChange, ...props }) => {
  const documentTypes = useSelector(documentTypesSelector)

  const { setValue, getValues } = useFormContext()

  const enhancedOnChange = (value) => {
    const documentType = documentTypes.find(({ code }) => code === value)
    const workflowConfiguration = documentType?.workflowConfiguration
    const targetEngine = workflowConfiguration?.engine ?? documentType?.engine
    const parsingFeatures = workflowConfiguration?.parsingFeatures ?? DEFAULT_FORM_VALUES[FIELD_FORM_CODE.PARSING_FEATURES]

    const files = getValues(FIELD_FORM_CODE.FILES)

    if (files) {
      const currentDocumentType = getValues(FIELD_FORM_CODE.DOCUMENT_TYPE)
      const currentEngine = getValues(FIELD_FORM_CODE.ENGINE)
      const currentParsingFeatures = getValues(FIELD_FORM_CODE.PARSING_FEATURES)

      files.forEach((file, index) => {
        if (
          file.settings.documentType === currentDocumentType &&
          file.settings.engine === currentEngine &&
          file.settings.parsingFeatures.length === currentParsingFeatures.length &&
          file.settings.parsingFeatures.every((feature) => currentParsingFeatures.includes(feature))
        ) {
          setValue(`${FIELD_FORM_CODE.FILES}.${index}.settings.${FIELD_FORM_CODE.DOCUMENT_TYPE}`, value)
          setValue(`${FIELD_FORM_CODE.FILES}.${index}.settings.${FIELD_FORM_CODE.ENGINE}`, targetEngine)
          setValue(`${FIELD_FORM_CODE.FILES}.${index}.settings.${FIELD_FORM_CODE.PARSING_FEATURES}`, parsingFeatures)
        }
      })
    }

    setValue(FIELD_FORM_CODE.ENGINE, targetEngine)
    setValue(FIELD_FORM_CODE.PARSING_FEATURES, parsingFeatures)

    onChange(value)
  }

  return (
    <DocTypeSelect
      {...props}
      onChange={enhancedOnChange}
    />
  )
}

BulkDocTypeSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
}
