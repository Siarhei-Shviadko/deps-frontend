
import isEqual from 'lodash/isEqual'
import PropTypes from 'prop-types'
import { Component } from 'react'
import isRequiredIf from 'react-proptype-conditional-require'
import { connect } from 'react-redux'
import {
  highlightTableCoordsField,
  highlightPolygonCoordsField,
  extractAreaWithAlgorithm,
  extractArea,
} from '@/actions/documentReviewPage'
import { storeValidation, updateExtractedData } from '@/actions/documents'
import { documentsApi } from '@/api/documentsApi'
import { documentTypesApi } from '@/api/documentTypesApi'
import {
  HTCell,
  ContextMenuItem,
  SEPARATOR,
} from '@/components/HandsonTable'
import {
  CONFIDENCE_BREAKPOINT,
  MAX_CONFIDENCE_LEVEL,
  NOT_APPLICABLE_CONFIDENCE_LEVEL,
} from '@/constants/confidence'
import { UiKeys } from '@/constants/navigation'
import { InsertRowsModal } from '@/containers/InsertRowsModal'
import { ExtractedDataCoordsType } from '@/enums/ExtractedDataCoordsType'
import { withParentSize } from '@/hocs/withParentSize'
import { localize, Localization } from '@/localization/i18n'
import { confidenceViewShape } from '@/models/confidenceView'
import { Document, documentShape } from '@/models/Document'
import { documentTypeShape } from '@/models/DocumentType'
import { documentTypeFieldShape } from '@/models/DocumentTypeField'
import { FieldValidation, fieldValidationShape } from '@/models/DocumentValidation'
import {
  ExtractedData,
  extractedDataFieldShape,
  TableData,
  TableField,
} from '@/models/ExtractedData'
import {
  mapTableFieldToHandsonDataStrings,
  mapTableFieldToHandsonDataObjects,
  mapHandsonDataObjectsToTableFieldCells,
  mapHandsonDataStringsToTableFieldCells,
} from '@/models/ExtractedData/mappers'
import { highlightedPolygonCoordsShape, highlightedTableCoordsShape } from '@/models/HighlightedField'
import { mapSourceTableCoordinatesToTableCoordinates } from '@/models/SourceCoordinates/mappers'
import { TableCoordinates } from '@/models/TableCoordinates'
import { User, userShape } from '@/models/User'
import { userSelector } from '@/selectors/authorization'
import {
  idSelector,
  documentSelector,
  confidenceViewSelector,
  highlightedFieldSelector,
  documentTypeSelector,
} from '@/selectors/documentReviewPage'
import { uiSelector } from '@/selectors/navigation'
import { ENV } from '@/utils/env'
import { externalOneTimeRender } from '@/utils/externalOneTimeRender'
import { notifyRequest } from '@/utils/notification'
import { StyledHandsonTable } from './ExtractedDataHandsonTable.styles'
import { getTableCellsCoords } from './getTableCellsCoords'
import { renderCell } from './renderCell'
import { renderCellExtraData } from './renderCellExtraData'

const propsForUpdate = ['readOnly', 'forceRerenderProps', 'data', 'width']

const SizedTable = withParentSize({
  noPlaceholder: true,
})((props) => (
  <StyledHandsonTable
    {...props}
    width={props.size.width}
  />
))

class ExtractedDataHandsonTable extends Component {
  static propTypes = {
    documentId: PropTypes.string,
    pageSize: PropTypes.number,
    validation: fieldValidationShape,
    user: userShape.isRequired,
    dtField: documentTypeFieldShape.isRequired,
    cellRanges: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.number,
      ),
    ),
    documentType: documentTypeShape.isRequired,
    confidenceView: confidenceViewShape,
    extractArea: PropTypes.func.isRequired,
    extractAreaWithAlgorithm: isRequiredIf(PropTypes.func, ENV.FEATURE_OCR_INTERSECTION_ALGORITHM),
    highlightTableCoordsField: PropTypes.func.isRequired,
    highlightPolygonCoordsField: PropTypes.func.isRequired,
    highlightedField: PropTypes.oneOfType([
      highlightedPolygonCoordsShape,
      highlightedTableCoordsShape,
    ]),
    tableField: extractedDataFieldShape.isRequired,
    updateExtractedData: PropTypes.func.isRequired,
    storeValidation: PropTypes.func.isRequired,
    document: documentShape.isRequired,
    activePage: PropTypes.number.isRequired,
    readOnly: PropTypes.bool.isRequired,
  }

  state = {
    extraData: {
      modified: [],
      errors: [],
      comments: [],
      warnings: [],
    },
  }

  highlightFieldWithMultiSourceCoords = (cell) => {
    const { sourceTableCoordinates, sourceBboxCoordinates } = cell

    const [highlightedField] = (
      this.props.highlightedField?.length === 1
        ? this.props.highlightedField
        : []
    )

    let isEqualToHighlighted

    if (sourceBboxCoordinates) {
      isEqualToHighlighted = sourceBboxCoordinates.map((coords) => coords.bboxes).flat()?.find((coord) => (
        isEqual(highlightedField, coord)
      ))
    }

    if (sourceTableCoordinates) {
      isEqualToHighlighted = sourceTableCoordinates.map((coords) => coords.cellRanges).flat()?.find((coord) => (
        isEqual(highlightedField, mapSourceTableCoordinatesToTableCoordinates(coord))
      ))
    }

    if (!isEqualToHighlighted) {
      const [firstCoord] = sourceBboxCoordinates ?? sourceTableCoordinates
      const coord = firstCoord.bboxes?.[0] ?? mapSourceTableCoordinatesToTableCoordinates(firstCoord.cellRanges[0])
      sourceBboxCoordinates && this.props.highlightPolygonCoordsField({
        field: [coord],
        sourceId: firstCoord?.sourceId,
      })
      sourceTableCoordinates && this.props.highlightTableCoordsField({
        field: [coord],
        sourceId: firstCoord?.sourceId,
      })
    }
  }

  highlightFieldWithMultiCoords = (cell) => {
    const { sourceTableCoordinates, sourceBboxCoordinates, tableCoordinates } = cell

    if (sourceBboxCoordinates || sourceTableCoordinates) {
      return this.highlightFieldWithMultiSourceCoords(cell)
    }

    const [highlightedField] = (
      this.props.highlightedField?.length === 1
        ? this.props.highlightedField
        : []
    )

    const isHighlightedFieldInCellCoords = !highlightedField || !tableCoordinates.map(
      (coord) => coord.cellRange)
      .flat()
      .find((coord) => (
        isEqual(highlightedField, coord)
      ))

    if (isHighlightedFieldInCellCoords) {
      const [multiCoordsCell] = cell.tableCoordinates
      const [firstCoord] = multiCoordsCell.cellRange

      this.props.highlightTableCoordsField({
        field: [firstCoord],
        page: multiCoordsCell?.page,
      })
    }
  }

  modifyRangeToPaginatedTableRange = (range) => (
    Object.keys(range).reduce((acc, key) => {
      const { col, row } = range[key]

      acc[key] = {
        row: this.getRowFromIndex(row),
        col,
      }

      return acc
    }, {})
  )

  onSelectRange = ([range]) => {
    const cells = TableField.getCellsByRange(this.props.tableField, range)
    const firstCell = TableField.getFirstCellWithCoords(range, this.props.tableField)

    if (!cells.length) {
      return
    }

    if (
      !firstCell && !this.props.tableField.data.coordinates) {
      return
    }

    if (cells.length === 1 && !TableField.isCellCoordsFromOnePage(firstCell)) {
      return this.highlightFieldWithMultiCoords(firstCell)
    }

    if (firstCell?.sourceBboxCoordinates?.length) {
      const sourceId = firstCell.sourceBboxCoordinates[0].sourceId
      const fieldsToHighlight = cells
        .filter((c) => c.sourceBboxCoordinates)
        .map((c) => {
          const coordsByFirstCell = c.sourceBboxCoordinates.filter((sb) => sb.sourceId === sourceId)
            .map((sb) => sb.bboxes)
            .flat()
          return coordsByFirstCell
        }).flat()

      return this.props.highlightPolygonCoordsField({
        field: fieldsToHighlight,
        sourceId,
      })
    }

    if (firstCell?.sourceTableCoordinates?.length) {
      const sourceId = firstCell.sourceTableCoordinates?.[0].sourceId
      const fieldsToHighlight = cells
        .filter((c) => c.sourceTableCoordinates)
        .map((c) => {
          const rangesByFirstCell = c.sourceTableCoordinates.filter((st) => st.sourceId === sourceId && st.cellRanges?.length)
            .map((sb) => sb.cellRanges)
            .flat()
            .map((cr) => Object.values(cr)
              .filter((val) => !!val)
              .reduce((sum, coords) => ([...sum, coords.row, coords.column]), []),
            )

          return rangesByFirstCell
        }).flat()

      return this.props.highlightTableCoordsField({
        field: fieldsToHighlight,
        sourceId,
      })
    }

    if (firstCell?.tableCoordinates?.length) {
      const { page } = firstCell.tableCoordinates[0]
      const sourceId = Document.getTableSourceIdByPage(this.props.document, page)

      const fieldsToHighlight = cells
        .filter((c) => c.tableCoordinates)
        .map((c) => {
          const rangesByFirstCell = c.tableCoordinates.filter((tc) => tc.page === page)
            .map((tc) => tc.cellRange)
            .flat()
          return rangesByFirstCell
        }).flat()

      return this.props.highlightTableCoordsField({
        field: fieldsToHighlight,
        sourceId,
      })
    }

    const { page } = cells[0].coordinates

    const modifiedRange = (
      ENV.FEATURE_PAGINATED_TABLES
        ? this.modifyRangeToPaginatedTableRange(range)
        : range
    )

    const coordsToHighlight = TableField.getCoordsBounds(modifiedRange, this.props.tableField, page)
    this.props.highlightPolygonCoordsField({
      field: coordsToHighlight,
      page,
    })
  }

  openInsertRowsModal = ([selection]) => new Promise((resolve) => {
    const onOk = async (rowsAmount) => {
      const insert = {
        startRow: selection.end.row + 1,
        quantity: rowsAmount,
      }

      resolve({
        data: [],
        insert,
        selection,
      })
    }

    externalOneTimeRender(
      (props) => (
        <InsertRowsModal
          message={localize(Localization.INSERT_ROWS_MODAL_MESSAGE)}
          onCancel={props.onCancel}
          onOk={props.onOk}
          title={localize(Localization.INSERT_MULTIPLE_ROWS)}
        />
      ),
      {
        onOk,
      },
    )
  })

  extractValue = async ([selection], tableData) => {
    const { mergeCells } = mapTableFieldToHandsonDataObjects(this.props.tableField.data)
    const cells = getTableCellsCoords(selection, mergeCells)

    const data = await notifyRequest(
      Promise.all(
        cells.map(async (cell) => {
          const { field: [cellCoords] } = TableField.getCellRangesFromHighlightedCells(this.props.tableField, {
            from: cell.start,
            to: cell.end,
          })
          const blobName = Document.getUnifiedDataBlobName(this.props.document, this.props.activePage) ??
            Document.getProcessingBlobName(this.props.document, this.props.activePage)

          const extractDataCb = ENV.FEATURE_OCR_INTERSECTION_ALGORITHM
            ? this.props.extractAreaWithAlgorithm
            : this.props.extractArea
          const { content, confidence } = await extractDataCb(
            blobName,
            cellCoords,
          )

          const cellHT = new HTCell(content, { confidence })
          return [
            cell.start.row,
            cell.start.col,
            cellHT,
          ]
        }),
      ),
    )({
      fetching: localize(Localization.FETCHING_EXTRACT_DATA),
      success: localize(Localization.EXTRACT_DATA_SUCCESSFUL),
      warning: localize(Localization.EXTRACT_DATA_FAILED),
    })

    data.forEach(([row, col, HTcell]) => {
      const { meta } = HTcell
      HTcell.meta = {
        ...tableData[row][col].meta,
        ...meta,
      }
    })

    return {
      data,
      insert: null,
      selection,
    }
  }

  extraCtxMenuConfig = [
    {
      name: localize(Localization.INSERT_MULTIPLE_ROWS),
      callback: this.openInsertRowsModal,
    },
  ]

  isExtractValueDisabled = () => (
    TableCoordinates.hasCoordsType(
      this.props.tableField.data.cells,
      ExtractedDataCoordsType.TABLE_COORDINATES,
    ) ||
    TableCoordinates.hasCoordsType(
      this.props.tableField.data.cells,
      ExtractedDataCoordsType.SOURCE_TABLE_COORDINATES,
    )
  )

  extraCtxMenuConfigForTableWithCoord = ENV.FEATURE_DATA_EXTRACTION ? [
    {
      name: localize(Localization.EXTRACT_VALUE),
      callback: this.extractValue,
      disabled: this.isExtractValueDisabled,
    },
  ]
    : undefined

  getConfidenceValue = (confidence, errors, isConfidenceNotApplicable) => {
    if (isConfidenceNotApplicable) {
      return ENV.FEATURE_SHOW_NOT_APPLICABLE_CONFIDENCE ? NOT_APPLICABLE_CONFIDENCE_LEVEL : null
    }

    if (
      ENV.FEATURE_HIDE_LOW_CONFIDENCE_DUE_TO_VALIDATION_ERRORS &&
        confidence < CONFIDENCE_BREAKPOINT.LOW &&
        errors
    ) {
      return null
    }

    return confidence
  }

  getFlagMessages = (row, col, cellsData) => { // TODO: #699 , #546
    const errors = FieldValidation.getErrorMessages(this.props.validation, this.getRowFromIndex(row), col, this.props.tableField.data.index)
    const { messages: comments } = this.state.extraData.comments.find((c) => c.row === row && c.col === col) || {}
    const modified = this.state.extraData.modified.find((m) => m.row === row && m.col === col)
    const cellConfidence = cellsData?.[row]?.[col]?.meta?.confidence
    const isConfidenceNotApplicable = (
      cellConfidence === undefined ||
      cellConfidence < 0
    )
    const confidence = (
      !isConfidenceNotApplicable &&
      Math.round(cellConfidence * 100)
    )
    const { confidenceView } = this.props

    return {
      comments,
      modified,
      confidence: this.getConfidenceValue(confidence, errors, isConfidenceNotApplicable),
      confidenceView,
    }
  }

  extractedDataSourceHighlighters = (cell) => {
    if (cell.sourceTableCoordinates?.length || cell.sourceBboxCoordinates?.length) {
      if (TableField.isCellCoordsFromOnePage(cell)) {
        return null
      }

      if (cell?.sourceBboxCoordinates) {
        const coords = cell.sourceBboxCoordinates.reduce((res, coordinates) => {
          const { sourceId, bboxes } = coordinates
          if (!res[sourceId]) {
            res[sourceId] = []
          }

          res[sourceId].push(...bboxes)
          return res
        }, {})

        return Object.entries(coords).map(([sourceId, fieldCoords]) => ({
          highlighter: () => (
            this.props.highlightPolygonCoordsField({
              field: fieldCoords,
              sourceId,
            })
          ),
          page: Document.getPageBySourceId(this.props.document, sourceId),
        })).sort((a, b) => a.page - b.page)
      }

      const coords = cell.sourceTableCoordinates.reduce((res, coordinates) => {
        const { sourceId, cellRanges } = coordinates
        if (!res[sourceId]) {
          res[sourceId] = {
            coordinates: [],
          }
        }
        const ranges = cellRanges.map((range) => mapSourceTableCoordinatesToTableCoordinates(range))
        res[sourceId].coordinates.push(...ranges)
        res[sourceId].page = Document.getPageBySourceId(this.props.document, sourceId)
        return res
      }, {})

      return Object.entries(coords).map(([sourceId, config]) => ({
        highlighter: () => (
          this.props.highlightTableCoordsField({
            field: config.coordinates,
            sourceId,
          })
        ),
        page: config.page,
      }
      )).sort((a, b) => a.page - b.page)
    }
  }

  extractedDataHighlighters = (cellRow, cellCol) => {
    const cell = this.props.tableField.data.cells.find((cell) => {
      const { column, row } = cell.coordinates
      return column === cellCol && row === cellRow
    })

    if (!cell) {
      return null
    }

    const { tableCoordinates, sourceBboxCoordinates, sourceTableCoordinates } = cell
    if (sourceBboxCoordinates || sourceTableCoordinates) {
      return this.extractedDataSourceHighlighters(cell)
    }

    if (tableCoordinates && tableCoordinates.length) {
      const cell = this.props.tableField.data.cells.find((cell) => {
        const { column, row } = cell.coordinates
        return column === cellCol && row === cellRow
      })

      if (TableField.isCellCoordsFromOnePage(cell)) {
        return null
      }

      const cellExtractedDataCoords = cell.tableCoordinates.reduce((res, cel) => {
        const { page, cellRange } = cel
        if (!res[page]) {
          res[page] = []
        }

        res[page].push(...cellRange)
        return res
      }, {})

      return Object.entries(cellExtractedDataCoords).map(
        ([page, coords]) => ({
          highlighter: () => (
            this.props.highlightTableCoordsField({
              field: coords,
              page,
            })
          ),
          page,
        }),
      ).sort((a, b) => a.page - b.page)
    }
  }

  renderExtra = (row, col, cellsData, table) => {
    const messages = this.getFlagMessages(row, col, cellsData)
    const cellDataHighlighters = this.extractedDataHighlighters(row, col)
    return renderCellExtraData(messages, table, cellDataHighlighters)
  }

  cellRenderer = (instance, td, row, col, prop, value, cellProps, cellsData) => {
    const extra = this.renderExtra(row, col, cellsData, instance.rootElement)
    const errors = FieldValidation.getErrorMessages(
      this.props.validation,
      this.getRowFromIndex(row),
      col,
      this.props.tableField.data.index,
      this.props.documentType.fields,
    )
    const warnings = FieldValidation.getWarningMessages(
      this.props.validation,
      this.getRowFromIndex(row),
      col,
      this.props.tableField.data.index,
      this.props.documentType.fields,
    )
    return renderCell(instance, td, row, col, prop, value, cellProps, extra, errors, warnings)
  }

  saveData = (tableData, mergedCells) => {
    const { extractedDataClone, fieldToUpdate } = ExtractedData.getUpdates(this.props.document.extractedData, this.props.dtField)
    const modifiedTableField = { ...fieldToUpdate }
    const tableFieldCells = this.mapHandsonDataToFieldCells(tableData, mergedCells)

    const data = this.getTableFieldData(modifiedTableField)

    if (this.isTableMutated(tableFieldCells, data.cells, tableData)) {
      const tableFieldCellsWithUpdatedConfidence = this.getFieldCellsWithUpdatedConfidence(tableFieldCells, data.cells)

      data.cells = tableFieldCellsWithUpdatedConfidence
      data.modifiedBy = User.getName(this.props.user)

      const modifiedExtractedData = ExtractedData.replaceField(extractedDataClone, fieldToUpdate, modifiedTableField)
      this.props.updateExtractedData(this.props.documentId, modifiedExtractedData)
      this.sendFieldToSave(fieldToUpdate)
    }
  }

  sendFieldToSave = async ({
    aliases,
    data,
    fieldPk,
  }) => {
    const { documentId, tableField } = this.props

    const dataToSend = {
      aliases,
      data,
      fieldPk,
      documentPk: documentId,
    }

    if (TableData.isEmpty(tableField.data)) {
      await documentsApi.saveEdField(dataToSend)
    } else {
      await documentsApi.updateEdField({
        ...dataToSend,
        data: Array.isArray(data) ? data.reduce((prev, cur) => ({ cells: prev.cells.concat(cur.cells) })) : data,
      })
    }

    await this.validateFieldAfterSave()
  }

  validateFieldAfterSave = async () => {
    if (!ENV.FEATURE_PER_FIELD_VALIDATION) {
      return
    }

    const { documentId, documentType, dtField, storeValidation } = this.props

    const validationResult = await documentTypesApi.validateField(
      documentType.code,
      dtField.code,
      documentId,
    )

    storeValidation(documentId, validationResult)
  }

  getFieldCellsWithUpdatedConfidence = (currentTable, prevTable) => (
    currentTable.map((currentCell) => {
      const prevCell = prevTable.find((cell) => cell.pk === currentCell.pk)

      if (prevCell && prevCell.value !== currentCell.value) {
        return {
          ...currentCell,
          confidence: MAX_CONFIDENCE_LEVEL,
        }
      }

      return currentCell
    })
  )

  mapHandsonDataToFieldCells = (tableData, mergedCells) => {
    const page = this.props.activePage

    return this.hasCoordinates(this.props.tableField.data)
      ? mapHandsonDataObjectsToTableFieldCells(tableData, mergedCells, page)
      : mapHandsonDataStringsToTableFieldCells(tableData, mergedCells, page)
  }

  getTableFieldData = (tableField) => (
    tableField.data[this.props.dtField.fieldIndex] ??
    tableField.data
  )

  areTableCellsValuesChanged = (prevCells, currentCells) => {
    const prepareCellsData = (cells) => (
      cells
        .map(({ value }) => value)
        .filter((value) => !!value)
        .sort()
    )

    return !isEqual(prepareCellsData(prevCells), prepareCellsData(currentCells))
  }

  isUnextractedTableLayoutChanged = (tableData) => (
    tableData.some((row) => (
      Array.isArray(row)
        ? this.isUnextractedTableLayoutChanged(row)
        : row === null
    ))
  )

  isTableMutated = (tableFieldCells, dataCells, tableData) => (
    this.areTableCellsValuesChanged(tableFieldCells, dataCells) ||
    this.isUnextractedTableLayoutChanged(tableData)
  )

  hasCoordinates = (tableFieldData) => (
    (
      TableCoordinates.hasCoordsInCells(tableFieldData.cells) ||
      tableFieldData.coordinates
    ) &&
    tableFieldData.rows?.length && tableFieldData.columns?.length
  )

  defaultContextMenuItems = [
    ContextMenuItem.ROW_ABOVE,
    ContextMenuItem.ROW_BELOW,
    ContextMenuItem.REMOVE_ROW,
    SEPARATOR,
    ContextMenuItem.COL_LEFT,
    ContextMenuItem.COL_RIGHT,
    ContextMenuItem.REMOVE_COL,
    SEPARATOR,
  ]

  getPredefinedColumnHeaders = () => (
    this.props.dtField?.fieldMeta?.columns?.map((column) => column.title)
  )

  renderPureTable = () => {
    const minimalColumnQuantity = this.getPredefinedColumnHeaders()?.length || 1
    const { data, mergeCells } = mapTableFieldToHandsonDataStrings(this.props.tableField.data, minimalColumnQuantity)
    return (
      <SizedTable
        cellRenderer={this.cellRenderer}
        colHeaders={this.getPredefinedColumnHeaders()}
        data={data}
        defaultContextMenuItems={this.defaultContextMenuItems}
        extraCtxMenuConfig={this.extraCtxMenuConfig}
        forceRerenderProps={
          [
            this.props.confidenceView,
          ]
        }
        mergeCells={mergeCells}
        propsForUpdate={propsForUpdate}
        readOnly={this.props.readOnly}
        rowHeaders={this.getRowHeaders}
        saveData={this.saveData}
        selectedRanges={this.props.cellRanges}
      />
    )
  }

  getRowHeaders = (rowIndex) => {
    const rowNumber = rowIndex + 1
    return this.getRowFromIndex(rowNumber)
  }

  getRowFromIndex = (rowIndex) => {
    if (!this.props.pageSize || !ENV.FEATURE_PAGINATED_TABLES || !this.props.tableField.data.meta?.rowsChunk) {
      return rowIndex
    }
    return rowIndex + this.props.pageSize * (this.props.tableField.data.meta.rowsChunk - 1)
  }

  renderTableWithCoords = () => {
    const predefinedColumns = this.getPredefinedColumnHeaders()?.map((_, i) => i)
    const { data, mergeCells, columns } = mapTableFieldToHandsonDataObjects(this.props.tableField.data, predefinedColumns)

    return (
      <SizedTable
        cellRenderer={this.cellRenderer}
        colHeaders={this.getPredefinedColumnHeaders()}
        columns={columns}
        data={data}
        extraCtxMenuConfig={this.extraCtxMenuConfigForTableWithCoord}
        forceRerenderProps={
          [
            this.props.confidenceView,
            this.props.validation,
          ]
        }
        mergeCells={mergeCells}
        onSelectRange={this.onSelectRange}
        propsForUpdate={propsForUpdate}
        readOnly={this.props.readOnly}
        rowHeaders={this.getRowHeaders}
        saveData={this.saveData}
        selectedRanges={this.props.cellRanges}
      />
    )
  }

  render = () => {
    if (!this.hasCoordinates(this.props.tableField.data)) {
      return this.renderPureTable()
    }

    return this.renderTableWithCoords()
  }
}

const mapStateToProps = (state) => ({
  documentId: idSelector(state),
  user: userSelector(state),
  cellRanges: uiSelector(state)[UiKeys.CELL_RANGES],
  activePage: uiSelector(state)[UiKeys.ACTIVE_PAGE] || 1,
  document: documentSelector(state),
  documentType: documentTypeSelector(state),
  confidenceView: confidenceViewSelector(state),
  highlightedField: highlightedFieldSelector(state),
})

const mapDispatchToProps = {
  highlightTableCoordsField,
  highlightPolygonCoordsField,
  updateExtractedData,
  storeValidation,
  extractAreaWithAlgorithm,
  extractArea,
}

const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(ExtractedDataHandsonTable)

export {
  ConnectedComponent as ExtractedDataHandsonTable,
}
