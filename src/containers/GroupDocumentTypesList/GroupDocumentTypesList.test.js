
import { mockComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setPagination, setSelection } from '@/actions/navigation'
import { PaginationKeys } from '@/constants/navigation'
import { ExtractionType } from '@/enums/ExtractionType'
import { Localization, localize } from '@/localization/i18n'
import { DocumentTypesGroup, GenAiClassifier } from '@/models/DocumentTypesGroup'
import { DefaultPaginationConfig } from '@/models/PaginationConfig'
import { navigationMap } from '@/utils/navigationMap'
import { render } from '@/utils/rendererRTL'
import { goTo } from '@/utils/routerActions'
import { GroupDocumentType } from './GroupDocumentType'
import { GroupDocumentTypesList } from './GroupDocumentTypesList'
import { useFilterGroupDocTypes } from './useFilterGroupDocTypes'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/selectors/documentTypesListPage')
jest.mock('@/selectors/navigation')

jest.mock('./DocumentTypeClassifier', () => mockComponent('DocumentTypeClassifier'))
jest.mock('./DocumentTypeSplitterCell', () => mockComponent('DocumentTypeSplitterCell'))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/actions/navigation', () => ({
  setPagination: jest.fn(),
  setSelection: jest.fn(),
}))

jest.mock('./useFilterGroupDocTypes', () => ({
  useFilterGroupDocTypes: jest.fn(() => [
    [],
    mockFilterCallback,
  ]),
}))

jest.mock('@/utils/routerActions', () => ({
  goTo: jest.fn(),
}))

const mockDispatch = jest.fn()
const mockFilterCallback = jest.fn()

const mockDocTypesGroup = new DocumentTypesGroup({
  id: 'id1',
  name: 'Group1',
  documentTypeIds: ['testType1', 'testType2'],
  genAiClassifiers: [
    new GenAiClassifier({
      genAiClassifierId: 'genAiClassifierId1',
      documentTypeId: 'testType1',
      name: 'Classifier Name',
      llmType: 'Test llm',
      prompt: 'Test prompt',
    }),
  ],
  splitters: [],
  createdAt: '2012-12-12',
})

test('render table with document types correctly', () => {
  const props = {
    group: mockDocTypesGroup,
  }

  render(<GroupDocumentTypesList {...props} />)

  const columns = screen.getAllByRole('columnheader')

  const [
    ,
    groupDocTypeNameColumn,
    groupDocTypeExtractorColumn,
    groupDocTypeClassifierColumn,
    groupDocTypeSplitterColumn,
  ] = columns

  expect(columns).toHaveLength(6)

  expect(groupDocTypeNameColumn).toHaveTextContent(localize(Localization.NAME))
  expect(groupDocTypeExtractorColumn).toHaveTextContent(localize(Localization.TYPE_OF_EXTRACTOR))
  expect(groupDocTypeClassifierColumn).toHaveTextContent(localize(Localization.CLASSIFIER))
  expect(groupDocTypeSplitterColumn).toHaveTextContent(localize(Localization.SPLITTER))
})

test('render NoData component if table data is not provided', () => {
  const props = {
    group: mockDocTypesGroup,
  }

  render(<GroupDocumentTypesList {...props} />)

  const noDataComponent = screen.getByText(/no data/i)

  expect(noDataComponent).toBeInTheDocument()
})

test('calls dispatch with correct arguments when change page', async () => {
  const multipliedDocTypes = Array(40).fill(0).map((_, i) => (
    new GroupDocumentType({
      id: `typeCode${i}`,
      groupId: 'mockId',
      name: `typeName${i}`,
      classifier: new GenAiClassifier({
        genAiClassifierId: 'genAiClassifierId1',
        documentTypeId: `typeCode${i}`,
        name: 'Classifier Name 1',
        llmType: 'Test llm',
        prompt: 'Test prompt',
      }),
      extractionType: ExtractionType.PROTOTYPE,
    })
  ))

  useFilterGroupDocTypes.mockReturnValueOnce([
    multipliedDocTypes,
    mockFilterCallback,
  ])

  const props = {
    group: mockDocTypesGroup,
  }

  render(<GroupDocumentTypesList {...props} />)

  const lastPage = (
    multipliedDocTypes.length / DefaultPaginationConfig[PaginationKeys.PER_PAGE]
  )

  const pageBtn = screen.getByText(lastPage)

  await userEvent.click(pageBtn)

  expect(mockDispatch).nthCalledWith(
    1,
    setPagination({
      [PaginationKeys.PAGE]: lastPage,
      [PaginationKeys.PER_PAGE]: DefaultPaginationConfig[PaginationKeys.PER_PAGE],
    }),
  )
})

test('calls dispatch with correct arguments when select rows', async () => {
  jest.clearAllMocks()

  useFilterGroupDocTypes.mockReturnValueOnce([
    [
      new GroupDocumentType({
        id: 'typeCode',
        groupId: 'mockGroupId',
        name: 'typeName',
        extractionType: ExtractionType.PROTOTYPE,
      }),
    ],
    mockFilterCallback,
  ])

  const props = {
    group: mockDocTypesGroup,
  }

  render(<GroupDocumentTypesList {...props} />)

  const [checkbox] = screen.getAllByRole('checkbox')

  fireEvent.click(checkbox)

  expect(mockDispatch).nthCalledWith(
    1,
    setSelection(),
  )
})

test('calls filterHandler when onFilter prop is called', () => {
  const props = {
    group: mockDocTypesGroup,
  }

  render(<GroupDocumentTypesList {...props} />)

  const [, nameColumn] = screen.getAllByRole('columnheader')
  fireEvent.click(nameColumn)

  expect(mockFilterCallback).toHaveBeenCalled()
})

test('calls goTo with correct page url when click on row data', async () => {
  const groupDocumentType = new GroupDocumentType({
    id: 'mockId',
    groupId: 'mockGroupId',
    name: 'mockName',
    extractionType: ExtractionType.PROTOTYPE,
  })

  useFilterGroupDocTypes.mockReturnValueOnce([
    [groupDocumentType],
    mockFilterCallback,
  ])

  const props = {
    group: mockDocTypesGroup,
  }

  render(<GroupDocumentTypesList {...props} />)

  const groupNameCell = screen.getByText(groupDocumentType.name)

  fireEvent.click(groupNameCell)

  expect(goTo).nthCalledWith(1, navigationMap.documentTypes.documentType(groupDocumentType.id))
})
