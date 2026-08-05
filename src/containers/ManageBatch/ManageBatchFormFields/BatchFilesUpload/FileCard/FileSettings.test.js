
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFormContext } from 'react-hook-form'
import { FIELD_FORM_CODE } from '@/containers/ManageBatch/constants'
import { KnownParsingFeature, KnownParsingFeature as MockKnownParsingFeature } from '@/enums/KnownParsingFeature'
import { DocumentType } from '@/models/DocumentType'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { render } from '@/utils/rendererRTL'
import { FileSettings } from './FileSettings'

const LLM_TEST_ID = 'llm-select'
const DOC_TYPE_SELECT = 'doc-type-select'
const ENGINE_SELECT = 'engine-select'
const PARSING_FEATURES_SWITCH = 'parsing-features-switch'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-hook-form', () => mockReactHookForm)
jest.mock('@/selectors/documentTypesListPage')

jest.mock('@/containers/ExtractionLLMSelect', () => ({
  ExtractionLLMSelect: () => <div data-testid={LLM_TEST_ID} />,
}))

jest.mock('@/containers/ManageBatch/ManageBatchFormFields/DocTypeSelect', () => ({
  DocTypeSelect: ({ innerRef, onChange, ...props }) => (
    <div
      ref={innerRef}
      data-testid={DOC_TYPE_SELECT}
      onClick={() => onChange?.('code1')}
      {...props}
    />
  ),
}))

jest.mock('@/containers/ManageBatch/ManageBatchFormFields/EngineSelect', () => ({
  EngineSelect: () => <div data-testid={ENGINE_SELECT} />,
}))

jest.mock('@/containers/ParsingFeaturesSwitch', () => ({
  ParsingFeaturesSwitch: ({ onChange, value }) => (
    <div
      data-default-value={JSON.stringify(value)}
      data-testid={PARSING_FEATURES_SWITCH}
      onClick={() => onChange([MockKnownParsingFeature.TEXT])}
    />
  ),
}))

const mockSetValue = jest.fn()

let defaultProps

beforeEach(() => {
  jest.clearAllMocks()
  defaultProps = {
    index: 0,
  }
  useFormContext.mockImplementation(() => ({
    setValue: mockSetValue,
    getValues: jest.fn(),
    formState: {},
    control: {},
    reset: jest.fn(),
  }))
})

test('renders DocTypeSelect and all fields when LLM feature is enabled', () => {
  mockEnv.ENV.FEATURE_LLM_DATA_EXTRACTION = true
  render(<FileSettings {...defaultProps} />)

  expect(screen.getByTestId(DOC_TYPE_SELECT)).toBeInTheDocument()
  expect(screen.getByTestId(ENGINE_SELECT)).toBeInTheDocument()
  expect(screen.getByTestId(LLM_TEST_ID)).toBeInTheDocument()
  expect(screen.getByTestId(PARSING_FEATURES_SWITCH)).toBeInTheDocument()
})

test('renders DocTypeSelect but not LLM select when LLM feature is disabled', () => {
  mockEnv.ENV.FEATURE_LLM_DATA_EXTRACTION = false
  render(<FileSettings {...defaultProps} />)

  expect(screen.getByTestId(DOC_TYPE_SELECT)).toBeInTheDocument()
  expect(screen.getByTestId(ENGINE_SELECT)).toBeInTheDocument()
  expect(screen.queryByTestId(LLM_TEST_ID)).not.toBeInTheDocument()
  expect(screen.getByTestId(PARSING_FEATURES_SWITCH)).toBeInTheDocument()
})

test('sets TEXT as default switch on for parsing features', () => {
  render(<FileSettings {...defaultProps} />)

  const parsingFeaturesSelect = screen.getByTestId(PARSING_FEATURES_SWITCH)
  expect(parsingFeaturesSelect).toBeInTheDocument()
  expect(parsingFeaturesSelect.getAttribute('data-default-value')).toBe(`["${KnownParsingFeature.TEXT}"]`)
})

test('sets parsing features and engine from workflowConfiguration when document type changes', async () => {
  const docType = new DocumentType(
    'code1',
    'Type 1',
    'defaultEngine',
    'en',
    undefined,
    [],
    'id1',
  )
  docType.workflowConfiguration = {
    engine: 'workflowEngine',
    parsingFeatures: [KnownParsingFeature.KEY_VALUE_PAIRS, KnownParsingFeature.TABLES],
  }
  documentTypesSelector.mockReturnValue([docType])

  render(<FileSettings {...defaultProps} />)

  await userEvent.click(screen.getByTestId(DOC_TYPE_SELECT))

  expect(mockSetValue).toHaveBeenCalledWith(
    `${FIELD_FORM_CODE.FILES}.0.settings.${FIELD_FORM_CODE.PARSING_FEATURES}`,
    [KnownParsingFeature.KEY_VALUE_PAIRS, KnownParsingFeature.TABLES],
  )
  expect(mockSetValue).toHaveBeenCalledWith(
    `${FIELD_FORM_CODE.FILES}.0.settings.${FIELD_FORM_CODE.ENGINE}`,
    'workflowEngine',
  )
})

test('sets document type engine and default parsing features when workflowConfiguration is missing', async () => {
  const docType = new DocumentType(
    'code1',
    'Type 1',
    'engine1',
    'en',
    undefined,
    [],
    'id1',
  )
  documentTypesSelector.mockReturnValue([docType])

  render(<FileSettings {...defaultProps} />)

  await userEvent.click(screen.getByTestId(DOC_TYPE_SELECT))

  expect(mockSetValue).toHaveBeenCalledWith(
    `${FIELD_FORM_CODE.FILES}.0.settings.${FIELD_FORM_CODE.PARSING_FEATURES}`,
    [KnownParsingFeature.TEXT],
  )
  expect(mockSetValue).toHaveBeenCalledWith(
    `${FIELD_FORM_CODE.FILES}.0.settings.${FIELD_FORM_CODE.ENGINE}`,
    'engine1',
  )
})

test('does not call setValue when document type is not found', async () => {
  documentTypesSelector.mockReturnValue([])

  render(<FileSettings {...defaultProps} />)

  await userEvent.click(screen.getByTestId(DOC_TYPE_SELECT))

  expect(mockSetValue).not.toHaveBeenCalled()
})
