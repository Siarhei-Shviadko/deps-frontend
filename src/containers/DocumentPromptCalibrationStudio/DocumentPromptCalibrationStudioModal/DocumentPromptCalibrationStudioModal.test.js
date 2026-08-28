
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {
  getDocumentState,
  highlightPolygonCoordsField,
  highlightTableCoordsField,
} from '@/actions/documentReviewPage'
import { extractData } from '@/actions/documents'
import { fetchDocumentType } from '@/actions/documentType'
import { DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY, UiKeys } from '@/constants/navigation'
import { DocumentState } from '@/enums/DocumentState'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { ExtractionType } from '@/enums/ExtractionType'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { useQueryParams } from '@/hooks/useQueryParams'
import { Localization, localize } from '@/localization/i18n'
import { Document } from '@/models/Document'
import { DocumentType } from '@/models/DocumentType'
import {
  documentSelector,
  documentTypeSelector,
  highlightedFieldSelector,
} from '@/selectors/documentReviewPage'
import { uiSelector } from '@/selectors/navigation'
import {
  isDocumentDataFetchingSelector,
  isDocumentTypeFetchingSelector,
} from '@/selectors/requests'
import { notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { DocumentPromptCalibrationStudioModal } from './DocumentPromptCalibrationStudioModal'

const mockSetQueryParams = jest.fn()
const mockDispatch = jest.fn((action) => action)

var MockDocumentPreview

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('@/selectors/documentReviewPage')
jest.mock('@/selectors/navigation')
jest.mock('@/selectors/requests')
jest.mock('@/actions/documentReviewPage')
jest.mock('@/actions/documents')
jest.mock('react-redux', () => mockReactRedux)

jest.mock('@/actions/documentType', () => ({
  fetchDocumentType: jest.fn(),
}))

const mockManageDocumentType = jest.fn(() => Promise.resolve())

jest.mock('@/containers/PromptCalibrationStudio/hooks', () => ({
  useManageDocumentType: jest.fn(() => ({
    manageDocumentType: mockManageDocumentType,
    isManaging: false,
  })),
}))

jest.mock('@/containers/PromptCalibrationStudio', () => {
  const actual = jest.requireActual('@/containers/PromptCalibrationStudio')

  return {
    ...actual,
    ...mockShallowComponent('PromptCalibrationStudio'),
  }
})

jest.mock('@/containers/DocumentPreview', () => {
  const mock = mockShallowComponent('DocumentPreview')
  MockDocumentPreview = mock.DocumentPreview
  return mock
})

jest.mock('@/hooks/useQueryParams', () => ({
  useQueryParams: jest.fn(() => ({
    queryParams: {},
    setQueryParams: mockSetQueryParams,
  })),
}))

let defaultProps

beforeEach(() => {
  jest.clearAllMocks()

  mockDispatch.mockImplementation((action) => action)
  mockReactRedux.useDispatch.mockReturnValue(mockDispatch)

  highlightPolygonCoordsField.mockReturnValue({ type: 'HIGHLIGHT_POLYGON_COORDS_FIELD' })
  highlightTableCoordsField.mockReturnValue({ type: 'HIGHLIGHT_TABLE_COORDS_FIELD' })
  getDocumentState.mockReturnValue({ type: 'GET_DOCUMENT_STATE' })
  extractData.mockReturnValue({ type: 'EXTRACT_DATA' })

  documentSelector.mockReturnValue(
    new Document({
      id: 'mock-document-id',
      state: DocumentState.IN_REVIEW,
      extractedData: [],
    }),
  )

  const mockDocumentType = new DocumentType(
    'mock-document-type',
    'Mock Document Type',
    'mock-engine-code',
    'mock-language-code',
    ExtractionType.ML,
    [],
    'mock-document-type-id',
  )

  mockDocumentType.llmExtractors = []
  documentTypeSelector.mockReturnValue(mockDocumentType)
  highlightedFieldSelector.mockReturnValue(null)
  isDocumentDataFetchingSelector.mockReturnValue(false)
  isDocumentTypeFetchingSelector.mockReturnValue(false)

  uiSelector.mockReturnValue({
    [UiKeys.ACTIVE_PAGE]: 1,
    [UiKeys.ACTIVE_SOURCE_ID]: 'mock-source-id',
  })

  useQueryParams.mockReturnValue({
    queryParams: {},
    setQueryParams: mockSetQueryParams,
  })

  mockEnv.ENV = {
    ...mockEnv.ENV,
    FEATURE_PROMPT_CALIBRATION_STUDIO_MODEL: 'test-model',
    FEATURE_PROMPT_CALIBRATION_STUDIO_TOP_P: 0.9,
    FEATURE_PROMPT_CALIBRATION_STUDIO_TEMPERATURE: 0.7,
    FEATURE_PROMPT_CALIBRATION_STUDIO_GROUPING_FACTOR: 5,
  }

  defaultProps = {}
})

test('renders nothing when query param is not set', () => {
  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  expect(screen.queryByTestId('PromptCalibrationStudio')).not.toBeInTheDocument()
})

test('renders modal when query param is set', () => {
  useQueryParams.mockReturnValue({
    queryParams: { [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: 1 },
    setQueryParams: mockSetQueryParams,
  })

  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  expect(screen.getByTestId('PromptCalibrationStudio')).toBeInTheDocument()
  expect(screen.getByTestId('DocumentPreview')).toBeInTheDocument()
})

test('renders correct layout with correct props when modal is visible', () => {
  useQueryParams.mockReturnValue({
    queryParams: { [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: 1 },
    setQueryParams: mockSetQueryParams,
  })

  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  expect(MockDocumentPreview).toHaveBeenCalledWith(
    expect.objectContaining({
      activePage: 1,
      activeSourceId: 'mock-source-id',
      document: expect.any(Document),
      fetching: false,
      highlightedField: null,
      onChangeActiveExcelPage: expect.any(Function),
      onChangeActiveImagePage: expect.any(Function),
    }),
    expect.anything(),
  )
})

test('closes modal when close button is clicked', async () => {
  useQueryParams.mockReturnValue({
    queryParams: { [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: 1 },
    setQueryParams: mockSetQueryParams,
  })

  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  const closeButton = screen.getByText(localize(Localization.CLOSE_STUDIO))
  await userEvent.click(closeButton)

  expect(mockSetQueryParams).toHaveBeenCalledWith({
    [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: undefined,
  })
})

test('passes onChangeActiveImagePage callback to DocumentPreview', () => {
  useQueryParams.mockReturnValue({
    queryParams: { [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: 1 },
    setQueryParams: mockSetQueryParams,
  })

  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  const documentPreviewProps = MockDocumentPreview.mock.calls[0][0]
  documentPreviewProps.onChangeActiveImagePage(5)

  expect(mockDispatch).toHaveBeenCalledWith({ type: 'HIGHLIGHT_POLYGON_COORDS_FIELD' })
  expect(highlightPolygonCoordsField).toHaveBeenCalledWith({ page: 5 })
})

test('passes onChangeActiveExcelPage callback to DocumentPreview', () => {
  useQueryParams.mockReturnValue({
    queryParams: { [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: 1 },
    setQueryParams: mockSetQueryParams,
  })

  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  const documentPreviewProps = MockDocumentPreview.mock.calls[0][0]
  documentPreviewProps.onChangeActiveExcelPage(3)

  expect(mockDispatch).toHaveBeenCalledWith({ type: 'HIGHLIGHT_TABLE_COORDS_FIELD' })
  expect(highlightTableCoordsField).toHaveBeenCalledWith({ page: 3 })
})

test('renders SaveDocumentTypeModal with correct props', () => {
  useQueryParams.mockReturnValue({
    queryParams: { [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: 1 },
    setQueryParams: mockSetQueryParams,
  })

  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  const editDocumentTypeModal = screen.getByText(localize(Localization.SAVE_DOCUMENT_TYPE))

  expect(editDocumentTypeModal).toBeInTheDocument()
})

test('renders spinner when document type is fetching', () => {
  useQueryParams.mockReturnValue({
    queryParams: { [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: 1 },
    setQueryParams: mockSetQueryParams,
  })

  isDocumentTypeFetchingSelector.mockReturnValue(true)

  jest.spyOn(React, 'useState')
    .mockImplementationOnce(() => [false, jest.fn()])
    .mockImplementationOnce(() => [null, jest.fn()])
    .mockImplementationOnce(() => [false, jest.fn()])

  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  const promptCalibrationStudio = screen.queryByTestId('PromptCalibrationStudio')
  const documentPreview = screen.queryByTestId('DocumentPreview')

  expect(promptCalibrationStudio).not.toBeInTheDocument()
  expect(documentPreview).not.toBeInTheDocument()
})

test('renders content when document type is not fetching', () => {
  useQueryParams.mockReturnValue({
    queryParams: { [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: 1 },
    setQueryParams: mockSetQueryParams,
  })

  isDocumentTypeFetchingSelector.mockReturnValue(false)

  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  expect(screen.getByTestId('PromptCalibrationStudio')).toBeInTheDocument()
  expect(screen.getByTestId('DocumentPreview')).toBeInTheDocument()
})

test('calls fetchDocumentType after manage document type success', async () => {
  jest.clearAllMocks()

  useQueryParams.mockReturnValue({
    queryParams: { [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: 1 },
    setQueryParams: mockSetQueryParams,
  })

  const mockCalibrationValues = {
    fields: [{
      id: 'field-1',
      name: 'Test Field',
    }],
    extractors: [],
  }

  jest.spyOn(React, 'useState')
    .mockImplementationOnce(() => [true, jest.fn()])
    .mockImplementationOnce(() => [mockCalibrationValues, jest.fn()])
    .mockImplementationOnce(() => [true, jest.fn()])

  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  const confirmButton = screen.getByText(localize(Localization.CONFIRM))
  await userEvent.click(confirmButton)

  expect(mockManageDocumentType).toHaveBeenCalledWith(
    expect.objectContaining({
      documentTypeId: 'mock-document-type',
      documentTypeName: 'Mock Document Type',
      fields: mockCalibrationValues.fields,
      extractors: mockCalibrationValues.extractors,
    }),
  )

  expect(fetchDocumentType).toHaveBeenCalledWith(
    'mock-document-type',
    [
      DocumentTypeExtras.EXTRACTION_FIELDS,
      DocumentTypeExtras.LLM_EXTRACTORS,
    ],
  )
})

test('calls extractData and getDocumentState when needsReExtraction is true', async () => {
  jest.clearAllMocks()

  useQueryParams.mockReturnValue({
    queryParams: { [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: 1 },
    setQueryParams: mockSetQueryParams,
  })

  const mockCalibrationValues = {
    fields: [{
      id: 'field-1',
      name: 'Test Field',
    }],
    extractors: [],
  }

  const mockSetIsEditDocumentTypeModalVisible = jest.fn()

  jest.spyOn(React, 'useState')
    .mockImplementationOnce(() => [true, mockSetIsEditDocumentTypeModalVisible])
    .mockImplementationOnce(() => [mockCalibrationValues, jest.fn()])
    .mockImplementationOnce(() => [true, jest.fn()])

  const mockDocument = new Document({
    id: 'mock-document-id',
    state: DocumentState.IN_REVIEW,
    extractedData: [],
    engine: KnownProcessingEngines.TESSERACT,
  })

  documentSelector.mockReturnValue(mockDocument)

  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  const editButton = screen.getByRole('button', {
    name: localize(Localization.SAVE_DOCUMENT_TYPE),
  })
  await userEvent.click(editButton)

  const confirmButton = screen.getByText(localize(Localization.CONFIRM))
  await userEvent.click(confirmButton)

  expect(mockManageDocumentType).toHaveBeenCalled()

  expect(extractData).toHaveBeenCalledWith(
    ['mock-document-id'],
    KnownProcessingEngines.TESSERACT,
  )

  expect(getDocumentState).toHaveBeenCalledWith('mock-document-id')

  expect(mockSetIsEditDocumentTypeModalVisible).toHaveBeenCalledWith(false)
})

test('does not call extractData when needsReExtraction is false', async () => {
  jest.clearAllMocks()

  useQueryParams.mockReturnValue({
    queryParams: { [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: 1 },
    setQueryParams: mockSetQueryParams,
  })

  const mockCalibrationValues = {
    fields: [{
      id: 'field-1',
      name: 'Test Field',
    }],
    extractors: [],
  }

  const mockSetIsEditDocumentTypeModalVisible = jest.fn()

  jest.spyOn(React, 'useState')
    .mockImplementationOnce(() => [true, mockSetIsEditDocumentTypeModalVisible])
    .mockImplementationOnce(() => [mockCalibrationValues, jest.fn()])
    .mockImplementationOnce(() => [true, jest.fn()])

  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  const editButton = screen.getByRole('button', {
    name: localize(Localization.SAVE_DOCUMENT_TYPE),
  })
  await userEvent.click(editButton)

  const checkbox = screen.getByRole('checkbox')
  await userEvent.click(checkbox)

  const confirmButton = screen.getByText(localize(Localization.CONFIRM))
  await userEvent.click(confirmButton)

  expect(mockManageDocumentType).toHaveBeenCalled()
  expect(extractData).not.toHaveBeenCalled()
  expect(getDocumentState).not.toHaveBeenCalled()
})

test('shows error notification when extractData fails', async () => {
  jest.clearAllMocks()

  useQueryParams.mockReturnValue({
    queryParams: { [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: 1 },
    setQueryParams: mockSetQueryParams,
  })

  const mockCalibrationValues = {
    fields: [{
      id: 'field-1',
      name: 'Test Field',
    }],
    extractors: [],
  }

  const mockSetIsEditDocumentTypeModalVisible = jest.fn()

  jest.spyOn(React, 'useState')
    .mockImplementationOnce(() => [true, mockSetIsEditDocumentTypeModalVisible])
    .mockImplementationOnce(() => [mockCalibrationValues, jest.fn()])
    .mockImplementationOnce(() => [true, jest.fn()])

  const mockError = new Error('Extract data failed')
  mockDispatch.mockImplementation((action) => {
    if (action && action.type === 'EXTRACT_DATA') {
      return Promise.reject(mockError)
    }
    return Promise.resolve(action)
  })

  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  const editButton = screen.getByRole('button', {
    name: localize(Localization.SAVE_DOCUMENT_TYPE),
  })
  await userEvent.click(editButton)

  const confirmButton = screen.getByText(localize(Localization.CONFIRM))
  await userEvent.click(confirmButton)

  expect(notifyWarning).toHaveBeenCalledWith(localize(Localization.DEFAULT_ERROR))
})

test('uses default engine when document engine is not set', async () => {
  jest.clearAllMocks()

  useQueryParams.mockReturnValue({
    queryParams: { [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: 1 },
    setQueryParams: mockSetQueryParams,
  })

  const mockCalibrationValues = {
    fields: [{
      id: 'field-1',
      name: 'Test Field',
    }],
    extractors: [],
  }

  const mockSetIsEditDocumentTypeModalVisible = jest.fn()

  jest.spyOn(React, 'useState')
    .mockImplementationOnce(() => [true, mockSetIsEditDocumentTypeModalVisible])
    .mockImplementationOnce(() => [mockCalibrationValues, jest.fn()])
    .mockImplementationOnce(() => [true, jest.fn()])

  const mockDocument = new Document({
    id: 'mock-document-id',
    state: DocumentState.IN_REVIEW,
    extractedData: [],
    engine: null,
  })

  documentSelector.mockReturnValue(mockDocument)

  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  const editButton = screen.getByRole('button', {
    name: localize(Localization.SAVE_DOCUMENT_TYPE),
  })
  await userEvent.click(editButton)

  const confirmButton = screen.getByText(localize(Localization.CONFIRM))
  await userEvent.click(confirmButton)

  expect(extractData).toHaveBeenCalledWith(
    ['mock-document-id'],
    KnownProcessingEngines.TESSERACT,
  )
})

test('disables EditDocumentTypeModal when calibrationValues.fields.length is 0', () => {
  useQueryParams.mockReturnValue({
    queryParams: { [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: 1 },
    setQueryParams: mockSetQueryParams,
  })

  const mockCalibrationValues = {
    fields: [],
    extractors: [],
  }

  jest.spyOn(React, 'useState')
    .mockImplementationOnce(() => [false, jest.fn()])
    .mockImplementationOnce(() => [mockCalibrationValues, jest.fn()])
    .mockImplementationOnce(() => [true, jest.fn()])

  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  const editButton = screen.getByRole('button', {
    name: localize(Localization.SAVE_DOCUMENT_TYPE),
  })

  expect(editButton).toBeDisabled()
})

test('disables EditDocumentTypeModal when calibrationValues.calibrationMode is provided', () => {
  useQueryParams.mockReturnValue({
    queryParams: { [DOCUMENT_PROMPT_CALIBRATION_STUDIO_QUERY_KEY]: 1 },
    setQueryParams: mockSetQueryParams,
  })

  const mockCalibrationValues = {
    fields: [{
      id: 'field-1',
      name: 'Test Field',
    }],
    extractors: [],
    calibrationMode: 'test-mode',
  }

  jest.spyOn(React, 'useState')
    .mockImplementationOnce(() => [false, jest.fn()])
    .mockImplementationOnce(() => [mockCalibrationValues, jest.fn()])
    .mockImplementationOnce(() => [true, jest.fn()])

  render(<DocumentPromptCalibrationStudioModal {...defaultProps} />)

  const editButton = screen.getByRole('button', {
    name: localize(Localization.SAVE_DOCUMENT_TYPE),
  })

  expect(editButton).toBeDisabled()
})
