
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import { Menu } from '@/components/Menu'
import { PipelineStepModal } from '@/containers/PipelineStepModal'
import { DocumentState } from '@/enums/DocumentState'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { render } from '@/utils/rendererRTL'
import { RunPipelineButton } from './RunPipelineButton'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/containers/PipelineStepModal', () => ({
  PipelineStepModal: mockShallowComponent('PipelineStepModal').PipelineStepModal,
}))
jest.mock('@/components/Menu', () => ({
  Menu: {
    Item: mockShallowComponent('MenuItem').MenuItem,
  },
}))
jest.mock('@/components/Button', () => ({
  Button: {
    Text: mockShallowComponent('ButtonText').ButtonText,
  },
}))

const mockDocumentId = 'documentId'
const mockLLMType = 'provider@model'

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders PipelineStepModal components for all pipeline steps', () => {
  render(
    <RunPipelineButton
      documentEngine={KnownProcessingEngines.TESSERACT}
      documentId={mockDocumentId}
      documentLLMType={mockLLMType}
      documentState={DocumentState.COMPLETED}
    />,
  )

  const pipelineStepModals = screen.getAllByTestId('PipelineStepModal')

  expect(pipelineStepModals).toHaveLength(2)
})

test('renders MenuItem components for all pipeline steps', () => {
  render(
    <RunPipelineButton
      documentEngine={KnownProcessingEngines.TESSERACT}
      documentId={mockDocumentId}
      documentLLMType={mockLLMType}
      documentState={DocumentState.COMPLETED}
    />,
  )

  const menuItems = screen.getAllByTestId('MenuItem')

  expect(menuItems).toHaveLength(2)
})

test('passes correct eventKey to MenuItem components', () => {
  render(
    <RunPipelineButton
      documentEngine={KnownProcessingEngines.TESSERACT}
      documentId={mockDocumentId}
      documentLLMType={mockLLMType}
      documentState={DocumentState.COMPLETED}
    />,
  )

  expect(Menu.Item).toHaveBeenCalledTimes(2)

  const calls = Menu.Item.mock.calls

  expect(calls[0][0].eventKey).toBe('extraction')
  expect(calls[1][0].eventKey).toBe('parsing')
})

test('passes correct step to PipelineStepModal components', () => {
  render(
    <RunPipelineButton
      documentEngine={KnownProcessingEngines.TESSERACT}
      documentId={mockDocumentId}
      documentLLMType={mockLLMType}
      documentState={DocumentState.COMPLETED}
    />,
  )

  expect(PipelineStepModal).toHaveBeenCalledTimes(2)

  const calls = PipelineStepModal.mock.calls

  expect(calls[0][0].step).toBe('extraction')
  expect(calls[1][0].step).toBe('parsing')
})

test('passes correct props to PipelineStepModal components', () => {
  const error = { description: 'test error' }

  render(
    <RunPipelineButton
      documentEngine={KnownProcessingEngines.TESSERACT}
      documentId={mockDocumentId}
      documentLLMType={mockLLMType}
      documentState={DocumentState.COMPLETED}
      error={error}
    />,
  )

  expect(PipelineStepModal).toHaveBeenCalledTimes(2)

  const calls = PipelineStepModal.mock.calls

  calls.forEach((call) => {
    const props = call[0]
    expect(props.documentEngine).toBe(KnownProcessingEngines.TESSERACT)
    expect(props.documentId).toBe(mockDocumentId)
    expect(props.documentLLMType).toBe(mockLLMType)
    expect(props.documentState).toBe(DocumentState.COMPLETED)
    expect(props.error).toEqual(error)
  })
})
