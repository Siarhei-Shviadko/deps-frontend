
import { useEffect } from 'react'
import { useWatch } from 'react-hook-form'
import {
  batch,
  useDispatch,
  useSelector,
} from 'react-redux'
import { fetchOCREngines } from '@/actions/engines'
import {
  Form,
  FormItem,
  FormFieldType,
} from '@/components/Form/ReactHookForm'
import {
  CustomSelect,
} from '@/components/Select'
import { AddLabelsPicker } from '@/containers/AddLabelsPicker'
import { ExtractionLLMSelect } from '@/containers/ExtractionLLMSelect'
import { ParsingFeaturesSwitch } from '@/containers/ParsingFeaturesSwitch'
import { AuthType } from '@/enums/AuthType'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { Localization, localize } from '@/localization/i18n'
import { Engine } from '@/models/Engine'
import { ocrEnginesSelector } from '@/selectors/engines'
import { areEnginesFetchingSelector } from '@/selectors/requests'
import { ENV } from '@/utils/env'
import { FormFieldCodes } from './constants'
import { CheckboxWrapper } from './DocumentUploadSettings.styles'

export const DEFAULT_FORM_SETTINGS = {
  [FormFieldCodes.PARSING_FEATURES]: [KnownParsingFeature.TEXT],
  [FormFieldCodes.SHOULD_ASSIGN_TO_ME]: false,
  [FormFieldCodes.SHOULD_EXTRACT_DATA]: true,
  [FormFieldCodes.LABELS]: [],
}

const DocumentUploadSettingsForm = () => {
  const engines = useSelector(ocrEnginesSelector)
  const areEnginesFetching = useSelector(areEnginesFetchingSelector)

  const selectedEngine = useWatch({ name: FormFieldCodes.ENGINE })

  const dispatch = useDispatch()

  useEffect(() => {
    batch(() => {
      dispatch(fetchOCREngines)
    })
  }, [dispatch])

  const fields = [
    {
      code: FormFieldCodes.PARSING_FEATURES,
      label: localize(Localization.PARSING_FEATURES),
      placeholder: localize(Localization.SELECT_PARSING_FEATURE),
      defaultValue: [KnownParsingFeature.TEXT],
      render: (props) => (
        <ParsingFeaturesSwitch
          {...props}
          engineCode={selectedEngine}
        />
      ),
    },
    {
      code: FormFieldCodes.ENGINE,
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
    ENV.FEATURE_LLM_DATA_EXTRACTION && {
      code: FormFieldCodes.LLM_TYPE,
      label: localize(Localization.LLM_TYPE),
      placeholder: localize(Localization.SELECT_LLM_TYPE),
      render: (props) => (
        <ExtractionLLMSelect
          {...props}
          allowClear
          allowSearch
        />
      ),
    },
    {
      code: FormFieldCodes.LABELS,
      label: localize(Localization.LABELS),
      render: AddLabelsPicker,
    },
    {
      code: FormFieldCodes.SHOULD_EXTRACT_DATA,
      label: localize(Localization.SEND_TO_EXTRACTION),
      defaultValue: true,
      type: FormFieldType.CHECKMARK,
    },
    ...(
      (ENV.AUTH_TYPE !== AuthType.NO_AUTH)
        ? [{
          code: FormFieldCodes.SHOULD_ASSIGN_TO_ME,
          label: localize(Localization.ASSIGN_ME_AS_A_REVIEWER_FOR_DOCUMENTS),
          defaultValue: false,
          type: FormFieldType.CHECKMARK,
        }]
        : []),
  ]

  const renderFormFields = () => (
    fields
      .filter((field) => field)
      .map(({ label, requiredMark, ...field }) => {
        const isFieldTypeCheckmark = field.type === FormFieldType.CHECKMARK

        const FormItemComponent = (
          <FormItem
            key={field.code}
            field={field}
            label={label}
            requiredMark={requiredMark}
          />
        )

        if (isFieldTypeCheckmark) {
          return (
            <CheckboxWrapper key={field.code}>
              {FormItemComponent}
            </CheckboxWrapper>
          )
        }

        return FormItemComponent
      })
  )

  return (
    <Form>
      {renderFormFields()}
    </Form>
  )
}

export {
  DocumentUploadSettingsForm,
}
