
import { mockEnv } from '@/mocks/mockEnv'
import { LabelType, Label } from 'labeling-tool/lib/models/Label'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { FieldData } from '@/models/ExtractedData'
import { FieldCoordinates } from '@/models/FieldCoordinates'
import { Rect } from '@/models/Rect'
import { SourceBboxCoordinates } from '@/models/SourceCoordinates'
import { getExtractedFieldData } from './getExtractedFieldData'

jest.mock('@/utils/env', () => mockEnv)
const mockExtractAreaCallback = jest.fn(() => 'mockExtractAreaCallback')

const getLabel = ({ labelCoords, fieldCoordinates, sourceBboxCoordinates }) => {
  return new Label(
    labelCoords.x,
    labelCoords.y,
    labelCoords.w,
    labelCoords.h,
    'testFieldCode',
    undefined,
    LabelType.STRING,
    'INVOICE',
    new FieldData(
      'INVOICE',
      new FieldCoordinates(fieldCoordinates.page, fieldCoordinates.x, fieldCoordinates.y, fieldCoordinates.w, fieldCoordinates.h),
      1,
      null,
      undefined,
      null,
      sourceBboxCoordinates && [
        new SourceBboxCoordinates(sourceBboxCoordinates.sourceId, sourceBboxCoordinates.page, sourceBboxCoordinates.bboxes),
      ],
    ),
    1,
  )
}

const blobName = 'test1.png'
const sourceId = 'testId'
const language = KnownLanguage.ENGLISH
const engine = KnownProcessingEngines.TESSERACT
const page = 1

const mockUnifiedData = {
  1: [{
    blobName,
    id: sourceId,
  }],
  2: [{
    blobName: 'test2.png',
    id: 'testId2',
  }],
}

let props

describe('Mapper: getExtractedFieldData', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    props = {
      page,
      processingDocuments: {},
      language,
      engine,
      withoutExtraction: false,
      unifiedData: mockUnifiedData,
      extractDataArea: mockExtractAreaCallback,
    }
  })

  describe('should call extractDataArea callback first time with proper arguments in case', () => {
    const coords = {
      x: 0.5,
      y: 0.5,
      w: 0.5,
      h: 0.5,
    }

    const expectedArguments = {
      labelCoords: {
        page,
        h: coords.h,
        w: coords.w,
        x: coords.x,
        y: coords.y,
      },
      blobName,
      engine,
      language,
      sourceBboxCoordinates: [{
        sourceId,
        page,
        bboxes: [{
          h: coords.h,
          w: coords.w,
          x: coords.x,
          y: coords.y,
        }],
      }],
      setIndex: null,
    }

    it('if the field has sourceBboxCoordinates and new sourceBboxCoordinates are not equal to the previous ones ', async () => {
      const label = getLabel({
        labelCoords: coords,
        fieldCoordinates: {
          page,
          ...coords,
        },
        sourceBboxCoordinates: {
          sourceId,
          page,
          bboxes: [new Rect(0.1, 0.1, 0.1, 0.1)],
        },
      })
      props.label = label
      await getExtractedFieldData(props)

      expect(mockExtractAreaCallback).nthCalledWith(1, {
        label,
        ...expectedArguments,
      })
    })

    it('if the field does not have sourceBboxCoordinates and field`s new coordinates are not equal to the previous ones ', async () => {
      const label = getLabel({
        labelCoords: coords,
        fieldCoordinates: {
          page,
          x: 0.1,
          y: 0.1,
          w: 0.1,
          h: 0.1,
        },
      })
      props.label = label
      await getExtractedFieldData(props)

      expect(mockExtractAreaCallback).nthCalledWith(1, {
        label,
        ...expectedArguments,
      })
    })
  })

  describe('should not call extractDataArea callback in case', () => {
    const coords = {
      x: 0.1,
      y: 0.1,
      w: 0.1,
      h: 0.1,
    }

    it('if the field has sourceBboxCoordinates and new sourceBboxCoordinates are equal to the previous ones', async () => {
      props.label = getLabel({
        labelCoords: coords,
        fieldCoordinates: {
          page: 2,
          ...coords,
        },
        sourceBboxCoordinates: {
          page,
          bboxes: [new Rect(0.1, 0.1, 0.1, 0.1)],
        },
      })
      await getExtractedFieldData(props)

      expect(mockExtractAreaCallback).not.toBeCalled()
    })

    it('if the field does not have sourceBboxCoordinates and field`s new coordinates are equal to the previous ones ', async () => {
      props.label = getLabel({
        labelCoords: coords,
        fieldCoordinates: {
          page,
          ...coords,
        },
      })
      await getExtractedFieldData(props)

      expect(mockExtractAreaCallback).not.toBeCalled()
    })
  })
})
