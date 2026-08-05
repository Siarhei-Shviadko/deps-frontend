import PropTypes from 'prop-types'
import { useParams } from 'react-router'
import { useFetchDocumentTypesGroupState } from '@/apiRTK/documentTypesGroupsApi'
import { useCreateSplitterMutation } from '@/apiRTK/splittingApi'
import { DocumentTypeSplitter } from '@/containers/DocumentTypeSplitter'
import { DocumentTypesGroupExtras } from '@/enums/DocumentTypesGroupExtras'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Localization, localize } from '@/localization/i18n'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { PlusIcon, Trigger } from './AddSplitterDrawerButton.styles'

export const AddSplitterDrawerButton = ({ documentTypeId }) => {
  const { groupId } = useParams()

  const { data: { group } } = useFetchDocumentTypesGroupState({
    groupId,
    extras: [
      DocumentTypesGroupExtras.CLASSIFIERS,
      DocumentTypesGroupExtras.SPLITTERS,
    ],
  })

  const [
    createSplitter,
    { isLoading },
  ] = useCreateSplitterMutation()

  const getTrigger = (onClick) => (
    <Trigger
      onClick={onClick}
    >
      <PlusIcon />
      {localize(Localization.ADD_SPLITTER)}
    </Trigger>
  )

  const onSubmit = async (values) => {
    try {
      await createSplitter({
        ...values,
        groupId,
      }).unwrap()
      notifySuccess(localize(Localization.CREATE_SPLITTER_SUCCESSFUL))
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }

  return (
    <DocumentTypeSplitter.Drawer
      documentTypeId={documentTypeId}
      isLoading={isLoading}
      onSubmit={onSubmit}
      renderTrigger={getTrigger}
    >
      <DocumentTypeSplitter.DocTypeField
        allowSelectDocumentType={false}
        groupDocumentTypeIds={[documentTypeId]}
        groupSplitters={group.splitters ?? []}
        initialDocumentTypeId={documentTypeId}
      >
        <DocumentTypeSplitter.Fields />
      </DocumentTypeSplitter.DocTypeField>
    </DocumentTypeSplitter.Drawer>
  )
}

AddSplitterDrawerButton.propTypes = {
  documentTypeId: PropTypes.string.isRequired,
}
