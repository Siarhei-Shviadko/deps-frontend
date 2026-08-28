import { mockEnv } from '@/mocks/mockEnv'
import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { clearDocumentTypeStore, fetchDocumentType } from '@/actions/documentType'
import { changeActiveTab } from '@/actions/documentTypePage'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { ExtractionType } from '@/enums/ExtractionType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { StatusCode } from '@/enums/StatusCode'
import { Localization, localize } from '@/localization/i18n'
import { ExtendedDocumentType } from '@/models/ExtendedDocumentType'
import { ENV } from '@/utils/env'
import { navigationMap } from '@/utils/navigationMap'
import { render } from '@/utils/rendererRTL'
import { goTo } from '@/utils/routerActions'
import { DocumentTypeViewPage } from './DocumentTypeViewPage'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/actions/documentType', () => ({
  fetchDocumentType: jest.fn(() => ({ type: 'mockType' })),
  clearDocumentTypeStore: jest.fn(() => ({ type: 'mockType' })),
}))
jest.mock('@/actions/documentTypePage', () => ({
  changeActiveTab: jest.fn(() => ({ type: 'mockType' })),
}))
jest.mock('@/selectors/documentType')
jest.mock('react-router', () => ({
  useParams: jest.fn(() => ({
    documentTypeCode: mockDocumentType.code,
  })),
}))
jest.mock('@/utils/routerActions', () => ({
  goTo: jest.fn(),
}))
jest.mock('./DocumentTypeHeader', () => ({
  DocumentTypeHeader: () => <div data-testid='dt-header' />,
}))
jest.mock('@/containers/DocumentTypeFieldsList', () => ({
  DocumentTypeFieldsList: () => <div data-testid='dt-fields' />,
}))
jest.mock('@/containers/DocumentTypeLLMExtractorsList', () => ({
  DocumentTypeLLMExtractorsList: () => <div data-testid='llm-extractors' />,
}))
jest.mock('@/containers/DocumentTypeOutputProfilesList', () => ({
  DocumentTypeOutputProfilesList: () => <div data-testid='output-profiles' />,
}))
jest.mock('@/containers/DocumentTypeBusinessRulesList', () => ({
  DocumentTypeBusinessRulesList: () => <div data-testid='business-rules' />,
}))

const mockDocumentType = new ExtendedDocumentType({
  code: 'DocType1',
  name: 'Doc Type 1',
  extractionType: ExtractionType.TEMPLATE,
  language: KnownLanguage,
  engine: KnownProcessingEngines,
})

const originalEnv = JSON.parse(JSON.stringify(mockEnv.ENV))

beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => {
  mockEnv.ENV = { ...originalEnv }
})

test('shows spinner if document type is fetching', async () => {
  fetchDocumentType.mockImplementationOnce(() => async () => {})

  render(<DocumentTypeViewPage />)

  await waitFor(() => {
    expect(screen.getByTestId('spin')).toBeInTheDocument()
  })
})

test('shows document type header', async () => {
  render(<DocumentTypeViewPage />)

  await waitFor(() => {
    expect(screen.getByTestId('dt-header')).toBeInTheDocument()
  })
})

test('shows all tabs and displays Fields tab content after document type was fetched', async () => {
  render(<DocumentTypeViewPage />)

  await waitForElementToBeRemoved(screen.queryByTestId('spin'))

  expect(screen.getByText(localize(Localization.FIELDS_TITLE))).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.OUTPUT_PROFILES))).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.LLM_EXTRACTORS))).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.BUSINESS_RULES))).toBeInTheDocument()
  expect(screen.getByTestId('dt-fields')).toBeInTheDocument()
})

test('does not show output profiles tab when feature flag is off', async () => {
  ENV.FEATURE_OUTPUT_PROFILES = false

  render(<DocumentTypeViewPage />)

  await waitFor(() => {
    expect(screen.queryByText(localize(Localization.OUTPUT_PROFILES))).not.toBeInTheDocument()
  })
})

test('does not show llm extractors tab when feature flag is off', async () => {
  ENV.FEATURE_LLM_EXTRACTORS = false

  render(<DocumentTypeViewPage />)

  await waitFor(() => {
    expect(screen.queryByText(localize(Localization.LLM_EXTRACTORS))).not.toBeInTheDocument()
  })
})

test('does not show business rules tab when feature flag is off', async () => {
  ENV.FEATURE_VALIDATION_BUSINESS_RULES = false

  render(<DocumentTypeViewPage />)

  await waitFor(() => {
    expect(screen.queryByText(localize(Localization.BUSINESS_RULES))).not.toBeInTheDocument()
  })
})

test('calls fetchDocumentType with correct args', async () => {
  render(<DocumentTypeViewPage />)

  await waitFor(() => {
    expect(fetchDocumentType).nthCalledWith(
      1,
      mockDocumentType.code,
      [
        DocumentTypeExtras.EXTRACTION_FIELDS,
        DocumentTypeExtras.VALIDATORS,
        DocumentTypeExtras.EXTRA_FIELDS,
        DocumentTypeExtras.PROFILES,
        DocumentTypeExtras.LLM_EXTRACTORS,
        DocumentTypeExtras.WORKFLOW_CONFIGURATIONS,
      ],
    )
  })
})

test('calls goTo if fetchDocumentType is rejected with error with status NOT_FOUND', async () => {
  const error = new Error('test')
  error.response = {
    status: StatusCode.NOT_FOUND,
  }

  fetchDocumentType.mockImplementationOnce(() => async () => Promise.reject(error))

  render(<DocumentTypeViewPage />)

  await waitFor(() => {
    expect(goTo).nthCalledWith(1, navigationMap.error.notFound())
  })
})

test('calls changeActiveTab on tab change', async () => {
  render(<DocumentTypeViewPage />)

  await waitForElementToBeRemoved(screen.queryByTestId('spin'))

  const outputProfilesTab = screen.getByText(localize(Localization.OUTPUT_PROFILES))
  await userEvent.click(outputProfilesTab)

  expect(changeActiveTab).toHaveBeenCalledWith(expect.stringMatching(/outputProfiles/i))
})

test('calls clearDocumentTypeStore on unmount', async () => {
  const { unmount } = render(<DocumentTypeViewPage />)

  await waitForElementToBeRemoved(screen.queryByTestId('spin'))
  unmount()

  await waitFor(() => {
    expect(clearDocumentTypeStore).toHaveBeenCalledTimes(1)
  })
})

test('calls changeActiveTab on unmount', async () => {
  const { unmount } = render(<DocumentTypeViewPage />)

  await waitForElementToBeRemoved(screen.queryByTestId('spin'))
  unmount()

  await waitFor(() => {
    expect(changeActiveTab).toHaveBeenCalledTimes(1)
  })
})
