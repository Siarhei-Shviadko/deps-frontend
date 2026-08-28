
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fetchTemplateMarkupState, fetchTemplateVersions } from '@/api/templatesApi'
import { ASYNC_OPERATION_STATE } from '@/enums/AsyncOperationState'
import { ExtractionType } from '@/enums/ExtractionType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { DocumentType } from '@/models/DocumentType'
import { TemplateVersion } from '@/models/TemplateVersion'
import { ENV } from '@/utils/env'
import { navigationMap } from '@/utils/navigationMap'
import { notifyInfo, notifyProgress, notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { goTo } from '@/utils/routerActions'
import { EditDocumentTypeButton } from './EditDocumentTypeButton'

const mockDocumentType = new DocumentType(
  'DocType1',
  'Doc Type 1',
  KnownProcessingEngines.TESSERACT,
  KnownLanguage.ENGLISH,
  ExtractionType.TEMPLATE,
)
const mockVersion = new TemplateVersion({
  id: 'versionId',
  name: 'test',
  createdAt: '2023-04-21',
  templateId: 'templateId',
})

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('@/utils/routerActions', () => ({
  goTo: jest.fn(),
}))
jest.mock('@/api/templatesApi', () => ({
  fetchTemplateVersions: jest.fn(() => Promise.resolve([mockVersion])),
  fetchTemplateMarkupState: jest.fn(),
}))

test('show button with correct text', () => {
  render(
    <EditDocumentTypeButton
      documentType={mockDocumentType}
    />,
  )

  const button = screen.getByRole('button', localize(Localization.EDIT_DOCUMENT_TYPE))

  expect(button).toBeInTheDocument()
})

test('open the prototype page when user clicked on edit prototype', async () => {
  jest.clearAllMocks()

  const dt = {
    ...mockDocumentType,
    extractionType: ExtractionType.PROTOTYPE,
  }

  render(
    <EditDocumentTypeButton
      documentType={dt}
    />,
  )

  await userEvent.click(screen.getByRole('button', localize(Localization.EDIT_DOCUMENT_TYPE)))

  expect(goTo).nthCalledWith(1, navigationMap.prototypes.prototype(mockDocumentType.code))
})

test('should open TemplateVersionsPage if user clicked on edit template and feature for versions is enabled', async () => {
  jest.clearAllMocks()

  ENV.FEATURE_MANAGE_TEMPLATE_VERSIONS = true

  const dt = {
    ...mockDocumentType,
    extractionType: ExtractionType.TEMPLATE,
  }

  render(
    <EditDocumentTypeButton
      documentType={dt}
    />,
  )

  await userEvent.click(screen.getByRole('button', localize(Localization.EDIT_DOCUMENT_TYPE)))

  expect(goTo).nthCalledWith(1, navigationMap.templates.template(mockDocumentType.code))
})

test('should call fetchTemplateVersions api with correct arg before opening LabelingTool page', async () => {
  ENV.FEATURE_MANAGE_TEMPLATE_VERSIONS = false

  const dt = {
    ...mockDocumentType,
    extractionType: ExtractionType.TEMPLATE,
  }

  render(
    <EditDocumentTypeButton
      documentType={dt}
    />,
  )

  await userEvent.click(screen.getByRole('button', localize(Localization.EDIT_DOCUMENT_TYPE)))

  expect(fetchTemplateVersions).nthCalledWith(1, mockDocumentType.code)
})

test('should show warning notification if fetchTemplateVersions failed', async () => {
  ENV.FEATURE_MANAGE_TEMPLATE_VERSIONS = false

  fetchTemplateVersions.mockImplementationOnce(() => Promise.reject(new Error('test')))

  const dt = {
    ...mockDocumentType,
    extractionType: ExtractionType.TEMPLATE,
  }

  render(
    <EditDocumentTypeButton
      documentType={dt}
    />,
  )

  await userEvent.click(screen.getByRole('button', localize(Localization.EDIT_DOCUMENT_TYPE)))

  expect(notifyWarning).nthCalledWith(1, localize(Localization.DEFAULT_ERROR))
})

test('should open LabelingTool page if user clicked on edit template and feature for versions is disabled', async () => {
  jest.clearAllMocks()
  ENV.FEATURE_MANAGE_TEMPLATE_VERSIONS = false

  const dt = {
    ...mockDocumentType,
    extractionType: ExtractionType.TEMPLATE,
  }

  render(
    <EditDocumentTypeButton
      documentType={dt}
    />,
  )

  await userEvent.click(screen.getByRole('button', localize(Localization.EDIT_DOCUMENT_TYPE)))

  await waitFor(() => {
    expect(goTo).nthCalledWith(1, navigationMap.templates.labelingTool(mockDocumentType.code, mockVersion.id))
  })
})

test('should call notifyProgress and fetchTemplateMarkupState if user clicked on edit template and auto labeling is enabled', async () => {
  ENV.FEATURE_MANAGE_TEMPLATE_VERSIONS = false
  ENV.FEATURE_AUTO_LABELING = true

  const dt = {
    ...mockDocumentType,
    extractionType: ExtractionType.TEMPLATE,
  }

  render(
    <EditDocumentTypeButton
      documentType={dt}
    />,
  )

  await userEvent.click(screen.getByRole('button', localize(Localization.EDIT_DOCUMENT_TYPE)))

  expect(notifyProgress).nthCalledWith(1, localize(Localization.AUTO_MARKUP_CHECKING))
  expect(fetchTemplateMarkupState).nthCalledWith(1, mockDocumentType.code)
})

test('should call notifyInfo in case of pipeline status is processing', async () => {
  ENV.FEATURE_MANAGE_TEMPLATE_VERSIONS = false
  ENV.FEATURE_AUTO_LABELING = true

  fetchTemplateMarkupState.mockImplementationOnce(() => Promise.resolve(ASYNC_OPERATION_STATE.PROCESSING))

  const dt = {
    ...mockDocumentType,
    extractionType: ExtractionType.TEMPLATE,
  }

  render(
    <EditDocumentTypeButton
      documentType={dt}
    />,
  )

  await userEvent.click(screen.getByRole('button', localize(Localization.EDIT_DOCUMENT_TYPE)))

  await waitFor(() => {
    expect(notifyInfo).nthCalledWith(1, localize(Localization.AUTO_MARKUP_IN_PROGRESS))
  })
})
