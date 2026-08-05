import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import { DOCUMENT_LAYOUT_FEATURE, DOCUMENT_LAYOUT_PARSING_TYPE } from '@/enums/DocumentLayoutType'
import { Localization, localize } from '@/localization/i18n'
import { KeyValuePairElementLayout } from '@/models/DocumentLayout'
import { Point } from '@/models/Point'
import { render } from '@/utils/rendererRTL'
import { usePaginatedLayout } from '../hooks'
import { KeyValuePairLayout as KeyValuePairLayoutComponent } from './KeyValuePairLayout'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/components/Spin', () => ({
  Spin: () => <div data-testid="spin" />,
}))

jest.mock('../hooks', () => ({
  usePaginatedLayout: jest.fn(),
}))

jest.mock('./KeyValuePairField', () => ({
  KeyValuePairField: jest.fn(({ keyData, valueData, page }) => (
    <div data-testid={`kvp-field-${page}`}>
      <span>{keyData.content}</span>
      <span>{valueData.content}</span>
    </div>
  )),
}))

const mockKeyData = new KeyValuePairElementLayout(
  'keyContent',
  [
    new Point(0.111, 0.222),
    new Point(0.333, 0.444),
  ],
)
const mockValueData = new KeyValuePairElementLayout(
  'valueContent',
  [
    new Point(0.111, 0.222),
    new Point(0.333, 0.444),
  ],
)

const mockData = [
  {
    layout: {
      key: mockKeyData,
      value: mockValueData,
    },
    page: 1,
  },
  {
    layout: {
      key: mockKeyData,
      value: mockValueData,
    },
    page: 2,
  },
]

const defaultProps = {
  batchIndex: 0,
  parsingType: DOCUMENT_LAYOUT_PARSING_TYPE.AWS_TEXTRACT,
}

beforeEach(() => {
  jest.clearAllMocks()
  usePaginatedLayout.mockReturnValue({
    layoutData: mockData,
    isFetching: false,
  })
})

test('calls usePaginatedLayout with correct parameters', () => {
  render(<KeyValuePairLayoutComponent {...defaultProps} />)

  expect(usePaginatedLayout).toHaveBeenCalledWith({
    batchIndex: 0,
    parsingFeature: DOCUMENT_LAYOUT_FEATURE.KEY_VALUE_PAIRS,
    parsingType: DOCUMENT_LAYOUT_PARSING_TYPE.AWS_TEXTRACT,
  })
})

test('renders correct layout for key-value pairs', () => {
  render(<KeyValuePairLayoutComponent {...defaultProps} />)

  expect(screen.getByTestId('kvp-field-1')).toBeInTheDocument()
  expect(screen.getByTestId('kvp-field-2')).toBeInTheDocument()
  expect(screen.getAllByText('keyContent').length).toBe(2)
  expect(screen.getAllByText('valueContent').length).toBe(2)
})

test('renders spinner when layout is fetching', () => {
  usePaginatedLayout.mockReturnValueOnce({
    layoutData: [],
    isFetching: true,
  })

  render(<KeyValuePairLayoutComponent {...defaultProps} />)

  expect(screen.getByTestId('spin')).toBeInTheDocument()
  expect(screen.queryByTestId('kvp-field-1')).not.toBeInTheDocument()
})

test('renders no data message when layout data is empty', () => {
  usePaginatedLayout.mockReturnValueOnce({
    layoutData: [],
    isFetching: false,
  })

  render(<KeyValuePairLayoutComponent {...defaultProps} />)

  expect(screen.getByText(localize(Localization.NO_DATA))).toBeInTheDocument()
})
