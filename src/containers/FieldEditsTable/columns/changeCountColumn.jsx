
import { Progress } from '@/components/Progress'
import { Localization, localize } from '@/localization/i18n'
import { FieldEditsColumn } from './FieldEditsColumn'

export const generateChangeCountColumn = (maxChangeCount) => ({
  title: localize(Localization.CHANGE_COUNT),
  dataIndex: FieldEditsColumn.CHANGE_COUNT,
  key: FieldEditsColumn.CHANGE_COUNT,
  render: (changeCount) => (
    <Progress
      format={() => changeCount}
      percent={changeCount / maxChangeCount * 100}
    />
  ),
})
