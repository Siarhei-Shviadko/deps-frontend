
import { localize, Localization } from '@/localization/i18n'

const KnownProcessingEngines = {
  GCP_VISION: 'GCP_VISION',
  AWS_TEXTRACT: 'AWS_TEXTRACT',
  AZURE_FORM_RECOGNIZER: 'AZURE_FORM_RECOGNIZER',
  TESSERACT: 'TESSERACT',
  DOCX: 'DOCX',
  EXCEL: 'EXCEL',
  CSV: 'CSV',
  LLAMAINDEX: 'llamaindex',
}

const RESOURCE_PROCESSING_ENGINE = {
  [KnownProcessingEngines.GCP_VISION]: localize(Localization.GCP_DOCUMENT_AI),
  [KnownProcessingEngines.AWS_TEXTRACT]: localize(Localization.AWS_TEXTRACT),
  [KnownProcessingEngines.AZURE_FORM_RECOGNIZER]: localize(Localization.AZURE_DOCUMENT_INTELLIGENCE),
  [KnownProcessingEngines.TESSERACT]: localize(Localization.TESSERACT),
  [KnownProcessingEngines.DOCX]: localize(Localization.DOCX),
  [KnownProcessingEngines.EXCEL]: localize(Localization.EXCEL),
  [KnownProcessingEngines.CSV]: localize(Localization.CSV),
  [KnownProcessingEngines.LLAMAINDEX]: localize(Localization.LLAMAINDEX),
}

export {
  KnownProcessingEngines,
  RESOURCE_PROCESSING_ENGINE,
}
