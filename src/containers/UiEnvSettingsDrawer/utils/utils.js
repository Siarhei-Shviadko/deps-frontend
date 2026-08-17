
import { UI_ENV_SETTINGS } from '@/constants/storage'
import { KnownBackendService } from '@/enums/KnownBackendService'
import { BackendServicesManager } from '@/services/BackendServicesManager'
import { getStaticEnvValue } from '@/utils/env'
import { localStorageWrapper } from '@/utils/localStorageWrapper'
import { BoolSwitch } from '../BoolSwitch'
import { ConfidenceLevelToDisplay } from '../ConfidenceLevelToDisplay'
import { ConfidenceLevelView } from '../ConfidenceLevelView'
import { HiddenEngines } from '../HiddenEngines'
import { HiddenLlmProviders } from '../HiddenLlmProviders'
import { MaxCellContent } from '../MaxCellContent'
import { OidcLogLevel } from '../OidcLogLevel'

export const getEnvToRender = () => ({
  FEATURE_CONFIDENCE_LEVEL_VIEW: ConfidenceLevelView,
  FEATURE_OIDC_LOG_LEVEL: OidcLogLevel,
  FEATURE_HIDDEN_ENGINES: HiddenEngines,
  ...(
    !!BackendServicesManager.getServiceEnv(KnownBackendService.AI_FUSION) &&
    { FEATURE_HIDDEN_LLM_PROVIDERS: HiddenLlmProviders }
  ),
  DEFAULT_MAX_CELL_CONTENT_LENGTH: MaxCellContent,
  DEFAULT_CONFIDENCE_LEVEL_TO_DISPLAY: ConfidenceLevelToDisplay,
  FEATURE_SHOW_NOT_APPLICABLE_CONFIDENCE: BoolSwitch,
  ...(
    !!BackendServicesManager.getServiceEnv(KnownBackendService.CLOUD_EXTRACTION) &&
    { FEATURE_AZURE_CLOUD_NATIVE_EXTRACTOR: BoolSwitch }
  ),
  ...(
    !!BackendServicesManager.getServiceEnv(KnownBackendService.GROUPS) &&
    { FEATURE_DOCUMENT_TYPES_GROUPS: BoolSwitch }
  ),
  ...(
    !!BackendServicesManager.getServiceEnv(KnownBackendService.FILES_BATCH) &&
    { FEATURE_FILES_BATCH: BoolSwitch }
  ),
  FEATURE_DOCUMENT_LAYOUT_EDITING: BoolSwitch,
  FEATURE_FILE_LAYOUT_EDITING: BoolSwitch,
  FEATURE_MARKDOWN_LAYOUT: BoolSwitch,
  FEATURE_PDF_VIEWER: BoolSwitch,
  ...(
    !!BackendServicesManager.getServiceEnv(KnownBackendService.FILES_BATCH) &&
    { FEATURE_PDF_SPLITTING: BoolSwitch }
  ),
  ...(
    !!BackendServicesManager.getServiceEnv(KnownBackendService.AI_FUSION) &&
    {
      FEATURE_LLM_EXTRACTORS: BoolSwitch,
      FEATURE_PROMPT_CALIBRATION_STUDIO: BoolSwitch,
    }
  ),
  FEATURE_BULK_RETRY_PREVIOUS_STEP: BoolSwitch,
  FEATURE_ENTITIES_UPLOAD: BoolSwitch,
  FEATURE_DOCUMENT_TYPE_IMPORT_EXPORT: BoolSwitch,
  FEATURE_FILES: BoolSwitch,
  FEATURE_AGENTIC_DOCUMENT_PROCESSING: BoolSwitch,
  FEATURE_PER_FIELD_VALIDATION: BoolSwitch,
})

export const getDefaultEnvs = () => Object.keys(getEnvToRender()).reduce((a, envName) => ({
  ...a,
  [envName]: (
    BackendServicesManager.getFeatureEnv(envName) ?? getStaticEnvValue(envName)
  ),
}), {})

export const getInitialLocalEnvs = () => {
  const defaultEnvs = getDefaultEnvs()
  const storedEnvs = localStorageWrapper.getItem(UI_ENV_SETTINGS)

  if (!storedEnvs) {
    return defaultEnvs
  }

  return Object.keys(defaultEnvs).reduce((acc, key) => ({
    ...acc,
    [key]: storedEnvs[key] !== undefined ? storedEnvs[key] : defaultEnvs[key],
  }), {})
}
