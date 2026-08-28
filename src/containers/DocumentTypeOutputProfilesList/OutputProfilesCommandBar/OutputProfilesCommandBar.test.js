
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import { ExtractionType } from '@/enums/ExtractionType'
import { FileExtension, FILE_EXTENSION_TO_DOWNLOAD_FORMAT } from '@/enums/FileExtension'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { DocumentType } from '@/models/DocumentType'
import { ExtractedDataSchema, OutputProfile, ExportingType } from '@/models/OutputProfile'
import { render } from '@/utils/rendererRTL'
import { DeleteOutputProfileButton } from '../DeleteOutputProfileButton'
import { OutputProfilesCommandBar } from './OutputProfilesCommandBar'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('../DeleteOutputProfileButton', () => mockShallowComponent('DeleteOutputProfileButton'))
jest.mock('../EditOutputProfileButton', () => mockShallowComponent('EditOutputProfileButton'))

const TEST_ID = {
  DELETE_BUTTON: 'DeleteOutputProfileButton',
  EDIT_BUTTON: 'EditOutputProfileButton',
}

const mockDocumentType = new DocumentType(
  'DocType1',
  'Doc Type 1',
  KnownProcessingEngines.TESSERACT,
  KnownLanguage.ENGLISH,
  ExtractionType.TEMPLATE,
)

const mockUserProfile = new OutputProfile({
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

const mockPluginProfile = new OutputProfile({
  id: 'mockPluginId',
  name: 'pluginName',
  format: FILE_EXTENSION_TO_DOWNLOAD_FORMAT[FileExtension.XLSX],
  creationDate: 'creationDate',
  version: 'pluginVersion',
  schema: new ExtractedDataSchema({
    fields: [],
    needsValidationResults: false,
  }),
  exportingType: ExportingType.PLUGIN,
})

test('show command bar with edit and delete button for profile', () => {
  render(
    <OutputProfilesCommandBar
      documentType={mockDocumentType}
      profile={mockUserProfile}
      refreshTable={jest.fn()}
      total={2}
    />,
  )

  expect(screen.getByTestId(TEST_ID.DELETE_BUTTON)).toBeInTheDocument()
  expect(screen.getByTestId(TEST_ID.EDIT_BUTTON)).toBeInTheDocument()
})

test('allows deletion when total profiles > 1 and profile is not a plugin', () => {
  render(
    <OutputProfilesCommandBar
      documentType={mockDocumentType}
      profile={mockUserProfile}
      refreshTable={jest.fn()}
      total={2}
    />,
  )

  expect(DeleteOutputProfileButton.getProps().isDeletionAllowed).toBe(true)
})

test('allows deletion when total profiles > 1 even for plugin profiles', () => {
  render(
    <OutputProfilesCommandBar
      documentType={mockDocumentType}
      profile={mockPluginProfile}
      refreshTable={jest.fn()}
      total={2}
    />,
  )

  expect(DeleteOutputProfileButton.getProps().isDeletionAllowed).toBe(true)
})

test('disallows deletion when total profiles = 1 and profile is not a plugin', () => {
  render(
    <OutputProfilesCommandBar
      documentType={mockDocumentType}
      profile={mockUserProfile}
      refreshTable={jest.fn()}
      total={1}
    />,
  )

  expect(DeleteOutputProfileButton.getProps().isDeletionAllowed).toBe(false)
})

test('disallows deletion when total profiles = 1 and profile is a plugin', () => {
  render(
    <OutputProfilesCommandBar
      documentType={mockDocumentType}
      profile={mockPluginProfile}
      refreshTable={jest.fn()}
      total={1}
    />,
  )

  expect(DeleteOutputProfileButton.getProps().isDeletionAllowed).toBe(false)
})
