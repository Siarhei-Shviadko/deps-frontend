
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen } from '@testing-library/react'
import { useWatch } from 'react-hook-form'
import { fetchDocumentTypes } from '@/actions/documentTypes'
import { fetchProcessingEngines } from '@/actions/engines'
import { FIELD_FORM_CODE } from '@/containers/UploadDocumentsDrawer/constants'
import { AuthType } from '@/enums/AuthType'
import { Localization, localize } from '@/localization/i18n'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { processingEnginesSelector } from '@/selectors/engines'
import { ENV } from '@/utils/env'
import { render } from '@/utils/rendererRTL'
import { DocumentSettingsForm } from './DocumentSettingsForm'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/selectors/requests')
jest.mock('@/selectors/engines')
jest.mock('@/selectors/documentTypesListPage')

jest.mock('@/components/Form', () => ({
  ...jest.requireActual('@/components/Form'),
  FormItem: (props) => (
    <div data-testid={`form-item-${props.field?.code}`}>
      {props.label}
      Form Item
    </div>
  ),
}))

jest.mock('react-hook-form', () => ({
  ...mockReactHookForm,
  useWatch: jest.fn(() => false),
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/actions/engines', () => ({
  fetchProcessingEngines: jest.fn(),
}))

jest.mock('@/actions/documentTypes', () => ({
  fetchDocumentTypes: jest.fn(),
}))

const mockDispatch = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders should classify field when form is rendered', () => {
  render(<DocumentSettingsForm />)

  const shouldClassify = screen.getByTestId(`form-item-${FIELD_FORM_CODE.SHOULD_CLASSIFY}`)
  expect(shouldClassify).toBeInTheDocument()
  expect(shouldClassify).toHaveTextContent(localize(Localization.CLASSIFICATION))
})

test('renders document type select field when form is rendered', () => {
  render(<DocumentSettingsForm />)

  const documentTypeField = screen.getByTestId(`form-item-${FIELD_FORM_CODE.DOCUMENT_TYPE}`)
  expect(documentTypeField).toBeInTheDocument()
  expect(documentTypeField).toHaveTextContent(localize(Localization.DOCUMENT_TYPE))
})

test('renders llm type select field when form is rendered', () => {
  render(<DocumentSettingsForm />)

  const llmField = screen.getByTestId(`form-item-${FIELD_FORM_CODE.LLM_TYPE}`)
  expect(llmField).toBeInTheDocument()
  expect(llmField).toHaveTextContent(localize(Localization.LLM_TYPE))
})

test('do not render llm type select field if FEATURE_LLM_DATA_EXTRACTION is false', () => {
  ENV.FEATURE_LLM_DATA_EXTRACTION = false
  render(<DocumentSettingsForm />)

  const llmField = screen.queryByTestId(`form-item-${FIELD_FORM_CODE.LLM_TYPE}`)
  expect(llmField).not.toBeInTheDocument()

  ENV.FEATURE_LLM_DATA_EXTRACTION = false
})

test('renders labels select field when form is rendered', () => {
  render(<DocumentSettingsForm />)

  const labelsField = screen.getByTestId(`form-item-${FIELD_FORM_CODE.LABELS}`)
  expect(labelsField).toBeInTheDocument()
  expect(labelsField).toHaveTextContent(localize(Localization.LABELS))
})

test('renders assign to me checkbox field when form is rendered and auth type is OIDC', () => {
  ENV.AUTH_TYPE = AuthType.OIDC

  render(<DocumentSettingsForm />)

  expect(screen.getByText(localize(Localization.REVIEWER))).toBeInTheDocument()
  const assignMeField = screen.getByTestId(`form-item-${FIELD_FORM_CODE.ASSIGNED_TO_ME}`)
  expect(assignMeField).toBeInTheDocument()
  expect(assignMeField).toHaveTextContent(localize(Localization.ASSIGN_ME_AS_A_REVIEWER_FOR_DOCUMENTS))

  ENV.AUTH_TYPE = AuthType.NO_AUTH
})

test('renders document types groups select field when form is rendered and should classify is true', () => {
  useWatch.mockReturnValueOnce(true)

  render(<DocumentSettingsForm />)

  const documentTypesGroupsField = screen.getByTestId(`form-item-${FIELD_FORM_CODE.GROUP}`)
  expect(documentTypesGroupsField).toBeInTheDocument()
  expect(documentTypesGroupsField).toHaveTextContent(localize(Localization.GROUP))
})

test('calls fetchProcessingEngines when form is rendered if engines are empty', () => {
  processingEnginesSelector.mockReturnValueOnce([])

  render(<DocumentSettingsForm />)

  expect(mockDispatch).toHaveBeenCalledWith(fetchProcessingEngines())
})

test('calls fetchDocumentTypes when form is rendered if document types are empty', () => {
  documentTypesSelector.mockReturnValueOnce([])

  render(<DocumentSettingsForm />)

  expect(mockDispatch).toHaveBeenCalledWith(fetchDocumentTypes())
})
