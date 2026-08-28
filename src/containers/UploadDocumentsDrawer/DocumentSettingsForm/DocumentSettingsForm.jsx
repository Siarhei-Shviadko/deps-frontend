
import { useCallback, useEffect, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDocumentTypes } from '@/actions/documentTypes'
import { fetchProcessingEngines } from '@/actions/engines'
import { CustomSelect } from '@/components/Select'
import { Switch } from '@/components/Switch'
import { AddLabelsPicker } from '@/containers/AddLabelsPicker'
import { DocumentTypesGroupsSelect } from '@/containers/DocumentTypesGroupsSelect'
import { ExtractionLLMSelect } from '@/containers/ExtractionLLMSelect'
import { FIELD_FORM_CODE } from '@/containers/UploadDocumentsDrawer/constants'
import { AuthType } from '@/enums/AuthType'
import { ComponentSize } from '@/enums/ComponentSize'
import { FieldType } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import { DocumentType } from '@/models/DocumentType'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { processingEnginesSelector } from '@/selectors/engines'
import { areTypesFetchingSelector } from '@/selectors/requests'
import { ENV } from '@/utils/env'
import {
  ClassificationFormItem,
  SectionLabel,
  SectionWrapper,
  StyledForm,
  StyledFormItem,
} from './DocumentSettingsForm.styles'
import { WorkflowConfigurationSection } from './WorkflowConfigurationSection'

export const DocumentSettingsForm = () => {
  const documentTypes = useSelector(documentTypesSelector)
  const engines = useSelector(processingEnginesSelector)
  const areDocumentTypesFetching = useSelector(areTypesFetchingSelector)

  const shouldClassify = useWatch({ name: FIELD_FORM_CODE.SHOULD_CLASSIFY })
  const dispatch = useDispatch()
  const { setValue } = useFormContext()

  useEffect(() => {
    !engines.length && dispatch(fetchProcessingEngines())
    !documentTypes?.length && dispatch(fetchDocumentTypes())
  }, [
    dispatch,
    documentTypes?.length,
    engines?.length,
  ])

  const handleDocumentTypeChange = useCallback((documentTypeCode) => {
    const selectedDocumentType = documentTypes.find((dt) => dt.code === documentTypeCode)
    if (!selectedDocumentType) return

    const { workflowConfiguration } = selectedDocumentType

    if (workflowConfiguration) {
      setValue(FIELD_FORM_CODE.NEEDS_REVIEW, workflowConfiguration.needsReview)
      setValue(FIELD_FORM_CODE.NEEDS_EXTRACTION, workflowConfiguration.needsExtraction)
      setValue(FIELD_FORM_CODE.NEEDS_VALIDATION, workflowConfiguration.needsValidation)
      setValue(FIELD_FORM_CODE.PARSING_FEATURES, workflowConfiguration.parsingFeatures)
    }

    const engine = workflowConfiguration?.engine ?? selectedDocumentType.engine

    setValue(FIELD_FORM_CODE.ENGINE, engine)
  }, [documentTypes, setValue])

  const ConditionalFields = useMemo(() => {
    if (shouldClassify) {
      return [{
        code: FIELD_FORM_CODE.GROUP,
        label: localize(Localization.GROUP),
        requiredMark: true,
        render: DocumentTypesGroupsSelect,
      }]
    }

    return [{
      code: FIELD_FORM_CODE.DOCUMENT_TYPE,
      label: localize(Localization.DOCUMENT_TYPE),
      placeholder: localize(Localization.SELECT_DOCUMENT_TYPE),
      requiredMark: true,
      handler: {
        onChange: handleDocumentTypeChange,
      },
      render: (props) => (
        <CustomSelect
          {...props}
          allowClear
          allowSearch
          fetching={areDocumentTypesFetching}
          options={documentTypes.map(DocumentType.toOption)}
        />
      ),
    }]
  }, [
    areDocumentTypesFetching,
    documentTypes,
    handleDocumentTypeChange,
    shouldClassify,
  ])

  const fields = [
    {
      code: FIELD_FORM_CODE.SHOULD_CLASSIFY,
      label: localize(Localization.CLASSIFICATION),
      type: FieldType.CHECKMARK,
      isClassification: true,
      render: ({ value, ...restProps }) => (
        <Switch
          checked={value}
          disabled={!ENV.FEATURE_DOCUMENT_TYPES_GROUPS}
          size={ComponentSize.SMALL}
          {...restProps}
        />
      ),
    },
    ...ConditionalFields,
    ...(ENV.FEATURE_LLM_DATA_EXTRACTION
      ? [{
        code: FIELD_FORM_CODE.LLM_TYPE,
        label: localize(Localization.LLM_TYPE),
        placeholder: localize(Localization.SELECT_LLM_TYPE),
        render: ExtractionLLMSelect,
      }]
      : []
    ),
    {
      code: FIELD_FORM_CODE.LABELS,
      label: localize(Localization.LABELS),
      render: AddLabelsPicker,
    },
    ...(
      (ENV.AUTH_TYPE !== AuthType.NO_AUTH)
        ? [{
          code: FIELD_FORM_CODE.ASSIGNED_TO_ME,
          label: localize(Localization.ASSIGN_ME_AS_A_REVIEWER_FOR_DOCUMENTS),
          type: FieldType.CHECKMARK,
          sectionLabel: localize(Localization.REVIEWER),
        }]
        : []),
  ]

  return (
    <StyledForm>
      {
        fields.map(({ label, requiredMark, sectionLabel, isClassification, ...field }) => {
          const FormItemComponent = isClassification ? ClassificationFormItem : StyledFormItem

          return sectionLabel
            ? (
              <SectionWrapper key={field.code}>
                <SectionLabel>{sectionLabel}</SectionLabel>
                <FormItemComponent
                  field={field}
                  label={label}
                  requiredMark={requiredMark}
                />
              </SectionWrapper>
            )
            : (
              <FormItemComponent
                key={field.code}
                field={field}
                label={label}
                requiredMark={requiredMark}
              />
            )
        })
      }
      <WorkflowConfigurationSection />
    </StyledForm>
  )
}
