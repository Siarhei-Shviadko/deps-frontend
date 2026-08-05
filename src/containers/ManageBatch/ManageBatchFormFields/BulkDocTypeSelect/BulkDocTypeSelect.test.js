
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FIELD_FORM_CODE } from '@/containers/ManageBatch/constants'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { DocumentType } from '@/models/DocumentType'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { areTypesFetchingSelector } from '@/selectors/requests'
import { render } from '@/utils/rendererRTL'
import { BulkDocTypeSelect } from './BulkDocTypeSelect'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/selectors/documentTypesListPage')
jest.mock('@/selectors/requests')
jest.mock('react-redux', () => mockReactRedux)

jest.mock('@/components/Select', () => ({
  CustomSelect: ({ options, onChange, disabled }) => (
    <select
      data-testid="CustomSelect"
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {
        options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
          >
            {opt.text}
          </option>
        ))
      }
    </select>
  ),
}))

const mockSetValue = jest.fn()
const mockResetField = jest.fn()
const mockGetValues = jest.fn((key) => {
  if (key === FIELD_FORM_CODE.FILES) {
    return []
  }
  if (key === FIELD_FORM_CODE.DOCUMENT_TYPE) {
    return 'code1'
  }
  if (key === FIELD_FORM_CODE.ENGINE) {
    return 'engine1'
  }
  if (key === FIELD_FORM_CODE.LLM_TYPE) {
    return 'llmA'
  }
  if (key === FIELD_FORM_CODE.PARSING_FEATURES) {
    return []
  }
  return undefined
})

jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn(() => ({
    setValue: mockSetValue,
    resetField: mockResetField,
    getValues: mockGetValues,
  })),
  useWatch: jest.fn(() => undefined),
}))

beforeEach(() => {
  jest.clearAllMocks()
  areTypesFetchingSelector.mockReturnValue(false)
})

test('renders DocTypeSelect with enhanced onChange', () => {
  render(
    <BulkDocTypeSelect
      onChange={jest.fn()}
    />,
  )

  expect(screen.getByTestId('CustomSelect')).toBeInTheDocument()
})

test('calls original onChange and sets engine and parsing features when document type has them', async () => {
  const onChange = jest.fn()
  const docType = new DocumentType(
    'code1',
    'Type 1',
    'engine1',
    'en',
    undefined,
    [],
    'id1',
  )
  documentTypesSelector.mockReturnValue([docType])

  render(<BulkDocTypeSelect onChange={onChange} />)

  await userEvent.selectOptions(screen.getByTestId('CustomSelect'), 'code1')

  expect(onChange).toHaveBeenCalledWith('code1')
  expect(mockSetValue).toHaveBeenCalledWith(FIELD_FORM_CODE.ENGINE, 'engine1')
  expect(mockSetValue).toHaveBeenCalledWith(
    FIELD_FORM_CODE.PARSING_FEATURES,
    [KnownParsingFeature.TEXT],
  )
})

test('calls original onChange and resets engine and parsing features when document type does not have them', async () => {
  const onChange = jest.fn()
  const docType = new DocumentType(
    'code2',
    'Type 2',
    undefined,
    'en',
    undefined,
    [],
    'id2',
  )
  documentTypesSelector.mockReturnValue([docType])

  render(<BulkDocTypeSelect onChange={onChange} />)

  await userEvent.selectOptions(screen.getByTestId('CustomSelect'), 'code2')

  expect(onChange).toHaveBeenCalledWith('code2')
  expect(mockSetValue).toHaveBeenCalledWith(FIELD_FORM_CODE.ENGINE, undefined)
  expect(mockSetValue).toHaveBeenCalledWith(
    FIELD_FORM_CODE.PARSING_FEATURES,
    [KnownParsingFeature.TEXT],
  )
})

test('sets engine and parsing features from workflowConfiguration when document type has it', async () => {
  const onChange = jest.fn()
  const docType = new DocumentType(
    'code1',
    'Type 1',
    'defaultEngine',
    'en',
    undefined,
    [],
    'id1',
  )
  docType.workflowConfiguration = {
    engine: 'workflowEngine',
    parsingFeatures: [KnownParsingFeature.TEXT, KnownParsingFeature.IMAGES],
  }
  documentTypesSelector.mockReturnValue([docType])

  render(<BulkDocTypeSelect onChange={onChange} />)

  await userEvent.selectOptions(screen.getByTestId('CustomSelect'), 'code1')

  expect(onChange).toHaveBeenCalledWith('code1')
  expect(mockSetValue).toHaveBeenCalledWith(FIELD_FORM_CODE.ENGINE, 'workflowEngine')
  expect(mockSetValue).toHaveBeenCalledWith(
    FIELD_FORM_CODE.PARSING_FEATURES,
    [KnownParsingFeature.TEXT, KnownParsingFeature.IMAGES],
  )
})
