
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { useSelector } from 'react-redux'
import { runPipelineFromStep } from '@/actions/documentReviewPage'
import { fetchProcessingEngines } from '@/actions/engines'
import { ModalFormButton } from '@/components/ModalFormButton'
import { DocumentState } from '@/enums/DocumentState'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { PipelineStep } from '@/enums/PipelineStep'
import { localize, Localization } from '@/localization/i18n'
import { PipelineStepModal } from './PipelineStepModal'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/actions/engines')
jest.mock('@/actions/documentReviewPage')
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('@/components/ModalFormButton', () => ({
  ModalFormButton: jest.fn(() => null),
}))

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(() => mockDispatch),
  useSelector: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders with correct props and fetches processing engines', () => {
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  expect(mockDispatch).toHaveBeenCalled()
  expect(fetchProcessingEngines).toHaveBeenCalled()
})

test('renders ModalFormButton with correct props', () => {
  const mockProps = {
    step: PipelineStep.PARSING,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Tesseract',
  }])

  render(<PipelineStepModal {...mockProps} />)

  expect(ModalFormButton).toHaveBeenCalledWith(
    expect.objectContaining({
      renderOpenTrigger: expect.any(Function),
      onOk: expect.any(Function),
      fields: {
        parsingFeatures: expect.objectContaining({
          label: 'Parsing Features',
          render: expect.any(Function),
          initialValue: ['text'],
        }),
        engine: expect.objectContaining({
          label: 'Engine',
          render: expect.any(Function),
          initialValue: mockProps.documentEngine,
        }),
        llmType: expect.objectContaining({
          label: 'LLM Type',
          render: expect.any(Function),
          initialValue: null,
        }),
      },
      fetching: false,
      okButtonProps: expect.objectContaining({
        text: 'OK',
        loading: false,
      }),
      text: expect.any(Object),
      title: 'Are you sure you want to restart pipeline from Parsing step?',
    }),
    expect.any(Object),
  )
})

test('dispatches runPipelineFromStep when onOk is called', async () => {
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Tesseract',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const onOk = ModalFormButton.mock.calls[0][0].onOk

  const mockSettings = {
    engine: KnownProcessingEngines.TESSERACT,
    parsingFeatures: ['text'],
  }

  await act(async () => await onOk(mockSettings))

  expect(mockDispatch).toHaveBeenCalledWith(
    runPipelineFromStep(mockProps.documentId, mockProps.step, mockSettings),
  )
})

test('calls notifySuccess with correct message when pipeline runs successfully', async () => {
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Tesseract',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const onOk = ModalFormButton.mock.calls[0][0].onOk

  const mockSettings = {
    engine: KnownProcessingEngines.TESSERACT,
    parsingFeatures: ['text'],
  }

  await act(async () => await onOk(mockSettings))

  expect(mockNotification.notifySuccess).toHaveBeenCalledWith(
    localize(Localization.PIPELINE_SUCCESS_FROM_STEP, { stepNumber: 'Data Extraction' }),
  )
})

test('calls notifySuccess with correct message for extraction step', async () => {
  jest.clearAllMocks()

  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const onOk = ModalFormButton.mock.calls[0][0].onOk

  const mockSettings = {
    engine: KnownProcessingEngines.TESSERACT,
  }

  await act(async () => await onOk(mockSettings))

  expect(mockNotification.notifySuccess).toHaveBeenCalledWith(
    localize(Localization.PIPELINE_SUCCESS_FROM_STEP, { stepNumber: 'Data Extraction' }),
  )
})

test('renders with custom modal title when provided', () => {
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
    modalTitle: 'Custom Title',
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  expect(ModalFormButton).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'Custom Title',
    }),
    {},
  )
})

test('renders with disabled state when disabled prop is true', () => {
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
    disabled: true,
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  expect(ModalFormButton).toHaveBeenCalledWith(
    expect.objectContaining({
      renderOpenTrigger: expect.any(Function),
    }),
    {},
  )
})

test('renders with disabled state when document state is not allowed', () => {
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.COMPLETED,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  expect(ModalFormButton).toHaveBeenCalledWith(
    expect.objectContaining({
      renderOpenTrigger: expect.any(Function),
    }),
    {},
  )
})

test('renders with disabled state when extraction step is forbidden for document state', () => {
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.COMPLETED,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  expect(ModalFormButton).toHaveBeenCalledWith(
    expect.objectContaining({
      renderOpenTrigger: expect.any(Function),
    }),
    {},
  )
})

test('renders with disabled state when step is forbidden for error state', () => {
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.FAILED,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: {
      inState: 'someErrorState',
      description: 'Error description',
    },
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  expect(ModalFormButton).toHaveBeenCalledWith(
    expect.objectContaining({
      renderOpenTrigger: expect.any(Function),
    }),
    {},
  )
})

test('sets LLM type initial value to null when documentLLMType is invalid', () => {
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'invalid-llm-type',
    error: null,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const fields = ModalFormButton.mock.calls[0][0].fields

  expect(fields.llmType.initialValue).toBe(null)
})

test('sets LLM type initial value to null when documentLLMType is null', () => {
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: null,
    error: null,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const fields = ModalFormButton.mock.calls[0][0].fields

  expect(fields.llmType.initialValue).toBe(null)
})

test('disables step when disabled prop is true', () => {
  const mockRenderTrigger = jest.fn(() => <div data-testid="trigger">Run Pipeline</div>)
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: mockRenderTrigger,
    disabled: true,
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const renderOpenTrigger = ModalFormButton.mock.calls[0][0].renderOpenTrigger
  const mockOpen = jest.fn()

  renderOpenTrigger(mockOpen)

  expect(mockRenderTrigger).toHaveBeenCalledWith(mockOpen, true)
})

test('disables step when document state is not allowed to start pipeline', () => {
  const mockRenderTrigger = jest.fn(() => <div data-testid="trigger">Run Pipeline</div>)
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.NEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: mockRenderTrigger,
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const renderOpenTrigger = ModalFormButton.mock.calls[0][0].renderOpenTrigger
  const mockOpen = jest.fn()

  renderOpenTrigger(mockOpen)

  expect(mockRenderTrigger).toHaveBeenCalledWith(mockOpen, true)
})

test('enables step when document state is allowed to start pipeline', () => {
  const mockRenderTrigger = jest.fn(() => <div data-testid="trigger">Run Pipeline</div>)
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: mockRenderTrigger,
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const renderOpenTrigger = ModalFormButton.mock.calls[0][0].renderOpenTrigger
  const mockOpen = jest.fn()

  renderOpenTrigger(mockOpen)

  expect(mockRenderTrigger).toHaveBeenCalledWith(mockOpen, false)
})

test('disables extraction step when document state is forbidden for extraction', () => {
  const mockRenderTrigger = jest.fn(() => <div data-testid="trigger">Run Pipeline</div>)
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.NEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: mockRenderTrigger,
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const renderOpenTrigger = ModalFormButton.mock.calls[0][0].renderOpenTrigger
  const mockOpen = jest.fn()

  renderOpenTrigger(mockOpen)

  expect(mockRenderTrigger).toHaveBeenCalledWith(mockOpen, true)
})

test('enables extraction step when document state is allowed for extraction', () => {
  const mockRenderTrigger = jest.fn(() => <div data-testid="trigger">Run Pipeline</div>)
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: mockRenderTrigger,
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const renderOpenTrigger = ModalFormButton.mock.calls[0][0].renderOpenTrigger
  const mockOpen = jest.fn()

  renderOpenTrigger(mockOpen)

  expect(mockRenderTrigger).toHaveBeenCalledWith(mockOpen, false)
})

test('disables step when document is in failed state and step is not allowed for error', () => {
  const mockRenderTrigger = jest.fn(() => <div data-testid="trigger">Run Pipeline</div>)
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.FAILED,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: {
      inState: DocumentState.DATA_EXTRACTION,
      description: 'Error description',
    },
    renderTrigger: mockRenderTrigger,
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const renderOpenTrigger = ModalFormButton.mock.calls[0][0].renderOpenTrigger
  const mockOpen = jest.fn()

  renderOpenTrigger(mockOpen)

  expect(mockRenderTrigger).toHaveBeenCalledWith(mockOpen, true)
})

test('enables step when document is in failed state and step is allowed for error', () => {
  const mockRenderTrigger = jest.fn(() => <div data-testid="trigger">Run Pipeline</div>)
  const mockProps = {
    step: PipelineStep.PARSING,
    documentId: 'doc123',
    documentState: DocumentState.FAILED,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: {
      inState: DocumentState.DATA_EXTRACTION,
      description: 'Error description',
    },
    renderTrigger: mockRenderTrigger,
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const renderOpenTrigger = ModalFormButton.mock.calls[0][0].renderOpenTrigger
  const mockOpen = jest.fn()

  renderOpenTrigger(mockOpen)

  expect(mockRenderTrigger).toHaveBeenCalledWith(mockOpen, false)
})

test('enables step when document is in failed state but has no error', () => {
  const mockRenderTrigger = jest.fn(() => <div data-testid="trigger">Run Pipeline</div>)
  const mockProps = {
    step: PipelineStep.PARSING,
    documentId: 'doc123',
    documentState: DocumentState.FAILED,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: mockRenderTrigger,
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const renderOpenTrigger = ModalFormButton.mock.calls[0][0].renderOpenTrigger
  const mockOpen = jest.fn()

  renderOpenTrigger(mockOpen)

  expect(mockRenderTrigger).toHaveBeenCalledWith(mockOpen, false)
})

test('enables step when document is not in failed state even with error', () => {
  const mockRenderTrigger = jest.fn(() => <div data-testid="trigger">Run Pipeline</div>)
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: {
      inState: DocumentState.DATA_EXTRACTION,
      description: 'Error description',
    },
    renderTrigger: mockRenderTrigger,
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const renderOpenTrigger = ModalFormButton.mock.calls[0][0].renderOpenTrigger
  const mockOpen = jest.fn()

  renderOpenTrigger(mockOpen)

  expect(mockRenderTrigger).toHaveBeenCalledWith(mockOpen, false)
})

test('enables parsing step when document failed in identification state', () => {
  const mockRenderTrigger = jest.fn(() => <div data-testid="trigger">Run Pipeline</div>)
  const mockProps = {
    step: PipelineStep.PARSING,
    documentId: 'doc123',
    documentState: DocumentState.FAILED,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: {
      inState: DocumentState.IDENTIFICATION,
      description: 'Error description',
    },
    renderTrigger: mockRenderTrigger,
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const renderOpenTrigger = ModalFormButton.mock.calls[0][0].renderOpenTrigger
  const mockOpen = jest.fn()

  renderOpenTrigger(mockOpen)

  expect(mockRenderTrigger).toHaveBeenCalledWith(mockOpen, false)
})

test('disables extraction step when document failed in identification state', () => {
  const mockRenderTrigger = jest.fn(() => <div data-testid="trigger">Run Pipeline</div>)
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.FAILED,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: {
      inState: DocumentState.IDENTIFICATION,
      description: 'Error description',
    },
    renderTrigger: mockRenderTrigger,
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const renderOpenTrigger = ModalFormButton.mock.calls[0][0].renderOpenTrigger
  const mockOpen = jest.fn()

  renderOpenTrigger(mockOpen)

  expect(mockRenderTrigger).toHaveBeenCalledWith(mockOpen, true)
})

test('disables step when error state is not in allowed restart steps mapping', () => {
  const mockRenderTrigger = jest.fn(() => <div data-testid="trigger">Run Pipeline</div>)
  const mockProps = {
    step: PipelineStep.EXTRACTION,
    documentId: 'doc123',
    documentState: DocumentState.FAILED,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: {
      inState: DocumentState.PARSING,
      description: 'Error description',
    },
    renderTrigger: mockRenderTrigger,
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const renderOpenTrigger = ModalFormButton.mock.calls[0][0].renderOpenTrigger
  const mockOpen = jest.fn()

  renderOpenTrigger(mockOpen)

  expect(mockRenderTrigger).toHaveBeenCalledWith(mockOpen, true)
})

test('renders with selectedEngine prop and uses it as initial value for engine field', () => {
  const mockProps = {
    step: PipelineStep.PARSING,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    selectedEngine: KnownProcessingEngines.GCP_VISION,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.GCP_VISION,
    name: 'GCP Vision',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const fields = ModalFormButton.mock.calls[0][0].fields

  expect(fields.engine.initialValue).toBe(KnownProcessingEngines.GCP_VISION)
})

test('renders with PARSING step and includes parsing features field', () => {
  const mockProps = {
    step: PipelineStep.PARSING,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const fields = ModalFormButton.mock.calls[0][0].fields

  expect(fields.parsingFeatures).toBeDefined()
  expect(fields.parsingFeatures.label).toBe('Parsing Features')
})

test('renders with PARSING step and correct modal title', () => {
  const mockProps = {
    step: PipelineStep.PARSING,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  expect(ModalFormButton).toHaveBeenCalledWith(
    expect.objectContaining({
      title: expect.stringContaining('Parsing'),
    }),
    {},
  )
})

test('calls notifySuccess with correct message for parsing step', async () => {
  const mockProps = {
    step: PipelineStep.PARSING,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Engine 1',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const onOk = ModalFormButton.mock.calls[0][0].onOk

  const mockSettings = {
    engine: KnownProcessingEngines.TESSERACT,
    parsingFeatures: ['text'],
  }

  await act(async () => await onOk(mockSettings))

  expect(mockNotification.notifySuccess).toHaveBeenCalledWith(
    localize(Localization.PIPELINE_SUCCESS_FROM_STEP, { stepNumber: 'Parsing' }),
  )
})

test('uses selectedEngine as initial value when provided, otherwise uses documentEngine', () => {
  const mockProps = {
    step: PipelineStep.PARSING,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.TESSERACT,
    name: 'Tesseract',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const fields = ModalFormButton.mock.calls[0][0].fields

  expect(fields.engine.initialValue).toBe(KnownProcessingEngines.TESSERACT)
})

test('handles selectedEngine prop with KnownProcessingEngines values', () => {
  const mockProps = {
    step: PipelineStep.PARSING,
    documentId: 'doc123',
    documentState: DocumentState.IN_REVIEW,
    documentEngine: KnownProcessingEngines.TESSERACT,
    documentLLMType: 'gpt-3',
    error: null,
    selectedEngine: KnownProcessingEngines.GCP_VISION,
    renderTrigger: jest.fn(() => <div data-testid="trigger">Run Pipeline</div>),
  }

  useSelector.mockImplementation(() => [{
    id: KnownProcessingEngines.GCP_VISION,
    name: 'GCP Vision',
  }])

  render(<PipelineStepModal {...mockProps} />)

  const fields = ModalFormButton.mock.calls[0][0].fields

  expect(fields.engine.initialValue).toBe(KnownProcessingEngines.GCP_VISION)
})
