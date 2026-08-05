
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Localization, localize } from '@/localization/i18n'
import { render } from '@/utils/rendererRTL'
import { DocumentTypeSplitterSection } from './DocumentTypeSplitterSection'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/components/Icons/TrashIcon', () => mockShallowComponent('TrashIcon'))

const defaultProps = {
  children: <div data-testid="splitter-form">Splitter Form</div>,
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders create splitter button when splitter form is hidden', () => {
  render(
    <DocumentTypeSplitterSection {...defaultProps} />,
  )

  expect(screen.getByText(localize(Localization.ADD_SPLITTER))).toBeInTheDocument()
  expect(screen.queryByText(localize(Localization.SPLITTER_CONFIG))).not.toBeInTheDocument()
})

test('renders remove splitter button and children when areChildrenVisible is true', () => {
  const props = {
    ...defaultProps,
    areChildrenVisible: true,
  }

  render(
    <DocumentTypeSplitterSection {...props} />,
  )

  expect(screen.getByText(localize(Localization.SPLITTER_CONFIG))).toBeInTheDocument()
  expect(screen.getByRole('button')).toBeInTheDocument()
  expect(screen.getByTestId('splitter-form')).toBeInTheDocument()
})

test('shows splitter form when create splitter button is clicked', async () => {
  render(
    <DocumentTypeSplitterSection {...defaultProps} />,
  )

  const createButton = screen.getByText(localize(Localization.ADD_SPLITTER))

  await userEvent.click(createButton)

  expect(screen.getByText(localize(Localization.SPLITTER_CONFIG))).toBeInTheDocument()
  expect(screen.getByTestId('splitter-form')).toBeInTheDocument()
})

test('hides splitter form when remove splitter button is clicked', async () => {
  const props = {
    ...defaultProps,
    areChildrenVisible: true,
  }

  render(
    <DocumentTypeSplitterSection {...props} />,
  )

  const removeButton = screen.getByRole('button')

  await userEvent.click(removeButton)

  expect(screen.getByText(localize(Localization.ADD_SPLITTER))).toBeInTheDocument()
  expect(screen.queryByText(localize(Localization.SPLITTER_CONFIG))).not.toBeInTheDocument()
})

test('calls onVisibilityChange with true when create splitter button is clicked', async () => {
  const mockOnVisibilityChange = jest.fn()
  const props = {
    ...defaultProps,
    onVisibilityChange: mockOnVisibilityChange,
  }

  render(
    <DocumentTypeSplitterSection {...props} />,
  )

  await userEvent.click(screen.getByText(localize(Localization.ADD_SPLITTER)))

  expect(mockOnVisibilityChange).toHaveBeenNthCalledWith(1, true)
})

test('calls onVisibilityChange with false when remove splitter button is clicked', async () => {
  const mockOnVisibilityChange = jest.fn()
  const props = {
    ...defaultProps,
    areChildrenVisible: true,
    onVisibilityChange: mockOnVisibilityChange,
  }

  render(
    <DocumentTypeSplitterSection {...props} />,
  )

  await userEvent.click(screen.getByRole('button'))

  expect(mockOnVisibilityChange).toHaveBeenNthCalledWith(1, false)
})
