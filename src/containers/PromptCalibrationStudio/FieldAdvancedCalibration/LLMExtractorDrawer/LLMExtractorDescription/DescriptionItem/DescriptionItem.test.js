
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import { Localization, localize } from '@/localization/i18n'
import { render } from '@/utils/rendererRTL'
import { DescriptionItem } from './DescriptionItem'

jest.mock('@/utils/env', () => mockEnv)

const defaultProps = {
  label: localize(Localization.TEMPERATURE),
  value: 0.7,
}

test('renders label and value when value is provided', () => {
  render(<DescriptionItem {...defaultProps} />)

  expect(screen.getByText(defaultProps.label)).toBeInTheDocument()
  expect(screen.getByText(defaultProps.value)).toBeInTheDocument()
})
