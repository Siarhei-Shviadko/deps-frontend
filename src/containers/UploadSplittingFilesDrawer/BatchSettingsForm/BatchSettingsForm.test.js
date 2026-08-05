
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFormContext, useWatch } from 'react-hook-form'
import { fetchOCREngines } from '@/actions/engines'
import { BATCH_TYPE, FIELD_FORM_CODE } from '@/containers/UploadSplittingFilesDrawer/constants'
import { Localization, localize } from '@/localization/i18n'
import { ocrEnginesSelector } from '@/selectors/engines'
import { ENV } from '@/utils/env'
import { render } from '@/utils/rendererRTL'
import { BatchSettingsForm } from './BatchSettingsForm'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/selectors/requests')
jest.mock('@/selectors/engines')

jest.mock('@/components/Form', () => ({
  ...jest.requireActual('@/components/Form'),
  FormItem: (props) => (
    <div
      key={props.field?.code}
      data-testid={`form-item-${props.field?.code}`}
    >
      {props.label}
      Form Item
      {
        props.field?.handler?.onChange && (
          <>
            <button
              data-testid={`enable-${props.field.code}`}
              onClick={() => props.field.handler.onChange(true)}
              type="button"
            >
              enable
            </button>
            <button
              data-testid={`disable-${props.field.code}`}
              onClick={() => props.field.handler.onChange(false)}
              type="button"
            >
              disable
            </button>
          </>
        )
      }
    </div>
  ),
}))

jest.mock('react-hook-form', () => mockReactHookForm)

const mockDispatch = jest.fn()
const mockClearErrors = jest.fn()
const mockGetValues = jest.fn()
const mockSetValue = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/actions/engines', () => ({
  fetchOCREngines: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()

  useWatch.mockImplementation(({ name }) => {
    if (name === FIELD_FORM_CODE.AUTOMATIC_SPLITTING) {
      return false
    }

    return null
  })

  useFormContext.mockImplementation(() => ({
    clearErrors: mockClearErrors,
    getValues: mockGetValues,
    setValue: mockSetValue,
  }))
})

test('renders automatic splitting field when form is rendered', () => {
  render(<BatchSettingsForm />)

  const automaticSplitting = screen.getByTestId(`form-item-${FIELD_FORM_CODE.AUTOMATIC_SPLITTING}`)
  expect(automaticSplitting).toBeInTheDocument()
  expect(automaticSplitting).toHaveTextContent(localize(Localization.AUTOMATIC_SPLITTING))
})

test('renders group select field when form is rendered', () => {
  render(<BatchSettingsForm />)

  const groupField = screen.getByTestId(`form-item-${FIELD_FORM_CODE.GROUP}`)
  expect(groupField).toBeInTheDocument()
  expect(groupField).toHaveTextContent(localize(Localization.GROUP))
})

test('do not render group select field if FEATURE_DOCUMENT_TYPES_GROUPS is false', () => {
  ENV.FEATURE_DOCUMENT_TYPES_GROUPS = false
  render(<BatchSettingsForm />)

  const groupField = screen.queryByTestId(`form-item-${FIELD_FORM_CODE.GROUP}`)
  expect(groupField).not.toBeInTheDocument()

  ENV.FEATURE_DOCUMENT_TYPES_GROUPS = true
})

test('renders batch type switcher field when form is rendered', () => {
  render(<BatchSettingsForm />)

  const batchTypeSwitcherField = screen.getByTestId(`form-item-${FIELD_FORM_CODE.BATCH_TYPE}`)
  expect(batchTypeSwitcherField).toBeInTheDocument()
  expect(batchTypeSwitcherField).toHaveTextContent(localize(Localization.BATCH_TYPE))
})

test('do not render llm type select field if FEATURE_LLM_DATA_EXTRACTION is false', () => {
  ENV.FEATURE_LLM_DATA_EXTRACTION = false
  render(<BatchSettingsForm />)

  const llmField = screen.queryByTestId(`form-item-${FIELD_FORM_CODE.LLM_TYPE}`)
  expect(llmField).not.toBeInTheDocument()

  ENV.FEATURE_LLM_DATA_EXTRACTION = true
})

test('renders engine select field when form is rendered', () => {
  render(<BatchSettingsForm />)

  const engineField = screen.getByTestId(`form-item-${FIELD_FORM_CODE.ENGINE}`)
  expect(engineField).toBeInTheDocument()
  expect(engineField).toHaveTextContent(localize(Localization.ENGINE))
})

test('renders parsing features field when form is rendered', () => {
  render(<BatchSettingsForm />)

  const parsingFeaturesField = screen.getByTestId(`form-item-${FIELD_FORM_CODE.PARSING_FEATURES}`)
  expect(parsingFeaturesField).toBeInTheDocument()
  expect(parsingFeaturesField).toHaveTextContent(localize(Localization.PARSING_FEATURES))
})

test('renders batch name field when automatic splitting is disabled', () => {
  render(<BatchSettingsForm />)

  const batchNameField = screen.getByTestId(`form-item-${FIELD_FORM_CODE.BATCH_NAME}`)
  expect(batchNameField).toBeInTheDocument()
  expect(batchNameField).toHaveTextContent(localize(Localization.BATCH_NAME))
})

test('renders needs splitting review field when automatic splitting is enabled', () => {
  useWatch.mockImplementation(({ name }) => {
    if (name === FIELD_FORM_CODE.AUTOMATIC_SPLITTING) {
      return true
    }

    return null
  })

  render(<BatchSettingsForm />)

  const needsSplittingReviewField = screen.getByTestId(
    `form-item-${FIELD_FORM_CODE.NEEDS_SPLITTING_PROPOSAL_REVIEW}`,
  )

  expect(needsSplittingReviewField).toBeInTheDocument()
  expect(needsSplittingReviewField).toHaveTextContent(localize(Localization.NEEDS_SPLITTING_REVIEW))
})

test('does not render needs splitting review field when automatic splitting is disabled', () => {
  render(<BatchSettingsForm />)

  const needsSplittingReviewField = screen.queryByTestId(
    `form-item-${FIELD_FORM_CODE.NEEDS_SPLITTING_PROPOSAL_REVIEW}`,
  )

  expect(needsSplittingReviewField).not.toBeInTheDocument()
})

test('does not render batch name field when automatic splitting is enabled', () => {
  useWatch.mockImplementation(({ name }) => {
    if (name === FIELD_FORM_CODE.AUTOMATIC_SPLITTING) {
      return true
    }

    return null
  })

  render(<BatchSettingsForm />)

  const batchNameField = screen.queryByTestId(`form-item-${FIELD_FORM_CODE.BATCH_NAME}`)
  expect(batchNameField).not.toBeInTheDocument()
})

test('calls fetchOCREngines when form is rendered if engines are empty', () => {
  ocrEnginesSelector.mockReturnValueOnce([])

  render(<BatchSettingsForm />)

  expect(mockDispatch).toHaveBeenCalledWith(fetchOCREngines())
})

test('sets multi batches type and clears group without splitter when automatic splitting is enabled', async () => {
  mockGetValues.mockReturnValueOnce({ id: 'group-1' })

  render(<BatchSettingsForm />)

  await userEvent.click(screen.getByTestId(`enable-${FIELD_FORM_CODE.AUTOMATIC_SPLITTING}`))

  expect(mockSetValue).toHaveBeenNthCalledWith(1, FIELD_FORM_CODE.BATCH_TYPE, BATCH_TYPE.MULTI_BATCHES)
  expect(mockGetValues).toHaveBeenNthCalledWith(1, FIELD_FORM_CODE.GROUP)
  expect(mockSetValue).toHaveBeenNthCalledWith(2, FIELD_FORM_CODE.GROUP, null)
})

test('does not clear group with splitter when automatic splitting is enabled', async () => {
  mockGetValues.mockReturnValueOnce({
    id: 'group-1',
    splitter: { id: 'splitter-1' },
  })

  render(<BatchSettingsForm />)

  await userEvent.click(screen.getByTestId(`enable-${FIELD_FORM_CODE.AUTOMATIC_SPLITTING}`))

  expect(mockSetValue).toHaveBeenNthCalledWith(1, FIELD_FORM_CODE.BATCH_TYPE, BATCH_TYPE.MULTI_BATCHES)
  expect(mockSetValue).toHaveBeenCalledTimes(1)
})

test('sets one batch type and clears group errors when automatic splitting is disabled', async () => {
  render(<BatchSettingsForm />)

  await userEvent.click(screen.getByTestId(`disable-${FIELD_FORM_CODE.AUTOMATIC_SPLITTING}`))

  expect(mockClearErrors).toHaveBeenNthCalledWith(1, FIELD_FORM_CODE.GROUP)
  expect(mockSetValue).toHaveBeenNthCalledWith(1, FIELD_FORM_CODE.BATCH_TYPE, BATCH_TYPE.ONE_BATCH)
})
