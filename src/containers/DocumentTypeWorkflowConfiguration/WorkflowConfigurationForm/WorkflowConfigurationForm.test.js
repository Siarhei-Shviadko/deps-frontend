
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFormContext, useWatch } from 'react-hook-form'
import { fetchProcessingEngines } from '@/actions/engines'
import { WORKFLOW_FORM_FIELD_CODES } from '@/containers/DocumentTypeWorkflowConfiguration/constants'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { ReviewPolicy } from '@/enums/ReviewPolicy'
import { Localization, localize } from '@/localization/i18n'
import { ExtendedDocumentType } from '@/models/ExtendedDocumentType'
import { WorkflowConfiguration } from '@/models/WorkflowConfiguration'
import { documentTypeStateSelector } from '@/selectors/documentType'
import { processingEnginesSelector } from '@/selectors/engines'
import { areEnginesFetchingSelector } from '@/selectors/requests'
import { render } from '@/utils/rendererRTL'
import { WorkflowConfigurationForm } from './WorkflowConfigurationForm'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/selectors/documentType')
jest.mock('@/selectors/engines')
jest.mock('@/selectors/requests')

jest.mock('react-hook-form', () => mockReactHookForm)

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/actions/engines', () => ({
  fetchProcessingEngines: jest.fn(),
}))

jest.mock('@/containers/ParsingFeaturesSwitch', () => mockShallowComponent('ParsingFeaturesSwitch'))

jest.mock('@/components/Select', () => ({
  CustomSelect: () => <div data-testid="custom-select" />,
}))

jest.mock('@/components/Form/ReactHookForm', () => ({
  ...jest.requireActual('@/components/Form/ReactHookForm'),
  Form: ({ children }) => <form data-testid="form">{children}</form>,
  FormItem: (props) => (
    <div data-testid={`form-item-${props.field?.code}`}>
      {props.label}
      {props.field?.hint && <span data-testid={`hint-${props.field?.code}`}>{props.field.hint}</span>}
      {
        props.field?.render?.({
          value: props.field.defaultValue,
          onChange: jest.fn(),
        })
      }
      Form Item
    </div>
  ),
}))

const mockSetValue = jest.fn()
const mockDispatch = jest.fn()

const mockDocumentType = new ExtendedDocumentType({
  code: 'test-doc-type',
  name: 'Test Document Type',
  workflowConfiguration: new WorkflowConfiguration({
    needsExtraction: true,
    needsReview: ReviewPolicy.ALWAYS_REVIEW,
    needsValidation: false,
    parsingFeatures: [KnownParsingFeature.TEXT],
    needsOutputExporting: false,
  }),
})

beforeEach(() => {
  jest.clearAllMocks()
  documentTypeStateSelector.mockReturnValue(mockDocumentType)
  processingEnginesSelector.mockReturnValue([])
  areEnginesFetchingSelector.mockReturnValue(false)
  useFormContext.mockImplementation(() => ({
    control: {},
    setValue: mockSetValue,
    getValues: jest.fn(),
    formState: {},
    reset: jest.fn(),
  }))
})

const defaultProps = {
  onSubmit: jest.fn(),
  handleSubmit: jest.fn(),
}

test('renders form element', () => {
  render(<WorkflowConfigurationForm {...defaultProps} />)

  expect(screen.getByTestId('form')).toBeInTheDocument()
})

test('renders engine field with hint', () => {
  render(<WorkflowConfigurationForm {...defaultProps} />)

  const field = screen.getByTestId(`form-item-${WORKFLOW_FORM_FIELD_CODES.ENGINE}`)
  expect(field).toBeInTheDocument()
  expect(field).toHaveTextContent(localize(Localization.ENGINE))

  const hint = screen.getByTestId(`hint-${WORKFLOW_FORM_FIELD_CODES.ENGINE}`)
  expect(hint).toHaveTextContent(localize(Localization.WORKFLOW_ENGINE_HINT))
})

test('renders parsing features field with hint and columnView prop', () => {
  render(<WorkflowConfigurationForm {...defaultProps} />)

  const field = screen.getByTestId(`form-item-${WORKFLOW_FORM_FIELD_CODES.PARSING_FEATURES}`)
  expect(field).toBeInTheDocument()
  expect(field).toHaveTextContent(localize(Localization.PARSING_FEATURES))

  const hint = screen.getByTestId(`hint-${WORKFLOW_FORM_FIELD_CODES.PARSING_FEATURES}`)
  expect(hint).toHaveTextContent(localize(Localization.WORKFLOW_PARSING_FEATURES_HINT))

  const parsingFeaturesSwitch = screen.getByTestId('ParsingFeaturesSwitch')
  expect(parsingFeaturesSwitch).toHaveAttribute('data-columnview', 'true')
})

test('passes selected engine to ParsingFeaturesSwitch when engine is set in form', () => {
  useWatch.mockReturnValue(KnownProcessingEngines.TESSERACT)

  render(<WorkflowConfigurationForm {...defaultProps} />)

  const parsingFeaturesSwitch = screen.getByTestId('ParsingFeaturesSwitch')
  expect(parsingFeaturesSwitch).toHaveAttribute('data-enginecode', KnownProcessingEngines.TESSERACT)
})

test('renders needs review field with hint', () => {
  render(<WorkflowConfigurationForm {...defaultProps} />)

  const field = screen.getByTestId(`form-item-${WORKFLOW_FORM_FIELD_CODES.NEEDS_REVIEW}`)
  expect(field).toBeInTheDocument()
  expect(field).toHaveTextContent(localize(Localization.WORKFLOW_REVIEW_POLICY))

  const hint = screen.getByTestId(`hint-${WORKFLOW_FORM_FIELD_CODES.NEEDS_REVIEW}`)
  expect(hint).toHaveTextContent(localize(Localization.WORKFLOW_REVIEW_POLICY_HINT))
})

test('renders needs extraction field with hint', () => {
  render(<WorkflowConfigurationForm {...defaultProps} />)

  const field = screen.getByTestId(`form-item-${WORKFLOW_FORM_FIELD_CODES.NEEDS_EXTRACTION}`)
  expect(field).toBeInTheDocument()
  expect(field).toHaveTextContent(localize(Localization.WORKFLOW_NEEDS_EXTRACTION))

  const hint = screen.getByTestId(`hint-${WORKFLOW_FORM_FIELD_CODES.NEEDS_EXTRACTION}`)
  expect(hint).toHaveTextContent(localize(Localization.WORKFLOW_NEEDS_EXTRACTION_HINT))
})

test('renders needs validation field with hint', () => {
  render(<WorkflowConfigurationForm {...defaultProps} />)

  const field = screen.getByTestId(`form-item-${WORKFLOW_FORM_FIELD_CODES.NEEDS_VALIDATION}`)
  expect(field).toBeInTheDocument()
  expect(field).toHaveTextContent(localize(Localization.WORKFLOW_NEEDS_VALIDATION))

  const hint = screen.getByTestId(`hint-${WORKFLOW_FORM_FIELD_CODES.NEEDS_VALIDATION}`)
  expect(hint).toHaveTextContent(localize(Localization.WORKFLOW_NEEDS_VALIDATION_HINT))
})

test('renders needs output exporting field with hint', () => {
  render(<WorkflowConfigurationForm {...defaultProps} />)

  const field = screen.getByTestId(`form-item-${WORKFLOW_FORM_FIELD_CODES.NEEDS_OUTPUT_EXPORTING}`)
  expect(field).toBeInTheDocument()
  expect(field).toHaveTextContent(localize(Localization.WORKFLOW_NEEDS_OUTPUT_EXPORTING))

  const hint = screen.getByTestId(`hint-${WORKFLOW_FORM_FIELD_CODES.NEEDS_OUTPUT_EXPORTING}`)
  expect(hint).toHaveTextContent(localize(Localization.WORKFLOW_NEEDS_OUTPUT_EXPORTING_HINT))
})

test('calls fetchProcessingEngines when form is rendered if engines are empty', () => {
  render(<WorkflowConfigurationForm {...defaultProps} />)

  expect(mockDispatch).toHaveBeenCalledWith(fetchProcessingEngines())
})

test('sets needs output exporting to true when output exporting switch is enabled', async () => {
  render(<WorkflowConfigurationForm {...defaultProps} />)

  const outputExportingField = screen.getByTestId(`form-item-${WORKFLOW_FORM_FIELD_CODES.NEEDS_OUTPUT_EXPORTING}`)
  const outputExportingSwitch = within(outputExportingField).getByRole('switch')

  await userEvent.click(outputExportingSwitch)

  expect(mockSetValue).toHaveBeenCalledWith(WORKFLOW_FORM_FIELD_CODES.NEEDS_OUTPUT_EXPORTING, true)
})
