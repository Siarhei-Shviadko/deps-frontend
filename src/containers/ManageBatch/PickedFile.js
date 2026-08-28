
import PropTypes from 'prop-types'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'

class FileSettings {
  constructor (engine, documentType, llmType, parsingFeatures = []) {
    this.engine = engine
    this.documentType = documentType
    this.llmType = llmType
    this.parsingFeatures = parsingFeatures
  }
}

class PickedFile {
  constructor (file, settings) {
    this.file = file
    this.settings = new FileSettings(
      settings?.engine,
      settings?.documentType,
      settings?.llmType,
      settings?.parsingFeatures,
    )
  }
}

const fileSettingsShape = PropTypes.shape({
  engine: PropTypes.oneOf(Object.values(KnownProcessingEngines)),
  documentType: PropTypes.string,
  llmType: PropTypes.string,
  parsingFeatures: PropTypes.arrayOf(
    PropTypes.oneOf(Object.values(KnownParsingFeature)),
  ),
})

const pickedFileShape = PropTypes.shape({
  file: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.instanceOf(File),
  ]).isRequired,
  settings: fileSettingsShape.isRequired,
})

export {
  PickedFile,
  FileSettings,
  fileSettingsShape,
  pickedFileShape,
}
