
import { PdfSegment, UserPage } from './PdfSegment'

jest.mock('uuid', () => ({
  v4: jest.fn(() => mockUUID),
}))

const mockUUID = 'mocked-uuid'

test('splits a segment into two at a specified user page', () => {
  const mockSegmentId = 'mocked-uuid-1'

  const userPage1 = new UserPage({
    page: 1,
    segmentId: mockSegmentId,
  })

  const userPage2 = new UserPage({
    page: 2,
    segmentId: mockSegmentId,
  })

  const segment = new PdfSegment({
    id: mockSegmentId,
    documentTypeId: 'doc-type-1',
    name: 'Segment Name',
    userPages: [userPage1, userPage2],
  })

  const [segment1, segment2] = PdfSegment.split(segment, userPage2)

  expect(segment1).toEqual(
    new PdfSegment({
      id: mockSegmentId,
      documentTypeId: 'doc-type-1',
      name: 'Segment Name',
      userPages: [userPage1],
    }),
  )

  expect(segment2).toEqual(
    new PdfSegment({
      id: mockUUID,
      userPages: [
        {
          ...userPage2,
          segmentId: mockUUID,
        },
      ],
    }),
  )
})

test('merges two segments into one', () => {
  const mockSegmentId1 = 'mocked-uuid-1'
  const mockSegmentId2 = 'mocked-uuid-2'

  const userPage1 = new UserPage({
    page: 1,
    segmentId: mockSegmentId1,
  })

  const userPage2 = new UserPage({
    page: 2,
    segmentId: mockSegmentId2,
  })

  const segment1 = new PdfSegment({
    id: mockSegmentId1,
    documentTypeId: 'doc-type-1',
    name: 'Segment Name',
    userPages: [userPage1],
  })

  const segment2 = new PdfSegment({
    id: mockSegmentId2,
    documentTypeId: 'doc-type-2',
    name: 'Other Segment',
    userPages: [userPage2],
  })

  const mergedSegment = PdfSegment.merge(segment1, segment2)

  expect(mergedSegment).toEqual(
    new PdfSegment({
      id: mockSegmentId1,
      documentTypeId: 'doc-type-1',
      name: 'Segment Name',
      userPages: [
        userPage1,
        {
          ...userPage2,
          segmentId: mockSegmentId1,
        },
      ],
    }),
  )
})

test('creates a segment based on a page count', () => {
  const segment = PdfSegment.fromPagesCount(3)

  expect(segment.userPages).toHaveLength(3)
  expect(segment.userPages[0]).toEqual(
    new UserPage({
      page: 0,
      segmentId: mockUUID,
    }),
  )
})

test('creates a segment with a fixed length', () => {
  const segment = PdfSegment.fromPages(2)

  expect(segment.userPages).toHaveLength(2)

  expect(segment.userPages[1]).toEqual(
    new UserPage({
      page: 1,
      segmentId: mockUUID,
    }),
  )
})

test('exclude a userPage inside the segment when call togglesExcluded', () => {
  const mockSegmentId = 'mocked-uuid-1'

  const userPage1 = new UserPage({
    page: 1,
    segmentId: mockSegmentId,
  })

  const userPage2 = new UserPage({
    page: 2,
    segmentId: mockSegmentId,
  })

  const segment = new PdfSegment({
    id: mockSegmentId,
    documentType: 'PDF',
    userPages: [userPage1, userPage2],
  })

  const updatedSegment = PdfSegment.togglesExcluded(segment, userPage1)

  expect(updatedSegment).toEqual(
    new PdfSegment({
      id: mockSegmentId,
      documentType: 'PDF',
      userPages: [
        {
          ...userPage1,
          isExcluded: true,
        },
        userPage2,
      ],
    }),
  )
})

test('duplicates a specific userPage within the segment', () => {
  const mockSegmentId = 'mocked-uuid-1'

  const userPage1 = new UserPage({
    page: 0,
    segmentId: mockSegmentId,
  })

  const userPage2 = new UserPage({
    page: 1,
    segmentId: mockSegmentId,
  })

  const userPage3 = new UserPage({
    page: 2,
    segmentId: mockSegmentId,
  })

  const segment = new PdfSegment({
    id: mockSegmentId,
    documentType: 'PDF',
    userPages: [
      userPage1,
      userPage2,
      userPage3,
    ],
  })

  const updatedSegment = PdfSegment.duplicate(segment, userPage2)

  expect(updatedSegment).toEqual(
    new PdfSegment({
      id: mockSegmentId,
      documentType: 'PDF',
      userPages: [
        userPage1,
        userPage2,
        new UserPage({
          page: 1,
          segmentId: mockSegmentId,
        }),
        userPage3,
      ],
    }),
  )
})

test('toggles segment selection when call toggleSelection method', () => {
  const segment = new PdfSegment({
    id: 'mockId',
    documentType: 'PDF',
    userPages: [],
  })

  const updatedSegment = PdfSegment.toggleSelection(segment)

  expect(updatedSegment).toEqual({
    ...segment,
    isSelected: true,
  })
})

test('sets documentTypeId when call setDocumentTypeId method', () => {
  const segment = new PdfSegment({
    id: 'mockId',
    documentType: 'PDF',
    userPages: [],
  })

  const mockDocumentTypeId = 'mockDocTypeId'

  const updatedSegment = PdfSegment.setDocumentTypeId(segment, mockDocumentTypeId)

  expect(updatedSegment).toEqual({
    ...segment,
    documentTypeId: mockDocumentTypeId,
  })
})

test('returns page range when call getPageRangeFromSegment method', () => {
  const segment = new PdfSegment({
    id: 'mockId',
    documentType: 'PDF',
    userPages: [
      new UserPage({
        page: 0,
        segmentId: 'mockId',
        isExcluded: true,
      }),
      new UserPage({
        page: 1,
        segmentId: 'mockId',
      }),
      new UserPage({
        page: 2,
        segmentId: 'mockId',
      }),
    ],
  })

  const updatedSegment = PdfSegment.getPageRangeFromSegment(segment)

  const pages = segment.userPages

  expect(updatedSegment).toEqual([
    pages[1].page,
    pages[2].page,
  ])
})

test('returns enabled user pages when call getIncludedUserPages method', () => {
  const segment = new PdfSegment({
    id: 'mockId',
    documentType: 'PDF',
    userPages: [
      new UserPage({
        page: 0,
        segmentId: 'mockId',
        isExcluded: true,
      }),
      new UserPage({
        page: 1,
        segmentId: 'mockId',
      }),
      new UserPage({
        page: 2,
        segmentId: 'mockId',
        isExcluded: true,
      }),
    ],
  })

  const updatedSegment = PdfSegment.getIncludedUserPages(segment)

  const pages = segment.userPages

  expect(updatedSegment).toEqual([pages[1]])
})

test('inserts page right before the anchor when anchor is in the beginning when call insertUserPageToAnchor', () => {
  const mockUserPages = [
    new UserPage({
      page: 0,
      segmentId: 'mockId',
      isExcluded: true,
    }),
    new UserPage({
      page: 1,
      segmentId: 'mockId',
    }),
    new UserPage({
      page: 2,
      segmentId: 'mockId',
      isExcluded: true,
    }),
  ]

  const mockPageToInsert = new UserPage({
    page: 3,
    segmentId: 'mockId',
    isExcluded: true,
  })

  const mockSegment = new PdfSegment({
    id: 'id',
    userPages: mockUserPages,
  })

  const result = PdfSegment.insertUserPageToAnchor({
    segment: mockSegment,
    anchorPage: mockUserPages[0],
    draggedPage: mockPageToInsert,
    insertBefore: true,
  })

  expect(result).toEqual({
    ...mockSegment,
    userPages: [
      mockPageToInsert,
      ...mockUserPages,
    ],
  })
})

test('inserts page right before the anchor when anchor is in the end when call insertUserPageToAnchor', () => {
  const mockUserPages = [
    new UserPage({
      page: 0,
      segmentId: 'mockId',
      isExcluded: true,
    }),
    new UserPage({
      page: 1,
      segmentId: 'mockId',
    }),
    new UserPage({
      page: 2,
      segmentId: 'mockId',
      isExcluded: true,
    }),
  ]

  const mockPageToInsert = new UserPage({
    page: 3,
    segmentId: 'mockId',
    isExcluded: true,
  })

  const mockSegment = new PdfSegment({
    id: 'id',
    userPages: mockUserPages,
  })

  const result = PdfSegment.insertUserPageToAnchor({
    segment: mockSegment,
    anchorPage: mockUserPages.at(-1),
    draggedPage: mockPageToInsert,
    insertBefore: true,
  })

  expect(result).toEqual({
    ...mockSegment,
    userPages: [
      ...mockUserPages.slice(0, -1),
      mockPageToInsert,
      mockUserPages.at(-1),
    ],
  })
})

test('returns segment with empty userPages when call removePageFromSegment on segment with one userPage', () => {
  const mockUserPages = [
    new UserPage({
      page: 1,
      segmentId: 'mockId',
      isExcluded: true,
    }),
  ]

  const mockSegment = new PdfSegment({
    id: 'id',
    userPages: mockUserPages,
  })

  const result = PdfSegment.removePageFromSegment(mockSegment, mockUserPages[0])

  expect(result).toEqual({
    ...mockSegment,
    userPages: [],
  })
})

test('returns true when calling isValid on a segment with userPages', () => {
  const mockUserPages = [
    new UserPage({
      page: 1,
      segmentId: 'mockId',
      isExcluded: true,
    }),
  ]

  const mockSegment = new PdfSegment({
    id: 'id',
    userPages: mockUserPages,
  })

  const result = PdfSegment.isValid(mockSegment)

  expect(result).toBe(true)
})

test('returns false when calling isValid on a segment with no userPages', () => {
  const mockSegment = new PdfSegment({
    id: 'id',
    userPages: [],
  })

  const result = PdfSegment.isValid(mockSegment)

  expect(result).toBe(false)
})

test('returns false when calling isValid with null or undefined', () => {
  expect(PdfSegment.isValid(null)).toBe(false)
  expect(PdfSegment.isValid(undefined)).toBe(false)
})

test('returns segment without removed userPage when call removePageFromSegment', () => {
  const mockUserPages = [
    new UserPage({
      page: 1,
      segmentId: 'mockId',
      isExcluded: true,
    }),
    new UserPage({
      page: 2,
      segmentId: 'mockId',
      isExcluded: true,
    }),
  ]

  const mockSegment = new PdfSegment({
    id: 'id',
    userPages: mockUserPages,
  })

  const result = PdfSegment.removePageFromSegment(mockSegment, mockUserPages[0])

  expect(result).toEqual({
    ...mockSegment,
    userPages: [
      mockUserPages[1],
    ],
  })
})

test('returns segment by userPage when call getSegmentByUserPage', () => {
  const mockUserPage1 = [
    new UserPage({
      page: 1,
      segmentId: 'mockId1',
      isExcluded: true,
    }),
  ]

  const mockUserPage2 = [
    new UserPage({
      page: 2,
      segmentId: 'mockId2',
      isExcluded: true,
    }),
  ]

  const mockSegment1 = new PdfSegment({
    id: 'mockId1',
    userPages: mockUserPage1,
  })

  const mockSegment2 = new PdfSegment({
    id: 'mockId2',
    userPages: mockUserPage2,
  })

  const result = PdfSegment.getSegmentByUserPage([mockSegment1, mockSegment2], mockUserPage1[0])

  expect(result).toEqual({
    ...mockSegment1,
    userPages: [
      mockUserPage1[0],
    ],
  })
})

test('swaps user pages within a segment when call swapUserPages', () => {
  const mockUserPages = [
    new UserPage({
      page: 0,
      segmentId: 'mockId',
    }),
    new UserPage({
      page: 1,
      segmentId: 'mockId',
    }),
    new UserPage({
      page: 2,
      segmentId: 'mockId',
    }),
  ]

  const mockSegment = new PdfSegment({
    id: 'mockId',
    userPages: mockUserPages,
  })

  const result = PdfSegment.swapUserPages(mockSegment, 0, 2)

  expect(result).toEqual(
    new PdfSegment({
      id: 'mockId',
      userPages: [
        mockUserPages[2],
        mockUserPages[0],
        mockUserPages[1],
      ],
    }),
  )
})

test('returns true when segment is not found when call isPageDragDisabled', () => {
  const userPage = new UserPage({
    page: 0,
    segmentId: 'missing-segment-id',
  })

  const result = PdfSegment.isPageDragDisabled([], userPage)

  expect(result).toBe(true)
})

test('returns true when segment has multiple pages but only one included page when call isPageDragDisabled', () => {
  const mockSegment = new PdfSegment({
    id: 'test-segment-id',
    userPages: [
      new UserPage({
        page: 0,
        segmentId: 'test-segment-id',
        isExcluded: true,
      }),
      new UserPage({
        page: 1,
        segmentId: 'test-segment-id',
        isExcluded: false,
      }),
    ],
  })

  const segments = [mockSegment]
  const userPage = mockSegment.userPages[1]

  const result = PdfSegment.isPageDragDisabled(segments, userPage)

  expect(result).toBe(true)
})

test('returns false when segment has multiple included pages when call isPageDragDisabled', () => {
  const mockSegment = new PdfSegment({
    id: 'test-segment-id',
    userPages: [
      new UserPage({
        page: 0,
        segmentId: 'test-segment-id',
        isExcluded: true,
      }),
      new UserPage({
        page: 1,
        segmentId: 'test-segment-id',
        isExcluded: false,
      }),
      new UserPage({
        page: 2,
        segmentId: 'test-segment-id',
        isExcluded: false,
      }),
    ],
  })

  const segments = [mockSegment]
  const userPage = mockSegment.userPages[0]

  const result = PdfSegment.isPageDragDisabled(segments, userPage)

  expect(result).toBe(false)
})

test('returns true when segment is not found when call isPageExcludeDisabled', () => {
  const userPage = new UserPage({
    page: 0,
    segmentId: 'missing-segment-id',
  })

  const result = PdfSegment.isPageExcludeDisabled([], userPage)

  expect(result).toBe(true)
})

test('returns true when segment has only one included page when call isPageExcludeDisabled', () => {
  const mockUserPage = new UserPage({
    page: 0,
    segmentId: 'test-segment-id',
    isExcluded: true,
  })

  const mockSegment = new PdfSegment({
    id: 'test-segment-id',
    userPages: [mockUserPage],
  })

  const result = PdfSegment.isPageExcludeDisabled([mockSegment], mockUserPage)

  expect(result).toBe(true)
})

test('returns false when segment has multiple included pages when call isPageExcludeDisabled', () => {
  const mockUserPage = new UserPage({
    page: 0,
    segmentId: 'test-segment-id',
    isExcluded: false,
  })

  const mockSegment = new PdfSegment({
    id: 'test-segment-id',
    userPages: [
      mockUserPage,
      mockUserPage,
    ],
  })

  const result = PdfSegment.isPageExcludeDisabled([mockSegment], mockUserPage)

  expect(result).toBe(false)
})

test('creates UserPage with null coordinates by default', () => {
  const userPage = new UserPage({
    page: 0,
    segmentId: 'mockId',
  })

  expect(userPage.coordinates).toBeNull()
})

test('creates UserPage with provided coordinates', () => {
  const mockCoordinates = {
    x: 0.1,
    y: 0.2,
    width: 0.3,
    height: 0.4,
  }

  const userPage = new UserPage({
    page: 0,
    segmentId: 'mockId',
    coordinates: mockCoordinates,
  })

  expect(userPage.coordinates).toEqual(mockCoordinates)
})

test('sets coordinates for matching user page when call setUserPageCoordinates', () => {
  const mockCoordinates = {
    x: 0,
    y: 0.25,
    width: 1,
    height: 0.5,
  }

  const userPage1 = new UserPage({
    page: 0,
    segmentId: 'mockId1',
  })

  const userPage2 = new UserPage({
    page: 1,
    segmentId: 'mockId1',
  })

  const userPage3 = new UserPage({
    page: 2,
    segmentId: 'mockId2',
  })

  const mockSegment1 = new PdfSegment({
    id: 'mockId1',
    userPages: [userPage1, userPage2],
  })

  const mockSegment2 = new PdfSegment({
    id: 'mockId2',
    userPages: [userPage3],
  })

  const result = PdfSegment.setUserPageCoordinates(
    [mockSegment1, mockSegment2],
    userPage1,
    mockCoordinates,
  )

  expect(result).toEqual([
    new PdfSegment({
      id: 'mockId1',
      userPages: [
        {
          ...userPage1,
          coordinates: mockCoordinates,
        },
        userPage2,
      ],
    }),
    mockSegment2,
  ])
})

test('returns segment by userPage id when object reference differs when call getSegmentByUserPage', () => {
  const mockUserPage = new UserPage({
    page: 1,
    segmentId: 'mockId1',
  })

  const mockSegment = new PdfSegment({
    id: 'mockId1',
    userPages: [mockUserPage],
  })

  const result = PdfSegment.getSegmentByUserPage(
    [mockSegment],
    { ...mockUserPage },
  )

  expect(result).toEqual(mockSegment)
})

test('adds excluded pages and sorts by page number when call withExcludedPages', () => {
  const segment = new PdfSegment({
    id: 'segment-1',
    userPages: [
      new UserPage({
        page: 0,
        segmentId: 'segment-1',
      }),
      new UserPage({
        page: 3,
        segmentId: 'segment-1',
      }),
    ],
  })

  const result = PdfSegment.withExcludedPages(segment, [2, 1])

  expect(result.userPages).toEqual([
    expect.objectContaining({
      page: 0,
      isExcluded: false,
      segmentId: 'segment-1',
    }),
    expect.objectContaining({
      page: 1,
      isExcluded: true,
      segmentId: 'segment-1',
    }),
    expect.objectContaining({
      page: 2,
      isExcluded: true,
      segmentId: 'segment-1',
    }),
    expect.objectContaining({
      page: 3,
      isExcluded: false,
      segmentId: 'segment-1',
    }),
  ])
})

test('returns same segments when all pages are covered when call withMissingPages', () => {
  const segment = new PdfSegment({
    id: 'segment-1',
    userPages: [
      new UserPage({
        page: 0,
        segmentId: 'segment-1',
      }),
      new UserPage({
        page: 1,
        segmentId: 'segment-1',
      }),
    ],
  })

  const segments = [segment]
  const result = PdfSegment.withMissingPages(segments, 2)

  expect(result).toBe(segments)
})

test('adds missing pages as excluded to nearest preceding segment when call withMissingPages', () => {
  const segment1 = new PdfSegment({
    id: 'segment-1',
    userPages: [
      new UserPage({
        page: 0,
        segmentId: 'segment-1',
      }),
      new UserPage({
        page: 2,
        segmentId: 'segment-1',
      }),
    ],
  })

  const segment2 = new PdfSegment({
    id: 'segment-2',
    userPages: [
      new UserPage({
        page: 4,
        segmentId: 'segment-2',
      }),
    ],
  })

  const result = PdfSegment.withMissingPages([segment1, segment2], 6)

  expect(result[0].userPages).toEqual([
    expect.objectContaining({
      page: 0,
      isExcluded: false,
      segmentId: 'segment-1',
    }),
    expect.objectContaining({
      page: 1,
      isExcluded: true,
      segmentId: 'segment-1',
    }),
    expect.objectContaining({
      page: 2,
      isExcluded: false,
      segmentId: 'segment-1',
    }),
    expect.objectContaining({
      page: 3,
      isExcluded: true,
      segmentId: 'segment-1',
    }),
  ])

  expect(result[1].userPages).toEqual([
    expect.objectContaining({
      page: 4,
      isExcluded: false,
      segmentId: 'segment-2',
    }),
    expect.objectContaining({
      page: 5,
      isExcluded: true,
      segmentId: 'segment-2',
    }),
  ])
})

test('assigns missing pages without preceding pages to first segment when call withMissingPages', () => {
  const segment = new PdfSegment({
    id: 'segment-1',
    userPages: [
      new UserPage({
        page: 2,
        segmentId: 'segment-1',
      }),
    ],
  })

  const result = PdfSegment.withMissingPages([segment], 3)

  expect(result[0].userPages).toEqual([
    expect.objectContaining({
      page: 0,
      isExcluded: true,
      segmentId: 'segment-1',
    }),
    expect.objectContaining({
      page: 1,
      isExcluded: true,
      segmentId: 'segment-1',
    }),
    expect.objectContaining({
      page: 2,
      isExcluded: false,
      segmentId: 'segment-1',
    }),
  ])
})
