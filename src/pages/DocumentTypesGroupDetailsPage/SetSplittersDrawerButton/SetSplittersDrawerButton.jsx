import { useCallback, useMemo } from 'react'
import { useCreateSplitterMutation } from '@/apiRTK/splittingApi'
import { Button } from '@/components/Button'
import { DocumentTypeSplitter } from '@/containers/DocumentTypeSplitter'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Localization, localize } from '@/localization/i18n'
import { documentTypesGroupShape } from '@/models/DocumentTypesGroup'
import { notifySuccess, notifyWarning } from '@/utils/notification'

export const SetSplittersDrawerButton = ({ group }) => {
  const [
    createSplitter,
    { isLoading },
  ] = useCreateSplitterMutation()

  const getTrigger = (onClick) => (
    <Button.Secondary
      onClick={onClick}
    >
      {localize(Localization.SET_SPLITTERS)}
    </Button.Secondary>
  )

  const onSubmit = useCallback(async (values) => {
    try {
      await createSplitter({
        ...values,
        groupId: group.id,
      }).unwrap()
      notifySuccess(localize(Localization.CREATE_SPLITTER_SUCCESSFUL))
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }, [createSplitter, group.id])

  const groupDocTypeIdsWithoutSplitter = useMemo(() => {
    const docTypesWithSplitter = group.splitters
      .filter((s) => s.documentTypeId)
      .map((s) => s.documentTypeId)

    return group.documentTypeIds.filter((id) => !docTypesWithSplitter.includes(id))
  }, [
    group.splitters,
    group.documentTypeIds,
  ])

  const [initialDocTypeId] = groupDocTypeIdsWithoutSplitter

  return (
    <DocumentTypeSplitter.Drawer
      documentTypeId={initialDocTypeId}
      isLoading={isLoading}
      onSubmit={onSubmit}
      renderTrigger={getTrigger}
    >
      <DocumentTypeSplitter.DocTypeField
        groupDocumentTypeIds={groupDocTypeIdsWithoutSplitter}
        groupSplitters={group.splitters}
        initialDocumentTypeId={initialDocTypeId}
      >
        <DocumentTypeSplitter.Fields />
      </DocumentTypeSplitter.DocTypeField>
    </DocumentTypeSplitter.Drawer>
  )
}

SetSplittersDrawerButton.propTypes = {
  group: documentTypesGroupShape.isRequired,
}
