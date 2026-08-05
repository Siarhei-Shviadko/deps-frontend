
const enhanceLayoutWithPage = (layouts, page, pageId) => (
  layouts.map((layout) => ({
    pageId,
    page,
    layout,
  }))
)

const mapDocumentLayoutPagesToLayouts = (documentLayout) => {
  const layoutsByPage = documentLayout.pages.map(({
    id,
    paragraphs,
    tables,
    keyValuePairs,
    pageNumber,
    images,
  }) => ({
    paragraphs: enhanceLayoutWithPage(paragraphs, pageNumber, id),
    tables: enhanceLayoutWithPage(tables, pageNumber, id),
    keyValuePairs: enhanceLayoutWithPage(keyValuePairs, pageNumber, id),
    images: enhanceLayoutWithPage(images, pageNumber, id),
  }))

  return layoutsByPage.reduce((acc, layouts) => {
    Object.entries(layouts).forEach(([key, value]) => {
      acc[key]
        ? acc[key] = [...acc[key], ...value]
        : acc[key] = value
    })

    return acc
  }, {})
}

export {
  mapDocumentLayoutPagesToLayouts,
}
