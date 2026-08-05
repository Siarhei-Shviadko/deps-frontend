
import { Button } from '@/components/Button'
import { Tooltip } from '@/components/Tooltip'
import { Localization, localize } from '@/localization/i18n'
import { fileShape } from '@/models/File'
import { AutoFileSplittingButton } from '../AutoFileSplittingButton'
import { TOOLTIP_TITLE_RULES } from '../constants'

const getTooltipTitle = (file) => {
  return TOOLTIP_TITLE_RULES.find((rule) => rule.when(file))?.title
}

export const AutoFileSplittingGuard = ({ file }) => {
  const tooltipTitle = getTooltipTitle(file)

  if (tooltipTitle) {
    return (
      <Tooltip title={tooltipTitle}>
        <Button.Text disabled>
          {localize(Localization.AUTOMATIC_FILE_SPLITTING)}
        </Button.Text>
      </Tooltip>
    )
  }

  return (
    <AutoFileSplittingButton file={file} />
  )
}

AutoFileSplittingGuard.propTypes = {
  file: fileShape.isRequired,
}
