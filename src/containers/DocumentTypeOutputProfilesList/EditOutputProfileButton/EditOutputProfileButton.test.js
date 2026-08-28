
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import {
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { updateOutputProfile } from '@/api/outputProfilesApi'
import { ExtractionType } from '@/enums/ExtractionType'
import { FileExtension, FILE_EXTENSION_TO_DOWNLOAD_FORMAT } from '@/enums/FileExtension'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { DocumentType } from '@/models/DocumentType'
import {
  DocumentLayoutSchema,
  ExtractedDataSchema,
  ExportingType,
  OutputProfile,
} from '@/models/OutputProfile'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { EditOutputProfileButton } from './EditOutputProfileButton'

const TEST_ID = {
  EDIT_BUTTON: 'edit-profile-button',
}

const mockIconContent = 'EditIcon'
jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/components/Icons/PenIcon', () => ({
  PenIcon: () => mockIconContent,
}))
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => jest.fn()),
}))

jest.mock('@/api/outputProfilesApi', () => ({
  updateOutputProfile: jest.fn(() => Promise.resolve({})),
}))
jest.mock('@/utils/notification', () => mockNotification)

const mockDocumentType = new DocumentType(
  'DocType1',
  'Doc Type 1',
  KnownProcessingEngines.TESSERACT,
  KnownLanguage.ENGLISH,
  ExtractionType.TEMPLATE,
)

const mockProfileWithExtraction = new OutputProfile({
  id: 'mockProfileId',
  name: 'profileName',
  format: FILE_EXTENSION_TO_DOWNLOAD_FORMAT[FileExtension.XLSX],
  creationDate: 'creationDate',
  version: 'profileVersion',
  schema: new ExtractedDataSchema({
    fields: [],
    needsValidationResults: false,
  }),
  exportingType: ExportingType.BUILT_IN,
})

const mockProfileWithLayout = new OutputProfile({
  id: 'mockProfileId',
  name: 'Profile Name',
  format: FILE_EXTENSION_TO_DOWNLOAD_FORMAT[FileExtension.XLSX],
  creationDate: 'creationDate',
  version: 'profileVersion',
  schema: new DocumentLayoutSchema({
    features: [],
    parsingType: mockDocumentType.engine,
  }),
  exportingType: ExportingType.BUILT_IN,
})

const mockSaveParamsWithExtraction = {
  name: 'New Profile Name',
  format: mockProfileWithExtraction.format,
  schema: mockProfileWithExtraction.schema,
}

const mockSaveParamsWithLayout = {
  name: 'New Profile Name',
  format: mockProfileWithLayout.format,
  schema: mockProfileWithLayout.schema,
}

test('show action button', () => {
  render(
    <EditOutputProfileButton
      documentType={mockDocumentType}
      onAfterEditing={jest.fn()}
      profile={mockProfileWithLayout}
    />,
  )

  const button = screen.getByTestId(TEST_ID.EDIT_BUTTON)

  expect(button).toBeInTheDocument()
})

test('show correct tooltip message when user hovers the button', async () => {
  render(
    <EditOutputProfileButton
      documentType={mockDocumentType}
      onAfterEditing={jest.fn()}
      profile={mockProfileWithLayout}
    />,
  )

  fireEvent.mouseOver(screen.getByTestId(TEST_ID.EDIT_BUTTON))

  await waitFor(() => {
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent(localize(Localization.EDIT))
  })
})

test('show output editing drawer in case of button click', async () => {
  render(
    <EditOutputProfileButton
      documentType={mockDocumentType}
      onAfterEditing={jest.fn()}
      profile={mockProfileWithLayout}
    />,
  )

  await userEvent.click(screen.getByTestId(TEST_ID.EDIT_BUTTON))

  expect(screen.getByTestId('drawer')).toBeInTheDocument()
})

test('disable action button when save profile', async () => {
  updateOutputProfile.mockImplementationOnce(() => new Promise(() => {}))

  render(
    <EditOutputProfileButton
      documentType={mockDocumentType}
      onAfterEditing={jest.fn()}
      profile={mockProfileWithLayout}
    />,
  )

  const editButton = screen.getByTestId(TEST_ID.EDIT_BUTTON)
  await userEvent.click(editButton)

  const input = screen.getByRole('textbox')
  fireEvent.change(input, { target: { value: mockSaveParamsWithLayout.name } })

  await userEvent.click(screen.getByRole('button', { name: /submit/i }))

  expect(editButton).toBeDisabled()
})

test('call updateOutputProfile api with correct parameters when save profile with extraction', async () => {
  jest.clearAllMocks()

  render(
    <EditOutputProfileButton
      documentType={mockDocumentType}
      onAfterEditing={jest.fn()}
      profile={mockProfileWithExtraction}
    />,
  )

  await userEvent.click(screen.getByTestId(TEST_ID.EDIT_BUTTON))

  const input = screen.getByPlaceholderText(localize(Localization.PROFILE_NAME_PLACEHOLDER))
  fireEvent.change(input, { target: { value: mockSaveParamsWithExtraction.name } })

  await userEvent.click(screen.getByRole('button', { name: /submit/i }))

  expect(updateOutputProfile).nthCalledWith(
    1,
    mockDocumentType.code,
    mockProfileWithExtraction.id,
    mockSaveParamsWithExtraction,
  )
})

test('call updateOutputProfile api with correct parameters when save profile with layout', async () => {
  jest.clearAllMocks()

  render(
    <EditOutputProfileButton
      documentType={mockDocumentType}
      onAfterEditing={jest.fn()}
      profile={mockProfileWithLayout}
    />,
  )

  await userEvent.click(screen.getByTestId(TEST_ID.EDIT_BUTTON))

  const input = screen.getByRole('textbox')
  fireEvent.change(input, { target: { value: mockSaveParamsWithLayout.name } })

  await userEvent.click(screen.getByRole('button', { name: /submit/i }))

  expect(updateOutputProfile).nthCalledWith(
    1,
    mockDocumentType.code,
    mockProfileWithLayout.id,
    mockSaveParamsWithLayout,
  )
})

test('call notifySuccess and onAfterEditing prop in case editing was successful', async () => {
  const mockOnAfterEditing = jest.fn()

  render(
    <EditOutputProfileButton
      documentType={mockDocumentType}
      onAfterEditing={mockOnAfterEditing}
      profile={mockProfileWithLayout}
    />,
  )

  await userEvent.click(screen.getByTestId(TEST_ID.EDIT_BUTTON))
  await userEvent.click(screen.getByRole('button', { name: /submit/i }))

  expect(notifySuccess).nthCalledWith(
    1,
    localize(Localization.OUTPUT_PROFILE_UPDATE_SUCCESS_STATUS),
  )

  expect(mockOnAfterEditing).toHaveBeenCalledTimes(1)
})

test('call notifyWarning in case editing has failed', async () => {
  updateOutputProfile.mockImplementation(() => Promise.reject(new Error('')))

  render(
    <EditOutputProfileButton
      documentType={mockDocumentType}
      onAfterEditing={jest.fn()}
      profile={mockProfileWithLayout}
    />,
  )

  await userEvent.click(screen.getByTestId(TEST_ID.EDIT_BUTTON))
  await userEvent.click(screen.getByRole('button', { name: /submit/i }))

  expect(notifyWarning).nthCalledWith(
    1,
    localize(Localization.DEFAULT_ERROR),
  )
})

test('disable action button for plugin profiles', () => {
  const mockPluginProfile = new OutputProfile({
    id: 'plugin-profile-id',
    name: 'Plugin Profile',
    creationDate: '2024-01-01',
    version: '1.0.0',
    format: FILE_EXTENSION_TO_DOWNLOAD_FORMAT[FileExtension.JSON],
    exportingType: ExportingType.PLUGIN,
    schema: new ExtractedDataSchema({
      fields: [],
      needsValidationResults: false,
    }),
  })

  render(
    <EditOutputProfileButton
      documentType={mockDocumentType}
      onAfterEditing={jest.fn()}
      profile={mockPluginProfile}
    />,
  )

  const button = screen.getByTestId(TEST_ID.EDIT_BUTTON)

  expect(button).toBeDisabled()
})

test('show correct tooltip message for plugin profile when user hovers the button', async () => {
  const mockPluginProfile = new OutputProfile({
    id: 'plugin-profile-id',
    name: 'Plugin Profile',
    creationDate: '2024-01-01',
    version: '1.0.0',
    format: FILE_EXTENSION_TO_DOWNLOAD_FORMAT[FileExtension.JSON],
    exportingType: ExportingType.PLUGIN,
    schema: new ExtractedDataSchema({
      fields: [],
      needsValidationResults: false,
    }),
  })

  render(
    <EditOutputProfileButton
      documentType={mockDocumentType}
      onAfterEditing={jest.fn()}
      profile={mockPluginProfile}
    />,
  )

  fireEvent.mouseOver(screen.getByTestId(TEST_ID.EDIT_BUTTON))

  await waitFor(() => {
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent(localize(Localization.OUTPUT_PROFILE_EDIT_IS_NOT_ALLOWED_PLUGINS))
  })
})
