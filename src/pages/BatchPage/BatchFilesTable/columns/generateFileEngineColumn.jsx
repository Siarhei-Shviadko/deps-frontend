
import { enumToOptions } from '@/components/Select'
import { TableFilterIndicator } from '@/components/Table/TableFilterIndicator'
import { TableSelectFilter } from '@/components/Table/TableSelectFilter'
import { KnownProcessingEngines, RESOURCE_PROCESSING_ENGINE } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { stringsSorter } from '@/utils/string'
import { ColumnCode } from '../ColumnCode'

export const generateFileEngineColumn = (filterConfig) => {
  const filteredValue = filterConfig[ColumnCode.ENGINE]
  const sortOrder = filterConfig.sortField === ColumnCode.ENGINE ? filterConfig.sortDirect : ''
  const options = enumToOptions(KnownProcessingEngines, RESOURCE_PROCESSING_ENGINE)

  return ({
    dataIndex: ColumnCode.ENGINE,
    ellipsis: true,
    filterDropdown: ({ setSelectedKeys, confirm, visible }) => (
      <TableSelectFilter
        confirm={confirm}
        options={options}
        selectedKeys={filteredValue}
        setSelectedKeys={setSelectedKeys}
        visible={visible}
      />
    ),
    filterIcon: () => (
      <TableFilterIndicator
        active={!!filteredValue?.length}
      />
    ),
    filteredValue,
    key: ColumnCode.ENGINE,
    render: (engineCode) => engineCode && (
      <span data-testid="engine-title">
        {RESOURCE_PROCESSING_ENGINE[engineCode]}
      </span>
    ),
    sorter: (a, b) => stringsSorter(RESOURCE_PROCESSING_ENGINE[a[ColumnCode.ENGINE]], RESOURCE_PROCESSING_ENGINE[b[ColumnCode.ENGINE]]),
    sortOrder,
    title: localize(Localization.ENGINE_UPPERCASE),
  })
}
