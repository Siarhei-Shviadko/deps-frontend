
import { v4 as uuidv4 } from 'uuid'
import { CircleExclamationIcon } from '@/components/Icons/CircleExclamationIcon'
import { LongText } from '@/components/LongText'
import { Popover, PopoverTrigger } from '@/components/Popover'
import { getTooltipConfig, parsePageSpanToContent } from '@/containers/PromptCalibrationStudio/utils'
import { Localization, localize } from '@/localization/i18n'
import { useFieldCalibration, useExtractorModel } from '../hooks'
import {
  EXTRACTOR_SETTINGS_TO_LABEL,
  ExtractorSettings,
  EMPTY_VALUE,
} from './constants'
import {
  IconButton,
  Label,
  StyledList,
  StyledItem,
} from './LLMExtractorInfo.styles'

const getExtractorSettings = (settings, extractor) => (
  Object.entries(settings).map(([key, value]) => {
    const text = extractor[value] ?? EMPTY_VALUE

    return ({
      key,
      label: EXTRACTOR_SETTINGS_TO_LABEL[value],
      value: <LongText text={String(text)} />,
    })
  })
)

export const LLMExtractorInfo = () => {
  const { activeField, extractors } = useFieldCalibration()
  const extractor = extractors.find((extractor) => extractor.id === activeField.extractorId)

  const { providerName, modelName } = useExtractorModel(extractor.model)

  const {
    MODEL,
    PAGE_SPAN,
    LOGPROBS,
    STOP,
    CONTEXT_ATTACHMENTS,
    ...restSettings
  } = ExtractorSettings

  const extractorSettings = [
    {
      key: ExtractorSettings.MODEL,
      label: EXTRACTOR_SETTINGS_TO_LABEL[MODEL],
      value: <LongText text={`${modelName} / ${providerName}`} />,
    },
    {
      key: ExtractorSettings.PAGE_SPAN,
      label: EXTRACTOR_SETTINGS_TO_LABEL[PAGE_SPAN],
      value: <LongText text={parsePageSpanToContent(extractor.pageSpan)} />,
    },
    {
      key: ExtractorSettings.LOGPROBS,
      label: EXTRACTOR_SETTINGS_TO_LABEL[LOGPROBS],
      value: (
        <LongText text={extractor.logprobs ? localize(Localization.YES) : localize(Localization.NO)} />
      ),
    },
    {
      key: ExtractorSettings.CONTEXT_ATTACHMENTS,
      label: EXTRACTOR_SETTINGS_TO_LABEL[CONTEXT_ATTACHMENTS],
      value: (
        <LongText
          text={
            extractor.contextAttachments
              ? localize(Localization.AI_CONTEXT_TEXT_AND_IMAGES)
              : localize(Localization.AI_CONTEXT_TEXT_ONLY)
          }
        />
      ),
    },
    {
      key: uuidv4(),
      label: EXTRACTOR_SETTINGS_TO_LABEL[STOP],
      value: <LongText text={extractor.stop?.join(', ') || EMPTY_VALUE} />,
    },
    ...getExtractorSettings(restSettings, extractor),
  ]

  const Content = (
    <StyledList>
      {
        extractorSettings.map(({ key, label, value }) => (
          <StyledItem key={key}>
            <Label>{label}</Label>
            {value}
          </StyledItem>
        ))
      }
    </StyledList>
  )

  return (
    <Popover
      content={Content}
      trigger={PopoverTrigger.CLICK}
    >
      <IconButton
        icon={<CircleExclamationIcon />}
        tooltip={getTooltipConfig(localize(Localization.LLM_EXTRACTOR_INFO))}
      />
    </Popover>
  )
}
