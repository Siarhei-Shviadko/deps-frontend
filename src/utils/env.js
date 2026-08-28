import { UI_ENV_SETTINGS } from '@/constants/storage'
import { BackendServicesManager } from '@/services/BackendServicesManager'
import { localStorageWrapper } from '@/utils/localStorageWrapper'

export const getStaticEnvValue = (name) => {
  const value = window._env_?.[name] ?? staticEnv?.[name]

  if (typeof value === 'string' && value.includes(',')) {
    return value.split(',').filter(Boolean)
  }

  return value
}

export const getEnvValue = (name) => {
  const uiEnvSettings = localStorageWrapper.getItem(UI_ENV_SETTINGS)
  const relatedFeature = BackendServicesManager.getFeatureEnv(name)
  return relatedFeature ?? uiEnvSettings?.[name] ?? getStaticEnvValue(name)
}

const handler = {
  get (_target, property) {
    return getEnvValue(property)
  },
}

const ENV = new Proxy({}, handler)

export {
  ENV,
}
