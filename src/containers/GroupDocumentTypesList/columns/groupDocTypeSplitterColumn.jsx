
import { SearchIcon } from '@/components/Icons/SearchIcon'
import { TableFilterIndicator } from '@/components/Table/TableFilterIndicator'
import { TableSearchDropdown } from '@/components/Table/TableSearchDropdown'
import { Localization, localize } from '@/localization/i18n'
import { stringsSorter } from '@/utils/string'
import { DocumentTypeSplitterCell } from '../DocumentTypeSplitterCell'
import { GroupDocTypeColumn } from './GroupDocTypeColumn'

const generateGroupDocTypeSplitterColumn = ({
  filteredValue,
  sortOrder,
}) => ({
  title: localize(Localization.SPLITTER),
  dataIndex: GroupDocTypeColumn.SPLITTER,
  key: GroupDocTypeColumn.SPLITTER,
  render: (splitter, dt) => (
    <DocumentTypeSplitterCell
      documentTypeId={dt.id}
      splitter={splitter}
    />
  ),
  sorter: (a, b) => stringsSorter(a.splitter?.name, b.splitter?.name),
  filterDropdown: ({
    setSelectedKeys,
    confirm,
    visible,
  }) => (
    <TableSearchDropdown
      confirm={() => confirm({ closeDropdown: false })}
      onChange={setSelectedKeys}
      searchValue={filteredValue}
      visible={visible}
    />
  ),
  filterIcon: () => (
    <TableFilterIndicator
      active={!!filteredValue}
      icon={<SearchIcon />}
    />
  ),
  filteredValue,
  sortOrder,
})

export {
  generateGroupDocTypeSplitterColumn,
}
