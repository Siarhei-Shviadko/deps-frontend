
import PropTypes from 'prop-types'
import {
  useMemo,
  useCallback,
} from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button, ButtonType } from '@/components/Button'
import { FormValidationMode } from '@/components/Form'
import { localize, Localization } from '@/localization/i18n'
import { llmExtractorShape } from '@/models/LLMExtractor'
import { LLMSettings } from '@/models/LLMProvider'
import { LLMExtractorForm } from './LLMExtractorForm'
import { DEFAULT_VALUES, FIELD_CODE } from './LLMExtractorForm/constants'
import {
  Modal,
  ModalFooterWrapper,
} from './LLMExtractorModal.styles'

const MODAL_WIDTH = '98%'
const MODAL_HEIGHT = '90%'

const mapLLMExtractorToFieldValues = ({
  name,
  llmReference,
  extractionParams,
}) => {
  const { provider, model } = llmReference
  const {
    contextAttachments,
    stop,
    ...rest
  } = extractionParams

  return {
    extractorName: name,
    llmModel: LLMSettings.settingsToLLMType(provider, model),
    contextAttachments: contextAttachments ?? '',
    stop: stop == null ? DEFAULT_VALUES[FIELD_CODE.STOP] : stop,
    ...rest,
  }
}

const LLMExtractorModal = ({
  isLoading,
  isVisible,
  llmExtractor,
  onCancel,
  onSave,
}) => {
  const methods = useForm({
    mode: FormValidationMode.ON_CHANGE,
    shouldUnregister: true,
    defaultValues: llmExtractor
      ? mapLLMExtractorToFieldValues(llmExtractor)
      : DEFAULT_VALUES,
  })

  const {
    getValues,
    reset,
    formState: {
      isValid,
    },
  } = methods

  const drawerTitle = (
    llmExtractor
      ? localize(Localization.EDIT_LLM_EXTRACTOR)
      : localize(Localization.ADD_LLM_EXTRACTOR)
  )

  const onSubmit = useCallback(async () => {
    const values = getValues()
    const {
      extractorName,
      llmModel,
      contextAttachments,
      ...rest
    } = values

    const { provider, model } = LLMSettings.llmTypeToSettings(llmModel)

    const data = {
      extractorName,
      provider,
      model,
      extractionParams: {
        contextAttachments: contextAttachments || null,
        ...rest,
      },
    }

    await onSave(data)
    reset(values)
  }, [
    getValues,
    onSave,
    reset,
  ])

  const ModalFooter = useMemo(() => (
    <ModalFooterWrapper>
      <Button.Secondary
        disabled={isLoading}
        onClick={onCancel}
      >
        {localize(Localization.CANCEL)}
      </Button.Secondary>
      <Button
        disabled={!isValid}
        loading={isLoading}
        onClick={onSubmit}
        type={ButtonType.PRIMARY}
      >
        {
          llmExtractor
            ? localize(Localization.SUBMIT)
            : localize(Localization.CREATE)
        }
      </Button>
    </ModalFooterWrapper>
  ), [
    isLoading,
    isValid,
    llmExtractor,
    onCancel,
    onSubmit,
  ])

  return (
    <Modal
      centered
      closable={false}
      destroyOnClose
      footer={ModalFooter}
      getContainer={() => document.body}
      onCancel={onCancel}
      open={isVisible}
      style={
        {
          height: MODAL_HEIGHT,
        }
      }
      title={drawerTitle}
      width={MODAL_WIDTH}
    >
      <FormProvider {...methods}>
        <LLMExtractorForm />
      </FormProvider>
    </Modal>
  )
}

LLMExtractorModal.propTypes = {
  isLoading: PropTypes.bool,
  isVisible: PropTypes.bool.isRequired,
  llmExtractor: llmExtractorShape,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
}

export {
  LLMExtractorModal,
}
