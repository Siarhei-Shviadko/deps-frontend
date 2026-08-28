
import PropTypes from 'prop-types'
import { SelectOption } from '@/components/Select'
import { KnownProcessingEngines, RESOURCE_PROCESSING_ENGINE } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { ENV } from '@/utils/env'

class Engine {
  constructor (code, name) {
    this.code = code
    this.name = name
  }

  static toOption = (engine) => ({
    value: engine.code,
    text: engine.name,
  })

  static getAvailableEngines = (engines) => {
    const hiddenEngines = ENV.FEATURE_HIDDEN_ENGINES || []
    return engines.filter((e) => !hiddenEngines.includes(e.code))
  }

  static toAllEnginesOptions = (apiEngines, excludedEngines = []) => {
    const availableEngines = Engine.getAvailableEngines(apiEngines)
    const engines = availableEngines.filter((e) => !excludedEngines.includes(e.code))

    return engines.map((e) =>
      new SelectOption(
        e.code,
        e.name,
        null,
      ),
    )
  }

  static toAllEnginesOptionsWithDefault = (apiEngines, defaultEngine) => {
    return Engine.toAllEnginesOptions(apiEngines)
      .map((engine) => {
        if (engine.value === defaultEngine) {
          return {
            ...engine,
            text: localize(Localization.DEFAULT_VALUE, { value: engine.text }),
          }
        }
        return engine
      })
  }

  static toAllEngines = () => {
    return Object.values(KnownProcessingEngines).map((engineCode) =>
      new Engine(
        engineCode,
        RESOURCE_PROCESSING_ENGINE[engineCode],
      ),
    )
  }

  static isDisabled = (availableEngines, engineCode) => !availableEngines.find((e) => e.code === engineCode)
}

const engineShape = PropTypes.shape({
  code: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
})

export {
  Engine,
  engineShape,
}
