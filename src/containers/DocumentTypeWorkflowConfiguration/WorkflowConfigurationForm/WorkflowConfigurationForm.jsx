
import PropTypes from 'prop-types'
import {
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProcessingEngines } from '@/actions/engines'
import { FormFieldType } from '@/components/Form'
import { Form } from '@/components/Form/ReactHookForm'
import { CustomSelect } from '@/components/Select'
import { SelectOption } from '@/components/Select/SelectOption'
import { Switch } from '@/components/Switch'
import { ParsingFeaturesSwitch } from '@/containers/ParsingFeaturesSwitch'
import { ComponentSize } from '@/enums/ComponentSize'
import { REVIEW_POLICY_TO_LABEL } from '@/enums/ReviewPolicy'
import { Localization, localize } from '@/localization/i18n'
import { Engine } from '@/models/Engine'
import { documentTypeStateSelector } from '@/selectors/documentType'
import { processingEnginesSelector } from '@/selectors/engines'
import { areEnginesFetchingSelector } from '@/selectors/requests'
import { DEFAULT_FORM_VALUES, WORKFLOW_FORM_FIELD_CODES } from '../constants'
import { WorkflowFormItem } from './WorkflowConfigurationForm.styles'

const reviewPolicyOptions = Object.entries(REVIEW_POLICY_TO_LABEL).map(
  ([value, text]) => new SelectOption(value, text),
)

const renderFields = (fields) => (
  fields.map(({ label, requiredMark, ...field }) => (
    <WorkflowFormItem
      key={field.code}
      field={field}
      label={label}
      requiredMark={requiredMark}
    />
  ))
)

const WorkflowConfigurationForm = ({
  onSubmit,
  handleSubmit,
}) => {
  const documentType = useSelector(documentTypeStateSelector)
  const areEnginesFetching = useSelector(areEnginesFetchingSelector)
  const engines = useSelector(processingEnginesSelector)
  const { setValue } = useFormContext()

  const {
    needsExtraction,
    needsReview,
    needsValidation,
    parsingFeatures,
    engine,
    needsOutputExporting,
  } = documentType.workflowConfiguration || {}

  const selectedEngine = useWatch({
    name: WORKFLOW_FORM_FIELD_CODES.ENGINE,
    defaultValue: engine ?? DEFAULT_FORM_VALUES.engine,
  })

  const dispatch = useDispatch()

  useEffect(() => {
    !engines.length && dispatch(fetchProcessingEngines())
  }, [dispatch, engines])

  const handleNeedsExtractionChange = useCallback((onChange) => (value) => {
    if (!value) {
      setValue(WORKFLOW_FORM_FIELD_CODES.NEEDS_VALIDATION, false)
    }
    onChange(value)
  }, [setValue])

  const handleNeedsValidationChange = useCallback((onChange) => (value) => {
    if (value) {
      setValue(WORKFLOW_FORM_FIELD_CODES.NEEDS_EXTRACTION, true)
    }
    onChange(value)
  }, [setValue])

  const handleNeedsOutputExportingChange = useCallback((onChange) => (value) => {
    if (value) {
      setValue(WORKFLOW_FORM_FIELD_CODES.NEEDS_OUTPUT_EXPORTING, true)
    }
    onChange(value)
  }, [setValue])

  const fields = useMemo(() => [
    {
      code: WORKFLOW_FORM_FIELD_CODES.ENGINE,
      label: localize(Localization.ENGINE),
      hint: localize(Localization.WORKFLOW_ENGINE_HINT),
      type: FormFieldType.ENUM,
      defaultValue: engine ?? DEFAULT_FORM_VALUES.engine,
      render: (props) => (
        <CustomSelect
          {...props}
          allowClear={true}
          fetching={areEnginesFetching}
          options={Engine.toAllEnginesOptions(engines)}
        />
      ),
    },
    {
      code: WORKFLOW_FORM_FIELD_CODES.NEEDS_REVIEW,
      label: localize(Localization.WORKFLOW_REVIEW_POLICY),
      hint: localize(Localization.WORKFLOW_REVIEW_POLICY_HINT),
      type: FormFieldType.ENUM,
      defaultValue: needsReview ?? DEFAULT_FORM_VALUES.needsReview,
      options: reviewPolicyOptions,
    },
    {
      code: WORKFLOW_FORM_FIELD_CODES.PARSING_FEATURES,
      label: localize(Localization.PARSING_FEATURES),
      hint: localize(Localization.WORKFLOW_PARSING_FEATURES_HINT),
      type: FormFieldType.ENUM,
      defaultValue: parsingFeatures ?? DEFAULT_FORM_VALUES.parsingFeatures,
      render: (props) => (
        <ParsingFeaturesSwitch
          {...props}
          columnView
          engineCode={selectedEngine}
        />
      ),
    },
    {
      code: WORKFLOW_FORM_FIELD_CODES.NEEDS_EXTRACTION,
      label: localize(Localization.WORKFLOW_NEEDS_EXTRACTION),
      hint: localize(Localization.WORKFLOW_NEEDS_EXTRACTION_HINT),
      type: FormFieldType.CHECKMARK,
      defaultValue: needsExtraction ?? DEFAULT_FORM_VALUES.needsExtraction,
      render: ({ value, onChange, ...restProps }) => (
        <Switch
          checked={!!value}
          onChange={handleNeedsExtractionChange(onChange)}
          size={ComponentSize.SMALL}
          {...restProps}
        />
      ),
    },
    {
      code: WORKFLOW_FORM_FIELD_CODES.NEEDS_VALIDATION,
      label: localize(Localization.WORKFLOW_NEEDS_VALIDATION),
      hint: localize(Localization.WORKFLOW_NEEDS_VALIDATION_HINT),
      type: FormFieldType.CHECKMARK,
      defaultValue: needsValidation ?? DEFAULT_FORM_VALUES.needsValidation,
      render: ({ value, onChange, ...restProps }) => (
        <Switch
          checked={!!value}
          onChange={handleNeedsValidationChange(onChange)}
          size={ComponentSize.SMALL}
          {...restProps}
        />
      ),
    },
    {
      code: WORKFLOW_FORM_FIELD_CODES.NEEDS_OUTPUT_EXPORTING,
      label: localize(Localization.WORKFLOW_NEEDS_OUTPUT_EXPORTING),
      hint: localize(Localization.WORKFLOW_NEEDS_OUTPUT_EXPORTING_HINT),
      type: FormFieldType.CHECKMARK,
      defaultValue: needsOutputExporting ?? DEFAULT_FORM_VALUES.needsOutputExporting,
      render: ({ value, onChange, ...restProps }) => (
        <Switch
          checked={!!value}
          onChange={handleNeedsOutputExportingChange(onChange)}
          size={ComponentSize.SMALL}
          {...restProps}
        />
      ),
    },
  ], [
    engine,
    parsingFeatures,
    needsReview,
    needsExtraction,
    needsValidation,
    areEnginesFetching,
    engines,
    handleNeedsExtractionChange,
    handleNeedsValidationChange,
    handleNeedsOutputExportingChange,
    needsOutputExporting,
    selectedEngine,
  ])

  return (
    <Form
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
    >
      {renderFields(fields)}
    </Form>
  )
}

WorkflowConfigurationForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
}

export {
  WorkflowConfigurationForm,
}
