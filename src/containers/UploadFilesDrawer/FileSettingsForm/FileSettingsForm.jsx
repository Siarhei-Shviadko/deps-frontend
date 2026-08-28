
import { useEffect } from 'react'
import { useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProcessingEngines } from '@/actions/engines'
import { FormItem } from '@/components/Form'
import { CustomSelect } from '@/components/Select'
import { AddLabelsPicker } from '@/containers/AddLabelsPicker'
import { ParsingFeaturesSwitch } from '@/containers/ParsingFeaturesSwitch'
import { FIELD_FORM_CODE } from '@/containers/UploadFilesDrawer/constants'
import { Localization, localize } from '@/localization/i18n'
import { Engine } from '@/models/Engine'
import { processingEnginesSelector } from '@/selectors/engines'
import { areEnginesFetchingSelector } from '@/selectors/requests'
import { Hint } from '../Hint'
import { StyledForm } from './FileSettingsForm.styles'

export const FileSettingsForm = () => {
  const areEnginesFetching = useSelector(areEnginesFetchingSelector)
  const engines = useSelector(processingEnginesSelector)
  const selectedEngine = useWatch({ name: FIELD_FORM_CODE.ENGINE })

  const dispatch = useDispatch()

  useEffect(() => {
    !engines.length && dispatch(fetchProcessingEngines())
  }, [dispatch, engines])

  const fields = [
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
      render: (props) => (
        <ParsingFeaturesSwitch
          {...props}
          engineCode={selectedEngine}
        />
      ),
    },
    {
      code: FIELD_FORM_CODE.LABELS,
      label: localize(Localization.LABELS),
      render: AddLabelsPicker,
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
      <Hint />
    </StyledForm>
  )
}
