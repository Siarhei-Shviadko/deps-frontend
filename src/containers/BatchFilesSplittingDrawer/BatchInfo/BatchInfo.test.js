
import { mockComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KnownParsingFeature, RESOURCE_PARSING_FEATURE } from '@/enums/KnownParsingFeature'
import { KnownProcessingEngines, RESOURCE_PROCESSING_ENGINE } from '@/enums/KnownProcessingEngines'
import { render } from '@/utils/rendererRTL'
import { BatchSettings } from '../viewModels'
import { BatchInfo } from '.'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('../hooks', () => ({
  useFilesSplitting: jest.fn(() => ({
    batchSettings: mockBatchSettings,
  })),
}))

jest.mock('@/containers/DocumentLLMType', () => mockComponent('DocumentLLMType'))

const mockBatchSettings = new BatchSettings({
  group: {
    id: 'group-id',
    name: 'group-name',
  },
  engine: KnownProcessingEngines.TESSERACT,
  llmType: 'basic',
  parsingFeatures: [KnownParsingFeature.TABLES],
})

test('renders batch info correctly if all settings are provided', async () => {
  render(<BatchInfo />)

  const btn = screen.getByRole('button')
  await userEvent.click(btn)

  const [
    batchGroup,
    batchLLMType,
    batchEngine,
    batchParsingFeatures,
  ] = screen.getAllByRole('listitem')

  expect(batchGroup).toHaveTextContent(mockBatchSettings.group.name)
  expect(batchLLMType).toHaveTextContent('DocumentLLMType')
  expect(batchEngine).toHaveTextContent(RESOURCE_PROCESSING_ENGINE[mockBatchSettings.engine])
  expect(batchParsingFeatures).toHaveTextContent(`${RESOURCE_PARSING_FEATURE[mockBatchSettings.parsingFeatures[0]]}`)
})
