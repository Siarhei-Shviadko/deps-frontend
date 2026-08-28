
import { mockSelector } from '@/mocks/mockSelector'
import { Engine } from '@/models/Engine'

const tableEnginesSelector = mockSelector([
  new Engine('TESSERACT', 'Tesseract'),
  new Engine('GCP_VISION', 'AI Vision'),
  new Engine('AWS_TEXTRACT', 'AWS Textract'),
])

const processingEnginesSelector = mockSelector([
  new Engine('TESSERACT', 'Tesseract'),
  new Engine('GCP_VISION', 'GCP Document AI'),
  new Engine('AWS_TEXTRACT', 'AWS Textract'),
  new Engine('AZURE_FORM_RECOGNIZER', 'Azure Document Intelligence'),
  new Engine('DOCX', 'DOCX'),
  new Engine('EXCEL', 'Excel'),
  new Engine('CSV', 'CSV'),
  new Engine('llamaindex', 'LlamaIndex'),
])

export {
  tableEnginesSelector,
  processingEnginesSelector,
}
