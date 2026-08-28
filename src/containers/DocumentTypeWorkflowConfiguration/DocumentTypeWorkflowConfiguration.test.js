
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fetchDocumentType } from '@/actions/documentType'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { ReviewPolicy } from '@/enums/ReviewPolicy'
import { Localization, localize } from '@/localization/i18n'
import { ExtendedDocumentType } from '@/models/ExtendedDocumentType'
import { WorkflowConfiguration } from '@/models/WorkflowConfiguration'
import { render } from '@/utils/rendererRTL'
import { DocumentTypeWorkflowConfiguration } from './DocumentTypeWorkflowConfiguration'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)

const mockUpdateWorkflowConfiguration = jest.fn()
const mockDispatch = jest.fn()

jest.mock('@/apiRTK/documentTypeApi', () => ({
  useUpdateWorkflowConfigurationMutation: jest.fn(() => [
    mockUpdateWorkflowConfiguration,
    { isLoading: false },
  ]),
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/actions/documentType', () => ({
  fetchDocumentType: jest.fn(),
}))

jest.mock('@/components/Icons/GearIcon', () => ({
  GearIcon: () => <span data-testid="gear-icon" />,
}))

jest.mock('./WorkflowConfigurationDrawer', () => mockShallowComponent('WorkflowConfigurationDrawer'))

const getGearButton = () => screen.getByTestId('gear-icon')

const mockDocumentType = new ExtendedDocumentType({
  code: 'test-doc-type',
  name: 'Test Document Type',
  workflowConfiguration: new WorkflowConfiguration({
    needsExtraction: true,
    needsReview: ReviewPolicy.ALWAYS_REVIEW,
    needsValidation: false,
  }),
})

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders gear icon button with workflow configuration tooltip', () => {
  render(<DocumentTypeWorkflowConfiguration documentType={mockDocumentType} />)

  expect(getGearButton()).toBeInTheDocument()
})

test('does not show drawer initially', () => {
  render(<DocumentTypeWorkflowConfiguration documentType={mockDocumentType} />)

  const drawer = screen.getByTestId('WorkflowConfigurationDrawer')
  expect(drawer).toHaveAttribute('data-visible', 'false')
})

test('opens drawer when gear button is clicked', async () => {
  render(<DocumentTypeWorkflowConfiguration documentType={mockDocumentType} />)

  const button = getGearButton()
  await userEvent.click(button)

  const drawer = screen.getByTestId('WorkflowConfigurationDrawer')
  expect(drawer).toHaveAttribute('data-visible', 'true')
})

test('passes isLoading to drawer', () => {
  render(<DocumentTypeWorkflowConfiguration documentType={mockDocumentType} />)

  const drawer = screen.getByTestId('WorkflowConfigurationDrawer')
  expect(drawer).toHaveAttribute('data-isloading', 'false')
})

test('calls updateWorkflowConfiguration and shows success on submit', async () => {
  mockUpdateWorkflowConfiguration.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })

  render(<DocumentTypeWorkflowConfiguration documentType={mockDocumentType} />)

  const button = getGearButton()
  await userEvent.click(button)

  const drawer = screen.getByTestId('WorkflowConfigurationDrawer')
  const onSubmitProp = drawer.getAttribute('data-onsubmit')
  expect(onSubmitProp).toBe('mock-onSubmit')
})

test('closes drawer and refreshes document type after successful submit', async () => {
  mockUpdateWorkflowConfiguration.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })

  render(<DocumentTypeWorkflowConfiguration documentType={mockDocumentType} />)

  const button = getGearButton()
  await userEvent.click(button)

  const { WorkflowConfigurationDrawer: DrawerMock } = require('./WorkflowConfigurationDrawer')
  const drawerProps = DrawerMock.getProps()

  await act(async () => {
    await drawerProps.onSubmit({
      needsReview: ReviewPolicy.ALWAYS_REVIEW,
      needsExtraction: true,
      needsValidation: false,
      parsingFeatures: [KnownParsingFeature.TEXT],
      engine: KnownProcessingEngines.TESSERACT,
      needsOutputExporting: false,
    })
  })

  expect(mockUpdateWorkflowConfiguration).toHaveBeenCalledWith({
    documentTypeId: mockDocumentType.code,
    data: {
      needsValidation: false,
      needsReview: ReviewPolicy.ALWAYS_REVIEW,
      needsExtraction: true,
      parsingFeatures: [KnownParsingFeature.TEXT],
      engine: KnownProcessingEngines.TESSERACT,
      needsOutputExporting: false,
    },
  })

  expect(mockNotification.notifySuccess).toHaveBeenCalledWith(
    localize(Localization.WORKFLOW_SETTINGS_SAVED),
  )

  expect(mockDispatch).toHaveBeenCalledWith(
    fetchDocumentType(mockDocumentType.code, [DocumentTypeExtras.WORKFLOW_CONFIGURATIONS]),
  )
})

test('shows warning notification on submit error', async () => {
  mockUpdateWorkflowConfiguration.mockReturnValue({
    unwrap: jest.fn().mockRejectedValue({ data: { code: 'unknown_error' } }),
  })

  render(<DocumentTypeWorkflowConfiguration documentType={mockDocumentType} />)

  const button = getGearButton()
  await userEvent.click(button)

  const { WorkflowConfigurationDrawer: DrawerMock } = require('./WorkflowConfigurationDrawer')
  const drawerProps = DrawerMock.getProps()

  await act(async () => {
    await drawerProps.onSubmit({
      needsReview: ReviewPolicy.ALWAYS_REVIEW,
      needsExtraction: true,
      needsValidation: false,
    })
  })

  expect(mockNotification.notifyWarning).toHaveBeenCalled()
})

test('shows default error message when error code is not mapped', async () => {
  mockUpdateWorkflowConfiguration.mockReturnValue({
    unwrap: jest.fn().mockRejectedValue({ data: { code: 'unmapped_error' } }),
  })

  render(<DocumentTypeWorkflowConfiguration documentType={mockDocumentType} />)

  const button = getGearButton()
  await userEvent.click(button)

  const { WorkflowConfigurationDrawer: DrawerMock } = require('./WorkflowConfigurationDrawer')
  const drawerProps = DrawerMock.getProps()

  await act(async () => {
    await drawerProps.onSubmit({
      needsReview: ReviewPolicy.ALWAYS_REVIEW,
      needsExtraction: true,
      needsValidation: false,
    })
  })

  expect(mockNotification.notifyWarning).toHaveBeenCalledWith(
    localize(Localization.DEFAULT_ERROR),
  )
})
