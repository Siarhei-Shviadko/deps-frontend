
import { Extractor } from '@/containers/PromptCalibrationStudio/viewModels'
import { LLMSettings } from '@/models/LLMProvider'

export const mapLLMExtractorsToStudioExtractors = (llmExtractors) => (
  llmExtractors.map((llmExtractor) => {
    const {
      extractorId,
      name,
      extractionParams,
      llmReference,
    } = llmExtractor

    const {
      stop,
      contextAttachments,
      ...rest
    } = extractionParams

    const model = LLMSettings.settingsToLLMType(llmReference.provider, llmReference.model)

    return new Extractor({
      id: extractorId,
      name,
      model,
      stop: stop == null ? [] : stop,
      contextAttachments: contextAttachments == null ? '' : contextAttachments,
      ...rest,
    })
  })
)
