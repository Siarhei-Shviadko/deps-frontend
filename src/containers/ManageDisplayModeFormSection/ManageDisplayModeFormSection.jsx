
import PropTypes from 'prop-types'
import { useFormContext, useWatch } from 'react-hook-form'
import { Switch } from '@/components/Switch'
import { ComponentSize } from '@/enums/ComponentSize'
import { FieldType } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import { DisplayCharLimitField } from './DisplayCharLimitField'
import {
  Wrapper,
  SwitchFormItem,
  DefaultFormItem,
  SwitchFormItemWithSubInfo,
} from './ManageDisplayModeFormSection.styles'

const FIELD_CODE = {
  NAME: 'name',
  READ_ONLY: 'readOnly',
  CONFIDENTIAL: 'confidential',
  DISPLAY_CHAR_LIMIT: 'displayCharLimit',
}

const DEFAULT_CHAR_LIMIT = 0

const FIELD_CODE_TO_FORM_ITEM_WRAPPER = {
  [FIELD_CODE.READ_ONLY]: SwitchFormItem,
  [FIELD_CODE.CONFIDENTIAL]: SwitchFormItem,
  [FIELD_CODE.DISPLAY_CHAR_LIMIT]: SwitchFormItemWithSubInfo,
  [FIELD_CODE.NAME]: DefaultFormItem,
}

const ManageDisplayModeFormSection = ({
  isEditMode,
  fieldName,
  fieldType,
  isReadOnlyField,
  isConfidentialField,
  isMaskingModeDisabled,
  displayCharLimit,
}) => {
  const { control } = useFormContext()

  const watchedConfidentialValue = useWatch({
    control,
    defaultValue: !!isConfidentialField,
    name: FIELD_CODE.CONFIDENTIAL,
  })

  const formFields = [
    ...(fieldName ? [{
      code: FIELD_CODE.NAME,
      label: localize(Localization.NAME),
      type: FieldType.STRING,
      defaultValue: fieldName,
      disabled: true,
    }] : []),
    {
      code: FIELD_CODE.READ_ONLY,
      label: localize(Localization.READ_ONLY_MODE),
      defaultValue: isReadOnlyField,
      disabled: !isEditMode,
      type: FieldType.CHECKMARK,
      render: ({ value, ...restProps }) => (
        <Switch
          checked={!!value}
          data-testid={`switch-${FIELD_CODE.READ_ONLY}`}
          size={ComponentSize.SMALL}
          {...restProps}
        />
      ),
    },
    ...(!isMaskingModeDisabled ? [{
      code: FIELD_CODE.CONFIDENTIAL,
      label: localize(Localization.MASK_MODE),
      disabled: !isEditMode,
      defaultValue: isConfidentialField,
      type: FieldType.CHECKMARK,
      render: ({ value, ...restProps }) => (
        <Switch
          checked={!!value}
          data-testid={`switch-${FIELD_CODE.CONFIDENTIAL}`}
          size={ComponentSize.SMALL}
          {...restProps}
        />
      ),
    }] : []),
    ...(watchedConfidentialValue ? [{
      code: FIELD_CODE.DISPLAY_CHAR_LIMIT,
      label: localize(Localization.VISIBLE_SYMBOLS),
      disabled: !isEditMode,
      placeholder: localize(Localization.DISPLAY_CHAR_LIMIT_PLACEHOLDER),
      defaultValue: displayCharLimit ?? DEFAULT_CHAR_LIMIT,
      render: (fieldProps) => (
        <DisplayCharLimitField
          charLimit={fieldProps.value}
          fieldType={fieldType}
          {... fieldProps}
        />
      ),
    }] : []),
  ]

  return (
    <Wrapper>
      {
        formFields.map(({ label, ...field }) => {
          const Wrapper = FIELD_CODE_TO_FORM_ITEM_WRAPPER[field.code]

          return (
            <Wrapper
              key={field.code}
              field={field}
              label={label}
            />
          )
        })
      }
    </Wrapper>
  )
}

ManageDisplayModeFormSection.propTypes = {
  isEditMode: PropTypes.bool.isRequired,
  fieldName: PropTypes.string,
  fieldType: PropTypes.oneOf(Object.values(FieldType)),
  isReadOnlyField: PropTypes.bool,
  isConfidentialField: PropTypes.bool,
  isMaskingModeDisabled: PropTypes.bool,
  displayCharLimit: PropTypes.number,
}

export {
  ManageDisplayModeFormSection,
}
