
import { FileExtension } from '@/enums/FileExtension'
import { MimeType } from '@/enums/MimeType'

export const PROJECT_CREATION_DATE = '2018-10-03T12:14:02'

export const SYSTEM_EMAIL = 'system@system.com'

export const MOUSE_BUTTON_DETAIL = {
  LEFT: 1,
  WHEEL: 2,
  RIGHT: 3,
}

export const SUPPORTED_EXTENSIONS_DOCUMENTS = [
  FileExtension.JPG,
  FileExtension.JPEG,
  FileExtension.PNG,
  FileExtension.PDF,
  FileExtension.MSG,
  FileExtension.EML,
  FileExtension.XLSX,
  FileExtension.XLS,
  FileExtension.XLSM,
  FileExtension.XLTX,
  FileExtension.XLTM,
  FileExtension.DOCX,
  FileExtension.CSV,
  FileExtension.TIFF,
  FileExtension.TIF,
]

export const SUPPORTED_EXTENSIONS_TEMPLATES = [
  FileExtension.JPG,
  FileExtension.JPEG,
  FileExtension.PNG,
  FileExtension.PDF,
  FileExtension.TIFF,
  FileExtension.TIF,
]

// TODO: 6072
export const SUPPORTED_TEXT_FORMATS = [MimeType.APPLICATION_CSV]

export const TABLE_ACTIONS_COLUMN_WIDTH = '95px'

export const DEFAULT_DATE_FORMAT = '%m/%d/%Y'

export const GEN_AI_PROMPT_MAX_LENGTH = 10_000
