
import { Button } from '@/components/Button'
import { Tooltip } from '@/components/Tooltip'
import { PdfSegmentsProvider } from '@/containers/PdfSplitting/providers'
import { FileExtension } from '@/enums/FileExtension'
import { Localization, localize } from '@/localization/i18n'
import { fileShape } from '@/models/File'
import { getFileExtension } from '@/utils/getFileExtension'
import { FilePDFSplittingButton } from './FilePDFSplittingButton'

export const FilePDFSplittingButtonGuard = ({ file }) => {
  const isExtensionPdf = getFileExtension(file.name) === FileExtension.PDF
  const hasReference = !!file.reference

  if (!isExtensionPdf || hasReference) {
    const tooltipTitle = !isExtensionPdf
      ? localize(Localization.SPLITTING_AVAILABLE_FOR_PDF_FILE)
      : localize(Localization.FILE_ACTION_UNAVAILABLE_REFERENCE_TOOLTIP)

    return (
      <Tooltip title={tooltipTitle}>
        <Button.Text disabled>
          {localize(Localization.MANUAL_FILE_SPLITTING)}
        </Button.Text>
      </Tooltip>
    )
  }

  return (
    <PdfSegmentsProvider>
      <FilePDFSplittingButton
        file={file}
      >
        {localize(Localization.MANUAL_FILE_SPLITTING)}
      </FilePDFSplittingButton>
    </PdfSegmentsProvider>
  )
}

FilePDFSplittingButtonGuard.propTypes = {
  file: fileShape.isRequired,
}
