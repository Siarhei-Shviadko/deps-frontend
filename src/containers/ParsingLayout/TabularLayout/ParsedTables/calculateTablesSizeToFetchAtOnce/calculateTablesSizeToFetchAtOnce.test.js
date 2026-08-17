import { mockEnv } from '@/mocks/mockEnv'
import { TableInfo } from '@/models/DocumentParsingInfo'
import { calculateTablesSizeToFetchAtOnce } from './calculateTablesSizeToFetchAtOnce'

jest.mock('@/utils/env', () => mockEnv)

test('should calculate the correct fetch sizes', () => {
  const tables = [
    new TableInfo({
      id: 'table1',
      rowCount: 1000,
      columnCount: 1000,
    }),
    new TableInfo({
      id: 'table2',
      rowCount: 500,
      columnCount: 500,
    }),
    new TableInfo({
      id: 'table3',
      rowCount: 100,
      columnCount: 100,
    }),
  ]

  const maxCells = 1000

  const result = calculateTablesSizeToFetchAtOnce(tables, maxCells)

  expect(result).toEqual({
    tables: ['table1'],
    rows: 50,
    cols: 20,
  })
})

test('should fetch multiple tables if possible', () => {
  const tables = [
    new TableInfo({
      id: 'table1',
      rowCount: 100,
      columnCount: 100,
    }),
    new TableInfo({
      id: 'table2',
      rowCount: 100,
      columnCount: 100,
    }),
    new TableInfo({
      id: 'table3',
      rowCount: 100,
      columnCount: 100,
    }),
  ]

  const maxCells = 1000

  const result = calculateTablesSizeToFetchAtOnce(tables, maxCells)

  expect(result).toEqual({
    tables: ['table1'],
    rows: 50,
    cols: 20,
  })
})
