
import { useCallback, useMemo } from 'react'
import { useCreateGenAiClassifierMutation } from '@/apiRTK/documentTypesGroupsApi'
import { Button } from '@/components/Button'
import { GenAiClassifierDrawer } from '@/containers/GenAiClassifierDrawer'
import { RESOURCE_ERROR_TO_DISPLAY } from '@/enums/Errors'
import { Localization, localize } from '@/localization/i18n'
import { documentTypesGroupShape } from '@/models/DocumentTypesGroup'
import { notifySuccess, notifyWarning } from '@/utils/notification'

const SetClassifiersDrawerButton = ({ group }) => {
  const [
    createGenAiClassifier,
    { isLoading },
  ] = useCreateGenAiClassifierMutation()

  const getTrigger = (onClick) => (
    <Button.Secondary
      onClick={onClick}
    >
      {localize(Localization.SET_CLASSIFIERS)}
    </Button.Secondary>
  )

  const onSubmit = useCallback(async (values) => {
    try {
      await createGenAiClassifier(values).unwrap()
      notifySuccess(localize(Localization.CREATE_GEN_AI_CLASSIFIER_SUCCESSFUL))
    } catch (e) {
      const errorCode = e?.data?.code
      const message = RESOURCE_ERROR_TO_DISPLAY[errorCode] ?? localize(Localization.DEFAULT_ERROR)
      notifyWarning(message)
    }
  }, [createGenAiClassifier])

  const groupDocTypeIdsWithoutClassifier = useMemo(() => {
    const docTypesWithClassifier = group.genAiClassifiers.map((c) => c.documentTypeId)
    return group.documentTypeIds.filter((id) => !docTypesWithClassifier.includes(id))
  }, [
    group.genAiClassifiers,
    group.documentTypeIds,
  ])

  return (
    <GenAiClassifierDrawer
      documentTypeId={groupDocTypeIdsWithoutClassifier[0]}
      isLoading={isLoading}
      onSubmit={onSubmit}
      renderTrigger={getTrigger}
    />
  )
}

SetClassifiersDrawerButton.propTypes = {
  group: documentTypesGroupShape.isRequired,
}

export {
  SetClassifiersDrawerButton,
}
