
import { useWatch } from 'react-hook-form'
import { FIELD_FORM_CODE } from '@/containers/ManageBatch/constants'
import { pickedFileShape } from '@/containers/ManageBatch/PickedFile'
import { Localization, localize } from '@/localization/i18n'
import {
  FileCardNameWrapper,
  LongText,
  DisclaimerText,
} from './FileCard.styles'

export const FileName = ({ fileData }) => {
  const bulkDocumentType = useWatch({ name: FIELD_FORM_CODE.DOCUMENT_TYPE })
  const bulkEngine = useWatch({ name: FIELD_FORM_CODE.ENGINE })
  const bulkParsingFeatures = useWatch({ name: FIELD_FORM_CODE.PARSING_FEATURES })

  if (!fileData.settings) {
    return (
      <FileCardNameWrapper>
        <LongText text={fileData.file.name} />
      </FileCardNameWrapper>
    )
  }

  const isBulkTheSame = (
    bulkDocumentType === fileData.settings.documentType &&
    bulkEngine === fileData.settings.engine &&
    bulkParsingFeatures.length === fileData.settings.parsingFeatures.length &&
    bulkParsingFeatures.every((feature) => fileData.settings.parsingFeatures.includes(feature))
  )

  return (
    <FileCardNameWrapper>
      <LongText text={fileData.file.name} />
      {
        !isBulkTheSame && (
          <DisclaimerText>
            {localize(Localization.MANUALLY_CONFIGURED)}
          </DisclaimerText>
        )
      }
    </FileCardNameWrapper>
  )
}

FileName.propTypes = {
  fileData: pickedFileShape.isRequired,
}
