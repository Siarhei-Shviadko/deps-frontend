
import PropTypes from 'prop-types'
import { v4 as uuidV4 } from 'uuid'

export class UserPage {
  constructor ({
    page,
    segmentId,
    isExcluded = false,
    coordinates = null,
  }) {
    this.id = uuidV4()
    this.page = page
    this.segmentId = segmentId
    this.isExcluded = isExcluded
    this.coordinates = coordinates
  }
}

export class PdfSegment {
  constructor ({
    id = uuidV4(),
    documentTypeId,
    userPages,
    isSelected = false,
    name,
  }) {
    this.id = id
    this.documentTypeId = documentTypeId
    this.userPages = userPages
    this.isSelected = isSelected
    this.name = name
  }

  static split = (segment, userPage) => {
    const pageIndex = segment.userPages.indexOf(userPage)
    const id = uuidV4()

    const newSegments = [
      new PdfSegment({
        id: segment.id,
        userPages: segment.userPages.slice(0, pageIndex),
        documentTypeId: segment.documentTypeId,
        name: segment.name,
      }),
      new PdfSegment({
        id,
        userPages: segment.userPages.slice(pageIndex)
          .map((uPage) => ({
            ...uPage,
            segmentId: id,
          })),
      }),
    ]

    const areSegmentsValid = (
      newSegments.every((s) => !!PdfSegment.getIncludedUserPages(s).length)
    )

    return areSegmentsValid ? newSegments : segment
  }

  static merge = (segment1, segment2) => (
    new PdfSegment({
      id: segment1.id,
      userPages: [
        ...segment1.userPages,
        ...segment2.userPages.map((uPage) => ({
          ...uPage,
          segmentId: segment1.id,
        })),
      ],
      documentTypeId: segment1.documentTypeId,
      name: segment1.name,
    })
  )

  static fromPagesCount = (pagesCount) => {
    const id = uuidV4()

    return new PdfSegment({
      id,
      userPages: Array.from(
        { length: pagesCount },
        (_, i) => (
          new UserPage({
            page: i,
            segmentId: id,
          })
        ),
      ),
    })
  }

  static fromPages = (length) => {
    const id = uuidV4()

    return new PdfSegment({
      id,
      userPages: Array.from(
        { length },
        (_, i) => (
          new UserPage({
            page: i,
            segmentId: id,
          })
        ),
      ),
    })
  }

  static togglesExcluded = (segment, userPage) => (
    new PdfSegment({
      id: segment.id,
      documentTypeId: segment.documentTypeId,
      name: segment.name,
      userPages: segment.userPages.map((uP) => {
        if (userPage === uP) {
          return {
            ...uP,
            isExcluded: !uP.isExcluded,
          }
        }

        return uP
      }),
    })
  )

  static getIncludedUserPages = (segment) => (
    segment.userPages.filter((page) => !page.isExcluded)
  )

  static duplicate = (segment, userPage) => {
    const userPageIndex = segment.userPages.indexOf(userPage)
    const duplicatedPage = new UserPage({
      page: userPage.page,
      segmentId: segment.id,
    })

    return new PdfSegment({
      id: segment.id,
      documentTypeId: segment.documentTypeId,
      name: segment.name,
      userPages: segment.userPages.toSpliced(userPageIndex + 1, 0, duplicatedPage),
    })
  }

  static toggleSelection = (segment) => (
    new PdfSegment({
      ...segment,
      isSelected: !segment.isSelected,
    })
  )

  static setDocumentTypeId = (segment, documentTypeId) => (
    new PdfSegment({
      ...segment,
      documentTypeId,
    })
  )

  static setUserPageCoordinates = (segments, userPage, coordinates) => (
    segments.map((segment) => {
      const hasPage = segment.userPages.some((uP) => uP === userPage)

      if (!hasPage) {
        return segment
      }

      return new PdfSegment({
        ...segment,
        userPages: segment.userPages.map((uP) => (
          uP === userPage ? {
            ...uP,
            coordinates,
          } : uP
        )),
      })
    })
  )

  static getPageRangeFromSegment = (segment) => (
    segment.userPages
      .filter((uP) => !uP.isExcluded)
      .map((uP) => uP.page)
  )

  static insertUserPageToAnchor = ({
    segment,
    anchorPage,
    draggedPage,
    insertBefore = false,
  }) => {
    const pages = [...segment.userPages]
    const anchorIndex = pages.indexOf(anchorPage)
    const insertIndex = insertBefore ? anchorIndex : anchorIndex + 1

    const pageToInsert = {
      ...draggedPage,
      segmentId: anchorPage.segmentId,
    }

    return new PdfSegment({
      ...segment,
      userPages: pages.toSpliced(insertIndex, 0, pageToInsert),
    })
  }

  static swapUserPages = (
    segment,
    targetIndex,
    sourceIndex,
  ) => (
    new PdfSegment({
      ...segment,
      userPages: segment.userPages
        .toSpliced(sourceIndex, 1)
        .toSpliced(targetIndex, 0, segment.userPages[sourceIndex]),
    })
  )

  static isValid = (segment) => !!segment?.userPages?.length > 0

  static removePageFromSegment = (segment, userPage) => {
    const removedUserPageIndex = segment.userPages.indexOf(userPage)

    return new PdfSegment({
      ...segment,
      userPages: segment.userPages.toSpliced(removedUserPageIndex, 1),
    })
  }

  static getSegmentByUserPage = (segments, userPage) => {
    return segments.find((segment) => segment.userPages.some((uP) => uP.id === userPage.id))
  }

  static isPageDragDisabled = (segments, userPage) => {
    const segment = PdfSegment.getSegmentByUserPage(segments, userPage)

    if (!segment) {
      return true
    }

    return (
      segment.userPages.length > 1 &&
      PdfSegment.getIncludedUserPages(segment).length === 1
    )
  }

  static isPageExcludeDisabled = (segments, userPage) => {
    const segment = PdfSegment.getSegmentByUserPage(segments, userPage)

    if (!segment) {
      return true
    }

    return (
      PdfSegment.getIncludedUserPages(segment).length <= 1
    )
  }
}

export const coordinatesShape = PropTypes.shape({
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
})

export const userPageShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  segmentId: PropTypes.string.isRequired,
  isExcluded: PropTypes.bool.isRequired,
  coordinates: coordinatesShape,
})

export const pdfSegmentShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  documentTypeId: PropTypes.string,
  userPages: PropTypes.arrayOf(userPageShape).isRequired,
  isSelected: PropTypes.bool.isRequired,
  name: PropTypes.string,
})
