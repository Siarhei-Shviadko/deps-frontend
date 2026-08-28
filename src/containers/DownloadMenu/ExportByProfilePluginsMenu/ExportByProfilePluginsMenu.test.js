
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createProfileOutputV2 } from '@/api/outputProfilesApi'
import { ExtractionType } from '@/enums/ExtractionType'
import { FILE_EXTENSION_TO_DOWNLOAD_FORMAT, FileExtension } from '@/enums/FileExtension'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { DocumentType } from '@/models/DocumentType'
import { ExtractedDataSchema, OutputProfile, ExportingType } from '@/models/OutputProfile'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { ExportByProfilePluginsMenu } from './ExportByProfilePluginsMenu'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('@/api/outputProfilesApi', () => ({
  createProfileOutputV2: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(() => ({ documentId: 'test-doc-id' })),
}))

jest.mock('@/components/Menu', () => ({
  Menu: {
    SubMenu: ({ children, disabled, title, ...props }) => (
      <div
        data-testid="custom-submenu"
        disabled={disabled}
        {...props}
      >
        {title}
        {children}
      </div>
    ),
    Item: ({ children, disabled, onClick, ...props }) => (
      <div
        data-testid="menu-item"
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    ),
  },
}))

jest.mock('./ExportByProfilePluginsMenu.styles.js', () => ({
  ...jest.requireActual('./ExportByProfilePluginsMenu.styles.js'),
  CustomSubMenu: ({ children, disabled, title, ...props }) => (
    <div
      data-testid="custom-submenu"
      disabled={disabled}
      {...props}
    >
      {title}
      {children}
    </div>
  ),
  MenuItem: ({ children, disabled, onClick, ...props }) => (
    <div
      data-testid="menu-item"
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  ),
  ArrowIcon: ({ $disabled, ...props }) => (
    <div
      data-disabled={$disabled ? 'true' : 'false'}
      data-testid="arrow-icon"
      {...props}
    />
  ),
}))

const mockDocumentType = new DocumentType(
  'DocType1',
  'Doc Type 1',
  KnownProcessingEngines.TESSERACT,
  KnownLanguage.ENGLISH,
  ExtractionType.TEMPLATE,
)

const mockUserProfile = new OutputProfile({
  id: 'user-profile-id',
  name: 'User Profile',
  creationDate: '2024-01-01',
  version: '1.0.0',
  schema: new ExtractedDataSchema({
    fields: [],
    needsValidationResults: false,
  }),
  format: FILE_EXTENSION_TO_DOWNLOAD_FORMAT[FileExtension.JSON],
  exportingType: ExportingType.BUILT_IN,
})

const mockPluginProfile = new OutputProfile({
  id: 'plugin-profile-id',
  name: 'Plugin Profile',
  creationDate: '2024-01-01',
  version: '1.0.0',
  format: 'custom-format',
  exportingType: ExportingType.PLUGIN,
})

test('should render submenu with plugin profiles', () => {
  const documentTypeWithPlugins = {
    ...mockDocumentType,
    profiles: [mockUserProfile, mockPluginProfile],
  }

  render(<ExportByProfilePluginsMenu documentType={documentTypeWithPlugins} />)

  expect(screen.getByText(localize(Localization.EXPORT_BY_PROFILE_PLUGINS))).toBeInTheDocument()
  expect(screen.getByText('Plugin Profile')).toBeInTheDocument()
  expect(screen.queryByText('User Profile')).not.toBeInTheDocument()
})

test('should not disable submenu when plugin profiles are available', () => {
  const documentTypeWithPlugins = {
    ...mockDocumentType,
    profiles: [mockUserProfile, mockPluginProfile],
  }

  render(<ExportByProfilePluginsMenu documentType={documentTypeWithPlugins} />)

  const submenu = screen.getByTestId('custom-submenu')
  expect(submenu).not.toHaveAttribute('disabled', 'true')
})

test('should call createProfileOutputV2 when plugin profile is clicked', async () => {
  const user = userEvent.setup()
  const documentTypeWithPlugins = {
    ...mockDocumentType,
    profiles: [mockPluginProfile],
  }

  createProfileOutputV2.mockResolvedValue({})

  render(<ExportByProfilePluginsMenu documentType={documentTypeWithPlugins} />)

  await user.click(screen.getByText('Plugin Profile'))

  expect(createProfileOutputV2).toHaveBeenCalledWith({
    documentId: 'test-doc-id',
    documentTypeId: mockDocumentType.code,
    profileId: 'plugin-profile-id',
  })
})

test('should show success notification when plugin execution succeeds', async () => {
  const user = userEvent.setup()
  const documentTypeWithPlugins = {
    ...mockDocumentType,
    profiles: [mockPluginProfile],
  }

  createProfileOutputV2.mockResolvedValue({})

  render(<ExportByProfilePluginsMenu documentType={documentTypeWithPlugins} />)

  await user.click(screen.getByText('Plugin Profile'))

  await waitFor(() => {
    expect(notifySuccess).toHaveBeenCalledWith(localize(Localization.EXPORT_BY_PROFILE_PLUGINS_SUCCESS))
  })
})

test('should show warning notification when plugin execution fails', async () => {
  const user = userEvent.setup()
  const documentTypeWithPlugins = {
    ...mockDocumentType,
    profiles: [mockPluginProfile],
  }

  createProfileOutputV2.mockRejectedValue(new Error('API error'))

  render(<ExportByProfilePluginsMenu documentType={documentTypeWithPlugins} />)

  await user.click(screen.getByText('Plugin Profile'))

  await waitFor(() => {
    expect(notifyWarning).toHaveBeenCalledWith(localize(Localization.DEFAULT_ERROR))
  })
})

test('should disable submenu when no plugin profiles are available', () => {
  const documentTypeWithoutPlugins = {
    ...mockDocumentType,
    profiles: [mockUserProfile],
  }

  render(<ExportByProfilePluginsMenu documentType={documentTypeWithoutPlugins} />)

  const submenu = screen.getByTestId('custom-submenu')
  expect(submenu).toHaveAttribute('disabled')
})

test('should disable submenu when document type has no profiles', () => {
  const documentTypeWithoutProfiles = {
    ...mockDocumentType,
    profiles: [],
  }

  render(<ExportByProfilePluginsMenu documentType={documentTypeWithoutProfiles} />)
  const submenu = screen.getByTestId('custom-submenu')
  expect(submenu).toHaveAttribute('disabled')
})

test('should render title with arrow icon when plugin profiles are available', () => {
  const documentTypeWithPlugins = {
    ...mockDocumentType,
    profiles: [mockPluginProfile],
  }

  render(<ExportByProfilePluginsMenu documentType={documentTypeWithPlugins} />)

  expect(screen.getByTestId('title')).toBeInTheDocument()
  expect(screen.getByTestId('arrow-icon')).toBeInTheDocument()
})

test('should disable menu items during loading state', async () => {
  const user = userEvent.setup()
  const documentTypeWithPlugins = {
    ...mockDocumentType,
    profiles: [mockPluginProfile],
  }

  createProfileOutputV2.mockImplementation(() => new Promise(() => {}))

  render(<ExportByProfilePluginsMenu documentType={documentTypeWithPlugins} />)

  await user.click(screen.getByText('Plugin Profile'))

  const menuItem = screen.getByTestId('menu-item')
  expect(menuItem).toHaveAttribute('disabled')
})

test('should disable submenu during loading state', async () => {
  const user = userEvent.setup()
  const documentTypeWithPlugins = {
    ...mockDocumentType,
    profiles: [mockPluginProfile],
  }

  createProfileOutputV2.mockImplementation(() => new Promise(() => {}))

  render(<ExportByProfilePluginsMenu documentType={documentTypeWithPlugins} />)

  await user.click(screen.getByText('Plugin Profile'))

  const submenu = screen.getByTestId('custom-submenu')
  expect(submenu).toHaveAttribute('disabled')
})

test('should disable arrow icon during loading state', async () => {
  const user = userEvent.setup()
  const documentTypeWithPlugins = {
    ...mockDocumentType,
    profiles: [mockPluginProfile],
  }

  createProfileOutputV2.mockImplementation(() => new Promise(() => {}))

  render(<ExportByProfilePluginsMenu documentType={documentTypeWithPlugins} />)

  await user.click(screen.getByText('Plugin Profile'))

  const arrowIcon = screen.getByTestId('arrow-icon')
  expect(arrowIcon).toHaveAttribute('data-disabled', 'true')
})

test('should disable arrow icon when no plugin profiles are available', () => {
  const documentTypeWithoutPlugins = {
    ...mockDocumentType,
    profiles: [mockUserProfile],
  }

  render(<ExportByProfilePluginsMenu documentType={documentTypeWithoutPlugins} />)

  const arrowIcon = screen.getByTestId('arrow-icon')
  expect(arrowIcon).toHaveAttribute('data-disabled', 'true')
})

test('should disable arrow icon when document type has no profiles', () => {
  const documentTypeWithoutProfiles = {
    ...mockDocumentType,
    profiles: [],
  }

  render(<ExportByProfilePluginsMenu documentType={documentTypeWithoutProfiles} />)

  const arrowIcon = screen.getByTestId('arrow-icon')
  expect(arrowIcon).toHaveAttribute('data-disabled', 'true')
})

test('should enable arrow icon when plugin profiles are available and not loading', () => {
  const documentTypeWithPlugins = {
    ...mockDocumentType,
    profiles: [mockPluginProfile],
  }

  render(<ExportByProfilePluginsMenu documentType={documentTypeWithPlugins} />)

  const arrowIcon = screen.getByTestId('arrow-icon')
  expect(arrowIcon).toHaveAttribute('data-disabled', 'false')
})

test('should handle multiple plugin profiles correctly', () => {
  const mockPluginProfile2 = new OutputProfile({
    id: 'plugin-profile-id-2',
    name: 'Plugin Profile 2',
    creationDate: '2024-01-01',
    version: '1.0.0',
    format: 'custom-format-2',
    exportingType: ExportingType.PLUGIN,
  })

  const documentTypeWithMultiplePlugins = {
    ...mockDocumentType,
    profiles: [mockUserProfile, mockPluginProfile, mockPluginProfile2],
  }

  render(<ExportByProfilePluginsMenu documentType={documentTypeWithMultiplePlugins} />)

  expect(screen.getByText('Plugin Profile')).toBeInTheDocument()
  expect(screen.getByText('Plugin Profile 2')).toBeInTheDocument()
  expect(screen.queryByText('User Profile')).not.toBeInTheDocument()

  const submenu = screen.getByTestId('custom-submenu')
  expect(submenu).not.toHaveAttribute('disabled', 'true')

  const arrowIcon = screen.getByTestId('arrow-icon')
  expect(arrowIcon).toHaveAttribute('data-disabled', 'false')
})

test('should handle null document type gracefully', () => {
  render(<ExportByProfilePluginsMenu documentType={null} />)

  const submenu = screen.getByTestId('custom-submenu')
  expect(submenu).toHaveAttribute('disabled')

  const arrowIcon = screen.getByTestId('arrow-icon')
  expect(arrowIcon).toHaveAttribute('data-disabled', 'true')
})

test('should handle undefined document type gracefully', () => {
  render(<ExportByProfilePluginsMenu documentType={undefined} />)

  const submenu = screen.getByTestId('custom-submenu')
  expect(submenu).toHaveAttribute('disabled')

  const arrowIcon = screen.getByTestId('arrow-icon')
  expect(arrowIcon).toHaveAttribute('data-disabled', 'true')
})
