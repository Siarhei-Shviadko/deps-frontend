
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen } from '@testing-library/dom'
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { fetchDocumentType } from '@/actions/documentType'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { ExtractionType } from '@/enums/ExtractionType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { DocumentType } from '@/models/DocumentType'
import { GenAiClassifier } from '@/models/DocumentTypesGroup'
import { ExtendedDocumentType } from '@/models/ExtendedDocumentType'
import { documentTypeStateSelector } from '@/selectors/documentType'
import { documentTypesStateSelector } from '@/selectors/documentTypes'
import { render } from '@/utils/rendererRTL'
import { GenAiClassifierForm } from './GenAiClassifierForm'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-hook-form', () => mockReactHookForm)

jest.mock('@/selectors/documentType')
jest.mock('@/selectors/documentTypes')
jest.mock('@/selectors/requests')

jest.mock('@/components/Icons/AngleDownIcon', () => ({
  AngleDownIcon: () => <div data-testid={'carousel-control'} />,
}))

const mockAction = { type: 'action' }

jest.mock('@/actions/documentType', () => ({
  fetchDocumentType: jest.fn(() => mockAction),
}))

jest.mock('@/apiRTK/LLMsApi', () => ({
  useFetchLLMsQuery: jest.fn(() => ({
    data: [],
    isFetching: false,
    isError: false,
  })),
}))

jest.mock('react-hook-form', () => ({
  ...mockReactHookForm,
  useFormContext: jest.fn(() => ({
    reset: mockReset,
    setValue: mockSetValue,
    handleSubmit: jest.fn(),
  })),
}))

const mockReset = jest.fn()
const mockSetValue = jest.fn()

const mockDocTypeId1 = 'id1'
const mockDocTypeId2 = 'id2'

const mockDocType1 = new DocumentType(
  mockDocTypeId1,
  'Doc Type Name 1',
  KnownProcessingEngines.TESSERACT,
  KnownLanguage.ENGLISH,
  ExtractionType.TEMPLATE,
)
const mockDocType2 = new DocumentType(
  mockDocTypeId2,
  'Doc Type Name 2',
  KnownProcessingEngines.TESSERACT,
  KnownLanguage.ENGLISH,
  ExtractionType.TEMPLATE,
)

const mockGenAiClassifier = new GenAiClassifier({
  genAiClassifierId: 'genAiClassifierId1',
  documentTypeId: mockDocTypeId1,
  name: 'Classifier Name',
  llmType: 'Test Classifier Llm',
  prompt: 'Test Classifier Prompt',
})

documentTypesStateSelector.mockReturnValue({
  mockDocTypeId1: mockDocType1,
  mockDocTypeId2: mockDocType2,
})

documentTypeStateSelector.mockReturnValue(
  new ExtendedDocumentType({
    code: mockDocTypeId1,
    name: 'Doc Type Name',
    classifiers: {
      genAiClassifiers: [mockGenAiClassifier],
    },
  }),
)

test('shows all form fields and labels', () => {
  const props = {
    groupDocumentTypeIds: [mockDocTypeId1, mockDocTypeId2],
    groupGenAiClassifiers: [],
    onSubmit: jest.fn(),
    setCurrentDocumentTypeId: jest.fn(),
    currentDocumentTypeId: mockDocTypeId1,
    initialDocumentTypeId: mockDocTypeId1,
  }

  render(<GenAiClassifierForm {...props} />)

  const expectedLabels = [
    localize(Localization.DOCUMENT_TYPE),
    localize(Localization.SET_CLASSIFIER_FROM_ANOTHER_GROUP),
    localize(Localization.NAME),
    localize(Localization.LLM_TYPE),
    localize(Localization.PROMPT),
  ]

  const [docTypeField] = screen.getAllByDisplayValue(mockDocType1.name)
  const setClassifierFromAnotherGroupField = screen.getByText(localize(Localization.SELECT_CLASSIFIER))
  const setClassifierFromAnotherGroupHint = screen.getByText(localize(Localization.SET_CLASSIFIER_FROM_ANOTHER_GROUP_HINT))
  const nameField = screen.getByPlaceholderText(localize(Localization.NAME_PLACEHOLDER))
  const llmTypeField = screen.getByText(localize(Localization.SELECT_LLM_TYPE))
  const promptField = screen.getByPlaceholderText(localize(Localization.PROMPT_PLACEHOLDER))

  expect(docTypeField).toBeInTheDocument()
  expect(setClassifierFromAnotherGroupField).toBeInTheDocument()
  expect(setClassifierFromAnotherGroupHint).toBeInTheDocument()
  expect(nameField).toBeInTheDocument()
  expect(llmTypeField).toBeInTheDocument()
  expect(promptField).toBeInTheDocument()

  expectedLabels.forEach((label) => {
    expect(screen.getByText(label)).toBeInTheDocument()
  })
})

test('resets form and calls setCurrentDocumentTypeId prop on doc type change', async () => {
  const mockSetCurrentDocumentTypeId = jest.fn()
  const props = {
    groupDocumentTypeIds: [mockDocTypeId1, mockDocTypeId2],
    groupGenAiClassifiers: [],
    onSubmit: jest.fn(),
    setCurrentDocumentTypeId: mockSetCurrentDocumentTypeId,
    currentDocumentTypeId: mockDocTypeId1,
    initialDocumentTypeId: mockDocTypeId1,
  }

  render(<GenAiClassifierForm {...props} />)

  const [prevButton] = screen.getAllByTestId('carousel-control')

  await userEvent.click(prevButton)

  expect(mockReset).toHaveBeenCalled()
  expect(mockSetCurrentDocumentTypeId).nthCalledWith(1, mockDocTypeId2)
})

test('does not allow to select doc type if classifier prop is provided', async () => {
  const mockSetCurrentDocumentTypeId = jest.fn()
  const props = {
    groupDocumentTypeIds: [mockDocTypeId1, mockDocTypeId2],
    groupGenAiClassifiers: [],
    onSubmit: jest.fn(),
    setCurrentDocumentTypeId: mockSetCurrentDocumentTypeId,
    currentDocumentTypeId: mockDocTypeId1,
    initialDocumentTypeId: mockDocTypeId1,
    classifier: mockGenAiClassifier,
  }

  render(<GenAiClassifierForm {...props} />)

  const controlButtons = screen.queryAllByTestId('carousel-control')
  expect(controlButtons).toHaveLength(0)
})

test('fills in forms fields with classifier`s values if classifier from another group was selected', async () => {
  const props = {
    groupDocumentTypeIds: [mockDocTypeId1, mockDocTypeId2],
    groupGenAiClassifiers: [],
    onSubmit: jest.fn(),
    setCurrentDocumentTypeId: jest.fn(),
    currentDocumentTypeId: mockDocTypeId1,
    initialDocumentTypeId: mockDocTypeId1,
  }

  render(<GenAiClassifierForm {...props} />)

  const setClassifierFromAnotherGroupField = screen.getByText(localize(Localization.SELECT_CLASSIFIER))
  await userEvent.click(setClassifierFromAnotherGroupField)

  const option = screen.getByText(mockGenAiClassifier.name)

  await userEvent.click(option, {
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  })

  const options = {
    shouldValidate: true,
    shouldDirty: true,
  }

  expect(mockSetValue).toHaveBeenCalledTimes(3)
  expect(mockSetValue).toHaveBeenCalledWith('name', mockGenAiClassifier.name, options)
  expect(mockSetValue).toHaveBeenCalledWith('llmType', mockGenAiClassifier.llmType, options)
  expect(mockSetValue).toHaveBeenCalledWith('prompt', mockGenAiClassifier.prompt, options)
})

test('calls fetchDocumentType with correct document type id', async () => {
  jest.clearAllMocks()

  const props = {
    groupDocumentTypeIds: [mockDocTypeId1, mockDocTypeId2],
    groupGenAiClassifiers: [],
    onSubmit: jest.fn(),
    setCurrentDocumentTypeId: jest.fn(),
    currentDocumentTypeId: mockDocTypeId1,
    initialDocumentTypeId: mockDocTypeId1,
  }

  render(<GenAiClassifierForm {...props} />)

  expect(fetchDocumentType).nthCalledWith(1, mockDocTypeId1, [
    DocumentTypeExtras.CLASSIFIERS,
  ])
})
