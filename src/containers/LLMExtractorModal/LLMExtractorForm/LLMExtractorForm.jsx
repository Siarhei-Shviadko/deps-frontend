
import { useMemo } from 'react'
import {
  FormFieldType,
  FormItem,
  PatternValidator,
  RequiredValidator,
  MaxLengthValidator,
} from '@/components/Form/ReactHookForm'
import { FORBIDDEN_WHITE_SPACE_BEFORE_TEXT } from '@/constants/regexp'
import { ExtractionLLMSelect } from '@/containers/ExtractionLLMSelect'
import { Localization, localize } from '@/localization/i18n'
import { InstructionSection } from '../InstructionSection'
import { TemperatureSection } from '../TemperatureSection'
import { AdvancedLLMSettings } from './AdvancedLLMSettings'
import { FIELD_CODE } from './constants'
import {
  FieldsList,
  FieldsWrapper,
  Form,
  Wrapper,
} from './LLMExtractorForm.styles'

const LLMExtractorForm = () => {
  const baseFields = useMemo(() => [
    {
      code: FIELD_CODE.EXTRACTOR_NAME,
      label: localize(Localization.NAME),
      requiredMark: true,
      type: FormFieldType.STRING,
      placeholder: localize(Localization.NAME_PLACEHOLDER),
      rules: {
        ...new RequiredValidator(),
        ...new PatternValidator(
          FORBIDDEN_WHITE_SPACE_BEFORE_TEXT,
          localize(Localization.WHITE_SPACE_VALIDATOR_ERROR_MESSAGE),
        ),
        ...new MaxLengthValidator(),
      },
    },
    {
      code: FIELD_CODE.LLM_MODEL,
      label: localize(Localization.LLM_MODEL),
      requiredMark: true,
      rules: {
        ...new RequiredValidator(),
      },
      render: (props) => (
        <ExtractionLLMSelect
          {...props}
          allowClear
          allowSearch
          placeholder={localize(Localization.SELECT_LLM_MODEL)}
        />
      ),
    },
  ], [])

  const renderFields = (fields) => fields.map(({ label, requiredMark, ...field }) => (
    <FormItem
      key={field.code}
      field={field}
      label={label}
      requiredMark={requiredMark}
    />
  ))

  return (
    <Form>
      <Wrapper>
        <FieldsList>
          <FieldsWrapper>
            {renderFields(baseFields)}
          </FieldsWrapper>
          <TemperatureSection />
          <AdvancedLLMSettings />
        </FieldsList>
        <InstructionSection />
      </Wrapper>
    </Form>
  )
}

export {
  LLMExtractorForm,
}
