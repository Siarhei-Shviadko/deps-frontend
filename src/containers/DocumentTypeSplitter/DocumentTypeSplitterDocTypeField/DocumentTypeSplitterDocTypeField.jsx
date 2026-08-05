import PropTypes from 'prop-types'
import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { FormItem, RequiredValidator } from '@/components/Form'
import { GroupDocumentTypeSelect } from '@/containers/GroupDocumentTypeSelect'
import { Localization, localize } from '@/localization/i18n'
import { splitterShape } from '@/models/Splitter'
import { documentTypesStateSelector } from '@/selectors/documentTypes'
import { areTypesFetchingSelector } from '@/selectors/requests'
import { FIELD_CODE, FORM_FIELD_PREFIX } from '../shared/constants'

export const DocumentTypeSplitterDocTypeField = ({
  children,
  groupDocumentTypeIds,
  groupSplitters,
  initialDocumentTypeId,
  allowSelectDocumentType = true,
}) => {
  const { reset } = useFormContext()
  const documentTypes = useSelector(documentTypesStateSelector)
  const areDocumentTypesFetching = useSelector(areTypesFetchingSelector)

  const documentTypeIdsToSelect = useMemo(() => {
    const idsWithSplitter = new Set(
      groupSplitters
        .filter((s) => s.documentTypeId)
        .map((s) => s.documentTypeId),
    )

    const documentTypeIdsWithoutSplitter = groupDocumentTypeIds.filter(
      (id) => id !== initialDocumentTypeId && !idsWithSplitter.has(id),
    )

    return [
      initialDocumentTypeId,
      ...documentTypeIdsWithoutSplitter,
    ]
  }, [
    initialDocumentTypeId,
    groupDocumentTypeIds,
    groupSplitters,
  ])

  const onDocumentTypeChange = (id) => {
    reset({
      [`${FORM_FIELD_PREFIX}.${FIELD_CODE.DOCUMENT_TYPE_ID}`]: id,
    })
  }

  const documentTypesToSelect = documentTypeIdsToSelect.map((id) => (
    Object.values(documentTypes).find((dt) => dt.code === id)
  ))

  const documentTypeField = {
    code: `${FORM_FIELD_PREFIX}.${FIELD_CODE.DOCUMENT_TYPE_ID}`,
    label: localize(Localization.DOCUMENT_TYPE),
    defaultValue: initialDocumentTypeId,
    rules: {
      ...new RequiredValidator(),
    },
    render: () => (
      <GroupDocumentTypeSelect
        allowSelectDocumentType={allowSelectDocumentType}
        documentTypes={documentTypesToSelect}
        isFetching={areDocumentTypesFetching}
        onChange={onDocumentTypeChange}
      />
    ),
  }

  return (
    <>
      <FormItem
        field={documentTypeField}
        label={documentTypeField.label}
        requiredMark
      />
      {children}
    </>
  )
}

DocumentTypeSplitterDocTypeField.propTypes = {
  children: PropTypes.node.isRequired,
  groupDocumentTypeIds: PropTypes.arrayOf(
    PropTypes.string.isRequired,
  ).isRequired,
  groupSplitters: PropTypes.arrayOf(
    splitterShape,
  ).isRequired,
  initialDocumentTypeId: PropTypes.string.isRequired,
  allowSelectDocumentType: PropTypes.bool,
}
