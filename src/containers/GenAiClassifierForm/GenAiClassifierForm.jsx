
import PropTypes from 'prop-types'
import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDocumentType } from '@/actions/documentType'
import {
  Form,
  FormFieldType,
  FormItem,
  PatternValidator,
  RequiredValidator,
} from '@/components/Form'
import { Input } from '@/components/Input'
import { CustomSelect, SelectOption } from '@/components/Select'
import { GEN_AI_PROMPT_MAX_LENGTH } from '@/constants/common'
import { FORBIDDEN_WHITE_SPACE_BEFORE_TEXT } from '@/constants/regexp'
import { ExtractionLLMSelect } from '@/containers/ExtractionLLMSelect'
import { GroupDocumentTypeSelect } from '@/containers/GroupDocumentTypeSelect'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { Localization, localize } from '@/localization/i18n'
import { genAiClassifierShape } from '@/models/DocumentTypesGroup'
import { documentTypeStateSelector } from '@/selectors/documentType'
import { documentTypesStateSelector } from '@/selectors/documentTypes'
import {
  areTypesFetchingSelector,
  isDocumentTypeFetchingSelector,
} from '@/selectors/requests'

const FIELD_CODE = {
  DOCUMENT_TYPE: 'documentType',
  CLASSIFIER_FROM_ANOTHER_GROUP: 'classifierFromAnotherGroup',
  NAME: 'name',
  LLM_TYPE: 'llmType',
  PROMPT: 'prompt',
}

const ROW_SIZE = 5
const PROMPT_INPUT_AUTOSIZE_CONFIG = {
  minRows: ROW_SIZE,
  maxRows: ROW_SIZE,
}

const GenAiClassifierForm = ({
  classifier,
  groupDocumentTypeIds,
  groupGenAiClassifiers,
  onSubmit,
  setCurrentDocumentTypeId,
  currentDocumentTypeId,
  initialDocumentTypeId,
}) => {
  const { setValue, handleSubmit, reset } = useFormContext()
  const documentType = useSelector(documentTypeStateSelector)
  const documentTypes = useSelector(documentTypesStateSelector)
  const isDocumentTypeFetching = useSelector(isDocumentTypeFetchingSelector)
  const areDocumentTypesFetching = useSelector(areTypesFetchingSelector)
  const dispatch = useDispatch()

  const documentTypeIdsToSelect = useMemo(() => {
    const idsWithClassifier = new Set(groupGenAiClassifiers.map((c) => c.documentTypeId))

    return [
      initialDocumentTypeId,
      ...groupDocumentTypeIds.filter((id) => id !== initialDocumentTypeId && !idsWithClassifier.has(id)),
    ]
  }, [
    initialDocumentTypeId,
    groupDocumentTypeIds,
    groupGenAiClassifiers,
  ])

  useEffect(() => {
    dispatch(fetchDocumentType(currentDocumentTypeId, [
      DocumentTypeExtras.CLASSIFIERS,
    ]))
  }, [
    currentDocumentTypeId,
    dispatch,
  ])

  const { genAiClassifiers: docTypeGenAiClassifiers } = documentType?.classifiers || {}

  const selectClassifier = (id) => {
    const classifier = docTypeGenAiClassifiers?.find((c) => c.genAiClassifierId === id)

    const options = {
      shouldValidate: true,
      shouldDirty: true,
    }

    setValue(FIELD_CODE.NAME, classifier?.name, options)
    setValue(FIELD_CODE.LLM_TYPE, classifier?.llmType, options)
    setValue(FIELD_CODE.PROMPT, classifier?.prompt, options)
  }

  const getClassifiersOptions = () => (
    docTypeGenAiClassifiers?.map(({ genAiClassifierId, name }) => (
      new SelectOption(genAiClassifierId, name)),
    )
  )

  const onDocumentTypeChange = (id) => {
    setCurrentDocumentTypeId(id)
    reset()
  }

  const documentTypesToSelect = documentTypeIdsToSelect.map((id) => (
    Object.values(documentTypes).find((dt) => dt.code === id)),
  )

  const fields = [
    {
      code: FIELD_CODE.DOCUMENT_TYPE,
      label: localize(Localization.DOCUMENT_TYPE),
      render: () => (
        <GroupDocumentTypeSelect
          allowSelectDocumentType={!classifier}
          documentTypes={documentTypesToSelect}
          isFetching={areDocumentTypesFetching}
          onChange={onDocumentTypeChange}
        />
      ),
    },
    {
      code: FIELD_CODE.CLASSIFIER_FROM_ANOTHER_GROUP,
      label: localize(Localization.SET_CLASSIFIER_FROM_ANOTHER_GROUP),
      placeholder: localize(Localization.SELECT_CLASSIFIER),
      onChange: selectClassifier,
      hint: localize(Localization.SET_CLASSIFIER_FROM_ANOTHER_GROUP_HINT),
      render: (props) => (
        <CustomSelect
          allowClear
          allowSearch
          fetching={isDocumentTypeFetching}
          identifier={currentDocumentTypeId}
          options={getClassifiersOptions() || []}
          {...props}
        />
      ),
    },
    {
      code: FIELD_CODE.NAME,
      label: localize(Localization.NAME),
      placeholder: localize(Localization.NAME_PLACEHOLDER),
      requiredMark: true,
      type: FormFieldType.STRING,
      rules: {
        ...new RequiredValidator(),
        ...new PatternValidator(
          FORBIDDEN_WHITE_SPACE_BEFORE_TEXT,
          localize(Localization.WHITE_SPACE_VALIDATOR_ERROR_MESSAGE),
        ),
      },
    },
    {
      code: FIELD_CODE.LLM_TYPE,
      requiredMark: true,
      label: localize(Localization.LLM_TYPE),
      placeholder: localize(Localization.SELECT_LLM_TYPE),
      rules: {
        ...new RequiredValidator(),
      },
      render: (props) => (
        <ExtractionLLMSelect
          {...props}
          allowClear
          allowSearch
        />
      ),
    },
    {
      code: FIELD_CODE.PROMPT,
      label: localize(Localization.PROMPT),
      requiredMark: true,
      placeholder: localize(Localization.PROMPT_PLACEHOLDER),
      rules: {
        ...new RequiredValidator(),
        ...new PatternValidator(
          FORBIDDEN_WHITE_SPACE_BEFORE_TEXT,
          localize(Localization.WHITE_SPACE_VALIDATOR_ERROR_MESSAGE),
        ),
      },
      render: (props) => (
        <Input.TextArea
          {...props}
          autoSize={PROMPT_INPUT_AUTOSIZE_CONFIG}
          maxLength={GEN_AI_PROMPT_MAX_LENGTH}
          showCount
        />
      ),
    },
  ]

  return (
    <Form
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
    >
      {
        fields.map(({ label, requiredMark, ...field }) => (
          <FormItem
            key={field.code}
            field={field}
            label={label}
            requiredMark={requiredMark}
          />
        ))
      }
    </Form>
  )
}

GenAiClassifierForm.propTypes = {
  classifier: genAiClassifierShape,
  currentDocumentTypeId: PropTypes.string.isRequired,
  groupDocumentTypeIds: PropTypes.arrayOf(
    PropTypes.string.isRequired,
  ).isRequired,
  groupGenAiClassifiers: PropTypes.arrayOf(
    genAiClassifierShape,
  ).isRequired,
  initialDocumentTypeId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  setCurrentDocumentTypeId: PropTypes.func.isRequired,
}

export {
  GenAiClassifierForm,
}
