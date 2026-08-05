import { useUpdateSplitterMutation } from '@/apiRTK/splittingApi'
import { PenIcon } from '@/components/Icons/PenIcon'
import { TableActionIcon } from '@/components/TableActionIcon'
import { DocumentTypeSplitter } from '@/containers/DocumentTypeSplitter'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Localization, localize } from '@/localization/i18n'
import { splitterShape } from '@/models/Splitter'
import { notifySuccess, notifyWarning } from '@/utils/notification'

export const EditSplitterDrawerButton = ({ splitter }) => {
  const [
    updateSplitter,
    { isLoading },
  ] = useUpdateSplitterMutation()

  const getTrigger = (onClick) => (
    <TableActionIcon
      icon={<PenIcon />}
      onClick={onClick}
    />
  )

  const onSubmit = async (values) => {
    try {
      await updateSplitter({
        id: splitter.id,
        ...values,
      }).unwrap()
      notifySuccess(localize(Localization.UPDATE_SPLITTER_SUCCESSFUL))
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }

  return (
    <DocumentTypeSplitter.Drawer
      documentTypeId={splitter.documentTypeId}
      isLoading={isLoading}
      onSubmit={onSubmit}
      renderTrigger={getTrigger}
      splitter={splitter}
    >
      <DocumentTypeSplitter.DocTypeField
        allowSelectDocumentType={false}
        groupDocumentTypeIds={[splitter.documentTypeId]}
        groupSplitters={[splitter]}
        initialDocumentTypeId={splitter.documentTypeId}
      >
        <DocumentTypeSplitter.Fields splitter={splitter} />
      </DocumentTypeSplitter.DocTypeField>
    </DocumentTypeSplitter.Drawer>
  )
}

EditSplitterDrawerButton.propTypes = {
  splitter: splitterShape.isRequired,
}
