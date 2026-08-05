
import { useDispatch, useSelector } from 'react-redux'
import { setSelection } from '@/actions/navigation'
import { Button, ButtonType } from '@/components/Button'
import { AddDocumentTypesToGroupButton } from '@/containers/AddDocumentTypeToGroupButton'
import { DeleteDocumentTypesFromGroupButton } from '@/containers/DeleteDocumentTypesFromGroupButton'
import { EditDocumentTypesGroupDrawerButton } from '@/containers/EditDocumentTypesGroupDrawerButton'
import { PageNavigationHeader } from '@/containers/PageNavigationHeader'
import { Localization, localize } from '@/localization/i18n'
import { documentTypesGroupShape } from '@/models/DocumentTypesGroup'
import { selectionSelector } from '@/selectors/navigation'
import { ENV } from '@/utils/env'
import { navigationMap } from '@/utils/navigationMap'
import { SetClassifiersDrawerButton } from '../SetClassifiersDrawerButton'
import { SetSplittersDrawerButton } from '../SetSplittersDrawerButton'
import { Controls, HeaderExtraWrapper } from './DocumentTypesGroupHeader.styles'

const DocumentTypesGroupHeader = ({ group }) => {
  const selectedDocumentTypes = useSelector(selectionSelector)
  const dispatch = useDispatch()

  const documentTypesWithClassifiers = group.genAiClassifiers.map((c) => c.documentTypeId)
  const isSetClassifierButtonVisible = group.documentTypeIds.some((dt) => !documentTypesWithClassifiers.includes(dt))

  const documentTypesWithSplitters = group.splitters
    .filter((s) => s.documentTypeId)
    .map((s) => s.documentTypeId)
  const isSetSplitterButtonVisible = group.documentTypeIds.some(
    (dt) => !documentTypesWithSplitters.includes(dt),
  )

  const clearSelection = () => {
    dispatch(setSelection(null))
  }

  const renderDeleteButton = (onClick) => (
    <Button
      onClick={onClick}
      type={ButtonType.PRIMARY}
    >
      {localize(Localization.DELETE)}
    </Button>
  )

  const renderExtra = () => (
    <HeaderExtraWrapper>
      <Controls>
        {
          !!selectedDocumentTypes.length && (
            <DeleteDocumentTypesFromGroupButton
              documentTypeIds={selectedDocumentTypes}
              groupId={group.id}
              onAfterDelete={clearSelection}
              renderTrigger={renderDeleteButton}
            />
          )
        }
        {
          isSetClassifierButtonVisible &&
          ENV.FEATURE_CLASSIFIER &&
          ENV.FEATURE_LLM_DATA_EXTRACTION && (
            <SetClassifiersDrawerButton
              group={group}
            />
          )
        }
        {
          ENV.FEATURE_PDF_SPLITTING &&
          isSetSplitterButtonVisible && (
            <SetSplittersDrawerButton
              group={group}
            />
          )
        }
        <EditDocumentTypesGroupDrawerButton
          group={group}
        />
        <AddDocumentTypesToGroupButton
          group={group}
        />
      </Controls>
    </HeaderExtraWrapper>
  )

  return (
    <PageNavigationHeader
      parentPath={navigationMap.documentTypesGroups()}
      renderExtra={renderExtra}
      title={group.name}
    />
  )
}

DocumentTypesGroupHeader.propTypes = {
  group: documentTypesGroupShape.isRequired,
}

export {
  DocumentTypesGroupHeader,
}
