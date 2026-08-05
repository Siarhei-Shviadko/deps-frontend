import PropTypes from 'prop-types'
import { useCallback, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { Button, ButtonType } from '@/components/Button'
import { FormValidationMode } from '@/components/Form'
import { Spin } from '@/components/Spin'
import { GenAiClassifierForm } from '@/containers/GenAiClassifierForm'
import { Localization, localize } from '@/localization/i18n'
import { documentTypesGroupShape } from '@/models/DocumentTypesGroup'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { areTypesFetchingSelector } from '@/selectors/requests'
import { ENV } from '@/utils/env'
import {
  CancelButton,
  Drawer,
  DrawerFooterWrapper,
} from './ManageGroupDocumentTypesDrawer.styles'
import { ManageGroupDocumentTypesForm } from './ManageGroupDocumentTypesForm'

const DRAWER_WIDTH = '44rem'

const ManageGroupDocumentTypesDrawer = ({
  isLoading,
  addDocTypesToGroup,
  addClassifierToDocType,
  closeDrawer,
  visible,
  group,
}) => {
  const [docTypeIdsWithoutClassifier, setDocTypeIdsWithoutClassifier] = useState([])
  const [activeDocTypeId, setActiveDocTypeId] = useState(null)
  const isSetClassifierMode = !!activeDocTypeId

  const documentTypes = useSelector(documentTypesSelector)
  const areDocumentTypesFetching = useSelector(areTypesFetchingSelector)
  const documentTypesToAdd = documentTypes.filter(({ code }) => !group.documentTypeIds.includes(code))

  const addDocumentTypeFormMethods = useForm({
    mode: FormValidationMode.ON_CHANGE,
    shouldUnregister: true,
  })

  const {
    getValues: getDocumentTypesFormValues,
    formState: {
      isValid: isAddDocumentTypesFormValid,
    },
  } = addDocumentTypeFormMethods

  const addClassifierFormMethods = useForm({
    mode: FormValidationMode.ON_CHANGE,
    shouldUnregister: true,
  })

  const {
    reset: resetClassifierForm,
    getValues: getClassifierFormValues,
    formState: {
      isValid: isSetClassifierFormValid,
    },
  } = addClassifierFormMethods

  const onAddDocumentTypesSubmit = useCallback(async () => {
    await addDocTypesToGroup(getDocumentTypesFormValues())
    closeDrawer()
  }, [
    getDocumentTypesFormValues,
    addDocTypesToGroup,
    closeDrawer,
  ])

  const onSetClassifierSubmit = useCallback(async () => {
    const {
      name,
      llmType,
      prompt,
    } = getClassifierFormValues()

    await addClassifierToDocType({
      documentTypeId: activeDocTypeId,
      groupId: group.id,
      name,
      llmType,
      prompt,
    })

    const docTypeIdsToSetClassifier = docTypeIdsWithoutClassifier.filter((id) =>
      id !== activeDocTypeId,
    )

    if (!docTypeIdsToSetClassifier.length) {
      closeDrawer()
      return
    }

    setDocTypeIdsWithoutClassifier(docTypeIdsToSetClassifier)
    resetClassifierForm()
  }, [
    activeDocTypeId,
    addClassifierToDocType,
    closeDrawer,
    docTypeIdsWithoutClassifier,
    group.id,
    getClassifierFormValues,
    resetClassifierForm,
    setDocTypeIdsWithoutClassifier,
  ])

  const onSaveAndSetClassifier = useCallback(async () => {
    const { documentTypeIds } = getDocumentTypesFormValues()
    await addDocTypesToGroup(getDocumentTypesFormValues())
    setDocTypeIdsWithoutClassifier(documentTypeIds)
    setActiveDocTypeId(documentTypeIds[0])
  }, [
    addDocTypesToGroup,
    getDocumentTypesFormValues,
    setActiveDocTypeId,
    setDocTypeIdsWithoutClassifier,
  ])

  const drawerTitle = isSetClassifierMode
    ? localize(Localization.ADD_CLASSIFIER)
    : localize(Localization.ADD_DOCUMENT_TYPES)

  const isValid = isSetClassifierMode
    ? isSetClassifierFormValid
    : isAddDocumentTypesFormValid

  const onSave = isSetClassifierMode
    ? onSetClassifierSubmit
    : onAddDocumentTypesSubmit

  const onClose = useCallback(() => {
    closeDrawer()
    setActiveDocTypeId(null)
    setDocTypeIdsWithoutClassifier([])
  }, [
    closeDrawer,
    setDocTypeIdsWithoutClassifier,
    setActiveDocTypeId,
  ])

  const DrawerFooter = useMemo(() => (
    <DrawerFooterWrapper>
      <CancelButton
        disabled={isLoading}
        onClick={onClose}
      >
        {localize(Localization.CANCEL)}
      </CancelButton>
      <Button.Secondary
        disabled={!isValid}
        loading={isLoading}
        onClick={onSave}
      >
        {localize(Localization.SAVE)}
      </Button.Secondary>
      {
        ENV.FEATURE_CLASSIFIER &&
        !isSetClassifierMode && (
          <Button
            disabled={!isValid}
            loading={isLoading}
            onClick={onSaveAndSetClassifier}
            type={ButtonType.PRIMARY}
          >
            {localize(Localization.SAVE_AND_SET_CLASSIFIERS)}
          </Button>
        )
      }
    </DrawerFooterWrapper>
  ), [
    isValid,
    isLoading,
    isSetClassifierMode,
    onSaveAndSetClassifier,
    onSave,
    onClose,
  ])

  return (
    <Drawer
      destroyOnClose
      footer={DrawerFooter}
      hasCloseIcon={false}
      onClose={onClose}
      open={visible}
      title={drawerTitle}
      width={DRAWER_WIDTH}
    >
      <Spin spinning={isLoading || areDocumentTypesFetching}>
        {
          isSetClassifierMode && ENV.FEATURE_LLM_DATA_EXTRACTION ? (
            <FormProvider {...addClassifierFormMethods}>
              <GenAiClassifierForm
                allowSelectDocumentType
                currentDocumentTypeId={activeDocTypeId}
                groupDocumentTypeIds={docTypeIdsWithoutClassifier}
                groupGenAiClassifiers={group.genAiClassifiers}
                initialDocumentTypeId={docTypeIdsWithoutClassifier[0]}
                onSubmit={onSetClassifierSubmit}
                setCurrentDocumentTypeId={setActiveDocTypeId}
              />
            </FormProvider>
          ) : (
            <FormProvider {...addDocumentTypeFormMethods}>
              <ManageGroupDocumentTypesForm
                documentTypes={documentTypesToAdd}
              />
            </FormProvider>
          )
        }
      </Spin>
    </Drawer>
  )
}

ManageGroupDocumentTypesDrawer.propTypes = {
  addDocTypesToGroup: PropTypes.func.isRequired,
  addClassifierToDocType: PropTypes.func.isRequired,
  closeDrawer: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  group: documentTypesGroupShape.isRequired,
  visible: PropTypes.bool.isRequired,
}

export {
  ManageGroupDocumentTypesDrawer,
}
