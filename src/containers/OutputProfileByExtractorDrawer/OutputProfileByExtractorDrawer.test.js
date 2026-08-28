
import { mockEnv } from '@/mocks/mockEnv'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExtractionType } from '@/enums/ExtractionType'
import { FileExtension, FILE_EXTENSION_TO_DOWNLOAD_FORMAT } from '@/enums/FileExtension'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { DocumentType } from '@/models/DocumentType'
import { ExtractedDataSchema, OutputProfile } from '@/models/OutputProfile'
import { render } from '@/utils/rendererRTL'
import { OutputProfileByExtractorDrawer } from './OutputProfileByExtractorDrawer'
import { ProfileHeader } from './ProfileHeader'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/containers/OutputProfileByExtractor', () => ({
  OutputProfileByExtractor: () => <div data-testid="output-profile" />,
}))
jest.mock('./ProfileHeader')

ProfileHeader.mockImplementation(() => <div data-testid="profile-header" />)

const mockDocumentType = new DocumentType(
  'DocType1',
  'Doc Type 1',
  KnownProcessingEngines.TESSERACT,
  KnownLanguage.ENGLISH,
  ExtractionType.TEMPLATE,
)

const mockProfile = new OutputProfile({
  id: 'mockProfileId',
  name: 'Profile Name',
  format: FILE_EXTENSION_TO_DOWNLOAD_FORMAT[FileExtension.XLSX],
  creationDate: 'creationDate',
  version: 'profileVersion',
  schema: new ExtractedDataSchema({
    fields: mockDocumentType.fields.map((field) => field.code),
    needsValidationResults: true,
  }),
})

test('show Update output drawer if edit mode is on ', () => {
  render(
    <OutputProfileByExtractorDrawer
      documentTypeFields={mockDocumentType.fields}
      isEditMode={true}
      isLoading={false}
      onSubmit={jest.fn()}
      profile={mockProfile}
      setVisible={jest.fn()}
      visible={true}
    />,
  )
  expect(screen.getByText(localize(Localization.UPDATE_PROFILE))).toBeInTheDocument()
  expect(screen.getByRole('button', { name: localize(Localization.SUBMIT) })).toBeInTheDocument()
})

test('show Add profile by layout drawer if edit mode is off ', () => {
  render(
    <OutputProfileByExtractorDrawer
      documentTypeFields={mockDocumentType.fields}
      isEditMode={false}
      isLoading={false}
      onSubmit={jest.fn()}
      profile={mockProfile}
      setVisible={jest.fn()}
      visible={true}
    />,
  )

  expect(screen.getByText(localize(Localization.EXTRACTION_FIELDS_PROFILE))).toBeInTheDocument()
  expect(screen.getByRole('button', { name: localize(Localization.CREATE) })).toBeInTheDocument()
})

test('show profile header and fields', () => {
  render(
    <OutputProfileByExtractorDrawer
      documentTypeFields={mockDocumentType.fields}
      isEditMode={true}
      isLoading={false}
      onSubmit={jest.fn()}
      profile={mockProfile}
      setVisible={jest.fn()}
      visible={true}
    />,
  )

  expect(screen.getByTestId('profile-header')).toBeInTheDocument()
  expect(screen.getByTestId('output-profile')).toBeInTheDocument()
})

test('call setVisible prop if Cancel button is clicked ', async () => {
  const mockSetVisible = jest.fn()

  render(
    <OutputProfileByExtractorDrawer
      documentTypeFields={mockDocumentType.fields}
      isEditMode={true}
      isLoading={false}
      onSubmit={jest.fn()}
      profile={mockProfile}
      setVisible={mockSetVisible}
      visible={true}
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: localize(Localization.CANCEL) }))

  expect(mockSetVisible).toHaveBeenCalledTimes(1)
})

test('call onSubmit prop with correct parameters if Submit button is clicked ', async () => {
  const mockOnSubmit = jest.fn()

  render(
    <OutputProfileByExtractorDrawer
      documentTypeFields={mockDocumentType.fields}
      isEditMode={true}
      isLoading={false}
      onSubmit={mockOnSubmit}
      profile={mockProfile}
      setVisible={jest.fn()}
      visible={true}
    />,
  )

  await userEvent.click(screen.getByRole('button', { name: localize(Localization.SUBMIT) }))

  expect(mockOnSubmit).nthCalledWith(
    1,
    {
      name: mockProfile.name,
      schema: mockProfile.schema,
      format: mockProfile.format,
    },
  )
})

test('render disabled loading Submit button if isLoading prop is true ', () => {
  render(
    <OutputProfileByExtractorDrawer
      documentTypeFields={mockDocumentType.fields}
      isEditMode={true}
      isLoading={true}
      onSubmit={jest.fn()}
      profile={mockProfile}
      setVisible={jest.fn()}
      visible={true}
    />,
  )
  const submit = screen.getByRole('button', {
    name: new RegExp(localize(Localization.SUBMIT), 'i'),
  })

  expect(submit).toHaveClass('ant-btn-loading')
  expect(submit).toBeDisabled()
})

test('render disabled Submit button if profile name is not valid ', () => {
  ProfileHeader.mockImplementationOnce(jest.requireActual('./ProfileHeader').ProfileHeader)

  render(
    <OutputProfileByExtractorDrawer
      documentTypeFields={mockDocumentType.fields}
      isEditMode={true}
      isLoading={false}
      onSubmit={jest.fn()}
      profile={mockProfile}
      setVisible={jest.fn()}
      visible={true}
    />,
  )
  const input = screen.getByPlaceholderText(localize(Localization.PROFILE_NAME_PLACEHOLDER))
  fireEvent.change(input, { target: { value: '' } })

  const submit = screen.getByRole('button', { name: localize(Localization.SUBMIT) })

  expect(submit).toBeDisabled()
})
