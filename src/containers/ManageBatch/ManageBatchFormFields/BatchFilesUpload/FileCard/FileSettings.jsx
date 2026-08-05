
import PropTypes from 'prop-types'
import { useCallback, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { ExtractionLLMSelect } from '@/containers/ExtractionLLMSelect'
import { DEFAULT_FORM_VALUES, FIELD_FORM_CODE } from '@/containers/ManageBatch/constants'
import {
  DocTypeSelect,
  EngineSelect,
} from '@/containers/ManageBatch/ManageBatchFormFields'
import { ParsingFeaturesSwitch } from '@/containers/ParsingFeaturesSwitch'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { localize, Localization } from '@/localization/i18n'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { ENV } from '@/utils/env'
import {
  FormItem,
  FileSettingsWrapper,
} from './FileCard.styles'

const generateFieldCode = (fieldCode, index) => `${FIELD_FORM_CODE.FILES}.${index}.settings.${fieldCode}`

export const FileSettings = ({ index, isVisible }) => {
  const documentTypes = useSelector(documentTypesSelector)

  const { setValue } = useFormContext()

  const topSelectedEngine = useWatch({ name: FIELD_FORM_CODE.ENGINE })
  const currentSelectedEngine = useWatch({ name: generateFieldCode(FIELD_FORM_CODE.ENGINE, index) })

  const handleDocumentTypeChange = useCallback((documentTypeCode) => {
    const selectedDocumentType = documentTypes.find((dt) => dt.code === documentTypeCode)

    if (!selectedDocumentType) {
      return
    }

    const { workflowConfiguration } = selectedDocumentType
    const targetEngine = workflowConfiguration?.engine ?? selectedDocumentType.engine
    const parsingFeatures = workflowConfiguration?.parsingFeatures ?? DEFAULT_FORM_VALUES[FIELD_FORM_CODE.PARSING_FEATURES]

    setValue(generateFieldCode(FIELD_FORM_CODE.PARSING_FEATURES, index), parsingFeatures)
    setValue(generateFieldCode(FIELD_FORM_CODE.ENGINE, index), targetEngine)
  }, [documentTypes, setValue, index])

  const fields = useMemo(() => [
    {
      code: generateFieldCode(FIELD_FORM_CODE.DOCUMENT_TYPE, index),
      label: localize(Localization.DOCUMENT_TYPE),
      handler: {
        onChange: handleDocumentTypeChange,
      },
      render: DocTypeSelect,
    },
    {
      code: generateFieldCode(FIELD_FORM_CODE.ENGINE, index),
      label: localize(Localization.ENGINE),
      placeholder: localize(Localization.SELECT_ENGINE),
      render: EngineSelect,
    },
    ENV.FEATURE_LLM_DATA_EXTRACTION && {
      code: generateFieldCode(FIELD_FORM_CODE.LLM_TYPE, index),
      label: localize(Localization.LLM_TYPE),
      placeholder: localize(Localization.SELECT_LLM_TYPE),
      render: ExtractionLLMSelect,
    },
    {
      code: generateFieldCode(FIELD_FORM_CODE.PARSING_FEATURES, index),
      label: localize(Localization.PARSING_FEATURES),
      placeholder: localize(Localization.SELECT_PARSING_FEATURE),
      defaultValue: [KnownParsingFeature.TEXT],
      render: (props) => (
        <ParsingFeaturesSwitch
          {...props}
          engineCode={currentSelectedEngine || topSelectedEngine}
        />
      ),
    },
  ], [
    index,
    topSelectedEngine,
    currentSelectedEngine,
    handleDocumentTypeChange,
  ])

  return (
    <FileSettingsWrapper $isVisible={isVisible}>
      {
        fields.map((field) => field && (
          <FormItem
            key={field.code}
            field={field}
            label={field.label}
            requiredMark={field.requiredMark}
          />
        ))
      }
    </FileSettingsWrapper>
  )
}

FileSettings.propTypes = {
  index: PropTypes.number.isRequired,
  isVisible: PropTypes.bool,
}
