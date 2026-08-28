
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FIELD_FORM_CODE, TEST_IDS } from '@/containers/UploadDocumentsDrawer/constants'
import { FILE_EXTENSION_TO_DISPLAY_TEXT, FileExtension } from '@/enums/FileExtension'
import { Localization, localize } from '@/localization/i18n'
import { processingEnginesSelector } from '@/selectors/engines'
import { areEnginesFetchingSelector } from '@/selectors/requests'
import { render } from '@/utils/rendererRTL'
import { WorkflowConfigurationSection } from './WorkflowConfigurationSection'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/selectors/requests')
jest.mock('@/selectors/engines')

jest.mock('react-hook-form', () => mockReactHookForm)

jest.mock('@/components/Form', () => ({
  ...jest.requireActual('@/components/Form'),
  FormItem: (props) => (
    <div data-testid={`form-item-${props.field?.code}`}>
      {props.label}
      Form Item
    </div>
  ),
}))

jest.mock('@/components/Collapse/CustomCollapse', () => ({
  CustomCollapse: Object.assign(
    ({ renderPanels }) => <div data-testid="custom-collapse">{renderPanels()}</div>,
    {
      Panel: ({ children, header }) => (
        <div data-testid="collapse-panel">
          {header}
          {children}
        </div>
      ),
    },
  ),
}))

beforeEach(() => {
  jest.clearAllMocks()
  processingEnginesSelector.mockReturnValue([])
  areEnginesFetchingSelector.mockReturnValue(false)
})

test('renders workflow configuration header', () => {
  render(<WorkflowConfigurationSection />)

  expect(screen.getByText(localize(Localization.WORKFLOW_CONFIGURATION))).toBeInTheDocument()
})

test('renders engine form field', () => {
  render(<WorkflowConfigurationSection />)

  const field = screen.getByTestId(`form-item-${FIELD_FORM_CODE.ENGINE}`)
  expect(field).toBeInTheDocument()
  expect(field).toHaveTextContent(localize(Localization.ENGINE))
})

test('renders parsing features form field', () => {
  render(<WorkflowConfigurationSection />)

  const field = screen.getByTestId(`form-item-${FIELD_FORM_CODE.PARSING_FEATURES}`)
  expect(field).toBeInTheDocument()
  expect(field).toHaveTextContent(localize(Localization.PARSING_FEATURES))
})

test('renders review policy form field', () => {
  render(<WorkflowConfigurationSection />)

  const field = screen.getByTestId(`form-item-${FIELD_FORM_CODE.NEEDS_REVIEW}`)
  expect(field).toBeInTheDocument()
  expect(field).toHaveTextContent(localize(Localization.WORKFLOW_REVIEW_POLICY))
})

test('renders send to extraction form field', () => {
  render(<WorkflowConfigurationSection />)

  const field = screen.getByTestId(`form-item-${FIELD_FORM_CODE.NEEDS_EXTRACTION}`)
  expect(field).toBeInTheDocument()
  expect(field).toHaveTextContent(localize(Localization.SEND_TO_EXTRACTION))
})

test('renders send to validation form field', () => {
  render(<WorkflowConfigurationSection />)

  const field = screen.getByTestId(`form-item-${FIELD_FORM_CODE.NEEDS_VALIDATION}`)
  expect(field).toBeInTheDocument()
  expect(field).toHaveTextContent(localize(Localization.SEND_TO_VALIDATION))
})

test('shows workflow configuration hint tooltip on info icon hover', async () => {
  render(<WorkflowConfigurationSection />)

  const infoIcon = screen.getByTestId(TEST_IDS.WORKFLOW_CONFIG_INFO_ICON)
  await userEvent.hover(infoIcon)

  await waitFor(() => {
    expect(screen.getByText(localize(Localization.PROCESSING_WORKFLOW_DOC_TYPE_HINT))).toBeInTheDocument()
  })
})

test('shows parsing features tooltip with supported file formats on info icon hover', async () => {
  render(<WorkflowConfigurationSection />)

  const infoIcon = screen.getByTestId(TEST_IDS.PARSING_FEATURES_INFO_ICON)
  await userEvent.hover(infoIcon)

  const expectedFormats = [
    FILE_EXTENSION_TO_DISPLAY_TEXT[FileExtension.DOCX],
    FILE_EXTENSION_TO_DISPLAY_TEXT[FileExtension.XLSX],
    FILE_EXTENSION_TO_DISPLAY_TEXT[FileExtension.CSV],
  ].join(', ')

  await waitFor(() => {
    expect(screen.getByText(localize(Localization.PARSING_FEATURES_TOOLTIP_INTRO), { exact: false })).toBeInTheDocument()
  })
  await waitFor(() => {
    expect(screen.getByText(expectedFormats, { exact: false })).toBeInTheDocument()
  })
  await waitFor(() => {
    expect(screen.getByText(localize(Localization.FILES_HAVE_NATIVE_PARSING), { exact: false })).toBeInTheDocument()
  })
})
