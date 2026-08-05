
import { useState } from 'react'
import { useCreateDocumentTypesGroupMutation } from '@/apiRTK/documentTypesGroupsApi'
import { useCreateSplitterMutation } from '@/apiRTK/splittingApi'
import { ButtonType } from '@/components/Button'
import { NewPlusIcon } from '@/components/Icons/NewPlusIcon'
import { DocumentTypesGroupDrawer } from '@/containers/DocumentTypesGroupDrawer'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { localize, Localization } from '@/localization/i18n'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { StyledButton } from './AddDocumentTypesGroupDrawerButton.styles'

const AddDocumentTypesGroupDrawerButton = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)

  const [
    createDocumentTypesGroup,
    { isLoading: isGroupCreating },
  ] = useCreateDocumentTypesGroupMutation()

  const [
    createSplitter,
    { isLoading: isSplitterCreating },
  ] = useCreateSplitterMutation()

  const isLoading = isGroupCreating || isSplitterCreating

  const toggleDrawer = () => setIsDrawerVisible((prev) => !prev)

  const createGroup = async (formValues) => {
    const { splitter, ...groupData } = formValues
    try {
      const newGroup = await createDocumentTypesGroup(groupData).unwrap()

      if (splitter) {
        const { splittingMode, ...rest } = splitter

        await createSplitter({
          groupId: newGroup.id,
          mode: splittingMode,
          ...rest,
        }).unwrap()
      }

      notifySuccess(localize(Localization.DOC_TYPES_GROUP_SUCCESS_CREATION))
      toggleDrawer()
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }

  return (
    <>
      <StyledButton
        onClick={toggleDrawer}
        type={ButtonType.PRIMARY}
      >
        <NewPlusIcon />
        {localize(Localization.ADD_GROUP)}
      </StyledButton>
      <DocumentTypesGroupDrawer
        closeDrawer={toggleDrawer}
        isLoading={isLoading}
        onSave={createGroup}
        visible={isDrawerVisible}
      />
    </>
  )
}

export {
  AddDocumentTypesGroupDrawerButton,
}
