import { v4 as uuidV4 } from 'uuid'
import { UserPage, PdfSegment } from '@/containers/PdfSplitting/models'
import { Localization, localize } from '@/localization/i18n'

export const mapProposalsToSegments = (proposals) => proposals.segments.map((segment) => {
  const id = uuidV4()

  const userPages = segment.contentRegions.map((region) => (
    new UserPage({
      page: region.pageNumber - 1,
      segmentId: id,
      coordinates: region.boundingBox ?? null,
    })
  ))

  return new PdfSegment({
    id,
    userPages,
    documentTypeId: segment.documentTypeId,
    name: segment.name,
  })
})

export const mapSegmentsToProposals = (segments) => segments.map((segment, index) => ({
  name: segment.name ?? localize(Localization.SEGMENT, { index: index + 1 }),
  contentRegions: segment.userPages
    .filter((uP) => !uP.isExcluded)
    .map((uP) => ({
      pageNumber: uP.page + 1,
      boundingBox: uP.coordinates ?? null,
    })),
  documentTypeId: segment.documentTypeId,
}))
