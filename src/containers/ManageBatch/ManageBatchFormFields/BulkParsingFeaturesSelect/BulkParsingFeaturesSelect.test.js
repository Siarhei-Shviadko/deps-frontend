
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFormContext } from 'react-hook-form'
import { FIELD_FORM_CODE } from '@/containers/ManageBatch/constants'
import { KnownParsingFeature as MockKnownParsingFeature } from '@/enums/KnownParsingFeature'
import { render } from '@/utils/rendererRTL'
import { BulkParsingFeaturesSelect } from './BulkParsingFeaturesSelect'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-redux', () => mockReactRedux)
jest.mock('react-hook-form', () => mockReactHookForm)

jest.mock('@/containers/ParsingFeaturesSwitch', () => ({
  ParsingFeaturesSwitch: ({ onChange }) => (
    <div data-testid="ParsingFeaturesSwitch">
      <button
        data-testid="toggle-text"
        onClick={() => onChange(['text'])}
      >
        {MockKnownParsingFeature.TEXT}
      </button>
      <button
        data-testid="toggle-images"
        onClick={() => onChange(['images'])}
      >
        {MockKnownParsingFeature.IMAGES}
      </button>
      <button
        data-testid="toggle-key-value-pairs"
        onClick={() => onChange(['key-value-pairs'])}
      >
        {MockKnownParsingFeature.KEY_VALUE_PAIRS}
      </button>
    </div>
  ),
}))

const mockSetValue = jest.fn()
const mockGetValues = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  useFormContext.mockImplementation(() => ({
    setValue: mockSetValue,
    getValues: mockGetValues,
  }))
})

test('renders ParsingFeaturesSwitch correctly', () => {
  render(
    <BulkParsingFeaturesSelect
      onChange={jest.fn()}
    />,
  )

  expect(screen.getByTestId('ParsingFeaturesSwitch')).toBeInTheDocument()
})

test('calls original onChange and does not update files when no files exist', async () => {
  const onChange = jest.fn()
  mockGetValues.mockImplementation(() => undefined)

  render(<BulkParsingFeaturesSelect onChange={onChange} />)

  const toggleFeature1 = screen.getByTestId('toggle-text')
  await userEvent.click(toggleFeature1)

  expect(onChange).toHaveBeenCalledWith(['text'])
  expect(mockSetValue).not.toHaveBeenCalled()
})

test('updates matching files with the new parsing features', async () => {
  const onChange = jest.fn()
  const currentDocumentType = 'doc1'
  const currentEngine = 'engine1'
  const currentLlmType = 'llmA'
  const currentParsingFeatures = ['feature1', 'feature2']

  const files = [
    {
      settings: {
        documentType: currentDocumentType,
        engine: currentEngine,
        llmType: currentLlmType,
        parsingFeatures: currentParsingFeatures,
      },
    },
    {
      settings: {
        documentType: 'doc2',
        engine: currentEngine,
        llmType: currentLlmType,
        parsingFeatures: currentParsingFeatures,
      },
    },
    {
      settings: {
        documentType: currentDocumentType,
        engine: currentEngine,
        llmType: currentLlmType,
        parsingFeatures: currentParsingFeatures,
      },
    },
  ]

  mockGetValues.mockImplementation((key) => {
    if (key === FIELD_FORM_CODE.FILES) {
      return files
    }
    if (key === FIELD_FORM_CODE.DOCUMENT_TYPE) {
      return currentDocumentType
    }
    if (key === FIELD_FORM_CODE.ENGINE) {
      return currentEngine
    }
    if (key === FIELD_FORM_CODE.LLM_TYPE) {
      return currentLlmType
    }
    if (key === FIELD_FORM_CODE.PARSING_FEATURES) {
      return currentParsingFeatures
    }
    return undefined
  })

  render(<BulkParsingFeaturesSelect onChange={onChange} />)

  const toggleFeature3 = screen.getByTestId('toggle-key-value-pairs')
  await userEvent.click(toggleFeature3)

  const newFeatures = ['key-value-pairs']
  expect(onChange).toHaveBeenCalledWith(newFeatures)
  expect(mockSetValue).toHaveBeenCalledWith(`${FIELD_FORM_CODE.FILES}.0.settings.${FIELD_FORM_CODE.PARSING_FEATURES}`, newFeatures)
  expect(mockSetValue).not.toHaveBeenCalledWith(`${FIELD_FORM_CODE.FILES}.1.settings.${FIELD_FORM_CODE.PARSING_FEATURES}`, newFeatures)
  expect(mockSetValue).toHaveBeenCalledWith(`${FIELD_FORM_CODE.FILES}.2.settings.${FIELD_FORM_CODE.PARSING_FEATURES}`, newFeatures)
})

test('does not update files with different document type', async () => {
  const onChange = jest.fn()
  const currentDocumentType = 'doc1'
  const currentEngine = 'engine1'
  const currentLlmType = 'llmA'
  const currentParsingFeatures = ['feature1', 'feature2']

  const files = [
    {
      settings: {
        documentType: 'different-doc-type',
        engine: currentEngine,
        llmType: currentLlmType,
        parsingFeatures: currentParsingFeatures,
      },
    },
  ]

  mockGetValues.mockImplementation((key) => {
    if (key === FIELD_FORM_CODE.FILES) {
      return files
    }
    if (key === FIELD_FORM_CODE.DOCUMENT_TYPE) {
      return currentDocumentType
    }
    if (key === FIELD_FORM_CODE.ENGINE) {
      return currentEngine
    }
    if (key === FIELD_FORM_CODE.LLM_TYPE) {
      return currentLlmType
    }
    if (key === FIELD_FORM_CODE.PARSING_FEATURES) {
      return currentParsingFeatures
    }
    return undefined
  })

  render(<BulkParsingFeaturesSelect onChange={onChange} />)

  const toggleFeature3 = screen.getByTestId('toggle-key-value-pairs')
  await userEvent.click(toggleFeature3)

  expect(onChange).toHaveBeenCalledWith(['key-value-pairs'])
  expect(mockSetValue).not.toHaveBeenCalled()
})
