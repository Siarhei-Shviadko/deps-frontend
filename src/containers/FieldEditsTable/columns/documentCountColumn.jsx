
import { Localization, localize } from '@/localization/i18n'
import { FieldEditsColumn } from './FieldEditsColumn'

export const generateDocumentCountColumn = () => ({
  title: localize(Localization.DOCUMENT_COUNT),
  dataIndex: FieldEditsColumn.DOCUMENT_COUNT,
  key: FieldEditsColumn.DOCUMENT_COUNT,
})
