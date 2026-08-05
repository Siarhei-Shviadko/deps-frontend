
import PropTypes from 'prop-types'
import { useFormContext, useWatch } from 'react-hook-form'
import { FIELD_FORM_CODE } from '@/containers/ManageBatch/constants'
import { ParsingFeaturesSwitch } from '@/containers/ParsingFeaturesSwitch'

export const BulkParsingFeaturesSelect = ({ onChange, ...props }) => {
  const { setValue, getValues } = useFormContext()

  const selectedEngine = useWatch({ name: FIELD_FORM_CODE.ENGINE })

  const enhancedOnChange = (value) => {
    const files = getValues(FIELD_FORM_CODE.FILES)

    if (files) {
      const currentDocumentType = getValues(FIELD_FORM_CODE.DOCUMENT_TYPE)
      const currentEngine = getValues(FIELD_FORM_CODE.ENGINE)
      const currentLlmType = getValues(FIELD_FORM_CODE.LLM_TYPE)
      const currentParsingFeatures = getValues(FIELD_FORM_CODE.PARSING_FEATURES)

      files.forEach((file, index) => {
        if (
          file.settings.documentType === currentDocumentType &&
          file.settings.engine === currentEngine &&
          file.settings.llmType === currentLlmType &&
          file.settings.parsingFeatures.length === currentParsingFeatures.length &&
          file.settings.parsingFeatures.every((feature) => currentParsingFeatures.includes(feature))
        ) {
          setValue(`${FIELD_FORM_CODE.FILES}.${index}.settings.${FIELD_FORM_CODE.PARSING_FEATURES}`, value)
        }
      })
    }

    onChange(value)
  }

  return (
    <ParsingFeaturesSwitch
      {...props}
      engineCode={selectedEngine}
      onChange={enhancedOnChange}
    />
  )
}

BulkParsingFeaturesSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
}
