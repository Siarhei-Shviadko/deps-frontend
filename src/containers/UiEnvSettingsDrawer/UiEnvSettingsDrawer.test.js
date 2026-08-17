
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { UI_ENV_SETTINGS_QUERY_KEY } from '@/constants/navigation'
import { localize, Localization } from '@/localization/i18n'
import { render } from '@/utils/rendererRTL'
import { UiEnvSettingsDrawer } from './UiEnvSettingsDrawer'

const mockQueryParams = { [UI_ENV_SETTINGS_QUERY_KEY]: 1 }
const mockSetQueryParams = jest.fn(() => {
  mockQueryParams[UI_ENV_SETTINGS_QUERY_KEY] = null
})

jest.mock('@/utils/env', () => mockEnv)

jest.mock('./BoolSwitch', () => mockShallowComponent('BoolSwitch', false))
jest.mock('./ConfidenceLevelToDisplay', () => mockShallowComponent('ConfidenceLevelToDisplay'))
jest.mock('./ConfidenceLevelView', () => mockShallowComponent('ConfidenceLevelView'))
jest.mock('./ExportImportEnvSettings', () => mockShallowComponent('ExportImportEnvSettings'))
jest.mock('./HiddenEngines', () => mockShallowComponent('HiddenEngines'))
jest.mock('./HiddenLlmProviders', () => mockShallowComponent('HiddenLlmProviders'))
jest.mock('./MaxCellContent', () => mockShallowComponent('MaxCellContent'))
jest.mock('./OidcLogLevel', () => mockShallowComponent('OidcLogLevel'))

jest.mock('@/hooks/useQueryParams', () => ({
  useQueryParams: jest.fn(() => ({
    queryParams: mockQueryParams,
    setQueryParams: mockSetQueryParams,
  })),
}))

jest.mock('@/services/BackendServicesManager', () => ({
  BackendServicesManager: {
    getServiceEnv: jest.fn(() => true),
    getFeatureEnv: jest.fn(() => true),
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
})

const ENV_TO_TEST_ID = {
  FEATURE_CONFIDENCE_LEVEL_VIEW: 'ConfidenceLevelView',
  FEATURE_OIDC_LOG_LEVEL: 'OidcLogLevel',
  DEFAULT_MAX_CELL_CONTENT_LENGTH: 'MaxCellContent',
  DEFAULT_CONFIDENCE_LEVEL_TO_DISPLAY: 'ConfidenceLevelToDisplay',
  FEATURE_HIDDEN_ENGINES: 'HiddenEngines',
  FEATURE_HIDDEN_LLM_PROVIDERS: 'HiddenLlmProviders',
}

for (const [envName, testId] of Object.entries(ENV_TO_TEST_ID)) {
  test(`renders component for ${envName} env variable`, () => {
    render(<UiEnvSettingsDrawer />)
    const element = screen.getByTestId(testId)
    expect(element).toBeInTheDocument()
  })
}

test('renders BoolSwitch for each BOOL_SWITCH_ENVS variables', () => {
  const BOOL_SWITCH_TEST_ID = 'BoolSwitch'

  const BOOL_SWITCH_ENVS = [
    'FEATURE_AZURE_CLOUD_NATIVE_EXTRACTOR',
    'FEATURE_SHOW_NOT_APPLICABLE_CONFIDENCE',
    'FEATURE_DOCUMENT_TYPES_GROUPS',
    'FEATURE_FILES_BATCH',
    'FEATURE_DOCUMENT_LAYOUT_EDITING',
    'FEATURE_MARKDOWN_LAYOUT',
    'FEATURE_FILE_LAYOUT_EDITING',
    'FEATURE_PDF_VIEWER',
    'FEATURE_PER_FIELD_VALIDATION',
    'FEATURE_PDF_SPLITTING',
    'FEATURE_LLM_EXTRACTORS',
    'FEATURE_PROMPT_CALIBRATION_STUDIO',
    'FEATURE_BULK_RETRY_PREVIOUS_STEP',
    'FEATURE_ENTITIES_UPLOAD',
    'FEATURE_DOCUMENT_TYPE_IMPORT_EXPORT',
    'FEATURE_FILES',
    'FEATURE_AGENTIC_DOCUMENT_PROCESSING',
  ]

  render(<UiEnvSettingsDrawer />)
  const elements = screen.getAllByTestId(BOOL_SWITCH_TEST_ID)
  expect(elements).toHaveLength(BOOL_SWITCH_ENVS.length)
})

test('renders Submit button', () => {
  render(<UiEnvSettingsDrawer />)
  const submitButton = screen.getByText(localize(Localization.SUBMIT))
  expect(submitButton).toBeInTheDocument()
})

test('renders Reset button', () => {
  render(<UiEnvSettingsDrawer />)
  const resetButton = screen.getByText(localize(Localization.RESET_ALL_TO_DEFAULT))
  expect(resetButton).toBeInTheDocument()
})

test('renders Export Import Env Settings buttons', () => {
  render(<UiEnvSettingsDrawer />)
  const btns = screen.getByTestId('ExportImportEnvSettings')
  expect(btns).toBeInTheDocument()
})

test('renders Drawer', () => {
  render(<UiEnvSettingsDrawer />)
  const drawerElement = screen.getByTestId('drawer')
  expect(drawerElement).toBeInTheDocument()
})

test('cancel button click executes close of the drawer', async () => {
  const { rerender } = render(<UiEnvSettingsDrawer />)

  const cancelButton = screen.getByText(localize(Localization.CANCEL))
  await userEvent.click(cancelButton)
  expect(mockSetQueryParams).toHaveBeenCalledWith({ [UI_ENV_SETTINGS_QUERY_KEY]: null })
  rerender(<UiEnvSettingsDrawer />)
  expect(screen.queryByTestId('drawer')).not.toBeInTheDocument()
})
