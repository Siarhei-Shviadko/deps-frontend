
import { mockEnv } from '@/mocks/mockEnv'
import { Table } from 'labeling-tool/lib/models/Table'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Cell, TableData } from '@/models/ExtractedData'
import { Rect } from '@/models/Rect'
import { SourceBboxCoordinates } from '@/models/SourceCoordinates'
import { getPage2Text } from '../OCRGrid/tests/conftest'
import { extractDataTableWithAlgorithm } from './extractDataTableWithAlgorithm'

const tableData = new TableData(
  '1',
  [{ y: 0 }, { y: 0.5441176471 }],
  [{ x: 0 }],
  [
    new Cell(0, 0, '', 1, 1, 1, '1'),
    new Cell(1, 0, '', 1, 1, 1, '1'),
  ],
  new Rect(
    0.07375049980007994,
    0.7973492880945169,
    0.14193122750899642,
    0.04180551348076339,
  ),
  null,
  null,
  undefined,
  null,
  new SourceBboxCoordinates(
    null,
    1,
    [
      new Rect(
        0.13194722111155538,
        0.33717055437746135,
        0.17193122750899642,
        0.04180551348076339,
      ),
    ],
  ),
)

const mockTable = new Table(
  [
    0.07375049980007994,
    0.2456817273090764,
  ],
  [
    0.7973492880945169,
    0.8199315715397456,
    0.8388518630717965,
  ],
  [],
  [],
  {},
  'Census Table',
)

const mockPage2text = getPage2Text()
const page = '1'
const language = KnownLanguage.ENGLISH
const engine = KnownProcessingEngines.TESSERACT
const blobName = 'test.png'

jest.mock('./getOCRTextLines', () => ({
  getOCRTextLines: jest.fn(() => Promise.resolve(mockPage2text[page])),
}))

jest.mock('@/utils/env', () => mockEnv)

describe('OCRTextExtractor: extractDataTableWithAlgorithm', () => {
  it('should return correct content when call extractDataTableWithAlgorithm', async () => {
    const expectedCellsWithValues = [
      new Cell(0, 0, '1. Introduction', 1, 1, 1, 1),
      new Cell(1, 0, 'DRUG_MOCK (DRUG_MOCK_B,', 1, 1, 1, 1),
    ]

    const tableEd = await extractDataTableWithAlgorithm({
      engine,
      blobName,
      markupTable: mockTable,
      language,
      tableData,
    })

    expect(tableEd).toEqual({
      ...tableData,
      cells: expectedCellsWithValues,
    })
  })
})
