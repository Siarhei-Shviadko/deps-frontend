
import {
  useMemo,
  useCallback,
  useState,
} from 'react'
import { useLazyFetchDocumentTypesGroupQuery } from '@/apiRTK/documentTypesGroupsApi'
import {
  useUpdateSplittingProposalsMutation,
  useConfirmSplittingProposalsMutation,
  useLazyFetchSplittingProposalsQuery,
} from '@/apiRTK/splittingApi'
import { Badge } from '@/components/Badge'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ClipboardIcon } from '@/components/Icons/ClipboardIcon'
import { WarningTriangleIcon } from '@/components/Icons/WarningTriangleIcon'
import { Tooltip } from '@/components/Tooltip'
import { usePdfSegments } from '@/containers/PdfSplitting/hooks'
import { LocalBoundary } from '@/containers/PdfSplitting/LocalBoundary'
import { PdfSegments } from '@/containers/PdfSplitting/PdfSegments'
import { PdfThumbnailsMap } from '@/containers/PdfSplitting/PdfThumbnailsMap'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Placement } from '@/enums/Placement'
import { localize, Localization } from '@/localization/i18n'
import { fileShape } from '@/models/File'
import { FileCache } from '@/services/FileCache'
import { apiMap } from '@/utils/apiMap'
import { notifyWarning } from '@/utils/notification'
import {
  DrawerHeaderWrapper,
  StyledDrawer,
  StyledSpin,
  WarningButton,
} from './FileReviewSplittingButton.styles'
import { mapProposalsToSegments, mapSegmentsToProposals } from './mappers'

const DRAWER_WIDTH = '90%'

export const FileReviewSplittingButton = ({ file }) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  const [pdfFile, setPdfFile] = useState(null)
  const [fetching, setFetching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isError, setIsError] = useState(false)

  const {
    segments,
    batchName,
    setSegments,
    setBatchName,
    setSelectedGroup,
    setActiveUserPage,
  } = usePdfSegments()

  const [fetchProposals] = useLazyFetchSplittingProposalsQuery()
  const [updateProposals] = useUpdateSplittingProposalsMutation()
  const [confirmProposals] = useConfirmSplittingProposalsMutation()
  const [fetchGroup] = useLazyFetchDocumentTypesGroupQuery()

  const getContainer = useCallback(() => document.body, [])

  const closeDrawer = useCallback(() => {
    setIsDrawerVisible(false)
    setActiveUserPage(null)
  }, [setActiveUserPage])

  const fetchPdfAndProposals = useCallback(async () => {
    try {
      setFetching(true)
      setIsError(false)
      setActiveUserPage(null)

      const fileUrl = apiMap.apiGatewayV2.v5.file.blob(file.path)

      let pdf = await FileCache.get(fileUrl)

      if (!pdf) {
        const cachedData = await FileCache.requestAndStore([fileUrl])
        pdf = cachedData[fileUrl]
      }

      const proposals = await fetchProposals(file.id).unwrap()
      const { group } = await fetchGroup({ groupId: proposals.groupId }).unwrap()

      setPdfFile(pdf)

      setSelectedGroup(group)
      setBatchName(proposals.batchName ?? localize(Localization.BATCH_NAME))
      setSegments(mapProposalsToSegments(proposals))
    } catch (e) {
      const errorCode = e?.response?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
      setIsError(true)
    } finally {
      setFetching(false)
    }
  }, [
    file.path,
    file.id,
    fetchProposals,
    setSegments,
    setBatchName,
    setSelectedGroup,
    setActiveUserPage,
    fetchGroup,
  ])

  const onClickHandler = useCallback(() => {
    setIsDrawerVisible(true)
    fetchPdfAndProposals()
  }, [fetchPdfAndProposals])

  const onSave = useCallback(async () => {
    try {
      setIsSaving(true)

      const proposalSegments = mapSegmentsToProposals(segments)

      await updateProposals({
        fileId: file.id,
        segments: proposalSegments,
        batchName,
      }).unwrap()

      await confirmProposals(file.id).unwrap()

      closeDrawer()
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    } finally {
      setIsSaving(false)
    }
  }, [
    segments,
    file.id,
    updateProposals,
    confirmProposals,
    batchName,
    closeDrawer,
  ])

  const DrawerTitle = useMemo(() => (
    <DrawerHeaderWrapper>
      {localize(Localization.REVIEW_SPLITTING_PROPOSALS)}
    </DrawerHeaderWrapper>
  ), [])

  const Content = useMemo(() => {
    if (isError) {
      return <LocalBoundary />
    }

    if (fetching) {
      return <StyledSpin spinning />
    }

    return (
      <>
        <PdfThumbnailsMap
          fillMissingPages
          pdfFile={pdfFile}
          withTitle
        />
        {
          !!segments.length && (
            <PdfSegments
              disableDocumentTypeGroup
              isSaveDisabled={isSaving}
              onCancel={closeDrawer}
              onSave={onSave}
            />
          )
        }
      </>
    )
  }, [
    isError,
    fetching,
    pdfFile,
    segments.length,
    onSave,
    isSaving,
    closeDrawer,
  ])

  return (
    <>
      <Tooltip title={localize(Localization.REVIEW_SPLITTING_PROPOSALS)}>
        <Badge count={<WarningTriangleIcon />}>
          <WarningButton
            icon={<ClipboardIcon />}
            onClick={onClickHandler}
          />
        </Badge>
      </Tooltip>
      <StyledDrawer
        closeIcon={false}
        destroyOnClose
        getContainer={getContainer}
        onClose={closeDrawer}
        open={isDrawerVisible}
        placement={Placement.RIGHT}
        title={DrawerTitle}
        width={DRAWER_WIDTH}
      >
        <ErrorBoundary localBoundary={() => <LocalBoundary />}>
          {Content}
        </ErrorBoundary>
      </StyledDrawer>
    </>
  )
}

FileReviewSplittingButton.propTypes = {
  file: fileShape.isRequired,
}
