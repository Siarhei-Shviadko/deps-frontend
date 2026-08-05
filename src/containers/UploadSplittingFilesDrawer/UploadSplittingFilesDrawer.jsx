
import PropTypes from 'prop-types'
import { useCallback, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useCreateBatchMutation } from '@/apiRTK/batchesApi'
import { Button, ButtonType } from '@/components/Button'
import { FormValidationMode } from '@/components/Form'
import { BatchFilesSplittingDrawer } from '@/containers/BatchFilesSplittingDrawer'
import { ProgressModal } from '@/containers/ProgressModal'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { FileExtension } from '@/enums/FileExtension'
import { localize, Localization } from '@/localization/i18n'
import { getFileExtension } from '@/utils/getFileExtension'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { BatchSettingsForm } from './BatchSettingsForm'
import {
  DefaultFormValues,
  DRAWER_WIDTH_DEFAULT,
  FIELD_FORM_CODE,
  MAX_FILES_COUNT_FOR_ONE_BATCH,
} from './constants'
import { useAutoSplitFiles, useUploadSplittingFiles } from './hooks'
import { mapDataToBatchDTO } from './mappers'
import { UploadConfirmationButton } from './UploadConfirmationButton'
import { UploadFilesForm } from './UploadFilesForm'
import {
  ButtonsWrapper,
  ContentWrapper,
  DrawerFooterWrapper,
  ErrorIcon,
  ErrorMessageWrapper,
  ResetButton,
  StyledDrawer,
} from './UploadSplittingFilesDrawer.styles'

export const UploadSplittingFilesDrawer = ({ isVisible, onClose }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [isSplittingDrawerVisible, setIsSplittingDrawerVisible] = useState(false)

  const formApi = useForm({
    mode: FormValidationMode.ON_CHANGE,
    shouldUnregister: true,
    defaultValues: DefaultFormValues,
  })

  const {
    uploadSplittingFiles,
    completedRequests: uploadCompletedRequests,
    resetRequestsCounter: resetUploadCounter,
  } = useUploadSplittingFiles()

  const {
    autoSplitFiles,
    completedRequests: autoSplitCompletedRequests,
    resetRequestsCounter: resetAutoSplitCounter,
  } = useAutoSplitFiles()

  const [createBatch] = useCreateBatchMutation()

  const toggleSplittingDrawerVisibility = useCallback(() => {
    setIsSplittingDrawerVisible((prev) => !prev)
  }, [])

  const createBatchHandler = useCallback(async (uploadedData, formValues) => {
    try {
      const data = mapDataToBatchDTO({
        formValues,
        uploadedData,
      })

      await createBatch(data).unwrap()
      notifySuccess(localize(Localization.BATCH_WAS_CREATED))
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }, [createBatch])

  const submitData = useCallback(async (files) => {
    setIsUploading(true)

    const formValues = formApi.getValues()
    const uploadedData = await uploadSplittingFiles(files)

    uploadedData && await createBatchHandler(uploadedData, formValues)

    setIsUploading(false)
    resetUploadCounter()
  }, [
    formApi,
    uploadSplittingFiles,
    createBatchHandler,
    resetUploadCounter,
  ])

  const formValues = formApi.watch()
  const isAutoSplitting = formValues[FIELD_FORM_CODE.AUTOMATIC_SPLITTING]

  const submitAutoSplitData = useCallback(async () => {
    const isFormValid = await formApi.trigger()

    if (!isFormValid) {
      return
    }

    setIsUploading(true)

    const { files, group, ...rest } = formApi.getValues()
    const filesData = files.map((file) => ({
      file,
      groupId: group?.id ?? null,
      ...rest,
    }))

    await autoSplitFiles(filesData)

    setIsUploading(false)
    resetAutoSplitCounter()
  }, [formApi, autoSplitFiles, resetAutoSplitCounter])

  const isSaveDisabled = (
    !formValues.files?.length ||
    isUploading ||
    !formApi.formState.isValid
  )

  const shouldShowConfirmation = (
    !isAutoSplitting &&
    !!formValues.files?.every((file) => getFileExtension(file.name) !== FileExtension.PDF) &&
    !!formValues.files?.length
  )

  const onConfirmHandler = useCallback(() => {
    const filesData = formValues.files.map((file) => ({ file }))
    submitData(filesData)
  }, [submitData, formValues.files])

  const onReset = useCallback(() => {
    formApi.reset({
      ...DefaultFormValues,
      files: formValues.files,
    })
  }, [formApi, formValues.files])

  const isUploadFilesLimitExceeded = formValues.files?.length > MAX_FILES_COUNT_FOR_ONE_BATCH

  const ConfirmationButton = useMemo(() => {
    if (isAutoSplitting) {
      return (
        <Button
          disabled={isSaveDisabled || isUploadFilesLimitExceeded}
          onClick={submitAutoSplitData}
          type={ButtonType.PRIMARY}
        >
          {localize(Localization.UPLOAD)}
        </Button>
      )
    }

    return (
      <UploadConfirmationButton
        disabled={isSaveDisabled || isUploadFilesLimitExceeded}
        onClick={toggleSplittingDrawerVisibility}
        onConfirm={onConfirmHandler}
        withConfirm={shouldShowConfirmation}
      />
    )
  }, [
    isSaveDisabled,
    isUploadFilesLimitExceeded,
    isAutoSplitting,
    submitAutoSplitData,
    toggleSplittingDrawerVisibility,
    onConfirmHandler,
    shouldShowConfirmation,
  ])

  const DrawerFooter = useMemo(() => (
    <DrawerFooterWrapper>
      <ResetButton
        onClick={onReset}
      >
        {localize(Localization.RESET_SETTINGS)}
      </ResetButton>
      {
        isUploadFilesLimitExceeded && (
          <ErrorMessageWrapper>
            <ErrorIcon />
            {localize(Localization.FILES_LIMIT_FOR_BATCH_EXCEEDED)}
          </ErrorMessageWrapper>
        )
      }
      <ButtonsWrapper>
        <Button
          onClick={onClose}
        >
          {localize(Localization.CANCEL)}
        </Button>
        {ConfirmationButton}
      </ButtonsWrapper>
    </DrawerFooterWrapper>
  ), [
    onReset,
    onClose,
    isUploadFilesLimitExceeded,
    ConfirmationButton,
  ])

  const { files, ...restFormValues } = formValues

  return (
    <FormProvider {...formApi}>
      <StyledDrawer
        destroyOnClose
        footer={DrawerFooter}
        getContainer={() => document.body}
        hasCloseIcon={false}
        onClose={onClose}
        open={isVisible}
        title={localize(Localization.BATCH_SETTINGS)}
        width={DRAWER_WIDTH_DEFAULT}
      >
        <ContentWrapper>
          <BatchSettingsForm />
          <UploadFilesForm />
        </ContentWrapper>
      </StyledDrawer>
      {
        isUploading && (
          <ProgressModal
            current={isAutoSplitting ? autoSplitCompletedRequests : uploadCompletedRequests}
            total={formValues.files.length}
          />
        )
      }
      {
        formValues.files?.length && (
          <BatchFilesSplittingDrawer
            files={files}
            isVisible={isSplittingDrawerVisible}
            onClose={toggleSplittingDrawerVisibility}
            onSubmit={submitData}
            settings={restFormValues}
          />
        )
      }
    </FormProvider>
  )
}

UploadSplittingFilesDrawer.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
