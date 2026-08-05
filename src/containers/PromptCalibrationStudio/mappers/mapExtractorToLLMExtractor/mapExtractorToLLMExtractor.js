
export const mapExtractorToLLMExtractor = (extractor) => {
  const [provider, model] = extractor.model.split('@')

  const {
    temperature,
    topP,
    groupingFactor,
    customInstruction,
    pageSpan,
    name,
    contextAttachments,
    maxTokens,
    stop,
    seed,
    logprobs,
  } = extractor

  return {
    extractorName: name,
    provider,
    model,
    extractionParams: {
      temperature,
      topP,
      groupingFactor,
      customInstruction: customInstruction || null,
      pageSpan: pageSpan || null,
      contextAttachments: contextAttachments || null,
      maxTokens,
      stop: stop?.length ? stop : null,
      seed,
      logprobs,
    },
  }
}
