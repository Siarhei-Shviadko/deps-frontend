import { LongText } from '@/components/LongText'
import { Tag } from '@/components/Tag'
import { Localization, localize } from '@/localization/i18n'
import { DocumentTypesGroupsColumn } from './DocumentTypesGroupsColumn'

const generateGroupSplitterColumn = () => ({
  title: localize(Localization.SPLITTER),
  dataIndex: DocumentTypesGroupsColumn.SPLITTER,
  key: DocumentTypesGroupsColumn.SPLITTER,
  render: (splitter) => {
    if (!splitter) {
      return null
    }

    return (
      <Tag closable={false}>
        <LongText text={splitter.name} />
      </Tag>
    )
  },
})

export {
  generateGroupSplitterColumn,
}
