
export const mapExtractorToLLMExtractor = (extractor) => {
  const [provider, model] = extractor.model.split('@')

  const {
    customInstruction,
    pageSpan,
    name,
    contextAttachments,
    stop,
    ...rest
  } = extractor

  return {
    extractorName: name,
    provider,
    model,
    extractionParams: {
      customInstruction: customInstruction || null,
      pageSpan: pageSpan || null,
      contextAttachments: contextAttachments || null,
      stop: stop?.length ? stop : null,
      ...rest,
    },
  }
}
