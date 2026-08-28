
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProcessingEngines } from '@/actions/engines'
import { FormFieldType, FormItem, RequiredValidator } from '@/components/Form'
import { CustomSelect } from '@/components/Select'
import { DocumentTypesGroupsSelect } from '@/containers/DocumentTypesGroupsSelect'
import { ExtractionLLMSelect } from '@/containers/ExtractionLLMSelect'
import { ParsingFeaturesSwitch } from '@/containers/ParsingFeaturesSwitch'
import { Localization, localize } from '@/localization/i18n'
import { Engine } from '@/models/Engine'
import { processingEnginesSelector } from '@/selectors/engines'
import { areEnginesFetchingSelector } from '@/selectors/requests'
import { ENV } from '@/utils/env'
import { FIELD_CODE } from '../constants'
import { StyledForm } from './AutoFileSplittingForm.styles'

export const AutoFileSplittingForm = () => {
  const engines = useSelector(processingEnginesSelector)
  const areEnginesFetching = useSelector(areEnginesFetchingSelector)

  const dispatch = useDispatch()

  const { watch } = useFormContext()
  const selectedEngine = watch(FIELD_CODE.ENGINE)

  useEffect(() => {
    if (!engines.length) {
      dispatch(fetchProcessingEngines())
    }
  }, [
    dispatch,
    engines.length,
  ])

  const fields = [
    {
      code: FIELD_CODE.GROUP,
      label: localize(Localization.GROUP),
      requiredMark: true,
      rules: { ...new RequiredValidator() },
      allowClear: false,
      render: (props) => (
        <DocumentTypesGroupsSelect
          {...props}
          filterWithSplitter
        />
      ),
    },
    {
      code: FIELD_CODE.ENGINE,
      label: localize(Localization.ENGINE),
      placeholder: localize(Localization.SELECT_ENGINE),
      render: (props) => (
        <CustomSelect
          {...props}
          allowClear
          fetching={areEnginesFetching}
          options={Engine.toAllEnginesOptions(engines)}
        />
      ),
    },
    ...(ENV.FEATURE_LLM_DATA_EXTRACTION
      ? [{
        code: FIELD_CODE.LLM_TYPE,
        label: localize(Localization.LLM_TYPE),
        placeholder: localize(Localization.SELECT_LLM_TYPE),
        render: ExtractionLLMSelect,
      }]
      : []
    ),
    {
      code: FIELD_CODE.PARSING_FEATURES,
      label: localize(Localization.PARSING_FEATURES),
      placeholder: localize(Localization.SELECT_PARSING_FEATURE),
      render: (props) => (
        <ParsingFeaturesSwitch
          {...props}
          engineCode={selectedEngine}
        />
      ),
    },
    {
      code: FIELD_CODE.NEEDS_SPLITTING_PROPOSAL_REVIEW,
      label: localize(Localization.NEEDS_SPLITTING_REVIEW),
      type: FormFieldType.CHECKMARK,
    },
  ]

  return (
    <StyledForm>
      {
        fields.map(({ label, requiredMark, ...field }) => (
          <FormItem
            key={field.code}
            field={field}
            label={label}
            requiredMark={requiredMark}
          />
        ))
      }
    </StyledForm>
  )
}
