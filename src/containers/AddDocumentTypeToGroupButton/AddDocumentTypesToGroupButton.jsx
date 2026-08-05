
import { useState } from 'react'
import {
  useAddDocumentTypesToGroupMutation,
  useCreateGenAiClassifierMutation,
} from '@/apiRTK/documentTypesGroupsApi'
import { ButtonType } from '@/components/Button'
import { NewPlusIcon } from '@/components/Icons/NewPlusIcon'
import { ManageGroupDocumentTypesDrawer } from '@/containers/ManageGroupDocumentTypesDrawer'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { localize, Localization } from '@/localization/i18n'
import { documentTypesGroupShape } from '@/models/DocumentTypesGroup'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { StyledButton } from './AddDocumentTypesToGroupButton.styles'

const AddDocumentTypesToGroupButton = ({ group }) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)

  const [
    addDocumentTypesToGroup,
    { isLoading: isDocumentTypeAdding },
  ] = useAddDocumentTypesToGroupMutation()

  const [
    createGenAiClassifier,
    { isLoading: isClassifierCreating },
  ] = useCreateGenAiClassifierMutation()

  const toggleDrawer = () => setIsDrawerVisible((prev) => !prev)

  const addDocTypesToGroup = async ({ documentTypeIds }) => {
    try {
      await addDocumentTypesToGroup({
        groupId: group.id,
        documentTypeIds,
      }).unwrap()
      notifySuccess(localize(Localization.ADD_DOC_TYPE_TO_GROUP_SUCCESS))
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }

  const addClassifierToDocType = async (values) => {
    try {
      await createGenAiClassifier(values).unwrap()
      notifySuccess(localize(Localization.CREATE_GEN_AI_CLASSIFIER_SUCCESSFUL))
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }

  const isLoading = isDocumentTypeAdding || isClassifierCreating

  return (
    <>
      <StyledButton
        onClick={toggleDrawer}
        type={ButtonType.PRIMARY}
      >
        <NewPlusIcon />
        {localize(Localization.ADD_DOC_TYPE)}
      </StyledButton>
      <ManageGroupDocumentTypesDrawer
        addClassifierToDocType={addClassifierToDocType}
        addDocTypesToGroup={addDocTypesToGroup}
        closeDrawer={toggleDrawer}
        group={group}
        isLoading={isLoading}
        visible={isDrawerVisible}
      />
    </>
  )
}

AddDocumentTypesToGroupButton.propTypes = {
  group: documentTypesGroupShape.isRequired,
}

export {
  AddDocumentTypesToGroupButton,
}
