
import { mockDocumentType } from '@/mocks/mockDocumentType'
import { mockSelector } from '@/mocks/mockSelector'
import { ACTIVE_FIELD_TYPES } from '@/constants/field'
import { DOCUMENT_LAYOUT_PARSING_TYPE } from '@/enums/DocumentLayoutType'
import { DocumentState } from '@/enums/DocumentState'
import { ExtractionType } from '@/enums/ExtractionType'
import { GROUPING_TYPE } from '@/enums/GroupingTypeTabs'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines.js'
import { Comment } from '@/models/Comment'
import { Document } from '@/models/Document'
import {
  DocumentLayout,
  KeyValuePairElementLayout,
  KeyValuePairLayout,
  LineLayout,
  PageLayout,
  ParagraphLayout,
  TableCellLayout,
  TableLayout,
} from '@/models/DocumentLayout'
import { DocumentReviewer } from '@/models/DocumentReviewer'
import { DocumentType } from '@/models/DocumentType'
import {
  ExtractedDataField,
  FieldData,
  TableData,
} from '@/models/ExtractedData'
import { FieldCoordinates } from '@/models/FieldCoordinates'
import { Label } from '@/models/Label'
import { Point } from '@/models/Point'
import { PreviewEntity } from '@/models/PreviewEntity'
import { Rect } from '@/models/Rect'
import { SourceBboxCoordinates } from '@/models/SourceCoordinates'
import { UnifiedDataWord } from '@/models/UnifiedData'

const documentTypeSelector = mockSelector(
  new DocumentType(
    'mockDocTypeCode',
    'mockDocTypeName',
    'mockEngineCode',
    'mockLanguageCode',
    ExtractionType.ML,
    mockDocumentType.fields,
  ),
)

const highlightedFieldSelector = mockSelector(
  [[0, 0], [1, 1]],
)

const documentReviewPageStateSelector = (state) => (
  (state && state.documentReviewPage) || {
    highlightedField: null,
    activePolygons: [],
  }
)

const mockCoordinates = new FieldCoordinates(1, 966, 403, 412, 58)

const mockEdFields = Array(3)
  .fill(new ExtractedDataField(
    1,
    new FieldData('328', mockCoordinates, 0.69),
  ))
  .map((f, i) => ({
    ...f,
    fieldPk: i + 1,
    data: {
      ...f.data,
      coordinates: {
        ...f.data.coordinates,
        page: f.page + i,
      },
    },
  }))

const idSelector = mockSelector('id')

const documentTypeCodeSelector = mockSelector('dockType')
const dataSavingSelector = mockSelector(true)
const isFocusOnRectSelector = mockSelector(true)

const confidenceViewSelector = mockSelector({
  low: true,
  high: false,
})
const tableDataSectionIndexSelector = mockSelector(1)
const activeTabSelector = mockSelector(42)
const fieldsGroupingSelector = mockSelector(GROUPING_TYPE.USER_DEFINED)
const imageHeightSelector = mockSelector(1)
const imageWidthSelector = mockSelector(1)
const activePolygonsSelector = mockSelector([])
const activeFieldTypesSelector = mockSelector(ACTIVE_FIELD_TYPES)

const documentSelector = mockSelector(
  new Document({
    id: 'mockId',
    extractedData: [
      new ExtractedDataField(
        0,
        new TableData(
          2,
          [],
          [],
          [],
          new Rect(0.1, 0.2, 0.3, 0.4),
          undefined,
          undefined,
          undefined,
          undefined,
          [new SourceBboxCoordinates(
            'c626d5ee3c964e31aaf2e2c7170823ba',
            1,
            [
              new Rect(0.1, 0.2, 0.3, 0.4),
            ],
          )],
        ),
      ),
      new ExtractedDataField(
        1,
        new FieldData(
          350,
          new FieldCoordinates(1, 0.1, 0.2, 0.23, 0.26),
          0.69,
          undefined,
          undefined,
          undefined,
          [new SourceBboxCoordinates(
            'c626d5ee3c964e31aaf2e2c7170823ba',
            1,
            [
              new Rect(0.1, 0.2, 0.23, 0.26),
            ],
          )],
        ),
        'Mick Duo',
      ),
      new ExtractedDataField(
        2,
        new FieldData(
          'mock value',
          new FieldCoordinates(2, 0.10, 0.10, 0.10, 0.10),
          0.8,
          undefined,
          undefined,
          undefined,
          [new SourceBboxCoordinates(
            'dadasdqe',
            1,
            [
              new Rect(0.10, 0.10, 0.10, 0.10),
            ],
          )],
        ),
      ),
      new ExtractedDataField(
        3,
        new TableData(1,
          [],
          [],
          [],
          new FieldCoordinates(1, 0.10, 0.10, 0.10, 0.10),
          undefined,
          undefined,
          undefined,
          undefined,
          [new SourceBboxCoordinates(
            'c626d5ee3c964e31aaf2e2c7170823ba',
            1,
            [
              new Rect(0.10, 0.0, 0.10, 0.10),
            ],
          )],
        ),
      ),
      new ExtractedDataField(
        4,
        [
          new TableData(
            2,
            [],
            [],
            [],
            new FieldCoordinates(2, 0.10, 0.10, 0.10, 0.10),
            undefined,
            undefined,
            undefined,
            undefined,
            [new SourceBboxCoordinates(
              'dadasdqe',
              1,
              [
                new Rect(0.10, 0.0, 0.10, 0.10),
              ],
            )],
          ),
        ],
      ),
      ...mockEdFields,
    ],
    previewDocuments: {
      1: {
        blobName: 'test/preview/0.png',
        url: 'http://localhost:8003/api/v1/storage/file/test/preview/0.png',
      },
      2: {
        blobName: 'test/preview/1.png',
        url: 'http://localhost:8003/api/v1/storage/file/test/preview/1.png',
      },
    },
    processingDocuments: {
      1: {
        blobName: 'test/processing/0.png',
        url: 'http://localhost:8003/api/v1/storage/file/test/processing/0.png',
      },
      2: {
        blobName: 'test/processing/1.png',
        url: 'http://localhost:8003/api/v1/storage/file/test/processing/1.png',
      },
    },
    unifiedData: {
      1: [
        {
          appliedTransformation: {
            name: 'rotation',
            parameters: {
              args: [],
              kwargs: { angle: 0 },
            },
          },
          blobName: 'test/preview/0.png',
          height: 3509,
          id: 'c626d5ee3c964e31aaf2e2c7170823ba',
          originalImageId: null,
          page: 1,
          width: 2480,
        },
        {
          id: 'asdasdasd123asd',
          page: 1,
          wordboxes: [
            new UnifiedDataWord({
              content: 'test',
              confidence: 1,
              x: 0.1,
              y: 0.2,
              w: 0.3,
              h: 0.4,
            }),
          ],
        },
        {
          id: '1234',
          page: 1,
        },
        {
          id: '4321',
          page: 1,
        },
        {
          id: 'f999d5ee3c964e31aaf2e2c7170823ba',
          page: 1,
        },
        {
          id: 'tableSourceId',
          cells: [],
          maxRow: 0,
          maxColumn: 0,
        },
      ],
      2: [
        {
          appliedTransformation: {
            name: 'rotation',
            parameters: {
              args: [],
              kwargs: { angle: 0 },
            },
          },
          blobName: 'test/preview/1.png',
          height: 3509,
          id: 'dadasdqe',
          originalImageId: null,
          page: 2,
          width: 2480,
        },
        {
          id: 'asdasdsdfgsg32asd123asd',
          page: 2,
          wordboxes: [
            new UnifiedDataWord({
              content: 'word',
              confidence: 1,
              x: 0.1,
              y: 0.2,
              w: 0.3,
              h: 0.4,
            }),
          ],
        },
      ],
    },
    documentType: new PreviewEntity('Document Type Name', 'docType'),
    date: '2021-07-02T10:00:24.200662+00:00',
    reviewer: new DocumentReviewer({
      id: '123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Smith',
    }),
    language: KnownLanguage.ENGLISH,
    labels: [
      new Label('mockLabelId1', 'mock Label Name 1'),
      new Label('mockLabelId2', 'mock Label Name 2'),
    ],
    state: DocumentState.IN_REVIEW,
    title: 'Mock Title.pdf',
    error: null,
    engine: KnownProcessingEngines.TESSERACT,
    llmType: null,
    files: [
      {
        blobName: '0.jpg',
        url: 'http://localhost:8003/api/v1/storage/file/0.jpg',
      },
      {
        blobName: '1.jpg',
        url: 'http://localhost:8003/api/v1/storage/file/1.jpg',
      },
    ],
    communication: {
      comments: [
        new Comment(
          'hello comment text',
          'user-uuid',
          '2018-09-03T09:34:24.249',
        ),
      ],
    },
    validation: {
      isValid: true,
      detail: [{
        fieldCode: 'glElevation',
        documentId: 'mockId',
        errors: ['Test error message'],
        warnings: ['Test warning message'],
      }],
    },
    containerType: null,
    containerMetadata: null,
    documentLayout: new DocumentLayout({
      id: 'documentLayoutId',
      tenantId: 'tenantId',
      pages: [
        new PageLayout({
          id: 'page_1_id',
          pageNumber: 1,
          parsingType: DOCUMENT_LAYOUT_PARSING_TYPE.AWS_TEXTRACT,
          images: [],
          paragraphs: [
            new ParagraphLayout({
              id: 'mockId',
              order: 1,
              confidence: 0,
              content: 'content',
              role: 'role',
              polygon: [
                new Point(0.751, 0.812),
                new Point(0.523, 0.954),
                new Point(0.651, 0.512),
                new Point(0.423, 0.454),
              ],
              lines: [
                new LineLayout({
                  order: 1,
                  confidence: 0,
                  content: 'content',
                  polygon: [
                    new Point(0.751, 0.812),
                    new Point(0.523, 0.954),
                    new Point(0.651, 0.512),
                    new Point(0.423, 0.454),
                  ],
                }),
              ],
            }),
          ],
          keyValuePairs: [
            new KeyValuePairLayout({
              key: new KeyValuePairElementLayout(
                'keyContent',
                [
                  new Point(0.111, 0.222),
                  new Point(0.333, 0.444),
                ],
              ),
              value: new KeyValuePairElementLayout(
                'valueContent',
                [
                  new Point(0.731, 0.456),
                  new Point(0.123, 0.234),
                ],
              ),
              confidence: 0,
              id: 'mockId',
            }),
          ],
          tables: [
            new TableLayout({
              id: 'mockTableId',
              order: 1,
              cells: [
                new TableCellLayout({
                  content: 'cell',
                  kind: 'kind',
                  columnIndex: 0,
                  columnSpan: 1,
                  rowIndex: 0,
                  rowSpan: 1,
                  polygon: [
                    new Point(0.111, 0.222),
                    new Point(0.333, 0.444),
                  ],
                }),
              ],
              confidence: 0,
              columnCount: 1,
              rowCount: 1,
              polygon: [
                new Point(0.111, 0.222),
                new Point(0.333, 0.444),
              ],
            }),
          ],
        }),
      ],
    }),
  }),
)

export {
  documentReviewPageStateSelector,
  documentTypeSelector,
  highlightedFieldSelector,
  documentTypeCodeSelector,
  idSelector,
  documentSelector,
  dataSavingSelector,
  isFocusOnRectSelector,
  tableDataSectionIndexSelector,
  activeTabSelector,
  imageHeightSelector,
  imageWidthSelector,
  fieldsGroupingSelector,
  confidenceViewSelector,
  activePolygonsSelector,
  activeFieldTypesSelector,
}
