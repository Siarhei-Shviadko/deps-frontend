
import { LongText } from '@/components/LongText'
import { Spin } from '@/components/Spin'
import { useExtractorModel } from '@/containers/PromptCalibrationStudio/hooks'
import { parsePageSpanToContent } from '@/containers/PromptCalibrationStudio/utils'
import { extractorShape } from '@/containers/PromptCalibrationStudio/viewModels'
import { localize, Localization } from '@/localization/i18n'
import { DescriptionItem } from './DescriptionItem'
import {
  CustomInstructionItem,
  CustomInstructionItemValue,
  ExtractorSettingsItemLabel,
  ExtractorSettingsItemsWrapper,
} from './LLMExtractorDescription.styles'

export const LLMExtractorDescription = ({ extractor }) => {
  const {
    providerName,
    modelName,
    isFetching,
  } = useExtractorModel(extractor.model)

  if (isFetching) {
    return <Spin.Centered spinning />
  }

  return (
    <>
      <DescriptionItem
        label={localize(Localization.LLM_MODEL)}
        value={
          (
            <>
              <LongText
                key={modelName}
                text={modelName}
              />
              <LongText
                key={providerName}
                text={providerName}
              />
            </>
          )
        }
      />
      {
        (extractor.temperature != null || extractor.topP != null) && (
          <ExtractorSettingsItemsWrapper>
            <DescriptionItem
              label={localize(Localization.TEMPERATURE)}
              value={extractor.temperature}
            />
            <DescriptionItem
              label={localize(Localization.TOP_P)}
              value={extractor.topP}
            />
          </ExtractorSettingsItemsWrapper>
        )
      }
      {
        (extractor.groupingFactor || extractor.pageSpan) && (
          <ExtractorSettingsItemsWrapper>
            <DescriptionItem
              label={localize(Localization.GROUPING_FACTOR)}
              value={extractor.groupingFactor}
            />
            <DescriptionItem
              label={localize(Localization.PAGE_SPAN)}
              value={parsePageSpanToContent(extractor.pageSpan)}
            />
          </ExtractorSettingsItemsWrapper>
        )
      }
      <CustomInstructionItem>
        <ExtractorSettingsItemLabel>
          {localize(Localization.CUSTOM_INSTRUCTION)}
        </ExtractorSettingsItemLabel>
        <CustomInstructionItemValue>
          {extractor.customInstruction}
        </CustomInstructionItemValue>
      </CustomInstructionItem>
    </>
  )
}

LLMExtractorDescription.propTypes = {
  extractor: extractorShape.isRequired,
}
