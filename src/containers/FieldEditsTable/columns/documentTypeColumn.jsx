
import { LongText } from '@/components/LongText'
import { Localization, localize } from '@/localization/i18n'
import { FieldEditsColumn } from './FieldEditsColumn'

export const generateDocumentTypeColumn = () => ({
  title: localize(Localization.DOCUMENT_TYPE),
  dataIndex: FieldEditsColumn.DOCUMENT_TYPE,
  key: FieldEditsColumn.DOCUMENT_TYPE,
  render: (documentTypeName) => <LongText text={documentTypeName} />,
})
