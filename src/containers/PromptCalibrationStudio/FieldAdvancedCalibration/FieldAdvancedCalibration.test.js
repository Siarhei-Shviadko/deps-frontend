
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { FieldType } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import { notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { mapNodesToRequestedInsights } from '../mappers'
import {
  MULTIPLICITY,
  Extractor,
  Field,
  Query,
  QueryNode,
} from '../viewModels'
import { FieldAdvancedCalibration } from './FieldAdvancedCalibration'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('../InsightsComparison', () => ({
  InsightsComparison: ({ executedValue, field }) => (
    <div data-testid="InsightsComparison">
      <span>{mockCalibrationFieldsAdapterContent}</span>
      <span data-testid="executed-value">{JSON.stringify(executedValue)}</span>
      <span data-testid="field-id">{field.id}</span>
    </div>
  ),
}))
jest.mock('../InsightsErrorBoundary', () => ({
  InsightsErrorBoundary: ({ children }) => (
    <div data-testid="InsightsErrorBoundary">{children}</div>
  ),
}))
jest.mock('../FieldName', () => mockShallowComponent('FieldName'))
jest.mock('../LLMExtractorInfo', () => mockShallowComponent('LLMExtractorInfo'))
jest.mock('./FieldsSwitcher', () => mockShallowComponent('FieldsSwitcher'))
jest.mock('./LLMExtractorDrawer', () => mockShallowComponent('LLMExtractorDrawer'))
let mockActiveFieldForExecute
jest.mock('./FieldFooter', () => ({
  FieldFooter: ({ onExecute }) => (
    <div data-testid="FieldFooter">
      <button
        onClick={() => onExecute({ nodes: mockActiveFieldForExecute?.query?.nodes ?? [] })}
        type="button"
      >
        {mockOnExecuteContent}
      </button>
    </div>
  ),
}))
jest.mock('./PromptChain', () => ({
  PromptChain: ({ onSaveNodes, queryNodes }) => (
    <div>
      <span>{mockPromptChainContent}</span>
      <span data-testid="prompt-chain-query-nodes">{JSON.stringify(queryNodes?.length)}</span>
      <button
        onClick={() => onSaveNodes(queryNodes)}
        type="button"
      >
        save-nodes
      </button>
    </div>
  ),
}))

jest.mock('../hooks', () => ({
  useFieldCalibration: jest.fn(() => ({
    activeField: mockField1,
    setActiveField: mockSetActiveField,
    setCalibrationMode: mockSetCalibrationMode,
    fields: [mockField1, mockField2],
    extractors: [mockExtractor],
  })),
  useRetrieveInsights: jest.fn(() => [
    mockRetrieveInsights,
    false,
  ]),
}))

const mockPromptChainContent = 'prompt-chain'
const mockOnExecuteContent = 'on-execute'
const mockCalibrationFieldsAdapterContent = 'calibration-fields-adapter'

const mockRetrieveInsights = jest.fn(() => ({
  unwrap: jest.fn(() => ({
    'field-1': {
      errorOccurred: false,
      content: 'new executed value',
    },
  })),
  isLoading: false,
}))

const mockSetActiveField = jest.fn()
const mockSetCalibrationMode = jest.fn()

const mockField1 = new Field({
  id: 'field-1',
  name: 'Test Field',
  value: 'initial value',
  extractorId: 'extractor-1',
  query: new Query({
    nodes: [
      new QueryNode({
        id: 'node-1',
        name: 'Node 1',
        prompt: 'Test prompt',
      }),
    ],
    value: 'initial value',
  }),
  fieldType: FieldType.STRING,
  multiplicity: MULTIPLICITY.SINGLE,
})

const mockField2 = new Field({
  id: 'field-2',
  name: 'Test Field 2',
  value: 'value 2',
  extractorId: 'extractor-1',
  fieldType: FieldType.STRING,
  multiplicity: MULTIPLICITY.SINGLE,
})

const mockExtractor = new Extractor({
  id: 'extractor-1',
  customInstruction: 'Extract the data',
  groupingFactor: 1,
  model: 'gpt-4',
  name: 'Test Extractor',
  pageSpan: null,
  temperature: 0.5,
  topP: 0.9,
})

beforeEach(() => {
  jest.clearAllMocks()
  mockActiveFieldForExecute = mockField1
})

test('renders FieldAdvancedCalibration with all child components', () => {
  render(<FieldAdvancedCalibration />)

  const fieldName = screen.getByTestId('FieldName')
  const lLMExtractorInfo = screen.getByTestId('LLMExtractorInfo')
  const fieldsSwitcher = screen.getByTestId('FieldsSwitcher')
  const lLMExtractorDrawer = screen.getByTestId('LLMExtractorDrawer')
  const calibrationFieldsAdapter = screen.getByText(mockCalibrationFieldsAdapterContent, { exact: false })
  const promptChain = screen.getByText(mockPromptChainContent, { exact: false })
  const fieldFooter = screen.getByTestId('FieldFooter')

  expect(fieldName).toBeInTheDocument()
  expect(lLMExtractorInfo).toBeInTheDocument()
  expect(fieldsSwitcher).toBeInTheDocument()
  expect(lLMExtractorDrawer).toBeInTheDocument()
  expect(calibrationFieldsAdapter).toBeInTheDocument()
  expect(promptChain).toBeInTheDocument()
  expect(fieldFooter).toBeInTheDocument()
})

test('calls retrieveInsights with correct parameters when onExecute is triggered', async () => {
  jest.clearAllMocks()

  render(<FieldAdvancedCalibration />)

  const executeBtn = screen.getByRole('button', { name: mockOnExecuteContent })
  await userEvent.click(executeBtn)

  await waitFor(() => {
    expect(mockRetrieveInsights).toHaveBeenCalledTimes(1)
  })

  const {
    model,
    customInstruction,
    contextAttachments,
    stop,
    ...rest
  } = mockExtractor

  expect(mockRetrieveInsights).toHaveBeenCalledWith(
    expect.objectContaining({
      model,
      customInstructions: customInstruction,
      requestedInsights: mapNodesToRequestedInsights(mockField1, mockField1.query.nodes),
      params: {
        contextAttachments: contextAttachments || null,
        stop: stop?.length ? stop : null,
        ...rest,
      },
    }),
  )
})

test('updates executedValue when retrieveInsights succeeds', async () => {
  render(<FieldAdvancedCalibration />)

  const executeBtn = screen.getByRole('button', { name: mockOnExecuteContent })
  await userEvent.click(executeBtn)

  await waitFor(() => {
    const calibrationFieldsAdapter = screen.getByText(mockCalibrationFieldsAdapterContent, { exact: false })
    expect(calibrationFieldsAdapter).toHaveTextContent(mockCalibrationFieldsAdapterContent)
  })
})

test('shows warning notification when retrieveInsights returns error', async () => {
  mockRetrieveInsights.mockImplementationOnce(() => ({
    unwrap: () => Promise.reject(new Error('UNKNOWN_ERROR')),
  }))

  render(<FieldAdvancedCalibration />)

  const executeBtn = screen.getByRole('button', { name: mockOnExecuteContent })
  await userEvent.click(executeBtn)

  await waitFor(() => {
    expect(notifyWarning).toHaveBeenCalledWith(localize(Localization.DEFAULT_ERROR))
  })
})

test('shows warning notification when retrieveInsights returns errorOccurred', async () => {
  const errorMessage = 'Error occurred during processing'
  mockRetrieveInsights.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => ({
      'field-1': {
        errorOccurred: true,
        content: errorMessage,
      },
    })),
  }))

  render(<FieldAdvancedCalibration />)

  const executeBtn = screen.getByRole('button', { name: mockOnExecuteContent })
  await userEvent.click(executeBtn)

  await waitFor(() => {
    expect(notifyWarning).toHaveBeenCalledWith(errorMessage)
  })
})

test('does not update activeField when retrieveInsights returns errorOccurred', async () => {
  mockRetrieveInsights.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => ({
      'field-1': {
        errorOccurred: true,
        content: 'Error occurred',
      },
    })),
  }))

  render(<FieldAdvancedCalibration />)

  const executeBtn = screen.getByRole('button', { name: mockOnExecuteContent })
  await userEvent.click(executeBtn)

  await waitFor(() => {
    expect(notifyWarning).toHaveBeenCalled()
  })

  expect(mockSetActiveField).not.toHaveBeenCalled()
})

test('renders InsightsComparison with activeField and executedValue', () => {
  render(<FieldAdvancedCalibration />)

  const fieldId = screen.getByTestId('field-id')
  const executedValue = screen.getByTestId('executed-value')

  expect(fieldId).toHaveTextContent('field-1')
  expect(executedValue).toBeInTheDocument()
})

test('updates activeField with parsed JSON response when content is JSON string', async () => {
  const jsonContent = '{"value": "parsed value"}'
  mockRetrieveInsights.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => ({
      'field-1': {
        errorOccurred: false,
        content: jsonContent,
      },
    })),
  }))

  render(<FieldAdvancedCalibration />)

  const executeBtn = screen.getByRole('button', { name: mockOnExecuteContent })
  await userEvent.click(executeBtn)

  await waitFor(() => {
    expect(mockSetActiveField).toHaveBeenCalledTimes(1)
  })

  expect(mockSetActiveField).toHaveBeenNthCalledWith(1, expect.any(Function))

  const [updateFunction] = mockSetActiveField.mock.calls[0]
  const updatedField = updateFunction(mockField1)

  expect(updatedField).toEqual(expect.objectContaining({
    id: mockField1.id,
    name: mockField1.name,
    fieldType: mockField1.fieldType,
    extractorId: mockField1.extractorId,
    multiplicity: mockField1.multiplicity,
    query: expect.objectContaining({
      value: 'parsed value',
      nodes: mockField1.query.nodes,
    }),
  }))
})

test('updates activeField with array value for multiple field type', async () => {
  const arrayContent = { value: ['item1', 'item2', 'item3'] }
  mockRetrieveInsights.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => ({
      'field-1': {
        errorOccurred: false,
        content: arrayContent,
      },
    })),
  }))

  render(<FieldAdvancedCalibration />)

  const executeBtn = screen.getByRole('button', { name: mockOnExecuteContent })
  await userEvent.click(executeBtn)

  await waitFor(() => {
    expect(mockSetActiveField).toHaveBeenCalledTimes(1)
  })

  expect(mockSetActiveField).toHaveBeenNthCalledWith(1, expect.any(Function))

  const [updateFunction] = mockSetActiveField.mock.calls[0]
  const updatedField = updateFunction(mockField1)

  expect(updatedField).toEqual(expect.objectContaining({
    id: mockField1.id,
    name: mockField1.name,
    fieldType: mockField1.fieldType,
    extractorId: mockField1.extractorId,
    multiplicity: mockField1.multiplicity,
    query: expect.objectContaining({
      value: ['item1', 'item2', 'item3'],
      nodes: mockField1.query.nodes,
    }),
  }))
})

test('updates activeField with key-value pair for dictionary field type', async () => {
  const dictContent = {
    value: {
      key: 'test key',
      value: 'test value',
    },
  }
  mockRetrieveInsights.mockImplementationOnce(() => ({
    unwrap: jest.fn(() => ({
      'field-1': {
        errorOccurred: false,
        content: dictContent,
      },
    })),
  }))

  render(<FieldAdvancedCalibration />)

  const executeBtn = screen.getByRole('button', { name: mockOnExecuteContent })
  await userEvent.click(executeBtn)

  await waitFor(() => {
    expect(mockSetActiveField).toHaveBeenCalledTimes(1)
  })

  expect(mockSetActiveField).toHaveBeenNthCalledWith(1, expect.any(Function))

  const [updateFunction] = mockSetActiveField.mock.calls[0]
  const updatedField = updateFunction(mockField1)

  expect(updatedField).toEqual(expect.objectContaining({
    id: mockField1.id,
    name: mockField1.name,
    fieldType: mockField1.fieldType,
    extractorId: mockField1.extractorId,
    multiplicity: mockField1.multiplicity,
    query: expect.objectContaining({
      value: {
        key: 'test key',
        value: 'test value',
      },
      nodes: mockField1.query.nodes,
    }),
  }))
})

test('wraps InsightsComparison with InsightsErrorBoundary', () => {
  render(<FieldAdvancedCalibration />)

  const errorBoundary = screen.getByTestId('InsightsErrorBoundary')
  const insightsComparison = screen.getByTestId('InsightsComparison')

  expect(errorBoundary).toBeInTheDocument()
  expect(insightsComparison).toBeInTheDocument()
  expect(errorBoundary).toContainElement(insightsComparison)
})

test('updates query nodes without executing when onSaveNodes is called', async () => {
  render(<FieldAdvancedCalibration />)

  const saveNodesBtn = screen.getByRole('button', { name: 'save-nodes' })
  await userEvent.click(saveNodesBtn)

  expect(mockSetActiveField).toHaveBeenCalledTimes(1)
  expect(mockRetrieveInsights).not.toHaveBeenCalled()
})

test('preserves existing query value and reasoning when onSaveNodes is called', async () => {
  render(<FieldAdvancedCalibration />)

  const saveNodesBtn = screen.getByRole('button', { name: 'save-nodes' })
  await userEvent.click(saveNodesBtn)

  expect(mockSetActiveField).toHaveBeenNthCalledWith(1, expect.any(Function))

  const [updateFunction] = mockSetActiveField.mock.calls[0]
  const updatedField = updateFunction(mockField1)

  expect(updatedField.query.value).toBe(mockField1.query.value)
  expect(updatedField.query.reasoning).toBe(mockField1.query.reasoning)
})
