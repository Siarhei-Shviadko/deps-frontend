
import PropTypes from 'prop-types'
import { useMemo, useCallback } from 'react'
import { useFormContext } from 'react-hook-form'
import { useSelector } from 'react-redux'
import {
  FormFieldType,
  FormItem,
  RequiredValidator,
} from '@/components/Form/ReactHookForm'
import { KnownOCREngine } from '@/enums/KnownOCREngine'
import { PrototypeViewType } from '@/enums/PrototypeViewType'
import { Localization, localize } from '@/localization/i18n'
import { Engine } from '@/models/Engine'
import { Language } from '@/models/Language'
import { ocrEnginesSelector } from '@/selectors/engines'
import { languagesSelector } from '@/selectors/languages'
import {
  FieldsWrapper,
  PrototypeFieldsViewSwitch,
  Wrapper,
} from './PrototypeInfo.styles'

const FIELD_CODE = {
  NAME: 'name',
  LANGUAGE: 'language',
  ENGINE: 'engine',
  DESCRIPTION: 'description',
}

const FIELD_MAX_LENGTH = 100

const PrototypeInfo = ({
  fieldsViewType,
  setFieldsViewType,
}) => {
  const engines = useSelector(ocrEnginesSelector)
  const languages = useSelector(languagesSelector)

  const { setValue } = useFormContext()

  const setFieldValue = useCallback((e, fieldCode) => {
    setValue(fieldCode, e.target.value.trimStart())
  }, [setValue])

  const fields = useMemo(() => ([
    {
      code: FIELD_CODE.NAME,
      handler: {
        onChange: (e) => setFieldValue(e, FIELD_CODE.NAME),
      },
      label: localize(Localization.TITLE),
      requiredMark: true,
      placeholder: localize(Localization.TITLE_PLACEHOLDER),
      type: FormFieldType.STRING,
      maxLength: FIELD_MAX_LENGTH,
      rules: new RequiredValidator(),
    }, {
      code: FIELD_CODE.ENGINE,
      label: localize(Localization.ENGINE),
      requiredMark: true,
      placeholder: localize(Localization.SELECT_ENGINE),
      type: FormFieldType.ENUM,
      options: Engine.toAllEnginesOptions(engines, [KnownOCREngine.TESSERACT]),
      rules: new RequiredValidator(),
    }, {
      code: FIELD_CODE.LANGUAGE,
      label: localize(Localization.LANGUAGE),
      requiredMark: true,
      placeholder: localize(Localization.SELECT_LANGUAGE),
      type: FormFieldType.ENUM,
      options: languages.map(Language.toOption),
      rules: new RequiredValidator(),
    }, {
      code: FIELD_CODE.DESCRIPTION,
      handler: {
        onChange: (e) => setFieldValue(e, FIELD_CODE.DESCRIPTION),
      },
      label: localize(Localization.DESCRIPTION),
      placeholder: localize(Localization.ENTER_DESCRIPTION),
      type: FormFieldType.STRING,
      maxLength: FIELD_MAX_LENGTH,
    }]), [
    engines,
    languages,
    setFieldValue,
  ])

  return (
    <Wrapper>
      <FieldsWrapper>
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
      </FieldsWrapper>
      <PrototypeFieldsViewSwitch
        fieldsViewType={fieldsViewType}
        setFieldsViewType={setFieldsViewType}
      />
    </Wrapper>
  )
}

PrototypeInfo.propTypes = {
  fieldsViewType: PropTypes.oneOf(
    Object.values(PrototypeViewType),
  ).isRequired,
  setFieldsViewType: PropTypes.func.isRequired,
}

export {
  PrototypeInfo,
}
