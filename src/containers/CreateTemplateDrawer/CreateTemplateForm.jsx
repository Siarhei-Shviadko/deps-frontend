
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { useSelector } from 'react-redux'
import {
  Form,
  FormItem,
  PatternValidator,
  MaxLengthValidator,
  RequiredValidator,
  FormFieldType,
} from '@/components/Form/ReactHookForm'
import { CustomSelect, getEmptyOption } from '@/components/Select'
import { FORBIDDEN_WHITE_SPACE_BEFORE_TEXT } from '@/constants/regexp'
import { ExtractionType } from '@/enums/ExtractionType'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { Engine } from '@/models/Engine'
import { Template } from '@/models/Template'
import { documentTypesStateSelector } from '@/selectors/documentTypes'
import { processingEnginesSelector } from '@/selectors/engines'
import { ENV } from '@/utils/env'
import {
  StyledTooltip,
  StyledCheckbox,
  CheckboxFormItem,
} from './CreateTemplateForm.styles'

const FIELD_PROPERTY = {
  NAME: 'name',
  ENGINE: 'engine',
  BASE_TEMPLATE_ID: 'baseTemplateId',
  MARKUP_AUTOMATICALLY: 'markupAutomatically',
}

const renderWithTooltip = (Component, tooltipTitle) => (
  <StyledTooltip
    title={tooltipTitle}
  >
    {Component}
  </StyledTooltip>
)

const CreateTemplateForm = () => {
  const engines = useSelector(processingEnginesSelector)
  const documentTypes = Object.values(useSelector(documentTypesStateSelector))

  const templates = useMemo(() =>
    documentTypes.filter((type) => type.extractionType === ExtractionType.TEMPLATE),
  [documentTypes],
  )

  const isMarkupAutomatically = useWatch({
    name: FIELD_PROPERTY.MARKUP_AUTOMATICALLY,
  })

  const baseTemplateId = useWatch({
    name: FIELD_PROPERTY.BASE_TEMPLATE_ID,
  })

  const isAutoLabelingDisabled = ENV.FEATURE_AUTO_LABELING && !!baseTemplateId
  const isDuplicateFieldsDisabled = !templates.length || !!isMarkupAutomatically
  const enginesOptions = Engine.toAllEnginesOptionsWithDefault(engines, KnownProcessingEngines.TESSERACT)

  const baseTemplateOptions = () => ([
    getEmptyOption(localize(Localization.NOT_SELECTED)),
    ...templates.map(Template.toOption),
  ])

  const fields = [
    {
      code: FIELD_PROPERTY.NAME,
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
      code: FIELD_PROPERTY.ENGINE,
      label: localize(Localization.ENGINE),
      placeholder: localize(Localization.SELECT_ENGINE),
      defaultValue: KnownProcessingEngines.TESSERACT,
      render: (props) => (
        <CustomSelect
          {...props}
          options={enginesOptions}
        />
      ),
    },
    {
      code: FIELD_PROPERTY.BASE_TEMPLATE_ID,
      label: localize(Localization.DUPLICATE_FIELDS),
      disabled: isDuplicateFieldsDisabled,
      defaultValue: null,
      hint: localize(Localization.SELECT_TEMPLATE_TO_COPY),
      render: (props) => {
        const Component = (
          <CustomSelect
            {...props}
            options={baseTemplateOptions()}
          />
        )

        if (isMarkupAutomatically) {
          return renderWithTooltip(Component, localize(Localization.UNAVAILABLE_WITH_AUTO_MARKUP))
        }

        return Component
      },
    },
    ENV.FEATURE_AUTO_LABELING && {
      code: FIELD_PROPERTY.MARKUP_AUTOMATICALLY,
      label: localize(Localization.MARKUP_AUTOMATICALLY),
      defaultValue: false,
      disabled: isAutoLabelingDisabled,
      render: (props) => {
        const Component = (
          <StyledCheckbox {...props} />
        )

        if (isAutoLabelingDisabled) {
          return renderWithTooltip(Component, localize(Localization.UNAVAILABLE_WITH_DUPLICATE))
        }

        return Component
      },
    },
  ]

  return (
    <Form>
      {
        fields
          .filter((field) => field)
          .map(({ label, requiredMark, ...field }) => {
            if (field.code === FIELD_PROPERTY.MARKUP_AUTOMATICALLY) {
              return (
                <CheckboxFormItem
                  key={field.code}
                  field={field}
                  label={label}
                  requiredMark={requiredMark}
                />
              )
            }

            return (
              <FormItem
                key={field.code}
                field={field}
                label={label}
                requiredMark={requiredMark}
              />
            )
          },
          )
      }
    </Form>
  )
}

export {
  CreateTemplateForm,
}
