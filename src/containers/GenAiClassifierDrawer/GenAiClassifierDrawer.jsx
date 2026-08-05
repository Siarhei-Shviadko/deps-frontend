
import PropTypes from 'prop-types'
import {
  useCallback,
  useMemo,
  useState,
} from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router'
import { useFetchDocumentTypesGroupState } from '@/apiRTK/documentTypesGroupsApi'
import { Button } from '@/components/Button'
import { FormValidationMode } from '@/components/Form'
import { Spin } from '@/components/Spin'
import { DocumentTypesGroupExtras } from '@/enums/DocumentTypesGroupExtras'
import { Localization, localize } from '@/localization/i18n'
import { genAiClassifierShape } from '@/models/DocumentTypesGroup'
import { theme } from '@/theme/theme.default'
import { GenAiClassifierForm } from '../GenAiClassifierForm'
import {
  Drawer,
  DrawerFooterWrapper,
  Wrapper,
} from './GenAiClassifierDrawer.styles'

const mapClassifierToFormValues = ({
  name,
  llmType,
  prompt,
}) => ({
  name,
  llmType,
  prompt,
})

const GenAiClassifierDrawer = ({
  renderTrigger,
  classifier,
  documentTypeId,
  onSubmit,
  isLoading,
}) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  const [currentDocumentTypeId, setCurrentDocumentTypeId] = useState(documentTypeId)

  const { groupId } = useParams()

  const { data: { group } } = useFetchDocumentTypesGroupState({
    groupId,
    extras: [
      DocumentTypesGroupExtras.CLASSIFIERS,
      DocumentTypesGroupExtras.SPLITTERS,
    ],
  })

  const methods = useForm({
    mode: FormValidationMode.ON_CHANGE,
    shouldUnregister: true,
  })

  const {
    getValues,
    setValue,
    formState: {
      isValid,
      isDirty,
    },
  } = methods

  const setFormValues = useCallback(() => {
    setCurrentDocumentTypeId(documentTypeId)

    if (classifier) {
      const classifierValues = mapClassifierToFormValues(classifier)
      Object.entries(classifierValues).map(([key, value]) => setValue(key, value))
    }
  }, [
    classifier,
    documentTypeId,
    setCurrentDocumentTypeId,
    setValue,
  ])

  const toggleDrawer = useCallback(() => {
    if (isLoading) {
      return
    }

    setIsDrawerVisible((prev) => !prev)
  }, [isLoading])

  const onTriggerClick = () => {
    toggleDrawer()
    setFormValues()
  }

  const onSubmitButtonClick = useCallback(async () => {
    const {
      name,
      llmType,
      prompt,
    } = getValues()

    await onSubmit({
      documentTypeId: currentDocumentTypeId,
      groupId,
      name,
      llmType,
      prompt,
      ...(classifier && {
        genAiClassifierId: classifier.genAiClassifierId,
      }),
    })
  }, [
    currentDocumentTypeId,
    classifier,
    getValues,
    groupId,
    onSubmit,
  ])

  const DrawerFooter = useMemo(() => (
    <DrawerFooterWrapper>
      <Button.Secondary
        disabled={isLoading}
        onClick={toggleDrawer}
      >
        {localize(Localization.CANCEL)}
      </Button.Secondary>
      <Button.Secondary
        disabled={!isValid || !isDirty}
        loading={isLoading}
        onClick={onSubmitButtonClick}
      >
        {localize(Localization.SAVE)}
      </Button.Secondary>
    </DrawerFooterWrapper>
  ), [
    isLoading,
    isDirty,
    isValid,
    onSubmitButtonClick,
    toggleDrawer,
  ])

  const drawerTitle = classifier
    ? localize(Localization.EDIT_CLASSIFIER)
    : localize(Localization.ADD_CLASSIFIER)

  const onDrawerClick = (e) => {
    e.stopPropagation()
  }

  return (
    <Wrapper onClick={onDrawerClick}>
      {renderTrigger(onTriggerClick)}
      {
        isDrawerVisible && (
          <Drawer
            destroyOnClose
            footer={DrawerFooter}
            hasCloseIcon={false}
            onClose={toggleDrawer}
            open={isDrawerVisible}
            title={drawerTitle}
            width={theme.size.drawerWidth}
          >
            <Spin spinning={isLoading}>
              <FormProvider {...methods}>
                <GenAiClassifierForm
                  classifier={classifier}
                  currentDocumentTypeId={currentDocumentTypeId}
                  groupDocumentTypeIds={group.documentTypeIds}
                  groupGenAiClassifiers={group.genAiClassifiers}
                  initialDocumentTypeId={documentTypeId}
                  onSubmit={onSubmitButtonClick}
                  setCurrentDocumentTypeId={setCurrentDocumentTypeId}
                />
              </FormProvider>
            </Spin>
          </Drawer>
        )
      }
    </Wrapper>
  )
}

GenAiClassifierDrawer.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  renderTrigger: PropTypes.func.isRequired,
  documentTypeId: PropTypes.string.isRequired,
  classifier: genAiClassifierShape,
}

export {
  GenAiClassifierDrawer,
}
