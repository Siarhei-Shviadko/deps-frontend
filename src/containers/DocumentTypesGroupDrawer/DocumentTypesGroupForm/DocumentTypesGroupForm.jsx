
import PropTypes from 'prop-types'
import {
  Form,
  FormItem,
  PatternValidator,
  RequiredValidator,
  FormFieldType,
  MaxLengthValidator,
} from '@/components/Form/ReactHookForm'
import { CustomSelect, SelectMode } from '@/components/Select'
import { Tooltip } from '@/components/Tooltip'
import { FORBIDDEN_WHITE_SPACE_BEFORE_TEXT } from '@/constants/regexp'
import { DocumentTypeSplitter } from '@/containers/DocumentTypeSplitter'
import { Localization, localize } from '@/localization/i18n'
import { DocumentType, documentTypeShape } from '@/models/DocumentType'
import { ENV } from '@/utils/env'

const GROUP_PROPERTY = {
  NAME: 'name',
  DOCUMENT_TYPE_IDS: 'documentTypeIds',
}

const NAME_MAX_LENGTH = 100
const MAX_TAGS_COUNT = 10

const renderTagsTooltip = (omittedValues) => {
  const combinedTitle = omittedValues.map(({ label }) => label).join(', ')

  return (
    <Tooltip
      title={combinedTitle}
    >
      {`+ ${omittedValues.length}`}
    </Tooltip>
  )
}

const DocumentTypesGroupForm = ({ documentTypes }) => {
  const documentTypesOptions = documentTypes.map(DocumentType.toOption)

  const fields = [
    {
      code: GROUP_PROPERTY.NAME,
      label: localize(Localization.NAME),
      requiredMark: true,
      type: FormFieldType.STRING,
      placeholder: localize(Localization.GROUP_PLACEHOLDER),
      hint: localize(Localization.MAXIMUM_CHARS_LIMIT, { limit: NAME_MAX_LENGTH }),
      rules: {
        ...new RequiredValidator(),
        ...new PatternValidator(
          FORBIDDEN_WHITE_SPACE_BEFORE_TEXT,
          localize(Localization.WHITE_SPACE_VALIDATOR_ERROR_MESSAGE),
        ),
        ...new MaxLengthValidator(NAME_MAX_LENGTH),
      },
    },
    {
      code: GROUP_PROPERTY.DOCUMENT_TYPE_IDS,
      requiredMark: true,
      label: localize(Localization.DOCUMENT_TYPES),
      type: FormFieldType.STRING,
      placeholder: localize(Localization.DOC_TYPES_PLACEHOLDER),
      rules: {
        ...new RequiredValidator(),
      },
      render: (props) => (
        <CustomSelect
          {...props}
          maxTagCount={MAX_TAGS_COUNT}
          maxTagPlaceholder={renderTagsTooltip}
          mode={SelectMode.MULTIPLE}
          options={documentTypesOptions}
        />
      ),
    },
  ]

  return (
    <Form>
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
      {
        ENV.FEATURE_PDF_SPLITTING && (
          <DocumentTypeSplitter.Section>
            <DocumentTypeSplitter.Fields />
          </DocumentTypeSplitter.Section>
        )
      }
    </Form>
  )
}

DocumentTypesGroupForm.propTypes = {
  documentTypes: PropTypes.arrayOf(
    documentTypeShape,
  ),
}

export {
  DocumentTypesGroupForm,
}
