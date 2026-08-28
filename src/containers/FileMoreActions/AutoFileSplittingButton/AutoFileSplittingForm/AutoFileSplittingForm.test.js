import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { screen } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'
import { fetchProcessingEngines } from '@/actions/engines'
import { Localization, localize } from '@/localization/i18n'
import { processingEnginesSelector } from '@/selectors/engines'
import { ENV } from '@/utils/env'
import { render } from '@/utils/rendererRTL'
import { FIELD_CODE } from '../constants'
import { AutoFileSplittingForm } from './AutoFileSplittingForm'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-hook-form', () => mockReactHookForm)
jest.mock('react-redux', () => mockReactRedux)
jest.mock('@/selectors/engines')
jest.mock('@/selectors/requests')

jest.mock('@/actions/engines', () => ({
  fetchProcessingEngines: jest.fn(),
}))

jest.mock('@/components/Form', () => ({
  ...jest.requireActual('@/components/Form'),
  FormItem: (props) => (
    <div data-testid={`form-item-${props.field?.code}`}>
      {props.label}
      Form Item
    </div>
  ),
}))

const mockDispatch = jest.fn()
const mockWatch = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()

  mockReactRedux.useDispatch.mockReturnValue(mockDispatch)

  mockWatch.mockImplementation((name) => {
    if (name === FIELD_CODE.ENGINE) {
      return null
    }

    return null
  })

  useFormContext.mockReturnValue({
    watch: mockWatch,
  })
})

test('renders group field when form is rendered', () => {
  render(<AutoFileSplittingForm />)

  const groupField = screen.getByTestId(`form-item-${FIELD_CODE.GROUP}`)
  expect(groupField).toBeInTheDocument()
  expect(groupField).toHaveTextContent(localize(Localization.GROUP))
})

test('renders engine field when form is rendered', () => {
  render(<AutoFileSplittingForm />)

  const engineField = screen.getByTestId(`form-item-${FIELD_CODE.ENGINE}`)
  expect(engineField).toBeInTheDocument()
  expect(engineField).toHaveTextContent(localize(Localization.ENGINE))
})

test('renders parsing features field when form is rendered', () => {
  render(<AutoFileSplittingForm />)

  const parsingFeaturesField = screen.getByTestId(`form-item-${FIELD_CODE.PARSING_FEATURES}`)
  expect(parsingFeaturesField).toBeInTheDocument()
  expect(parsingFeaturesField).toHaveTextContent(localize(Localization.PARSING_FEATURES))
})

test('renders needs splitting review field when form is rendered', () => {
  render(<AutoFileSplittingForm />)

  const reviewField = screen.getByTestId(`form-item-${FIELD_CODE.NEEDS_SPLITTING_PROPOSAL_REVIEW}`)
  expect(reviewField).toBeInTheDocument()
  expect(reviewField).toHaveTextContent(localize(Localization.NEEDS_SPLITTING_REVIEW))
})

test('renders llm type field when FEATURE_LLM_DATA_EXTRACTION is enabled', () => {
  ENV.FEATURE_LLM_DATA_EXTRACTION = true

  render(<AutoFileSplittingForm />)

  const llmField = screen.getByTestId(`form-item-${FIELD_CODE.LLM_TYPE}`)
  expect(llmField).toBeInTheDocument()
  expect(llmField).toHaveTextContent(localize(Localization.LLM_TYPE))
})

test('does not render llm type field when FEATURE_LLM_DATA_EXTRACTION is disabled', () => {
  ENV.FEATURE_LLM_DATA_EXTRACTION = false

  render(<AutoFileSplittingForm />)

  const llmField = screen.queryByTestId(`form-item-${FIELD_CODE.LLM_TYPE}`)
  expect(llmField).not.toBeInTheDocument()

  ENV.FEATURE_LLM_DATA_EXTRACTION = true
})

test('dispatches fetchProcessingEngines when engines list is empty', () => {
  processingEnginesSelector.mockReturnValueOnce([])

  render(<AutoFileSplittingForm />)

  expect(mockDispatch).toHaveBeenCalledWith(fetchProcessingEngines())
})
