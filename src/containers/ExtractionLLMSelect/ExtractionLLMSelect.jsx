
import PropTypes from 'prop-types'
import { useEffect, useMemo } from 'react'
import { useFetchLLMsQuery } from '@/apiRTK/LLMsApi'
import { SelectOption } from '@/components/Select'
import { RESOURCE_KNOWN_LLM_DESCRIPTION } from '@/enums/KnownLLM'
import { localize, Localization } from '@/localization/i18n'
import { LLMSettings } from '@/models/LLMProvider'
import { notifyWarning } from '@/utils/notification'
import {
  CustomSelect,
  LabelModel,
  LabelProvider,
  LabelWrapper,
  OptionModel,
  OptionProvider,
  OptionWrapper,
} from './ExtractionLLMSelect.styles'

const optionRender = (model, provider) => (
  <OptionWrapper>
    <OptionModel>{model}</OptionModel>
    <OptionProvider>{provider}</OptionProvider>
  </OptionWrapper>
)

const labelRender = (model, provider) => (
  <LabelWrapper>
    <LabelModel>{model}</LabelModel>
    <LabelProvider>{provider}</LabelProvider>
  </LabelWrapper>
)

const ExtractionLLMSelect = ({
  allowSearch = true,
  allowClear = true,
  innerRef,
  onBlur,
  onChange,
  placeholder,
  value,
  ...props
}) => {
  const {
    data = [],
    isFetching,
    isError,
  } = useFetchLLMsQuery()

  const options = useMemo(() =>
    data.flatMap((provider) =>
      provider.models.map((model) => {
        const llmType = LLMSettings.settingsToLLMType(provider.code, model.code)
        const text = `${model.name} ${provider.name}`
        const optionTooltip = {
          title: RESOURCE_KNOWN_LLM_DESCRIPTION[model.code] || model.description,
        }

        return new SelectOption(
          llmType,
          text,
          optionTooltip,
          false,
          () => optionRender(model.name, provider.name),
          () => labelRender(model.name, provider.name),
        )
      }),
    ),
  [data],
  )

  useEffect(() => {
    if (isError) {
      notifyWarning(localize(Localization.FETCH_LLMS_FAILURE_MESSAGE))
    }
  }, [isError])

  return (
    <CustomSelect
      {...props}
      ref={innerRef}
      allowClear={allowClear}
      allowSearch={allowSearch}
      disabled={isFetching}
      fetching={isFetching}
      onBlur={onBlur}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      value={value}
    />
  )
}

ExtractionLLMSelect.propTypes = {
  allowSearch: PropTypes.bool,
  allowClear: PropTypes.bool,
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.string,
}

export {
  ExtractionLLMSelect,
}
