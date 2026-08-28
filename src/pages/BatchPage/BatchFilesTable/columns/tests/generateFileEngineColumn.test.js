
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { render, screen } from '@testing-library/react'
import { TableSelectFilter } from '@/components/Table/TableSelectFilter'
import { TableSortDirection } from '@/components/Table/TableSorter'
import { KnownProcessingEngines, RESOURCE_PROCESSING_ENGINE } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { ColumnCode } from '../../ColumnCode'
import { generateFileEngineColumn } from '../generateFileEngineColumn'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/components/Table/TableSelectFilter', () => mockShallowComponent('TableSelectFilter'))
jest.mock('@/components/Table/TableFilterIndicator', () => mockShallowComponent('TableFilterIndicator'))

const filterConfig = {
  engine: ['TESSERACT'],
  sortField: ColumnCode.ENGINE,
  sortDirect: TableSortDirection.ASCEND,
}

test('returns the correct column configuration', () => {
  const column = generateFileEngineColumn(filterConfig)

  expect(column.title).toBe(localize(Localization.ENGINE_UPPERCASE))
  expect(column.dataIndex).toBe(ColumnCode.ENGINE)
  expect(column.key).toBe(ColumnCode.ENGINE)
  expect(column.filteredValue).toBe(filterConfig.engine)
  expect(column.sorter).toEqual(expect.any(Function))
  expect(column.sortOrder).toBe(TableSortDirection.ASCEND)
})

test('shows the filterDropdown component correctly', () => {
  const column = generateFileEngineColumn(filterConfig)

  const setSelectedKeysMock = jest.fn()
  const confirmMock = jest.fn()
  const filterDropdown = column.filterDropdown({
    setSelectedKeys: setSelectedKeysMock,
    confirm: confirmMock,
    visible: true,
  })

  render(filterDropdown)

  expect(screen.getByTestId('TableSelectFilter')).toBeInTheDocument()
  expect(TableSelectFilter).toHaveBeenCalledWith(
    expect.objectContaining({
      confirm: expect.any(Function),
      options: expect.any(Array),
      selectedKeys: ['TESSERACT'],
      setSelectedKeys: setSelectedKeysMock,
      visible: true,
    }),
    {},
  )
})

test('shows the filterIcon component correctly', () => {
  const column = generateFileEngineColumn(filterConfig)

  const filterIcon = column.filterIcon()
  render(filterIcon)

  expect(screen.getByTestId('TableFilterIndicator')).toBeInTheDocument()
})

test('shows the batch engine correctly in the render function', () => {
  const column = generateFileEngineColumn(filterConfig)

  const name = KnownProcessingEngines.TESSERACT
  const renderResult = column.render(name)

  render(renderResult)

  expect(screen.getByTestId('engine-title')).toHaveTextContent(RESOURCE_PROCESSING_ENGINE[name])
})
