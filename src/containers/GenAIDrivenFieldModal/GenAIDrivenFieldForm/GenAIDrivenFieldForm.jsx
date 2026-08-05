
import PropTypes from 'prop-types'
import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  PatternValidator,
  RequiredValidator,
  FormFieldType,
} from '@/components/Form/ReactHookForm'
import { FORBIDDEN_WHITE_SPACE_BEFORE_TEXT } from '@/constants/regexp'
import { FIELD_TYPES_WITH_DISABLED_MASKING, FORM_FIELD_CODES } from '@/containers/GenAIDrivenFieldModal/constants'
import { ManageDisplayModeFormSection } from '@/containers/ManageDisplayModeFormSection'
import { FieldType } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import { documentTypeFieldShape } from '@/models/DocumentTypeField'
import {
  LLMExtractionQueryWorkflow,
  LLMExtractor,
  llmExtractorShape,
} from '@/models/LLMExtractor'
import { FieldTypeSection } from '../FieldTypeSection'
import { LLMExtractorSection } from '../LLMExtractorSection'
import { PromptChainingSection } from '../PromptChainingSection'
import {
  BaseFieldsWrapper,
  FieldsList,
  Form,
  FormItem,
  Wrapper,
  PromptChainingFormItem,
} from './GenAIDrivenFieldForm.styles'

const validateLlmWorkflowNodes = (workflow) => {
  const invalid =
    !workflow?.nodes?.length ||
    workflow.nodes.some((node) => !node.name?.trim() || !node.prompt?.trim())

  return invalid
    ? localize(Localization.INVALID_PROMPT_CHAIN_MESSAGE)
    : true
}

const defaultLlmWorkflowValue = new LLMExtractionQueryWorkflow({
  startNodeId: null,
  endNodeId: null,
  nodes: [],
  edges: [],
})

const getDefaultFormValues = (field, llmExtractors) => {
  if (!field) return {}
  const llmExtractor = llmExtractors.find((extractor) => extractor.queries.some((query) => query.code === field.code))
  const extractorQuery = LLMExtractor.getQueryByCode(field.code, llmExtractor)
  const fieldTypeValue = field.fieldType === FieldType.LIST ? field.fieldMeta?.baseType : field.fieldType
  return {
    llmExtractor,
    extractorQuery,
    fieldTypeValue,
  }
}

const renderFields = (fields, Wrapper = FormItem) => (
  fields.map(({ label, requiredMark, ...field }) => (
    <Wrapper
      key={field.code}
      field={field}
      label={label}
      requiredMark={requiredMark}
    />
  ),
  ))

const GenAIDrivenFieldForm = ({
  field,
  isEditing,
  handleSubmit,
  llmExtractors,
  saveField,
}) => {
  const { control } = useFormContext()
  const {
    llmExtractor,
    extractorQuery,
    fieldTypeValue,
  } = getDefaultFormValues(field, llmExtractors)

  const fieldType = useWatch({
    control,
    name: FORM_FIELD_CODES.FIELD_TYPE,
    defaultValue: fieldTypeValue || FieldType.STRING,
  })

  const baseFields = useMemo(() => [
    {
      code: FORM_FIELD_CODES.NAME,
      defaultValue: field?.name,
      label: localize(Localization.NAME),
      requiredMark: true,
      type: FormFieldType.STRING,
      placeholder: localize(Localization.NAME_PLACEHOLDER),
      rules: {
        ...new RequiredValidator(),
        ...new PatternValidator(
          FORBIDDEN_WHITE_SPACE_BEFORE_TEXT,
          localize(Localization.WHITE_SPACE_VALIDATOR_ERROR_MESSAGE),
        ),
      },
    },
    {
      code: FORM_FIELD_CODES.REQUIRED,
      defaultValue: field?.required || false,
      label: localize(Localization.REQUIRED_FIELD),
      type: FormFieldType.CHECKMARK,
    },
  ], [field?.required, field?.name])

  const extractorId = llmExtractor?.extractorId || llmExtractors[0]?.extractorId

  const llmExtractorField = useMemo(() => [
    {
      code: FORM_FIELD_CODES.EXTRACTOR_ID,
      defaultValue: extractorId,
      rules: {
        ...new RequiredValidator(),
      },
      render: LLMExtractorSection,
    },
  ], [extractorId])

  const promptChainingField = useMemo(() => [
    {
      code: FORM_FIELD_CODES.LLM_WORKFLOW,
      defaultValue: extractorQuery?.workflow || defaultLlmWorkflowValue,
      rules: {
        validate: validateLlmWorkflowNodes,
      },
      render: PromptChainingSection,
    },
  ], [extractorQuery?.workflow])

  const charLimit = (
    field?.fieldMeta?.displayCharLimit ??
    field?.fieldMeta?.valueMeta?.displayCharLimit ??
    field?.fieldMeta?.baseTypeMeta?.displayCharLimit ??
    field?.fieldMeta?.baseTypeMeta?.valueMeta?.displayCharLimit
  )

  return (
    <Form
      handleSubmit={handleSubmit}
      onSubmit={saveField}
    >
      <Wrapper>
        <FieldsList>
          <BaseFieldsWrapper>
            {renderFields(baseFields)}
          </BaseFieldsWrapper>
          {renderFields(llmExtractorField)}
          <FieldTypeSection
            disabled={isEditing}
            shape={extractorQuery?.shape}
            value={fieldTypeValue}
          />
          <ManageDisplayModeFormSection
            displayCharLimit={charLimit}
            fieldType={fieldType}
            isConfidentialField={field?.confidential}
            isEditMode={true}
            isMaskingModeDisabled={FIELD_TYPES_WITH_DISABLED_MASKING.includes(fieldType)}
            isReadOnlyField={field?.readOnly}
          />
        </FieldsList>
        {renderFields(promptChainingField, PromptChainingFormItem)}
      </Wrapper>
    </Form>
  )
}

GenAIDrivenFieldForm.propTypes = {
  field: documentTypeFieldShape,
  isEditing: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  llmExtractors: PropTypes.arrayOf(llmExtractorShape).isRequired,
  saveField: PropTypes.func.isRequired,
}

export {
  GenAIDrivenFieldForm,
}
