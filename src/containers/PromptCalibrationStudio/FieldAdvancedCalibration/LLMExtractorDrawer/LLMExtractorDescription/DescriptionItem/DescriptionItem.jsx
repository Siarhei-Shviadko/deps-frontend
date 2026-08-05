import PropTypes from 'prop-types'
import { childrenShape } from '@/utils/propTypes'
import {
  ExtractorSettingsItem,
  ExtractorSettingsItemLabel,
  ExtractorSettingsItemValue,
} from '../LLMExtractorDescription.styles'

export const DescriptionItem = ({ label, value }) => {
  if (value == null) {
    return null
  }

  return (
    <ExtractorSettingsItem>
      <ExtractorSettingsItemLabel>
        {label}
      </ExtractorSettingsItemLabel>
      <ExtractorSettingsItemValue>
        {value}
      </ExtractorSettingsItemValue>
    </ExtractorSettingsItem>
  )
}

DescriptionItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: childrenShape,
}
