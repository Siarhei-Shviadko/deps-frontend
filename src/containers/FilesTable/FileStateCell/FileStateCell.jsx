
import { Tooltip } from '@/components/Tooltip'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { FileStatus, RESOURCE_FILE_STATUS } from '@/enums/FileStatus'
import { fileShape } from '@/models/File'
import { theme } from '@/theme/theme.default'
import {
  StyledBadge,
  Wrapper,
  WarningTriangleIcon,
  StatusRow,
  StyledFileRestartButton,
} from './FileStateCell.styles'

const BADGE_COLOR_TO_FILE_STATUS_MAPPING = {
  [FileStatus.PROCESSING]: theme.color.warning,
  [FileStatus.COMPLETED]: theme.color.success,
  [FileStatus.FAILED]: theme.color.error,
  [FileStatus.NEEDS_REVIEW]: theme.color.success,
  [FileStatus.IN_REVIEW]: theme.color.success,
  [FileStatus.SPLITTING_REVIEW]: theme.color.warning,
}

const getErrorMessage = (state) => {
  const { errorMessage, errorCode } = state

  return RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? errorMessage
}

export const FileStateCell = ({ file }) => {
  const { status } = file.state
  const isErrorStatus = status === FileStatus.FAILED
  const displayErrorMessage = getErrorMessage(file.state)

  return (
    <Wrapper>
      <StatusRow>
        <StyledBadge
          color={BADGE_COLOR_TO_FILE_STATUS_MAPPING[status]}
          text={RESOURCE_FILE_STATUS[status]}
        />
        {
          displayErrorMessage && (
            <Tooltip title={displayErrorMessage}>
              <WarningTriangleIcon />
            </Tooltip>
          )
        }
      </StatusRow>
      {
        isErrorStatus && (
          <StyledFileRestartButton file={file} />
        )
      }
    </Wrapper>
  )
}

FileStateCell.propTypes = {
  file: fileShape.isRequired,
}
