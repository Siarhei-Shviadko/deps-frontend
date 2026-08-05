
import {
  useCallback,
  useMemo,
  useState,
} from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useUpdateDocumentTypesGroupMutation } from '@/apiRTK/documentTypesGroupsApi'
import { Button } from '@/components/Button'
import { FormValidationMode } from '@/components/Form'
import { Spin } from '@/components/Spin'
import { DEFAULT_VALUES } from '@/containers/DocumentTypeSplitter'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { localize, Localization } from '@/localization/i18n'
import { documentTypesGroupShape } from '@/models/DocumentTypesGroup'
import { theme } from '@/theme/theme.default'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import {
  CancelButton,
  Drawer,
  DrawerFooterWrapper,
} from './EditDocumentTypesGroupDrawerButton.styles'
import { EditDocumentTypesGroupForm } from './EditDocumentTypesGroupForm'
import { useManageSplitter } from './useManageSplitter'

const EditDocumentTypesGroupDrawerButton = ({ group }) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  const [isSplitterVisible, setIsSplitterVisible] = useState(false)

  const [
    updateDocumentTypesGroup,
    { isLoading: isGroupUpdateLoading },
  ] = useUpdateDocumentTypesGroupMutation()

  const {
    manageSplitter,
    isLoading: isSplitterLoading,
  } = useManageSplitter(group)

  const isLoading = isGroupUpdateLoading || isSplitterLoading

  const methods = useForm({
    mode: FormValidationMode.ON_CHANGE,
    shouldUnregister: true,
  })

  const {
    getValues,
    formState: {
      isValid,
    },
    handleSubmit,
    reset,
  } = methods

  const handleOpenDrawer = useCallback(() => {
    const groupSplitter = group.splitters.find((splitter) => !splitter.documentTypeId)
    setIsSplitterVisible(!!groupSplitter)

    reset({
      name: group.name,
      splitter: groupSplitter ?? DEFAULT_VALUES,
    })

    setIsDrawerVisible(true)
  }, [group, reset])

  const handleSplitterVisibilityChange = useCallback((isVisible) => {
    setIsSplitterVisible(isVisible)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    reset()
    setIsDrawerVisible(false)
  }, [reset])

  const saveGroup = useCallback(async () => {
    const { splitter, ...groupInfo } = getValues()
    const splitterToSave = isSplitterVisible ? splitter : null

    try {
      await manageSplitter(splitterToSave)

      await updateDocumentTypesGroup({
        groupId: group.id,
        groupInfo,
      }).unwrap()

      notifySuccess(localize(Localization.DOC_TYPES_GROUP_SUCCESS_UPDATE))
      handleCloseDrawer()
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }, [
    manageSplitter,
    getValues,
    group.id,
    isSplitterVisible,
    handleCloseDrawer,
    updateDocumentTypesGroup,
  ])

  const DrawerFooter = useMemo(() => (
    <DrawerFooterWrapper>
      <CancelButton
        disabled={isLoading}
        onClick={handleCloseDrawer}
      >
        {localize(Localization.CANCEL)}
      </CancelButton>
      <Button.Secondary
        disabled={!isValid}
        loading={isLoading}
        onClick={saveGroup}
      >
        {localize(Localization.SAVE)}
      </Button.Secondary>
    </DrawerFooterWrapper>
  ), [
    isLoading,
    handleCloseDrawer,
    isValid,
    saveGroup,
  ])

  return (
    <>
      <Button.Secondary
        onClick={handleOpenDrawer}
      >
        {localize(Localization.EDIT)}
      </Button.Secondary>
      <Drawer
        destroyOnClose
        footer={DrawerFooter}
        hasCloseIcon={false}
        onClose={handleCloseDrawer}
        open={isDrawerVisible}
        title={localize(Localization.EDIT_GROUP)}
        width={theme.size.drawerWidth}
      >
        <Spin spinning={isLoading}>
          <FormProvider {...methods}>
            <EditDocumentTypesGroupForm
              group={group}
              handleSubmit={handleSubmit}
              onSplitterVisibilityChange={handleSplitterVisibilityChange}
              saveGroup={saveGroup}
            />
          </FormProvider>
        </Spin>
      </Drawer>
    </>
  )
}

EditDocumentTypesGroupDrawerButton.propTypes = {
  group: documentTypesGroupShape.isRequired,
}

export {
  EditDocumentTypesGroupDrawerButton,
}
