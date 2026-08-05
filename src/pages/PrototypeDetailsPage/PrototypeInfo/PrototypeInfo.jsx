
import PropTypes from 'prop-types'
import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Input } from '@/components/Input'
import { LongText } from '@/components/LongText'
import { CustomSelect } from '@/components/Select'
import { PrototypeFieldsViewSwitch } from '@/containers/PrototypeFieldsViewSwitch'
import { KnownOCREngine } from '@/enums/KnownOCREngine'
import { PrototypeViewType } from '@/enums/PrototypeViewType'
import { Localization, localize } from '@/localization/i18n'
import { Engine } from '@/models/Engine'
import { Language } from '@/models/Language'
import { prototypeShape } from '@/models/Prototype'
import { ocrEnginesSelector } from '@/selectors/engines'
import { languagesSelector } from '@/selectors/languages'
import {
  FieldsWrapper,
  ReadonlyField,
  FieldWrapper,
  FieldLabel,
  Wrapper,
} from './PrototypeInfo.styles'

const FIELD_CODE = {
  LANGUAGE: 'language',
  ENGINE: 'engine',
  DESCRIPTION: 'description',
}

const DESCRIPTION_MAX_LENGTH = 100

const getNameByCode = (list, item) => list.find((e) => e.code === item)?.name

const PrototypeInfo = ({
  fieldsViewType,
  isEditMode,
  prototype,
  onValueChange,
  setFieldsViewType,
}) => {
  const engines = useSelector(ocrEnginesSelector)
  const languages = useSelector(languagesSelector)
  const selectedEngine = getNameByCode(engines, prototype.engine) || prototype.engine
  const selectedLanguage = getNameByCode(languages, prototype.language) || prototype.language

  const onFieldChange = useCallback((value, fieldCode) => {
    onValueChange({
      [fieldCode]: value,
    })
  }, [onValueChange])

  const fields = useMemo(() => ([
    {
      code: FIELD_CODE.ENGINE,
      label: localize(Localization.ENGINE),
      requiredMark: true,
      defaultValue: selectedEngine,
      render: () => (
        <CustomSelect
          onChange={(val) => onFieldChange(val, FIELD_CODE.ENGINE)}
          options={Engine.toAllEnginesOptions(engines, [KnownOCREngine.TESSERACT])}
          placeholder={localize(Localization.SELECT_ENGINE)}
          value={selectedEngine}
        />
      ),
    }, {
      code: FIELD_CODE.LANGUAGE,
      label: localize(Localization.LANGUAGE),
      requiredMark: true,
      defaultValue: selectedLanguage,
      render: () => (
        <CustomSelect
          onChange={(val) => onFieldChange(val, FIELD_CODE.LANGUAGE)}
          options={languages.map(Language.toOption)}
          placeholder={localize(Localization.SELECT_LANGUAGE)}
          value={selectedLanguage}
        />
      ),
    }, {
      code: FIELD_CODE.DESCRIPTION,
      label: localize(Localization.DESCRIPTION),
      defaultValue: prototype.description,
      render: () => (
        <Input
          maxLength={DESCRIPTION_MAX_LENGTH}
          onChange={(e) => onFieldChange(e.target.value, FIELD_CODE.DESCRIPTION)}
          placeholder={localize(Localization.ENTER_DESCRIPTION)}
          value={prototype.description}
        />
      ),
    }]), [
    engines,
    languages,
    onFieldChange,
    prototype,
    selectedEngine,
    selectedLanguage,
  ])

  return (
    <Wrapper>
      <FieldsWrapper>
        {
          fields.map((field) => (
            <FieldWrapper key={field.code}>
              <FieldLabel
                name={field.label}
                required={field.requiredMark}
              />
              {
                isEditMode ? (
                  field.render()
                ) : (
                  <ReadonlyField>
                    <LongText text={field.defaultValue} />
                  </ReadonlyField>
                )
              }
            </FieldWrapper>
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
  isEditMode: PropTypes.bool.isRequired,
  prototype: prototypeShape.isRequired,
  setFieldsViewType: PropTypes.func.isRequired,
  onValueChange: PropTypes.func.isRequired,
}

export {
  PrototypeInfo,
}
