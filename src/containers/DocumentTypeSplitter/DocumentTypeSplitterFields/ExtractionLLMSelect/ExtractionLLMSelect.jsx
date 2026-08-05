
import PropTypes from 'prop-types'
import { useEffect, useMemo } from 'react'
import { useFetchLiteLLMModelsQuery } from '@/apiRTK/litellmApi'
import { SelectOption } from '@/components/Select'
import { localize, Localization } from '@/localization/i18n'
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
    <OptionModel text={model} />
    <OptionProvider>{provider}</OptionProvider>
  </OptionWrapper>
)

const labelRender = (model, provider) => (
  <LabelWrapper>
    <LabelModel text={model} />
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
  } = useFetchLiteLLMModelsQuery()

  const options = useMemo(() =>
    data.map(({ id }) => {
      const sepIndex = id.search(/[/-]/)
      const provider = id.slice(0, sepIndex)
      const model = id.slice(sepIndex + 1)
      const text = `${model} ${provider}`

      return new SelectOption(
        id,
        text,
        {},
        false,
        () => optionRender(model, provider),
        () => labelRender(model, provider),
      )
    }),
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
