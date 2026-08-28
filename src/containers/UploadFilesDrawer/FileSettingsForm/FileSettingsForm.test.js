
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen } from '@testing-library/react'
import { fetchProcessingEngines } from '@/actions/engines'
import { FIELD_FORM_CODE } from '@/containers/UploadFilesDrawer/constants'
import { Localization, localize } from '@/localization/i18n'
import { processingEnginesSelector } from '@/selectors/engines'
import { render } from '@/utils/rendererRTL'
import { FileSettingsForm } from './FileSettingsForm'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/selectors/requests')
jest.mock('@/selectors/engines')

jest.mock('react-hook-form', () => mockReactHookForm)

jest.mock('@/components/Form', () => ({
  ...jest.requireActual('@/components/Form'),
  FormItem: (props) => (
    <div data-testid={`form-item-${props.field?.code}`}>
      {props.label}
      Form Item
    </div>
  ),
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/actions/engines', () => ({
  fetchProcessingEngines: jest.fn(),
}))

const mockDispatch = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders engine select field when form is rendered', () => {
  render(<FileSettingsForm />)

  const engineField = screen.getByTestId(`form-item-${FIELD_FORM_CODE.ENGINE}`)
  expect(engineField).toBeInTheDocument()
  expect(engineField).toHaveTextContent(localize(Localization.ENGINE))
})

test('renders parsing features field when form is rendered', () => {
  render(<FileSettingsForm />)

  const parsingFeaturesField = screen.getByTestId(`form-item-${FIELD_FORM_CODE.PARSING_FEATURES}`)
  expect(parsingFeaturesField).toBeInTheDocument()
  expect(parsingFeaturesField).toHaveTextContent(localize(Localization.PARSING_FEATURES))
})

test('renders labels select field when form is rendered', () => {
  render(<FileSettingsForm />)

  const labelsField = screen.getByTestId(`form-item-${FIELD_FORM_CODE.LABELS}`)
  expect(labelsField).toBeInTheDocument()
  expect(labelsField).toHaveTextContent(localize(Localization.LABELS))
})

test('calls fetchProcessingEngines when form is rendered if engines are empty', () => {
  processingEnginesSelector.mockReturnValueOnce([])

  render(<FileSettingsForm />)

  expect(mockDispatch).toHaveBeenCalledWith(fetchProcessingEngines())
})
