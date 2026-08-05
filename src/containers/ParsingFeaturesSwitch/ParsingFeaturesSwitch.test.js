import { mockEnv } from '@/mocks/mockEnv'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KnownOCREngine } from '@/enums/KnownOCREngine'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { Localization, localize } from '@/localization/i18n'
import { render } from '@/utils/rendererRTL'
import { ParsingFeaturesSwitch } from './ParsingFeaturesSwitch'

jest.mock('@/utils/env', () => mockEnv)

const mockOnChange = jest.fn()
let defaultProps

beforeEach(() => {
  jest.clearAllMocks()
  defaultProps = {
    onChange: mockOnChange,
    value: [KnownParsingFeature.TEXT],
  }
})

test('renders switches with correct labels', () => {
  render(<ParsingFeaturesSwitch {...defaultProps} />)

  expect(screen.getByText(localize(Localization.TEXT))).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.IMAGES))).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.KEY_VALUE_PAIRS))).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.TABLES))).toBeInTheDocument()
})

test('calls onChange with updated features when toggling on', async () => {
  const user = userEvent.setup()
  render(<ParsingFeaturesSwitch {...defaultProps} />)

  const imagesSwitch = screen.getByText(localize(Localization.IMAGES))
  await user.click(imagesSwitch)

  expect(mockOnChange).toHaveBeenCalledWith([
    KnownParsingFeature.TEXT,
    KnownParsingFeature.IMAGES,
  ])
})

test('calls onChange with updated features when toggling off', async () => {
  const user = userEvent.setup()
  render(<ParsingFeaturesSwitch {...defaultProps} />)

  const textSwitch = screen.getByText(localize(Localization.TEXT))
  await user.click(textSwitch)

  expect(mockOnChange).toHaveBeenCalledWith([])
})

test('renders key value pairs feature before text feature', () => {
  render(<ParsingFeaturesSwitch {...defaultProps} />)

  const keyValuePairs = screen.getByText(localize(Localization.KEY_VALUE_PAIRS))
  const text = screen.getByText(localize(Localization.TEXT))

  expect(keyValuePairs.compareDocumentPosition(text) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})

test('renders tables switch as disabled when engineCode is TESSERACT', () => {
  const props = {
    ...defaultProps,
    engineCode: KnownOCREngine.TESSERACT,
  }

  render(<ParsingFeaturesSwitch {...props} />)

  const tablesItem = screen.getByText(localize(Localization.TABLES)).closest('div')
  const tablesSwitch = within(tablesItem).getByRole('switch')

  expect(tablesSwitch).toBeDisabled()
})

test('renders tables switch as unchecked when engineCode is TESSERACT and tables is selected', () => {
  const props = {
    ...defaultProps,
    value: [KnownParsingFeature.TEXT, KnownParsingFeature.TABLES],
    engineCode: KnownOCREngine.TESSERACT,
  }

  render(<ParsingFeaturesSwitch {...props} />)

  const tablesItem = screen.getByText(localize(Localization.TABLES)).closest('div')
  const tablesSwitch = within(tablesItem).getByRole('switch')

  expect(tablesSwitch).not.toBeChecked()
})

test('does not call onChange when clicking disabled tables feature with TESSERACT engine', async () => {
  const user = userEvent.setup()
  const props = {
    ...defaultProps,
    engineCode: KnownOCREngine.TESSERACT,
  }

  render(<ParsingFeaturesSwitch {...props} />)

  const tablesFeature = screen.getByText(localize(Localization.TABLES))
  await user.click(tablesFeature)

  expect(mockOnChange).not.toHaveBeenCalled()
})

test('renders tables switch as enabled when engineCode is not TESSERACT', () => {
  const props = {
    ...defaultProps,
    engineCode: KnownOCREngine.AWS_TEXTRACT,
  }

  render(<ParsingFeaturesSwitch {...props} />)

  const tablesItem = screen.getByText(localize(Localization.TABLES)).closest('div')
  const tablesSwitch = within(tablesItem).getByRole('switch')

  expect(tablesSwitch).toBeEnabled()
})
