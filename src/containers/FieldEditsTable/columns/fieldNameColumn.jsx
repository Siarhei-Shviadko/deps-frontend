
import { LongText } from '@/components/LongText'
import { Localization, localize } from '@/localization/i18n'
import { FieldEditsColumn } from './FieldEditsColumn'

export const generateFieldNameColumn = () => ({
  title: localize(Localization.FIELD_NAME),
  dataIndex: FieldEditsColumn.FIELD_NAME,
  key: FieldEditsColumn.FIELD_NAME,
  render: (fieldName) => <LongText text={fieldName} />,
})
