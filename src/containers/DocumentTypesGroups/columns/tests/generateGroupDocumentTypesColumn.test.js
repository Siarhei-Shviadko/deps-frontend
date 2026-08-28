
import { mockEnv } from '@/mocks/mockEnv'
import { render, screen } from '@testing-library/react'
import { TableSelectFilter } from '@/components/Table/TableSelectFilter'
import { DocumentTypesGroupsFilterKey } from '@/constants/navigation'
import { generateGroupDocumentTypesColumn } from '@/containers/DocumentTypesGroups/columns'
import { ExtractionType } from '@/enums/ExtractionType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { DocumentType } from '@/models/DocumentType'
import { DocumentTypesGroupsColumn } from '../DocumentTypesGroupsColumn'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/components/Table/TableSelectFilter', () => ({
  TableSelectFilter: jest.fn(() => <div data-testid="table-select-filter" />),
}))

jest.mock('@/components/Table/TableFilterIndicator', () => ({
  TableFilterIndicator: jest.fn(() => <div data-testid="table-filter-indicator" />),
}))

jest.mock('@/containers/DocumentTypesGroups/DocumentTypesCell', () => ({
  DocumentTypesCell: jest.fn(() => <div data-testid="document-types-cell" />),
}))

const mockDocTypeId = 'mockDocTypeId'

const mockDocumentType = new DocumentType(
  mockDocTypeId,
  'Name',
  KnownProcessingEngines.TESSERACT,
  KnownLanguage.ENGLISH,
  ExtractionType.PROTOTYPE,
)

const filterConfig = {
  [DocumentTypesGroupsFilterKey.DOCUMENT_TYPE_ID]: [mockDocTypeId],
}

const docTypes = [mockDocumentType]

test('returns the correct column configuration', () => {
  const column = generateGroupDocumentTypesColumn(filterConfig, docTypes)

  expect(column.title).toBe(localize(Localization.DOCUMENT_TYPES))
  expect(column.dataIndex).toBe(DocumentTypesGroupsColumn.DOC_TYPES)
  expect(column.key).toBe(DocumentTypesGroupsFilterKey.DOCUMENT_TYPE_ID)
  expect(column.filteredValue).toBe(filterConfig[DocumentTypesGroupsFilterKey.DOCUMENT_TYPE_ID])
})

test('shows the filter dropdown component correctly', () => {
  const column = generateGroupDocumentTypesColumn(filterConfig, docTypes)

  const setSelectedKeysMock = jest.fn()
  const confirmMock = jest.fn()
  const filterDropdown = column.filterDropdown({
    setSelectedKeys: setSelectedKeysMock,
    confirm: confirmMock,
    visible: true,
  })

  render(filterDropdown)

  expect(screen.getByTestId('table-select-filter')).toBeInTheDocument()
  expect(TableSelectFilter).toHaveBeenCalledWith(
    expect.objectContaining({
      confirm: confirmMock,
      options: docTypes.map((dt) => DocumentType.toOption(dt)),
      selectedKeys: filterConfig[DocumentTypesGroupsFilterKey.DOCUMENT_TYPE_ID],
      setSelectedKeys: setSelectedKeysMock,
      visible: true,
    }),
    {},
  )
})

test('shows the filterIcon component correctly', () => {
  const column = generateGroupDocumentTypesColumn(filterConfig, docTypes)

  const filterIcon = column.filterIcon()
  render(filterIcon)

  expect(screen.getByTestId('table-filter-indicator')).toBeInTheDocument()
})

test('shows the document types after the render function call', () => {
  const column = generateGroupDocumentTypesColumn(filterConfig, docTypes)

  const renderResult = column.render([mockDocTypeId])

  render(renderResult)

  expect(screen.getByTestId('document-types-cell')).toBeInTheDocument()
})

test('does not show the document types after the render function call if no document types', () => {
  const column = generateGroupDocumentTypesColumn(filterConfig, docTypes)

  const renderResult = column.render([])

  render(renderResult)

  expect(screen.queryByTestId('document-types-cell')).not.toBeInTheDocument()
})
