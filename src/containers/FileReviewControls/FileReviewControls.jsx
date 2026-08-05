
import { useCallback, useState } from 'react'
import { useParams } from 'react-router'
import { useFetchFileQuery } from '@/apiRTK/filesApi'
import { Button } from '@/components/Button'
import { ArrowDownSolidIcon } from '@/components/Icons/ArrowDownSolidIcon'
import { Tooltip } from '@/components/Tooltip'
import { DownloadLink } from '@/containers/DownloadLink'
import { FileGenAIModalButton } from '@/containers/FileGenAIModalButton'
import { FileMoreActions } from '@/containers/FileMoreActions'
import { FileStatus } from '@/enums/FileStatus'
import { localize, Localization } from '@/localization/i18n'
import { apiMap } from '@/utils/apiMap'
import { ENV } from '@/utils/env'
import { Controls } from './FileReviewControls.styles'
import { FileReviewSplittingButton } from './FileReviewSplittingButton'

const FileReviewControls = () => {
  const { fileId } = useParams()
  const { data: file } = useFetchFileQuery(fileId)
  const [isChatVisible, setIsChatVisible] = useState(false)

  const toggleChatVisibility = useCallback(() => {
    setIsChatVisible((prev) => !prev)
  }, [])

  const fileUrl = apiMap.apiGatewayV2.v5.file.blob(file.path)

  return (
    <Controls>
      {
        ENV.FEATURE_PDF_SPLITTING &&
        file.state.status === FileStatus.SPLITTING_REVIEW && (
          <FileReviewSplittingButton file={file} />
        )
      }
      <DownloadLink
        apiUrl={fileUrl}
        fileName={file.name}
      >
        <Tooltip title={localize(Localization.DOWNLOAD_FILE)}>
          <Button.Secondary
            icon={<ArrowDownSolidIcon />}
          />
        </Tooltip>
      </DownloadLink>
      {
        ENV.FEATURE_GEN_AI_CHAT && (
          <FileGenAIModalButton
            isModalVisible={isChatVisible}
            toggleModal={toggleChatVisibility}
          />
        )
      }
      <FileMoreActions file={file} />
    </Controls>
  )
}

export {
  FileReviewControls,
}
