import { useCallback, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useLazyFetchDocumentTypesGroupQuery } from '@/apiRTK/documentTypesGroupsApi'
import { useSplitExistingFileMutation } from '@/apiRTK/filesApi'
import { Button, ButtonType } from '@/components/Button'
import { FormValidationMode } from '@/components/Form'
import { Spin } from '@/components/Spin'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Placement } from '@/enums/Placement'
import { Localization, localize } from '@/localization/i18n'
import { fileShape } from '@/models/File'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import {
  ButtonsWrapper,
  DrawerFooterWrapper,
  StyledDrawer,
} from './AutoFileSplittingButton.styles'
import { AutoFileSplittingForm } from './AutoFileSplittingForm'
import { FIELD_CODE } from './constants'
import { mapProcessingParamsToFormValues } from './mappers'

const DRAWER_WIDTH = '55rem'

export const AutoFileSplittingButton = ({ file }) => {
  const [isAutoSplittingOpen, setIsAutoSplittingOpen] = useState(false)

  const [splitFile, { isLoading }] = useSplitExistingFileMutation()

  const [
    fetchGroup,
    { isFetching: isFetchingGroup },
  ] = useLazyFetchDocumentTypesGroupQuery()

  const formApi = useForm({
    mode: FormValidationMode.ON_CHANGE,
    shouldUnregister: true,
    defaultValues: mapProcessingParamsToFormValues(file.processingParams),
  })

  const {
    formState: {
      isValid,
    },
    getValues,
    reset,
    setValue,
  } = formApi

  const handleOpen = useCallback(async () => {
    try {
      setIsAutoSplittingOpen(true)

      if (!file.processingParams?.groupId) {
        return
      }

      const { group } = await fetchGroup({ groupId: file.processingParams?.groupId }).unwrap()

      setValue(FIELD_CODE.GROUP, group, { shouldValidate: true })
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }, [
    fetchGroup,
    file.processingParams?.groupId,
    setValue,
  ])

  const handleClose = useCallback(() => {
    reset()
    setIsAutoSplittingOpen(false)
  }, [reset])

  const onSubmit = useCallback(async () => {
    try {
      const { group, ...values } = getValues()
      await splitFile({
        fileId: file.id,
        groupId: group.id,
        ...values,
      }).unwrap()
      notifySuccess(localize(Localization.AUTO_SPLITTING_STARTED))
      handleClose()
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }, [
    getValues,
    splitFile,
    file.id,
    handleClose,
  ])

  const DrawerFooter = (
    <DrawerFooterWrapper>
      <ButtonsWrapper>
        <Button onClick={handleClose}>
          {localize(Localization.CANCEL)}
        </Button>
        <Button
          disabled={isLoading || !isValid}
          loading={isLoading}
          onClick={onSubmit}
          type={ButtonType.PRIMARY}
        >
          {localize(Localization.SPLIT)}
        </Button>
      </ButtonsWrapper>
    </DrawerFooterWrapper>
  )

  const renderContent = () => {
    if (isFetchingGroup) {
      return <Spin.Centered spinning />
    }

    return <AutoFileSplittingForm />
  }

  return (
    <>
      <Button.Text onClick={handleOpen}>
        {localize(Localization.AUTOMATIC_FILE_SPLITTING)}
      </Button.Text>
      <StyledDrawer
        destroyOnClose
        footer={DrawerFooter}
        getContainer={() => document.body}
        onClose={handleClose}
        open={isAutoSplittingOpen}
        placement={Placement.RIGHT}
        title={localize(Localization.AUTOMATIC_FILE_SPLITTING)}
        width={DRAWER_WIDTH}
      >
        <FormProvider {...formApi}>
          {renderContent()}
        </FormProvider>
      </StyledDrawer>
    </>
  )
}

AutoFileSplittingButton.propTypes = {
  file: fileShape.isRequired,
}
