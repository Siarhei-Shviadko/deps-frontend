
import { mockEnv } from '@/mocks/mockEnv'
import { UI_ENV_SETTINGS } from '@/constants/storage'
import { KnownBackendService } from '@/enums/KnownBackendService'
import { BackendServicesManager } from '@/services/BackendServicesManager'
import { getStaticEnvValue } from '@/utils/env'
import { localStorageWrapper } from '@/utils/localStorageWrapper'
import { getEnvToRender, getDefaultEnvs, getInitialLocalEnvs } from './utils'

jest.mock('@/utils/env', () => ({
  ...mockEnv,
  getStaticEnvValue: jest.fn((feature) => feature),
}))

jest.mock('@/services/BackendServicesManager', () => ({
  BackendServicesManager: {
    getServiceEnv: jest.fn((service) => (
      mockPredefinedServices.includes(service)
    )),
    getFeatureEnv: jest.fn((feature) => (
      mockPredefinedFeatures.includes(feature) ? feature : null
    )),
  },
}))

jest.mock('@/utils/localStorageWrapper', () => ({
  localStorageWrapper: {
    getItem: jest.fn(),
  },
}))

const mockPredefinedFeatures = ['FEATURE_HIDDEN_LLM_PROVIDERS', 'FEATURE_AZURE_CLOUD_NATIVE_EXTRACTOR']
const mockPredefinedServices = [
  KnownBackendService.AI_FUSION,
  KnownBackendService.CLOUD_EXTRACTION,
  KnownBackendService.FILES_BATCH,
]

describe('utils: getEnvToRender', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('returns the correct environment object based on service availability', () => {
    const envs = getEnvToRender()

    const envKeys = Object.keys(envs)

    expect(envKeys).toEqual([
      'FEATURE_CONFIDENCE_LEVEL_VIEW',
      'FEATURE_OIDC_LOG_LEVEL',
      'FEATURE_HIDDEN_ENGINES',
      'FEATURE_HIDDEN_LLM_PROVIDERS',
      'DEFAULT_MAX_CELL_CONTENT_LENGTH',
      'DEFAULT_CONFIDENCE_LEVEL_TO_DISPLAY',
      'FEATURE_SHOW_NOT_APPLICABLE_CONFIDENCE',
      'FEATURE_AZURE_CLOUD_NATIVE_EXTRACTOR',
      'FEATURE_FILES_BATCH',
      'FEATURE_DOCUMENT_LAYOUT_EDITING',
      'FEATURE_FILE_LAYOUT_EDITING',
      'FEATURE_MARKDOWN_LAYOUT',
      'FEATURE_PDF_VIEWER',
      'FEATURE_PDF_SPLITTING',
      'FEATURE_LLM_EXTRACTORS',
      'FEATURE_PROMPT_CALIBRATION_STUDIO',
      'FEATURE_BULK_RETRY_PREVIOUS_STEP',
      'FEATURE_ENTITIES_UPLOAD',
      'FEATURE_DOCUMENT_TYPE_IMPORT_EXPORT',
      'FEATURE_FILES',
      'FEATURE_AGENTIC_DOCUMENT_PROCESSING',
      'FEATURE_PER_FIELD_VALIDATION',
    ])
  })

  test('calls getServiceEnv when call getEnvToRender', () => {
    getEnvToRender()

    expect(BackendServicesManager.getServiceEnv).nthCalledWith(1, KnownBackendService.AI_FUSION)
    expect(BackendServicesManager.getServiceEnv).nthCalledWith(2, KnownBackendService.CLOUD_EXTRACTION)
    expect(BackendServicesManager.getServiceEnv).nthCalledWith(3, KnownBackendService.GROUPS)
    expect(BackendServicesManager.getServiceEnv).nthCalledWith(4, KnownBackendService.FILES_BATCH)
    expect(BackendServicesManager.getServiceEnv).nthCalledWith(5, KnownBackendService.FILES_BATCH)
    expect(BackendServicesManager.getServiceEnv).nthCalledWith(6, KnownBackendService.AI_FUSION)
  })
})

describe('utils: getDefaultEnvs', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('calls getFeatureEnv and getFeatureEnv when call getDefaultEnvs', () => {
    getDefaultEnvs()

    expect(BackendServicesManager.getFeatureEnv).toHaveBeenCalledTimes(
      Object.keys(getEnvToRender()).length,
    )

    expect(getStaticEnvValue).toHaveBeenCalledTimes(
      Object.keys(getEnvToRender()).length - mockPredefinedFeatures.length,
    )
  })

  test('returns correct value when call getDefaultEnvs', () => {
    const defaultEnvs = getDefaultEnvs()

    Object.keys(getEnvToRender()).forEach((key) => {
      expect(defaultEnvs[key]).toBe(key)
    })
  })
})

describe('utils: getInitialLocalEnvs', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('merges stored settings with default envs preserving cached values', () => {
    const storedEnvs = { FEATURE_CONFIDENCE_LEVEL_VIEW: 'fromLocalStorage' }
    localStorageWrapper.getItem.mockReturnValue(storedEnvs)

    const initialEnvs = getInitialLocalEnvs()
    const defaultEnvs = getDefaultEnvs()

    expect(localStorageWrapper.getItem).toHaveBeenCalledWith(UI_ENV_SETTINGS)
    expect(initialEnvs.FEATURE_CONFIDENCE_LEVEL_VIEW).toBe('fromLocalStorage')

    Object.keys(defaultEnvs).forEach((key) => {
      if (key !== 'FEATURE_CONFIDENCE_LEVEL_VIEW') {
        expect(initialEnvs[key]).toBe(defaultEnvs[key])
      }
    })
  })

  test('includes newly added feature flags with default values when cache exists', () => {
    const storedEnvs = { FEATURE_CONFIDENCE_LEVEL_VIEW: 'cached' }
    localStorageWrapper.getItem.mockReturnValue(storedEnvs)

    const initialEnvs = getInitialLocalEnvs()
    const defaultEnvs = getDefaultEnvs()

    Object.keys(defaultEnvs).forEach((key) => {
      expect(initialEnvs).toHaveProperty(key)
    })
  })

  test('fallback to default environments if local storage is empty', () => {
    localStorageWrapper.getItem.mockReturnValue(null)
    const defaultEnvs = getDefaultEnvs()

    const initialEnvs = getInitialLocalEnvs()

    expect(localStorageWrapper.getItem).toHaveBeenCalledWith(UI_ENV_SETTINGS)
    expect(initialEnvs).toEqual(defaultEnvs)
  })
})
