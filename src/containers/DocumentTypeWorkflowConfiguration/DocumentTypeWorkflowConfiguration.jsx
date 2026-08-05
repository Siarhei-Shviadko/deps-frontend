
import { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { fetchDocumentType } from '@/actions/documentType'
import { useUpdateWorkflowConfigurationMutation } from '@/apiRTK/documentTypeApi'
import { Button } from '@/components/Button'
import { GearIcon } from '@/components/Icons/GearIcon'
import { Tooltip } from '@/components/Tooltip'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Localization, localize } from '@/localization/i18n'
import { documentTypeShape } from '@/models/DocumentType'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { WorkflowConfigurationDrawer } from './WorkflowConfigurationDrawer'

const DocumentTypeWorkflowConfiguration = ({
  documentType,
}) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  const dispatch = useDispatch()

  const [updateWorkflowConfiguration, { isLoading }] = useUpdateWorkflowConfigurationMutation()

  const openDrawer = useCallback(() => setIsDrawerVisible(true), [])
  const closeDrawer = useCallback(() => setIsDrawerVisible(false), [])

  const refreshDocumentType = useCallback(() => {
    dispatch(fetchDocumentType(
      documentType.code,
      [DocumentTypeExtras.WORKFLOW_CONFIGURATIONS]),
    )
  }, [dispatch, documentType.code])

  const handleSubmit = useCallback(async (data) => {
    try {
      await updateWorkflowConfiguration({
        documentTypeId: documentType.code,
        data,
      }).unwrap()
      notifySuccess(localize(Localization.WORKFLOW_SETTINGS_SAVED))
      closeDrawer()
      refreshDocumentType()
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }, [
    documentType.code,
    updateWorkflowConfiguration,
    closeDrawer,
    refreshDocumentType,
  ])

  return (
    <>
      <Tooltip title={localize(Localization.WORKFLOW_CONFIGURATION)}>
        <Button.Secondary
          disabled={isLoading}
          icon={<GearIcon />}
          onClick={openDrawer}
        />
      </Tooltip>
      <WorkflowConfigurationDrawer
        isLoading={isLoading}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        visible={isDrawerVisible}
      />
    </>
  )
}

DocumentTypeWorkflowConfiguration.propTypes = {
  documentType: documentTypeShape.isRequired,
}

export {
  DocumentTypeWorkflowConfiguration,
}
