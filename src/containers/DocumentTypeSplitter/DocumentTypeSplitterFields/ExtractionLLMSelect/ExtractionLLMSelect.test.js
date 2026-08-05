
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFetchLiteLLMModelsQuery } from '@/apiRTK/litellmApi'
import { Localization, localize } from '@/localization/i18n'
import { notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { ExtractionLLMSelect } from './ExtractionLLMSelect'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('@/apiRTK/litellmApi', () => ({
  useFetchLiteLLMModelsQuery: jest.fn(() => ({
    data: [],
    isFetching: false,
    isError: false,
  })),
}))

const mockLiteLLMModels = [
  { id: 'provider1/model-1-1' },
  { id: 'provider1/model-1-2' },
  { id: 'provider2/model-2-1' },
]

beforeEach(() => {
  jest.clearAllMocks()
})

test('shows notification message when litellm models fetching fails', async () => {
  useFetchLiteLLMModelsQuery.mockImplementationOnce(() => ({
    data: [],
    isFetching: false,
    isError: true,
  }))

  render(
    <ExtractionLLMSelect />,
  )

  await waitFor(() => {
    expect(notifyWarning).toHaveBeenNthCalledWith(1, localize(Localization.FETCH_LLMS_FAILURE_MESSAGE))
  })
})

test('renders select with all providers and their models when data is loaded', async () => {
  useFetchLiteLLMModelsQuery.mockImplementationOnce(() => ({
    data: mockLiteLLMModels,
    isFetching: false,
    isError: false,
  }))

  render(
    <ExtractionLLMSelect />,
  )

  const combobox = screen.getByRole('combobox')
  expect(combobox).toBeInTheDocument()

  await userEvent.click(combobox)

  mockLiteLLMModels.forEach(({ id }) => {
    const sepIndex = id.search(/[/-]/)
    const model = id.slice(sepIndex + 1)

    expect(screen.getByText(model)).toBeInTheDocument()
  })

  const providerOccurrences = mockLiteLLMModels.reduce((acc, { id }) => {
    const sepIndex = id.search(/[/-]/)
    const provider = id.slice(0, sepIndex)
    acc[provider] = (acc[provider] || 0) + 1
    return acc
  }, {})

  Object.entries(providerOccurrences).forEach(([provider, count]) => {
    expect(screen.getAllByText(provider)).toHaveLength(count)
  })
})
