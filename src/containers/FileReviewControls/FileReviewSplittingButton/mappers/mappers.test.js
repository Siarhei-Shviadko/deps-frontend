import { mockEnv } from '@/mocks/mockEnv'
import { mockUuid } from '@/mocks/mockUuid'
import { PdfSegment, UserPage } from '@/containers/PdfSplitting/models'
import { Localization, localize } from '@/localization/i18n'
import { mapProposalsToSegments, mapSegmentsToProposals } from './mappers'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('uuid', () => mockUuid)

const mockBoundingBox = {
  x: 0.1,
  y: 0.2,
  width: 0.3,
  height: 0.4,
}

const mockProposals = {
  batchName: 'test-batch',
  segments: [
    {
      name: 'Proposal Segment 1',
      contentRegions: [
        {
          pageNumber: 1,
          boundingBox: mockBoundingBox,
        },
        {
          pageNumber: 3,
          boundingBox: null,
        },
      ],
    },
    {
      name: 'Proposal Segment 2',
      contentRegions: [
        { pageNumber: 5 },
      ],
    },
  ],
}

const mockSegments = [
  new PdfSegment({
    id: 'segment-1',
    name: 'Segment 1',
    userPages: [
      new UserPage({
        page: 0,
        segmentId: 'segment-1',
        coordinates: mockBoundingBox,
      }),
      new UserPage({
        page: 2,
        segmentId: 'segment-1',
      }),
    ],
  }),
  new PdfSegment({
    id: 'segment-2',
    name: 'Segment 2',
    userPages: [
      new UserPage({
        page: 4,
        segmentId: 'segment-2',
      }),
    ],
  }),
]

beforeEach(() => {
  jest.clearAllMocks()
})

test('maps proposals to segments with correct page numbers and names', () => {
  const result = mapProposalsToSegments(mockProposals)

  expect(result).toHaveLength(2)
  expect(result[0].name).toBe('Proposal Segment 1')
  expect(result[0].userPages).toEqual([
    expect.objectContaining({
      page: 0,
      segmentId: result[0].id,
      coordinates: mockBoundingBox,
    }),
    expect.objectContaining({
      page: 2,
      segmentId: result[0].id,
      coordinates: null,
    }),
  ])
  expect(result[1].name).toBe('Proposal Segment 2')
  expect(result[1].userPages).toEqual([
    expect.objectContaining({
      page: 4,
      segmentId: result[1].id,
    }),
  ])
})

test('maps segments to proposals with existing segment names', () => {
  const result = mapSegmentsToProposals(mockSegments)

  expect(result).toEqual([
    {
      name: 'Segment 1',
      contentRegions: [
        {
          pageNumber: 1,
          boundingBox: mockBoundingBox,
        },
        {
          pageNumber: 3,
          boundingBox: null,
        },
      ],
    },
    {
      name: 'Segment 2',
      contentRegions: [
        {
          pageNumber: 5,
          boundingBox: null,
        },
      ],
    },
  ])
})

test('maps segments to proposals with fallback name when segment name is missing', () => {
  const segments = [
    new PdfSegment({
      id: 'segment-1',
      userPages: [
        new UserPage({
          page: 0,
          segmentId: 'segment-1',
          coordinates: mockBoundingBox,
        }),
      ],
    }),
  ]

  const result = mapSegmentsToProposals(segments)

  expect(result).toEqual([
    {
      name: localize(Localization.SEGMENT, { index: 1 }),
      contentRegions: [
        {
          pageNumber: 1,
          boundingBox: mockBoundingBox,
        },
      ],
    },
  ])
})

test('excludes excluded user pages when maps segments to proposals', () => {
  const segments = [
    new PdfSegment({
      id: 'segment-1',
      name: 'Segment 1',
      userPages: [
        new UserPage({
          page: 0,
          segmentId: 'segment-1',
          coordinates: mockBoundingBox,
        }),
        new UserPage({
          page: 1,
          segmentId: 'segment-1',
          isExcluded: true,
          coordinates: mockBoundingBox,
        }),
      ],
    }),
  ]

  const result = mapSegmentsToProposals(segments)

  expect(result).toEqual([
    {
      name: 'Segment 1',
      contentRegions: [
        {
          pageNumber: 1,
          boundingBox: mockBoundingBox,
        },
      ],
    },
  ])
})
