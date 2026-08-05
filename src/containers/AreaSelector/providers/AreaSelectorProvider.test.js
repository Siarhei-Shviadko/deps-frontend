import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import { render } from '@/utils/rendererRTL'
import { AreaSelectorProvider } from './AreaSelectorProvider'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('./AreaCreateProvider', () => ({
  AreaCreateProvider: ({ children }) => (
    <div data-testid="AreaCreateProvider">{children}</div>
  ),
}))

jest.mock('./AreaResizeProvider', () => ({
  AreaResizeProvider: ({ children }) => (
    <div data-testid="AreaResizeProvider">{children}</div>
  ),
}))

const mockOnChange = jest.fn()

const defaultProps = {
  coordinates: {
    x: 0,
    y: 0.2,
    width: 1,
    height: 0.4,
  },
  onChange: mockOnChange,
  children: <div data-testid="child" />,
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders children inside create and resize providers', () => {
  render(<AreaSelectorProvider {...defaultProps} />)

  expect(screen.getByTestId('AreaCreateProvider')).toBeInTheDocument()
  expect(screen.getByTestId('AreaResizeProvider')).toBeInTheDocument()
  expect(screen.getByTestId('child')).toBeInTheDocument()
})
