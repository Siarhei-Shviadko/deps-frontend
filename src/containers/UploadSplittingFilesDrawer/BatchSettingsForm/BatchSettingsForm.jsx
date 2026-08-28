
import { useCallback, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProcessingEngines } from '@/actions/engines'
import {
  FormFieldType,
  PatternValidator,
  RequiredValidator,
} from '@/components/Form'
import { CustomSelect } from '@/components/Select'
import { Switch } from '@/components/Switch'
import { FORBIDDEN_WHITE_SPACE_BEFORE_TEXT } from '@/constants/regexp'
import { DocumentTypesGroupsSelect } from '@/containers/DocumentTypesGroupsSelect'
import { ExtractionLLMSelect } from '@/containers/ExtractionLLMSelect'
import { ParsingFeaturesSwitch } from '@/containers/ParsingFeaturesSwitch'
import { BATCH_TYPE, FIELD_FORM_CODE } from '@/containers/UploadSplittingFilesDrawer/constants'
import { ComponentSize } from '@/enums/ComponentSize'
import { FieldType } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import { Engine } from '@/models/Engine'
import { processingEnginesSelector } from '@/selectors/engines'
import { areEnginesFetchingSelector } from '@/selectors/requests'
import { ENV } from '@/utils/env'
import { BatchTypeSwitcher } from '../BatchTypeSwitcher'
import { Hints } from '../Hints'
import { StyledForm, StyledFormItem } from './BatchSettingsForm.styles'

export const BatchSettingsForm = () => {
  const engines = useSelector(processingEnginesSelector)
  const areEnginesFetching = useSelector(areEnginesFetchingSelector)

  const selectedEngine = useWatch({ name: FIELD_FORM_CODE.ENGINE })
  const isAutoSplitting = useWatch({ name: FIELD_FORM_CODE.AUTOMATIC_SPLITTING })

  const { clearErrors, getValues, setValue } = useFormContext()
  const dispatch = useDispatch()

  const handleAutomaticSplittingChange = (value) => {
    if (value) {
      setValue(FIELD_FORM_CODE.BATCH_TYPE, BATCH_TYPE.MULTI_BATCHES)
      const selectedGroup = getValues(FIELD_FORM_CODE.GROUP)

      !selectedGroup?.splitter && setValue(FIELD_FORM_CODE.GROUP, null)
    } else {
      clearErrors(FIELD_FORM_CODE.GROUP)
      setValue(FIELD_FORM_CODE.BATCH_TYPE, BATCH_TYPE.ONE_BATCH)
    }
  }

  const handleNeedsSplittingProposalReviewChange = useCallback((val) => {
    setValue(FIELD_FORM_CODE.NEEDS_SPLITTING_PROPOSAL_REVIEW, val)
  }, [setValue])

  useEffect(() => {
    !engines.length && dispatch(fetchProcessingEngines())
  }, [dispatch, engines?.length])

  const fields = [
    {
      code: FIELD_FORM_CODE.AUTOMATIC_SPLITTING,
      label: localize(Localization.AUTOMATIC_SPLITTING),
      type: FieldType.CHECKMARK,
      handler: {
        onChange: handleAutomaticSplittingChange,
      },
      render: ({ value, defaultValue, ...restProps }) => (
        <Switch
          checked={value}
          defaultChecked={defaultValue}
          size={ComponentSize.SMALL}
          {...restProps}
        />
      ),
    },
    ...(ENV.FEATURE_DOCUMENT_TYPES_GROUPS
      ? [{
        code: FIELD_FORM_CODE.GROUP,
        label: localize(Localization.GROUP),
        render: (props) => (
          <DocumentTypesGroupsSelect
            {...props}
            filterWithSplitter={isAutoSplitting}
          />
        ),
        ...(isAutoSplitting ? {
          requiredMark: true,
          rules: { ...new RequiredValidator() },
        } : {}),
      }]
      : []
    ),
    {
      code: FIELD_FORM_CODE.BATCH_TYPE,
      label: localize(Localization.BATCH_TYPE),
      disabled: true,
      render: BatchTypeSwitcher,
    },
    ...(!isAutoSplitting
      ? [{
        code: FIELD_FORM_CODE.BATCH_NAME,
        label: localize(Localization.BATCH_NAME),
        placeholder: localize(Localization.BATCH_NAME),
        requiredMark: true,
        type: FormFieldType.STRING,
        rules: {
          ...new RequiredValidator(),
          ...new PatternValidator(
            FORBIDDEN_WHITE_SPACE_BEFORE_TEXT,
            localize(Localization.WHITE_SPACE_VALIDATOR_ERROR_MESSAGE),
          ),
        },
      }]
      : []),
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
      code: FIELD_FORM_CODE.ENGINE,
      label: localize(Localization.ENGINE),
      placeholder: localize(Localization.SELECT_ENGINE),
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
      code: FIELD_FORM_CODE.PARSING_FEATURES,
      label: localize(Localization.PARSING_FEATURES),
      placeholder: localize(Localization.SELECT_PARSING_FEATURE),
      render: (props) => (
        <ParsingFeaturesSwitch
          {...props}
          engineCode={selectedEngine}
        />
      ),
    },
    ...(isAutoSplitting
      ? [{
        code: FIELD_FORM_CODE.NEEDS_SPLITTING_PROPOSAL_REVIEW,
        label: localize(Localization.NEEDS_SPLITTING_REVIEW),
        type: FieldType.CHECKMARK,
        handler: {
          onChange: handleNeedsSplittingProposalReviewChange,
        },
      }]
      : []
    ),
  ]

  return (
    <StyledForm>
      {
        fields.map(({ label, requiredMark, ...field }) => (
          <StyledFormItem
            key={field.code}
            field={field}
            label={label}
            requiredMark={requiredMark}
          />
        ))
      }
      <Hints />
    </StyledForm>
  )
}
