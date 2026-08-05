
import { Button } from '@/components/Button'
import { ClipboardIcon } from '@/components/Icons/ClipboardIcon'
import { Tooltip } from '@/components/Tooltip'
import { PdfSegmentsProvider } from '@/containers/PdfSplitting/providers'
import { FileExtension } from '@/enums/FileExtension'
import { Localization, localize } from '@/localization/i18n'
import { fileShape } from '@/models/File'
import { getFileExtension } from '@/utils/getFileExtension'
import { FileReviewSplittingButton } from './FileReviewSplittingButton'

export const FileReviewSplittingButtonGuard = ({ file }) => {
  const isExtensionPdf = getFileExtension(file.name) === FileExtension.PDF
  const hasReference = !!file.reference

  if (!isExtensionPdf || hasReference) {
    const tooltipTitle = !isExtensionPdf
      ? localize(Localization.SPLITTING_AVAILABLE_FOR_PDF_FILE)
      : localize(Localization.FILE_ACTION_UNAVAILABLE_REFERENCE_TOOLTIP)

    return (
      <Tooltip title={tooltipTitle}>
        <Button.Secondary
          disabled
          icon={<ClipboardIcon />}
        />
      </Tooltip>
    )
  }

  return (
    <PdfSegmentsProvider allowAreaSelection>
      <FileReviewSplittingButton file={file} />
    </PdfSegmentsProvider>
  )
}

FileReviewSplittingButtonGuard.propTypes = {
  file: fileShape.isRequired,
}
