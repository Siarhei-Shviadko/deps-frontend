
import { useMemo, useCallback } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { CustomCollapse } from '@/components/Collapse/CustomCollapse'
import { FormFieldType } from '@/components/Form'
import { DownOutlined } from '@/components/Icons/DownOutlined'
import { CustomSelect } from '@/components/Select'
import { SelectOption } from '@/components/Select/SelectOption'
import { Tooltip } from '@/components/Tooltip'
import { ParsingFeaturesSwitch } from '@/containers/ParsingFeaturesSwitch'
import { FIELD_FORM_CODE, TEST_IDS } from '@/containers/UploadDocumentsDrawer/constants'
import { FILE_EXTENSION_TO_DISPLAY_TEXT, FileExtension } from '@/enums/FileExtension'
import { Placement } from '@/enums/Placement'
import { REVIEW_POLICY_TO_LABEL } from '@/enums/ReviewPolicy'
import { Localization, localize } from '@/localization/i18n'
import { Engine } from '@/models/Engine'
import { ocrEnginesSelector } from '@/selectors/engines'
import { areEnginesFetchingSelector } from '@/selectors/requests'
import {
  CollapseContent,
  CollapseWrapper,
  InfoIcon,
  LabelWithIcon,
  StyledFormItem,
  ExpandIconButton,
} from './DocumentSettingsForm.styles'

const PROCESSING_WORKFLOW_PANEL_KEY = 'processing-workflow'

const reviewPolicyOptions = Object.entries(REVIEW_POLICY_TO_LABEL).map(
  ([value, text]) => new SelectOption(value, text),
)

const FILES_FORMATS = [
  FILE_EXTENSION_TO_DISPLAY_TEXT[FileExtension.DOCX],
  FILE_EXTENSION_TO_DISPLAY_TEXT[FileExtension.XLSX],
  FILE_EXTENSION_TO_DISPLAY_TEXT[FileExtension.CSV],
]

const renderParsingFeaturesLabel = () => {
  const tooltipContent = (
    <>
      {localize(Localization.PARSING_FEATURES_TOOLTIP_INTRO)}
      {' '}
      {FILES_FORMATS.join(', ')}
      {' '}
      {localize(Localization.FILES_HAVE_NATIVE_PARSING)}
    </>
  )

  return (
    <LabelWithIcon>
      {localize(Localization.PARSING_FEATURES)}
      <Tooltip
        placement={Placement.TOP}
        title={tooltipContent}
      >
        <InfoIcon data-testid={TEST_IDS.PARSING_FEATURES_INFO_ICON} />
      </Tooltip>
    </LabelWithIcon>
  )
}

export const WorkflowConfigurationSection = () => {
  const engines = useSelector(ocrEnginesSelector)
  const areEnginesFetching = useSelector(areEnginesFetchingSelector)
  const { setValue } = useFormContext()

  const selectedEngine = useWatch({ name: FIELD_FORM_CODE.ENGINE })

  const handleNeedsValidationChange = useCallback((val) => {
    if (val) {
      setValue(FIELD_FORM_CODE.NEEDS_EXTRACTION, true)
    }
  }, [setValue])

  const handleNeedsExtractionChange = useCallback((val) => {
    if (!val) {
      setValue(FIELD_FORM_CODE.NEEDS_VALIDATION, false)
    }
  }, [setValue])

  const processingWorkflowFields = useMemo(() => [
    {
      code: FIELD_FORM_CODE.ENGINE,
      label: localize(Localization.ENGINE),
      placeholder: localize(Localization.SELECT_ENGINE),
      render: (props) => (
        <CustomSelect
          {...props}
          allowClear={true}
          fetching={areEnginesFetching}
          options={Engine.toAllEnginesOptions(engines)}
        />
      ),
    },
    {
      code: FIELD_FORM_CODE.PARSING_FEATURES,
      label: renderParsingFeaturesLabel(),
      placeholder: localize(Localization.SELECT_PARSING_FEATURE),
      render: (props) => (
        <ParsingFeaturesSwitch
          {...props}
          engineCode={selectedEngine}
        />
      ),
    },
    {
      code: FIELD_FORM_CODE.NEEDS_REVIEW,
      label: localize(Localization.WORKFLOW_REVIEW_POLICY),
      type: FormFieldType.ENUM,
      options: reviewPolicyOptions,
      render: (props) => (
        <CustomSelect
          {...props}
          allowClear={false}
          options={reviewPolicyOptions}
        />
      ),
    },
    {
      code: FIELD_FORM_CODE.NEEDS_EXTRACTION,
      label: localize(Localization.SEND_TO_EXTRACTION),
      type: FormFieldType.CHECKMARK,
      handler: {
        onChange: handleNeedsExtractionChange,
      },
    },
    {
      code: FIELD_FORM_CODE.NEEDS_VALIDATION,
      label: localize(Localization.SEND_TO_VALIDATION),
      type: FormFieldType.CHECKMARK,
      handler: {
        onChange: handleNeedsValidationChange,
      },
    },
  ], [
    areEnginesFetching,
    engines,
    handleNeedsExtractionChange,
    handleNeedsValidationChange,
    selectedEngine,
  ])

  const renderExpandButton = useCallback((panelProps, onClick) => (
    <ExpandIconButton
      icon={
        (
          <DownOutlined
            rotate={panelProps.isActive ? 180 : 0}
          />
        )
      }
      onClick={onClick}
    />
  ), [])

  const processingWorkflowHeader = useMemo(() => (
    <LabelWithIcon>
      {localize(Localization.WORKFLOW_CONFIGURATION)}
      <Tooltip
        placement={Placement.TOP}
        title={localize(Localization.PROCESSING_WORKFLOW_DOC_TYPE_HINT)}
      >
        <InfoIcon data-testid={TEST_IDS.WORKFLOW_CONFIG_INFO_ICON} />
      </Tooltip>
    </LabelWithIcon>
  ), [])

  const renderPanels = useCallback(() => (
    <CustomCollapse.Panel
      key={PROCESSING_WORKFLOW_PANEL_KEY}
      header={processingWorkflowHeader}
    >
      <CollapseContent>
        {
          processingWorkflowFields.map(({ label, requiredMark, hint, ...field }) => (
            <StyledFormItem
              key={field.code}
              field={
                {
                  ...field,
                  hint,
                }
              }
              hint={hint}
              label={label}
              requiredMark={requiredMark}
            />
          ))
        }
      </CollapseContent>
    </CustomCollapse.Panel>
  ), [processingWorkflowFields, processingWorkflowHeader])

  return (
    <CollapseWrapper>
      <CustomCollapse
        renderExpandButton={renderExpandButton}
        renderPanels={renderPanels}
      />
    </CollapseWrapper>
  )
}
