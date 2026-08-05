
import PropTypes from 'prop-types'
import { Switch } from '@/components/Switch'
import { ComponentSize } from '@/enums/ComponentSize'
import { KnownOCREngine } from '@/enums/KnownOCREngine'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { Localization, localize } from '@/localization/i18n'
import { ParsingFeature } from '@/models/ParsingFeature'
import { FeatureItem, ParsingFeaturesContainer } from './ParsingFeaturesSwitch.styles'

const ParsingFeatures = [
  new ParsingFeature(KnownParsingFeature.KEY_VALUE_PAIRS, localize(Localization.KEY_VALUE_PAIRS)),
  new ParsingFeature(KnownParsingFeature.TEXT, localize(Localization.TEXT)),
  new ParsingFeature(KnownParsingFeature.IMAGES, localize(Localization.IMAGES)),
  new ParsingFeature(KnownParsingFeature.TABLES, localize(Localization.TABLES)),
]

export const ParsingFeaturesSwitch = ({
  onChange,
  value: selectedFeatures,
  columnView = false,
  engineCode,
}) => {
  const handleToggle = (feature) => {
    const isSelected = selectedFeatures.includes(feature)
    const updatedFeatures = isSelected
      ? selectedFeatures.filter((f) => f !== feature)
      : [...selectedFeatures, feature]

    onChange(updatedFeatures)
  }

  const isFeatureDisabled = (featureCode) => (
    featureCode === KnownParsingFeature.TABLES &&
    engineCode === KnownOCREngine.TESSERACT
  )

  return (
    <ParsingFeaturesContainer $columnView={columnView}>
      {
        ParsingFeatures.map((option) => {
          const disabled = isFeatureDisabled(option.code)
          const isSelected = selectedFeatures.includes(option.code)
          const checked = isSelected && !disabled

          disabled && isSelected && handleToggle(option.code)

          return (
            <FeatureItem
              key={option.code}
              $columnView={columnView}
              onClick={() => !disabled && handleToggle(option.code)}
            >
              {option.name}
              <Switch
                checked={checked}
                disabled={disabled}
                onChange={() => handleToggle(option.code)}
                size={ComponentSize.SMALL}
              />
            </FeatureItem>
          )
        })
      }
    </ParsingFeaturesContainer>
  )
}

ParsingFeaturesSwitch.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.arrayOf(
    PropTypes.oneOf(Object.values(KnownParsingFeature)),
  ).isRequired,
  columnView: PropTypes.bool,
  engineCode: PropTypes.oneOf(Object.values(KnownOCREngine)),
}
