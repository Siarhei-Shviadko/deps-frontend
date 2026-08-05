
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import flushPromises from 'flush-promises'
import {
  highlightTableCoordsField,
  highlightPolygonCoordsField,
} from '@/actions/documentReviewPage'
import { storeValidation, updateExtractedData } from '@/actions/documents'
import { documentsApi } from '@/api/documentsApi'
import { documentTypesApi } from '@/api/documentTypesApi'
import {
  HTColumn,
  HTCell,
  HTDataProps,
} from '@/components/HandsonTable'
import { UiKeys } from '@/constants/navigation'
import { ExtractedDataHandsonTable } from '@/containers/ExtractedDataHandsonTable'
import { FieldType } from '@/enums/FieldType'
import { Document } from '@/models/Document'
import { DocumentTypeField } from '@/models/DocumentTypeField'
import { TableFieldColumn } from '@/models/DocumentTypeFieldMeta'
import { FieldValidation } from '@/models/DocumentValidation'
import {
  Cell,
  ExtractedData,
  ExtractedDataField,
  TableData,
  TableField,
} from '@/models/ExtractedData'
import {
  mapTableFieldToHandsonDataStrings,
  mapTableFieldToHandsonDataObjects,
  mapHandsonDataObjectsToTableFieldCells,
  mapHandsonDataStringsToTableFieldCells,
} from '@/models/ExtractedData/mappers'
import { FieldCoordinates } from '@/models/FieldCoordinates'
import { Organisation } from '@/models/Organisation'
import { Rect } from '@/models/Rect'
import {
  SourceBboxCoordinates,
  SourceCellCoordinate,
  SourceCellRange,
  SourceTableCoordinates,
} from '@/models/SourceCoordinates'
import { TableCoordinates } from '@/models/TableCoordinates'
import { User } from '@/models/User'
import { userSelector } from '@/selectors/authorization'
import {
  documentSelector,
  confidenceViewSelector,
  documentTypeSelector,
} from '@/selectors/documentReviewPage'
import { uiSelector } from '@/selectors/navigation'
import { ENV } from '@/utils/env'
import { externalOneTimeRender } from '@/utils/externalOneTimeRender'
import { renderCellExtraData } from './renderCellExtraData'

jest.mock('react-redux', () => mockReactRedux)
jest.mock('@/selectors/documentReviewPage')
jest.mock('@/selectors/authorization')
jest.mock('@/selectors/navigation')
jest.mock('@/selectors/requests')
jest.mock('@/actions/documents', () => ({
  updateExtractedData: jest.fn(),
  storeValidation: jest.fn(),
}))
jest.mock('@/actions/documentReviewPage', () => ({
  highlightTableCoordsField: jest.fn(),
  highlightPolygonCoordsField: jest.fn(),
  extractArea: jest.fn(),
  extractAreaWithAlgorithm: jest.fn(),
}))
jest.mock('@/utils/env', () => mockEnv)

const mockCell1 = new Cell(0, 0, '0 1', 2, 2, 1, 0.1)
const mockCell2 = new Cell(0, 2, '0 3', 1, 2, 1, 0.1)

const mockUser = new User(
  'system@email.com',
  'Test',
  'Tester',
  new Organisation('1111', 'TestOrganisation'),
  'SystemUser',
  'test',
)

const sourceTableCoordinates = [new SourceTableCoordinates(
  '1234', [
    new SourceCellRange(new SourceCellCoordinate(1, 2)),
    new SourceCellRange(new SourceCellCoordinate(1, 2)),
  ])]

const sourceBboxCoordinates = [new SourceBboxCoordinates(
  '1234',
  1,
  [
    new Rect(1, 2, 3, 4),
    new Rect(1, 2, 3, 4),
  ],
)]

const mockExtractAreaResponse = {
  content: 'mockContent',
  confidence: 99,
}
jest.mock('@/utils/externalOneTimeRender', () => ({
  externalOneTimeRender: jest.fn(),
}))

jest.mock('@/utils/notification', () => mockNotification)

jest.mock('./renderCellExtraData', () => ({
  renderCellExtraData: jest.fn(),
}))

jest.mock('./renderCell', () => ({
  renderCell: jest.fn(),
}))

jest.mock('@/utils/externalOneTimeRender', () => ({
  externalOneTimeRender: jest.fn(),
}))

jest.mock('@/api/documentsApi', () => ({
  documentsApi: {
    updateEdField: jest.fn(),
    saveEdField: jest.fn(),
  },
}))

jest.mock('@/api/documentTypesApi', () => ({
  documentTypesApi: {
    validateField: jest.fn(),
  },
}))

const mockTableData = new HTDataProps(
  [
    {
      0: new HTCell(
        '0 0',
        { confidence: 0.01 },
      ),
      1: new HTCell(
        '0 1',
        { confidence: 0.02 },
      ),
    },
  ],
  [],
  [
    new HTColumn('0.value'),
    new HTColumn('1.value'),
  ],
)

jest.mock('@/models/ExtractedData/mappers', () => ({
  mapTableFieldToHandsonDataObjects: jest.fn(() => mockTableData),
  mapTableFieldToHandsonDataStrings: jest.fn(() => ({
    data: ['0 0', '0 1'],
    mergeCells: [],
  })),
  mapHandsonDataObjectsToTableFieldCells: jest.fn(() => [
    mockCell1,
    mockCell2,
  ]),
  mapHandsonDataStringsToTableFieldCells: jest.fn(() => [
    mockCell1,
    mockCell2,
  ]),
}))

const {
  mapStateToProps,
  mapDispatchToProps,
  ConnectedComponent,
} = ExtractedDataHandsonTable

describe('Container: ExtractedDataHandsonTable', () => {
  describe('mapStateToProps', () => {
    let props

    beforeEach(() => {
      props = mapStateToProps().props
    })

    it('should call documentSelector and pass the result as blobName prop', () => {
      expect(documentSelector).toHaveBeenCalled()
      expect(props.document).toEqual(documentSelector.getSelectorMockValue())
    })

    it('should call userSelector and pass the result as user prop', () => {
      expect(userSelector).toHaveBeenCalled()
      expect(props.user).toEqual(userSelector.getSelectorMockValue())
    })

    it('should call uiSelector and pass the result as cellRanges prop', () => {
      expect(uiSelector).toHaveBeenCalled()
      expect(props.cellRanges).toEqual(uiSelector.getSelectorMockValue()[UiKeys.CELL_RANGES])
    })
  })

  describe('mapDispatchToProps', () => {
    let props

    beforeEach(() => {
      props = mapDispatchToProps().props
    })

    it('should pass highlightTableCoordsField action as highlightTableCoordsField property', () => {
      props.highlightTableCoordsField()
      expect(highlightTableCoordsField).toHaveBeenCalledTimes(1)
    })

    it('should pass highlightPolygonCoordsField action as highlightPolygonCoordsField property', () => {
      props.highlightPolygonCoordsField()
      expect(highlightPolygonCoordsField).toHaveBeenCalledTimes(1)
    })

    it('should pass updateExtractedData action as updateExtractedData property', () => {
      props.updateExtractedData()
      expect(updateExtractedData).toHaveBeenCalledTimes(1)
    })

    it('should pass storeValidation action as storeValidation property', () => {
      props.storeValidation()
      expect(storeValidation).toHaveBeenCalledTimes(1)
    })
  })

  describe('ConnectedComponent', () => {
    let defaultObjectProps,
      defaultStringsProps,
      wrapperObjects,
      wrapperStrings,
      htObjectsProps,
      htStringsProps,
      tableField1,
      tableField2,
      tableFieldData1,
      tableFieldData2

    beforeEach(() => {
      jest.clearAllMocks()
      documentsApi.updateEdField.mockResolvedValue({})
      documentsApi.saveEdField.mockResolvedValue({})
      documentTypesApi.validateField.mockResolvedValue({})
      const cells1 = [
        new Cell(0, 0, '0 1', 2, 2, 1, 0.1),
        new Cell(0, 2, '0 3', 1, 2, 1, 0.1),
      ]
      const rows1 = [{ y: 0 }, { y: 0.5 }]
      const columns1 = [{ x: 0 }, { x: 0.5 }]
      tableFieldData1 = {
        ...new TableData(1, rows1, columns1, cells1, new Rect(0.1, 0.1, 0.2, 0.2)),
        index: 0,
      }
      tableField1 = { ...new ExtractedDataField(100, tableFieldData1) }

      const cells2 = [
        new Cell(0, 0, '0 1', 2, 2, 1, 0.1),
        new Cell(0, 2, '0 3', 1, 2, 1, 0.1),
      ]
      const rows2 = []
      const columns2 = []
      tableFieldData2 = {
        ...new TableData(1, rows2, columns2, cells2, new Rect(0.1, 0.1, 0.2, 0.2)),
        index: 0,
      }
      tableField2 = { ...new ExtractedDataField(100500, tableFieldData2) }

      defaultObjectProps = {
        documentId: 'testDocumentId',
        dtField: {
          ...new DocumentTypeField(
            'verticalReference',
            'Vertical Reference',
            {
              columns: [
                new TableFieldColumn('a'),
                new TableFieldColumn('b'),
              ],
            },
            FieldType.TABLE,
            false,
            1,
            'mockDocumentTypeCode',
            1,
          ),
          fieldIndex: 0,
        },
        user: mockUser,
        validation: new FieldValidation(
          [
            {
              column: 1,
              row: 1,
              index: null,
              message: 'MockError',
              kvId: null,
            },
          ],
          [
            {
              column: 0,
              row: 0,
              index: null,
              message: 'MockWarning',
              kvId: null,
            },
          ],
        ),
        document: documentSelector.getSelectorMockValue(),
        activePage: uiSelector.getSelectorMockValue()[UiKeys.ACTIVE_PAGE],
        cellRanges: uiSelector.getSelectorMockValue()[UiKeys.CELL_RANGES],
        extractArea: jest.fn(() => mockExtractAreaResponse),
        extractAreaWithAlgorithm: jest.fn(() => mockExtractAreaResponse),
        highlightedField: [[0, 0]],
        highlightTableCoordsField: jest.fn(),
        highlightPolygonCoordsField: jest.fn(),
        tableField: tableField1,
        updateExtractedData: jest.fn(),
        storeValidation: jest.fn(),
        readOnly: false,
        confidenceView: confidenceViewSelector.getSelectorMockValue(),
        documentType: documentTypeSelector.getSelectorMockValue(),
      }

      defaultStringsProps = {
        documentId: 'testDocumentId',
        user: mockUser,
        dtField: {
          ...new DocumentTypeField(
            'verticalReference',
            'Vertical Reference',
            {
              columns: [
                new TableFieldColumn('a'),
                new TableFieldColumn('b'),
              ],
            },
            FieldType.TABLE,
            false,
            1,
            'mockDocumentTypeCode',
            1,
          ),
          fieldIndex: 0,
        },
        document: documentSelector.getSelectorMockValue(),
        activePage: uiSelector.getSelectorMockValue()[UiKeys.ACTIVE_PAGE],
        validation: new FieldValidation(
          [
            {
              column: 1,
              row: 1,
              message: 'MockError',
            },
          ],
          [
            {
              column: 0,
              row: 0,
              message: 'MockWarning',
            },
          ],
        ),
        cellRanges: uiSelector.getSelectorMockValue()[UiKeys.CELL_RANGES],
        extractArea: jest.fn(() => mockExtractAreaResponse),
        extractAreaWithAlgorithm: jest.fn(() => mockExtractAreaResponse),
        highlightedField: [[0, 0]],
        highlightTableCoordsField: jest.fn(),
        highlightPolygonCoordsField: jest.fn(),
        tableField: tableField2,
        updateExtractedData: jest.fn(),
        storeValidation: jest.fn(),
        readOnly: false,
        confidenceView: confidenceViewSelector.getSelectorMockValue(),
        documentType: documentTypeSelector.getSelectorMockValue(),
      }

      wrapperObjects = shallow(<ConnectedComponent {...defaultObjectProps} />)
      wrapperStrings = shallow(<ConnectedComponent {...defaultStringsProps} />)

      htObjectsProps = wrapperObjects.props()
      htStringsProps = wrapperStrings.props()
    })

    it('should render correct layout for extracted data table with coordinates', () => {
      expect(wrapperObjects).toMatchSnapshot()
    })

    it('should render correct layout for extracted data table without coordinates', () => {
      expect(wrapperStrings).toMatchSnapshot()
    })

    it('extractValue should return correct data', async () => {
      const selection = {
        start: {
          row: 1,
          col: 1,
        },
        end: {
          row: 1,
          col: 1,
        },
      }

      const tableData = [
        [
          new HTCell('1', { confidence: 0.99 }),
          new HTCell('12', { confidence: 0.88 }),
        ],
        [
          new HTCell('21', { confidence: 0.77 }),
          new HTCell('22', { confidence: 0.66 }),
        ],
      ]

      const expectedData = {
        data: [[
          1,
          1,
          new HTCell('mockContent', { confidence: 99 }),
        ]],
        insert: null,
        selection,
      }
      const result = await wrapperObjects.instance().extractValue([selection], tableData)
      expect(result).toEqual(expectedData)
    })

    it('extractArea action should be called on extractArea calling', async () => {
      const selection = {
        start: {
          row: 1,
          col: 1,
        },
        end: {
          row: 1,
          col: 1,
        },
      }

      const tableData = [
        [
          new HTCell('1', { confidence: 0.99 }),
          new HTCell('12', { confidence: 0.88 }),
        ],
        [
          new HTCell('21', { confidence: 0.77 }),
          new HTCell('22', { confidence: 0.66 }),
        ],
      ]
      const blobName = Document.getUnifiedDataBlobName(defaultObjectProps.document, defaultObjectProps.activePage)
      const { field: [cellCoords] } = TableField.getCellRangesFromHighlightedCells(defaultObjectProps.tableField, {
        from: selection.start,
        to: selection.end,
      })
      await wrapperObjects.instance().extractValue([selection], tableData)
      expect(defaultObjectProps.extractArea).nthCalledWith(1, blobName, cellCoords)
    })

    it('extractDataAreaWithAlgorithm action should be called on extractArea calling if FEATURE_OCR_INTERSECTION_ALGORITHM is enabled', async () => {
      ENV.FEATURE_OCR_INTERSECTION_ALGORITHM = true
      const selection = {
        start: {
          row: 1,
          col: 1,
        },
        end: {
          row: 1,
          col: 1,
        },
      }

      const tableData = [
        [
          new HTCell('1', { confidence: 0.99 }),
          new HTCell('12', { confidence: 0.88 }),
        ],
        [
          new HTCell('21', { confidence: 0.77 }),
          new HTCell('22', { confidence: 0.66 }),
        ],
      ]
      const blobName = Document.getUnifiedDataBlobName(defaultObjectProps.document, defaultObjectProps.activePage)
      const { field: [cellCoords] } = TableField.getCellRangesFromHighlightedCells(defaultObjectProps.tableField, {
        from: selection.start,
        to: selection.end,
      })
      await wrapperObjects.instance().extractValue([selection], tableData)
      expect(defaultObjectProps.extractAreaWithAlgorithm).nthCalledWith(1, blobName, cellCoords)

      ENV.FEATURE_OCR_INTERSECTION_ALGORITHM = false
    })

    it('should call mapTableFieldToHandsonDataObjects when render Handson table', () => {
      const predefinedColumns = defaultObjectProps.dtField.fieldMeta.columns.map((_, i) => i)
      expect(mapTableFieldToHandsonDataObjects).nthCalledWith(1, defaultObjectProps.tableField.data, predefinedColumns)
    })

    it('should call mapTableFieldToHandsonDataStrings when render Handson table', () => {
      const minimalColumnQuantity = defaultStringsProps.dtField.fieldMeta.columns.length
      expect(mapTableFieldToHandsonDataStrings).nthCalledWith(1, defaultStringsProps.tableField.data, minimalColumnQuantity)
    })

    it('should not call props.updateExtractedData changes when cell value did not changed', () => {
      const cells = [
        new Cell(0, 0, '0 1', 2, 2, 1, 0.1),
        new Cell(0, 2, '0 3', 1, 2, 1, 0.1),
      ]

      defaultStringsProps.document.extractedData = [
        new ExtractedDataField(
          1,
          [new TableData(1, [], [], cells, new FieldCoordinates(1, 0.10, 0.10, 0.10, 0.10))],
        ),
      ]

      const tableData = [[1, 2]]
      const mergeCells = []
      htStringsProps.saveData(tableData, mergeCells)
      expect(defaultStringsProps.updateExtractedData).not.toBeCalled()
    })

    it('should call props.updateExtractedData with correct arguments in case of calling HandsonTable.props.saveData with table field', () => {
      defaultStringsProps.document.extractedData = []
      defaultStringsProps.dtField.fieldIndex = undefined
      const tableData = [[1, 2]]
      const mergeCells = []
      const { extractedDataClone, fieldToUpdate } = ExtractedData.getUpdates(defaultStringsProps.document.extractedData, defaultStringsProps.dtField)
      const modifiedTableField = { ...fieldToUpdate }
      modifiedTableField.data.cells = mapHandsonDataStringsToTableFieldCells(tableData, mergeCells, defaultStringsProps.activePage)
      modifiedTableField.data.modifiedBy = User.getName(defaultStringsProps.user)
      const modifiedExtractedData = ExtractedData.replaceField(extractedDataClone, fieldToUpdate, modifiedTableField)
      htStringsProps.saveData(tableData, mergeCells)
      expect(defaultStringsProps.updateExtractedData).nthCalledWith(1, defaultStringsProps.documentId, modifiedExtractedData)
    })

    it('should call props.updateExtractedData with correct arguments in case of calling HandsonTable.props.saveData with list field', () => {
      defaultStringsProps.document.extractedData = [
        new ExtractedDataField(
          1,
          [new TableData(1, [], [], [], new FieldCoordinates(1, 0.10, 0.10, 0.10, 0.10))],
        ),
      ]
      const tableData = [[1, 2]]
      const mergeCells = []
      const { extractedDataClone, fieldToUpdate } = ExtractedData.getUpdates(defaultStringsProps.document.extractedData, defaultStringsProps.dtField)
      const modifiedTableField = { ...fieldToUpdate }
      modifiedTableField.data[0].cells = mapHandsonDataStringsToTableFieldCells(tableData, mergeCells, defaultStringsProps.activePage)
      modifiedTableField.data[0].modifiedBy = User.getName(defaultStringsProps.user)
      const modifiedExtractedData = ExtractedData.replaceField(extractedDataClone, fieldToUpdate, modifiedTableField)
      htStringsProps.saveData(tableData, mergeCells)
      expect(defaultStringsProps.updateExtractedData).nthCalledWith(1, defaultStringsProps.documentId, modifiedExtractedData)
    })

    it('should call mapHandsonDataObjectsToTableFieldCells with correct arguments in case of calling HandsonTable.props.saveData', () => {
      const tableData = [{
        0: new HTCell(
          '1',
          {
            confidence: 0.1,
            tableCoordinates: [new TableCoordinates(1, [[1, 1]])],
          },
        ),
      }]
      const mergeCells = []
      htObjectsProps.saveData(tableData, mergeCells)
      expect(mapHandsonDataObjectsToTableFieldCells).nthCalledWith(
        1,
        tableData,
        mergeCells,
        defaultObjectProps.tableField.data.coordinates.page,
      )
    })

    it('should call mapHandsonDataStringsToTableFieldCells with correct arguments in case of calling HandsonTable.props.saveData', () => {
      const tableData = [[1, 2]]
      const mergeCells = []
      htStringsProps.saveData(tableData, mergeCells)
      expect(mapHandsonDataStringsToTableFieldCells).nthCalledWith(1, tableData, mergeCells, defaultStringsProps.activePage)
    })

    it('should call renderCellExtraData with correct arguments when calling HandsonTable.props.cellRenderer', () => {
      const instance = {
        rootElement: {
          id: 1,
        },
      }
      const cellDataHighlighters = undefined

      const cellsData = [{
        0: new HTCell(
          '1',
          { confidence: 0.1 },
        ),
      }]
      const td = 'td'
      const prop = 'prop'
      const value = '100500'
      const cellProps = 'cellProps'
      htObjectsProps.cellRenderer(instance, td, 0, 0, prop, value, cellProps, cellsData)
      expect(renderCellExtraData).nthCalledWith(
        1,
        {
          comments: undefined,
          modified: undefined,
          confidence: 10,
          confidenceView: defaultObjectProps.confidenceView,
        },
        instance.rootElement,
        cellDataHighlighters,
      )
    })

    it('should return array of callbacks when extractedDataHighlighters call with correct arguments with multi tableCoordinates', () => {
      const cell = [
        new Cell(0, 0, '0 1', 2, 2, 1, 0.1, [
          new TableCoordinates(1, [[0, 0], [3, 3]]),
          new TableCoordinates(2, [[0, 0], [3, 3]]),
        ]),
      ]

      const rows1 = [{ y: 0 }, { y: 0.5 }]
      const columns1 = [{ x: 0 }, { x: 0.5 }]

      defaultObjectProps.tableField = new ExtractedDataField(100, {
        ...new TableData(
          1, rows1, columns1, cell, undefined, undefined, [new TableCoordinates(1, [[2, 2], [3, 3]])],
        ),
        index: 0,
      })

      wrapperObjects.setProps(defaultObjectProps)
      const dataHighlighters = wrapperObjects.instance().extractedDataHighlighters(0, 0)
      dataHighlighters[0].highlighter()
      expect(defaultObjectProps.highlightTableCoordsField).nthCalledWith(1, {
        field: [[0, 0], [3, 3]],
        page: '1',
      })
    })

    it('should return array of callbacks when extractedDataHighlighters call with correct arguments with multi sourceTableCoordinates', () => {
      const cell = [
        new Cell(0, 0, '0 1', 2, 2, 1, 0.1, null, [
          ...sourceTableCoordinates,
          new SourceTableCoordinates(
            '4321',
            [
              new SourceCellRange(new SourceCellCoordinate(1, 2)),
              new SourceCellRange(new SourceCellCoordinate(1, 2)),
            ])],
        )]
      const rows1 = [{ y: 0 }, { y: 0.5 }]
      const columns1 = [{ x: 0 }, { x: 0.5 }]

      defaultObjectProps.tableField = new ExtractedDataField(100, {
        ...new TableData(
          undefined, rows1, columns1, cell, undefined, undefined, undefined, undefined, sourceTableCoordinates,
        ),
        index: 0,
      })

      wrapperObjects.setProps(defaultObjectProps)
      const highlighters = wrapperObjects.instance().extractedDataHighlighters(0, 0)
      highlighters[0].highlighter()
      expect(defaultObjectProps.highlightTableCoordsField).nthCalledWith(1, {
        field: [[1, 2], [1, 2]],
        sourceId: '1234',
      })
    })

    it('should return array of callbacks when extractedDataHighlighters call with correct arguments with multi sourceBboxCoordinates', () => {
      const cell = [
        new Cell(0, 0, '0 1', 2, 2, 1, 0.1, null, null, [
          ...sourceBboxCoordinates,
          new SourceBboxCoordinates(
            '4321',
            1,
            [
              new Rect(1, 2, 3, 4),
              new Rect(1, 2, 3, 4),
            ],
          ),
        ])]
      const rows1 = [{ y: 0 }, { y: 0.5 }]
      const columns1 = [{ x: 0 }, { x: 0.5 }]

      defaultObjectProps.tableField = new ExtractedDataField(100, {
        ...new TableData(
          undefined, rows1, columns1, cell, undefined, undefined, undefined, undefined, undefined, sourceBboxCoordinates,
        ),
        index: 0,
      })

      wrapperObjects.setProps(defaultObjectProps)
      const highlighters = wrapperObjects.instance().extractedDataHighlighters(0, 0)
      highlighters[0].highlighter()
      expect(defaultObjectProps.highlightPolygonCoordsField).nthCalledWith(1, {
        field: [new Rect(1, 2, 3, 4), new Rect(1, 2, 3, 4)],
        sourceId: '1234',
      })
    })

    it('should return null when extractedDataHighlighters call with correct arguments with one sourceBboxCoordinate', () => {
      const cell = [
        new Cell(0, 0, '0 1', 2, 2, 1, 0.1, null, null, [new SourceBboxCoordinates(
          '1234',
          1,
          [new Rect(1, 2, 3, 4)],
        )])]
      const rows1 = [{ y: 0 }, { y: 0.5 }]
      const columns1 = [{ x: 0 }, { x: 0.5 }]

      defaultObjectProps.tableField = new ExtractedDataField(100, {
        ...new TableData(
          undefined, rows1, columns1, cell, undefined, undefined, undefined, undefined, undefined, sourceBboxCoordinates,
        ),
        index: 0,
      })

      wrapperObjects.setProps(defaultObjectProps)
      const highlighters = wrapperObjects.instance().extractedDataHighlighters(0, 0)
      expect(highlighters).toBeNull()
    })

    it('should pass correct callback to the insert multiple rows context menu item', () => {
      const insertRowsContextMenuItem = htStringsProps.extraCtxMenuConfig.find((item) => item.name === 'Insert multiple rows')
      expect(insertRowsContextMenuItem.callback).toEqual(wrapperStrings.instance().openInsertRowsModal)
    })

    it('should call externalOneTimeRender once when calling callback of the insert multiple rows context menu item', () => {
      const insertRowsContextMenuItem = htStringsProps.extraCtxMenuConfig.find((item) => item.name === 'Insert multiple rows')
      const selections = [
        {
          start: {
            col: 0,
            row: 0,
          },
          end: {
            col: 0,
            row: 0,
          },
        },
      ]
      insertRowsContextMenuItem.callback(selections)
      expect(externalOneTimeRender).toHaveBeenCalledTimes(1)
    })

    it('should call props.highlightPolygonCoordsField with correct arguments in case cell not from first chunk of paginated table has been selected', () => {
      defaultObjectProps = {
        ...defaultObjectProps,
        pageSize: 2,
        tableField: {
          ...defaultObjectProps.tableField,
          data: {
            ...defaultObjectProps.tableField.data,
            meta: {
              rowsChunk: 2,
              chunksTotal: 3,
              rowsTotal: 6,
              listIndex: 0,
            },
            rows: [{ y: 0.1 }, { y: 0.12 }, { y: 0.15 }],
          },
        },
      }

      wrapperObjects.setProps(defaultObjectProps)

      const ranges = [{
        from: {
          row: 0,
          col: 0,
        },
        to: {
          row: 0,
          col: 0,
        },
      }]

      const modifiedRange = {
        from: {
          row: 2,
          col: 0,
        },
        to: {
          row: 2,
          col: 0,
        },
      }

      const expectedCoords = TableField.getCoordsBounds(modifiedRange, defaultObjectProps.tableField, 1)

      htObjectsProps.onSelectRange(ranges)
      expect(defaultObjectProps.highlightPolygonCoordsField).nthCalledWith(
        1,
        {
          field: expectedCoords,
          page: defaultObjectProps.tableField.data.coordinates.page,
        },
      )
    })

    it('should not call props.highlightTableCoordsField if there are multiple coordinates in cell and cell coords have already been selected', () => {
      const ranges = [{
        from: {
          row: 0,
          col: 0,
        },
        to: {
          row: 0,
          col: 0,
        },
      }]

      const cell = [
        new Cell(0, 0, '0 1', 2, 2, 1, 0.1, [
          new TableCoordinates(1, [[0, 0], [3, 3]]),
          new TableCoordinates(2, [[0, 0], [3, 3]]),
        ]),
      ]

      const rows1 = [{ y: 0 }, { y: 0.5 }]
      const columns1 = [{ x: 0 }, { x: 0.5 }]

      defaultObjectProps.tableField = new ExtractedDataField(100, {
        ...new TableData(1, rows1, columns1, cell, undefined, undefined, [new TableCoordinates(1, [[2, 2], [3, 3]])]),
        index: 0,
      })

      wrapperObjects.setProps(defaultObjectProps)
      htObjectsProps.onSelectRange(ranges)
      expect(defaultObjectProps.highlightTableCoordsField).not.toHaveBeenCalled()
    })

    it('should call props.highlightTableCoordsField if there are multiple coordinates in cell and in highlightedField', () => {
      const ranges = [{
        from: {
          row: 0,
          col: 0,
        },
        to: {
          row: 0,
          col: 0,
        },
      }]

      const expectedCoords = [0, 0]
      const expectedPage = 1

      const cell = [
        new Cell(0, 0, '0 1', 2, 2, 1, 0.1, [
          new TableCoordinates(expectedPage, [expectedCoords, [3, 3]]),
          new TableCoordinates(expectedPage + 1, [expectedCoords, [3, 3]]),
        ]),
      ]

      const rows1 = [{ y: 0 }, { y: 0.5 }]
      const columns1 = [{ x: 0 }, { x: 0.5 }]

      defaultObjectProps.tableField = new ExtractedDataField(100, {
        ...new TableData(1, rows1, columns1, cell, undefined, undefined, [new TableCoordinates(1, [[2, 2], [3, 3]])]),
        index: 0,
      })

      defaultObjectProps.highlightedField = [[0, 0], [1, 1]]

      wrapperObjects.setProps(defaultObjectProps)
      htObjectsProps.onSelectRange(ranges)
      expect(defaultObjectProps.highlightTableCoordsField).nthCalledWith(
        1,
        {
          field: [expectedCoords],
          page: expectedPage,
        },
      )
    })

    it('should call props.highlightTableCoordsField if there are multiple coordinates in cell', () => {
      const ranges = [{
        from: {
          row: 0,
          col: 0,
        },
        to: {
          row: 0,
          col: 0,
        },
      }]

      const expectedCoords = [1, 1]

      const cell = [
        new Cell(0, 0, '0 1', 2, 2, 1, 0.1, [
          new TableCoordinates(1, [expectedCoords, [3, 3]]),
          new TableCoordinates(2, [expectedCoords, [3, 3]]),
        ]),
      ]

      const rows1 = [{ y: 0 }, { y: 0.5 }]
      const columns1 = [{ x: 0 }, { x: 0.5 }]

      defaultObjectProps.tableField = new ExtractedDataField(100, {
        ...new TableData(1, rows1, columns1, cell, undefined, undefined, [new TableCoordinates(1, [[2, 2], [3, 3]])]),
        index: 0,
      })

      wrapperObjects.setProps(defaultObjectProps)
      htObjectsProps.onSelectRange(ranges)
      expect(defaultObjectProps.highlightTableCoordsField).nthCalledWith(1, {
        field: [expectedCoords],
        page: defaultObjectProps.tableField.data.tableCoordinates[0].page,
      })
    })

    it('should call props.highlightPolygonCoordsField if there are one sourceBboxCoordinate in cell', () => {
      const ranges = [{
        from: {
          row: 0,
          col: 0,
        },
        to: {
          row: 0,
          col: 0,
        },
      }]

      const expectedCoords = new Rect(1, 2, 3, 4)

      const cell = [
        new Cell(0, 0, '0 1', 2, 2, 1, 0.1, null, null, [new SourceBboxCoordinates(
          '1234',
          1,
          [new Rect(1, 2, 3, 4)],
        )])]

      const rows1 = [{ y: 0 }, { y: 0.5 }]
      const columns1 = [{ x: 0 }, { x: 0.5 }]

      defaultObjectProps.tableField = new ExtractedDataField(100, {
        ...new TableData(
          undefined, rows1, columns1, cell, undefined, undefined, undefined, undefined, undefined, sourceBboxCoordinates,
        ),
        index: 0,
      })

      wrapperObjects.setProps(defaultObjectProps)
      htObjectsProps.onSelectRange(ranges)
      expect(defaultObjectProps.highlightPolygonCoordsField).nthCalledWith(1, {
        field: [expectedCoords],
        sourceId: defaultObjectProps.tableField.data.sourceBboxCoordinates[0].sourceId,
      },
      )
    })

    it('should call props.highlightTableCoordsField if there are one sourceTableCoordinates in cell', () => {
      const ranges = [{
        from: {
          row: 0,
          col: 0,
        },
        to: {
          row: 0,
          col: 0,
        },
      }]

      const expectedCoords = [[0, 0, 0, 0]]

      const sourceTableCoords = [
        new SourceTableCoordinates(
          '1234',
          [
            new SourceCellRange(
              new SourceCellCoordinate(0, 0),
              new SourceCellCoordinate(0, 0),
            ),
          ],
        ),
      ]

      const cells = [
        new Cell(
          0,
          0,
          '0 1',
          1,
          1,
          1,
          0.1,
          null,
          sourceTableCoords,
          null,
        )]

      const rows1 = [{ y: 0 }, { y: 0.5 }]
      const columns1 = [{ x: 0 }, { x: 0.5 }]

      defaultObjectProps.tableField = new ExtractedDataField(100, {
        ...new TableData(
          undefined,
          rows1,
          columns1,
          cells,
          undefined,
          undefined,
          undefined,
          undefined,
          sourceTableCoords,
          undefined,
        ),
        index: 0,
      })

      wrapperObjects.setProps(defaultObjectProps)
      htObjectsProps.onSelectRange(ranges)
      expect(defaultObjectProps.highlightTableCoordsField).nthCalledWith(1, {
        field: expectedCoords,
        sourceId: defaultObjectProps.tableField.data.cells[0].sourceTableCoordinates[0].sourceId,
      })
    })

    it('should call props.highlightTableCoordsField if there are one sourceTableCoordinates in cell', () => {
      const ranges = [{
        from: {
          row: 0,
          col: 0,
        },
        to: {
          row: 0,
          col: 0,
        },
      }]

      const expectedCoords = [[0, 0]]
      const expectedPage = 1
      const tableCoordinates = [
        new TableCoordinates(
          1,
          [
            [0, 0],
          ],
        ),
      ]

      const cells = [
        new Cell(
          0,
          0,
          '0 1',
          1,
          1,
          expectedPage,
          0.1,
          tableCoordinates,
        )]

      const rows1 = [{ y: 0 }, { y: 0.5 }]
      const columns1 = [{ x: 0 }, { x: 0.5 }]

      defaultObjectProps.tableField = new ExtractedDataField(100, {
        ...new TableData(
          undefined,
          rows1,
          columns1,
          cells,
          undefined,
          undefined,
          undefined,
          tableCoordinates,
        ),
        index: 0,
      })

      wrapperObjects.setProps(defaultObjectProps)
      htObjectsProps.onSelectRange(ranges)
      expect(defaultObjectProps.highlightTableCoordsField).nthCalledWith(1, {
        field: expectedCoords,
        sourceId: defaultObjectProps.document.unifiedData[expectedPage].find((ud) => ud.cells).id,
      })
    })

    it('should call props.highlightPolygonCoordsField if there are sourceBboxCoordinates in cell', () => {
      const ranges = [{
        from: {
          row: 0,
          col: 0,
        },
        to: {
          row: 0,
          col: 0,
        },
      }]

      const expectedCoords = [
        new Rect(1, 2, 3, 4),
        new Rect(1, 2, 3, 4),
      ]

      const cell = [
        new Cell(0, 0, '0 1', 2, 2, 1, 0.1, null, null, sourceBboxCoordinates)]

      const rows1 = [{ y: 0 }, { y: 0.5 }]
      const columns1 = [{ x: 0 }, { x: 0.5 }]

      defaultObjectProps.tableField = new ExtractedDataField(100, {
        ...new TableData(
          undefined, rows1, columns1, cell, undefined, undefined, undefined, undefined, undefined, sourceBboxCoordinates,
        ),
        index: 0,
      })

      wrapperObjects.setProps(defaultObjectProps)
      htObjectsProps.onSelectRange(ranges)
      expect(defaultObjectProps.highlightPolygonCoordsField).nthCalledWith(1, {
        field: expectedCoords,
        sourceId: defaultObjectProps.tableField.data.sourceBboxCoordinates[0].sourceId,
      })
    })

    it('should call props.highlightTableCoordsField if there are sourceTableCoordinates in cell', () => {
      const ranges = [{
        from: {
          row: 0,
          col: 0,
        },
        to: {
          row: 0,
          col: 0,
        },
      }]

      const expectedCoords = [[1, 2], [1, 2]]

      const cell = [
        new Cell(0, 0, '0 1', 2, 2, 1, 0.1, null, sourceTableCoordinates)]

      const rows1 = [{ y: 0 }, { y: 0.5 }]
      const columns1 = [{ x: 0 }, { x: 0.5 }]

      defaultObjectProps.tableField = new ExtractedDataField(100, {
        ...new TableData(
          undefined, rows1, columns1, cell, undefined, undefined, undefined, undefined, sourceTableCoordinates,
        ),
        index: 0,
      })

      wrapperObjects.setProps(defaultObjectProps)
      htObjectsProps.onSelectRange(ranges)
      expect(defaultObjectProps.highlightTableCoordsField).nthCalledWith(1, {
        field: expectedCoords,
        sourceId: defaultObjectProps.tableField.data.sourceTableCoordinates[0].sourceId,
      })
    })

    it('should call documentsApi.updateEdField with correct arguments in case of calling HandsonTable.props.saveData with table field', () => {
      defaultStringsProps.document.extractedData = []
      defaultStringsProps.dtField.fieldIndex = undefined
      const tableData = [[1, 2]]
      const mergeCells = []
      const { fieldToUpdate } = ExtractedData.getUpdates(defaultStringsProps.document.extractedData, defaultStringsProps.dtField)
      fieldToUpdate.data.cells = mapHandsonDataStringsToTableFieldCells(tableData, mergeCells, defaultStringsProps.activePage)
      fieldToUpdate.data.modifiedBy = User.getName(defaultStringsProps.user)
      htStringsProps.saveData(tableData, mergeCells)
      expect(documentsApi.updateEdField).nthCalledWith(1, {
        data: fieldToUpdate.data,
        fieldPk: fieldToUpdate.fieldPk,
        documentPk: defaultStringsProps.documentId,
      })
    })

    it('should call documentsApi.saveEdField with correct arguments in case of calling HandsonTable.props.saveData with table field', () => {
      const fieldData = new TableData()
      defaultStringsProps.tableField = new ExtractedDataField(100, fieldData)
      defaultStringsProps.document.extractedData = []
      defaultStringsProps.dtField.fieldIndex = undefined
      const tableData = [[1, 2]]
      const mergeCells = []
      const { fieldToUpdate } = ExtractedData.getUpdates(defaultStringsProps.document.extractedData, defaultStringsProps.dtField)
      fieldToUpdate.data.cells = mapHandsonDataStringsToTableFieldCells(tableData, mergeCells, defaultStringsProps.activePage)
      fieldToUpdate.data.modifiedBy = User.getName(defaultStringsProps.user)
      wrapperStrings.setProps(defaultStringsProps)
      htStringsProps.saveData(tableData, mergeCells)
      expect(documentsApi.saveEdField).nthCalledWith(1, {
        data: fieldToUpdate.data,
        fieldPk: fieldToUpdate.fieldPk,
        documentPk: defaultStringsProps.documentId,
      })
    })

    it('should call documentsApi.updateEdField with correct arguments in case of calling HandsonTable.props.saveData with list of tables field', () => {
      const userName = User.getName(defaultStringsProps.user)
      defaultStringsProps.document.extractedData = [
        new ExtractedDataField(
          1,
          [
            new TableData(1, [], [], [], new FieldCoordinates(1, 0.10, 0.10, 0.10, 0.10)),
            new TableData(2, [], [], [], new FieldCoordinates(2, 0.20, 0.20, 0.20, 0.20)),
          ],
        ),
      ]
      const tableData = [[1, 2]]
      const mergeCells = []
      const { fieldToUpdate } = ExtractedData.getUpdates(defaultStringsProps.document.extractedData, defaultStringsProps.dtField)
      fieldToUpdate.data[0].cells = mapHandsonDataStringsToTableFieldCells(tableData, mergeCells, defaultStringsProps.activePage)
      fieldToUpdate.data[0].modifiedBy = userName
      htStringsProps.saveData(tableData, mergeCells)
      expect(documentsApi.updateEdField).nthCalledWith(1, {
        data: fieldToUpdate.data.reduce((prev, cur) => ({ cells: prev.cells.concat(cur.cells) })),
        fieldPk: fieldToUpdate.fieldPk,
        documentPk: defaultStringsProps.documentId,
      })
    })

    it('should call documentsApi.saveEdField with correct arguments in case of calling HandsonTable.props.saveData with list of tables field', () => {
      const fieldData = new TableData()
      defaultStringsProps.tableField = new ExtractedDataField(100, fieldData)
      defaultStringsProps.document.extractedData = [
        new ExtractedDataField(
          1,
          [
            new TableData(1, [], [], [], new FieldCoordinates(1, 0.10, 0.10, 0.10, 0.10)),
            new TableData(2, [], [], [], new FieldCoordinates(2, 0.20, 0.20, 0.20, 0.20)),
          ],
        ),
      ]
      const tableData = [[1, 2]]
      const mergeCells = []
      const { fieldToUpdate } = ExtractedData.getUpdates(defaultStringsProps.document.extractedData, defaultStringsProps.dtField)
      fieldToUpdate.data[0].cells = mapHandsonDataStringsToTableFieldCells(tableData, mergeCells, defaultStringsProps.activePage)
      fieldToUpdate.data[0].modifiedBy = User.getName(defaultStringsProps.user)
      wrapperStrings.setProps(defaultStringsProps)
      htStringsProps.saveData(tableData, mergeCells)
      expect(documentsApi.saveEdField).nthCalledWith(1, {
        data: fieldToUpdate.data,
        fieldPk: fieldToUpdate.fieldPk,
        documentPk: defaultStringsProps.documentId,
      })
    })

    it('should call validation after successful field save when calling validateFieldAfterSave', async () => {
      const mockValidation = {
        fieldValidations: [],
        crossFieldValidations: [],
      }
      documentTypesApi.validateField.mockResolvedValue(mockValidation)

      await wrapperStrings.instance().validateFieldAfterSave()

      expect(documentTypesApi.validateField).toHaveBeenNthCalledWith(
        1,
        defaultStringsProps.documentType.code,
        defaultStringsProps.dtField.code,
        defaultStringsProps.documentId,
      )
      expect(defaultStringsProps.storeValidation).toHaveBeenNthCalledWith(
        1,
        defaultStringsProps.documentId,
        mockValidation,
      )
    })

    it('should skip validation when FEATURE_PER_FIELD_VALIDATION is disabled', async () => {
      ENV.FEATURE_PER_FIELD_VALIDATION = false

      await wrapperStrings.instance().validateFieldAfterSave()

      expect(documentTypesApi.validateField).not.toHaveBeenCalled()
      expect(defaultStringsProps.storeValidation).not.toHaveBeenCalled()

      ENV.FEATURE_PER_FIELD_VALIDATION = true
    })

    it('should call validation after saveData when FEATURE_PER_FIELD_VALIDATION is enabled', async () => {
      defaultStringsProps.document.extractedData = []
      defaultStringsProps.dtField.fieldIndex = undefined
      const tableData = [[1, 2]]
      const mergeCells = []
      const mockValidation = {
        fieldValidations: [],
        crossFieldValidations: [],
      }
      documentTypesApi.validateField.mockResolvedValue(mockValidation)

      htStringsProps.saveData(tableData, mergeCells)
      await flushPromises()

      expect(documentTypesApi.validateField).toHaveBeenCalledTimes(1)
      expect(defaultStringsProps.storeValidation).toHaveBeenNthCalledWith(
        1,
        defaultStringsProps.documentId,
        mockValidation,
      )
    })

    it('should not call validation if save fails', async () => {
      documentsApi.updateEdField.mockRejectedValueOnce(new Error('Save failed'))
      defaultStringsProps.document.extractedData = []
      defaultStringsProps.dtField.fieldIndex = undefined
      const tableData = [[1, 2]]
      const mergeCells = []
      const { fieldToUpdate } = ExtractedData.getUpdates(
        defaultStringsProps.document.extractedData,
        defaultStringsProps.dtField,
      )
      fieldToUpdate.data.cells = mapHandsonDataStringsToTableFieldCells(
        tableData,
        mergeCells,
        defaultStringsProps.activePage,
      )
      fieldToUpdate.data.modifiedBy = User.getName(defaultStringsProps.user)

      await wrapperStrings.instance().sendFieldToSave(fieldToUpdate).catch(() => {})
      await flushPromises()

      expect(documentsApi.updateEdField).toHaveBeenCalledTimes(1)
      expect(documentTypesApi.validateField).not.toHaveBeenCalled()
      expect(defaultStringsProps.storeValidation).not.toHaveBeenCalled()
    })
  })
})
