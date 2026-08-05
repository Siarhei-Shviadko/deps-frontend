import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { Localization, localize } from '@/localization/i18n'
import { render } from '@/utils/rendererRTL'
import { TOP_LIMIT } from '../constants'
import { Header } from './Header'

jest.mock('@/utils/env', () => mockEnv)

const mockSetTopLimit = jest.fn()

const defaultProps = {
  topLimit: TOP_LIMIT.TEN,
  setTopLimit: mockSetTopLimit,
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders field edits title with current top limit', () => {
  render(<Header {...defaultProps} />)

  const title = screen.getByText(
    localize(Localization.FIELD_EDITS_TITLE, { top: TOP_LIMIT.TEN }),
  )

  expect(title).toBeInTheDocument()
})

test('renders top limit label', () => {
  render(<Header {...defaultProps} />)

  const topLimitLabel = screen.getByText(localize(Localization.TOP))

  expect(topLimitLabel).toBeInTheDocument()
})

test('calls setTopLimit with numeric value when select value changes', async () => {
  render(<Header {...defaultProps} />)

  const topLimitSelect = screen.getByRole('combobox')

  await userEvent.click(topLimitSelect)

  const option = await screen.findByTitle(String(TOP_LIMIT.TWENTY))

  await userEvent.click(option, {
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  })

  expect(mockSetTopLimit).toHaveBeenNthCalledWith(1, TOP_LIMIT.TWENTY)
})
