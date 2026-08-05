import { Button } from '@/components/Button'
import { Dropdown } from '@/components/Dropdown'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { EllipsisVerticalIcon } from '@/components/Icons/EllipsisVerticalIcon'
import { StudioTriggerButton } from '@/containers/FilePromptCalibrationStudio'
import { FileRestartButton } from '@/containers/FileRestartButton'
import { FileStatus } from '@/enums/FileStatus'
import { localize, Localization } from '@/localization/i18n'
import { fileShape } from '@/models/File'
import { ENV } from '@/utils/env'
import { AssignDocumentTypeToFileButton } from './AssignDocumentTypeToFileButton'
import { AutoFileSplittingButton } from './AutoFileSplittingButton'
import { StyledMenu, LocalBoundary } from './FileMoreActions.styles'
import { FilePDFSplittingButton } from './FilePDFSplittingButton'

const FileMoreActions = ({ file }) => {
  const renderLocalBoundary = () => (
    <LocalBoundary>
      {
        localize(Localization.DEFAULT_ERROR_MESSAGE)
      }
    </LocalBoundary>
  )

  const renderMenuOptions = (key, children) => (
    <ErrorBoundary
      localBoundary={renderLocalBoundary}
    >
      <StyledMenu.Item
        key={key}
        eventKey={key}
      >
        {children}
      </StyledMenu.Item>
    </ErrorBoundary>
  )

  const renderRestartFile = () => renderMenuOptions(
    'restartFile',
    <FileRestartButton file={file} />,
  )

  const renderAssignDocumentType = () => renderMenuOptions(
    'assignDocumentType',
    <AssignDocumentTypeToFileButton
      file={file}
    >
      {localize(Localization.ASSIGN_DOCUMENT_TYPE)}
    </AssignDocumentTypeToFileButton>,
  )

  const renderAutoSplitFile = () => renderMenuOptions(
    'autoSplitFile',
    <AutoFileSplittingButton file={file} />,
  )

  const renderManualSplitFile = () => renderMenuOptions(
    'manualSplitFile',
    <FilePDFSplittingButton file={file} />,
  )

  const renderFilePromptCalibrationStudioButton = () => renderMenuOptions(
    'filePromptCalibrationStudio',
    <StudioTriggerButton />,
  )

  const renderDropDownMenu = () => (
    <StyledMenu>
      {file.state.status === FileStatus.FAILED && renderRestartFile()}
      {ENV.FEATURE_ASSIGN_DOCUMENT_TYPE_TO_FILE && renderAssignDocumentType()}
      {ENV.FEATURE_PDF_SPLITTING && ENV.FEATURE_DOCUMENT_TYPES_GROUPS && renderAutoSplitFile()}
      {ENV.FEATURE_PDF_SPLITTING && renderManualSplitFile()}
      {ENV.FEATURE_PROMPT_CALIBRATION_STUDIO && renderFilePromptCalibrationStudioButton()}
    </StyledMenu>
  )

  return (
    <Dropdown dropdownRender={renderDropDownMenu}>
      <Button.Secondary
        icon={<EllipsisVerticalIcon />}
      />
    </Dropdown>
  )
}

FileMoreActions.propTypes = {
  file: fileShape.isRequired,
}

export {
  FileMoreActions,
}
