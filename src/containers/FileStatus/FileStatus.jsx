
import PropTypes from 'prop-types'
import { FileStatus as FileStatusEnum, RESOURCE_FILE_STATUS } from '@/enums/FileStatus'
import { theme } from '@/theme/theme.default'
import { StyledBadge } from './FileStatus.styles'

const BADGE_COLOR_TO_FILE_STATUS_MAPPING = {
  [FileStatusEnum.PROCESSING]: theme.color.warning,
  [FileStatusEnum.COMPLETED]: theme.color.success,
  [FileStatusEnum.FAILED]: theme.color.error,
  [FileStatusEnum.SPLITTING_REVIEW]: theme.color.warning,
}

const FileStatus = ({
  className,
  status,
}) => (
  <StyledBadge
    className={className}
    color={BADGE_COLOR_TO_FILE_STATUS_MAPPING[status]}
    text={RESOURCE_FILE_STATUS[status]}
  />
)

FileStatus.propTypes = {
  className: PropTypes.string,
  status: PropTypes.string.isRequired,
}

export {
  FileStatus,
}
