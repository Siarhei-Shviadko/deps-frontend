
import { mockEnv } from '@/mocks/mockEnv'
import { render, screen } from '@testing-library/react'
import { FileStatus } from '@/enums/FileStatus'
import { localize, Localization } from '@/localization/i18n'
import { FileMoreActions } from './FileMoreActions'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('./AssignDocumentTypeToFileButton', () => ({
  AssignDocumentTypeToFileButton: ({ children, file }) => (
    <button
      data-file-id={file.id}
      data-testid="assign-document-type-button"
    >
      {children}
    </button>
  ),
}))

jest.mock('./FilePDFSplittingButton', () => ({
  FilePDFSplittingButton: ({ file }) => (
    <button
      data-file-id={file.id}
      data-testid="split-file-button"
    />
  ),
}))

jest.mock('./AutoFileSplittingButton', () => ({
  AutoFileSplittingButton: ({ file }) => (
    <button
      data-file-id={file.id}
      data-testid="auto-split-file-button"
    />
  ),
}))

jest.mock('@/containers/FilePromptCalibrationStudio', () => ({
  StudioTriggerButton: () => (
    <button data-testid="studio-trigger-button" />
  ),
}))

jest.mock('@/containers/FileRestartButton', () => ({
  FileRestartButton: ({ file }) => (
    <button
      data-file-id={file.id}
      data-testid="restart-file-button"
    />
  ),
}))

jest.mock('@/components/Menu', () => ({
  Menu: ({ children }) => <div data-testid="menu">{children}</div>,
}))

jest.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }) => {
    return children
  },
}))

jest.mock('@/components/Dropdown', () => ({
  Dropdown: ({ dropdownRender, children }) => (
    <div>
      {children}
      <div data-testid="dropdown-menu">
        {dropdownRender?.()}
      </div>
    </div>
  ),
}))

jest.mock('@/components/Button', () => ({
  Button: {
    Secondary: (props) => (
      <button
        data-testid="dropdown-trigger"
        {...props}
      />
    ),
  },
}))

jest.mock('@/components/Icons/EllipsisVerticalIcon', () => ({
  EllipsisVerticalIcon: () => <span>...</span>,
}))

jest.mock('./FileMoreActions.styles', () => {
  const React = require('react')
  const StyledMenu = ({ children }) => <div data-testid="styled-menu">{children}</div>
  StyledMenu.Item = ({ children }) => <div data-testid="menu-item">{children}</div>

  return {
    StyledMenu,
    LocalBoundary: ({ children }) => <div>{children}</div>,
  }
})

describe('FileMoreActions', () => {
  let defaultProps

  beforeEach(() => {
    jest.clearAllMocks()

    defaultProps = {
      file: {
        id: 'test-file-id',
        tenantId: 'test-tenant-id',
        name: 'test-file.pdf',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        labels: [],
        state: {
          status: FileStatus.COMPLETED,
        },
      },
    }

    mockEnv.ENV.FEATURE_ASSIGN_DOCUMENT_TYPE_TO_FILE = true
    mockEnv.ENV.FEATURE_PDF_SPLITTING = true
    mockEnv.ENV.FEATURE_DOCUMENT_TYPES_GROUPS = true
    mockEnv.ENV.FEATURE_PROMPT_CALIBRATION_STUDIO = true
  })

  it('renders dropdown trigger button', () => {
    render(<FileMoreActions {...defaultProps} />)

    const triggerButton = screen.getByTestId('dropdown-trigger')
    expect(triggerButton).toBeInTheDocument()
  })

  it('renders dropdown menu', () => {
    render(<FileMoreActions {...defaultProps} />)

    const menu = screen.getByTestId('dropdown-menu')
    expect(menu).toBeInTheDocument()
  })

  it('renders AssignDocumentTypeToFileButton when feature flag is enabled', () => {
    mockEnv.ENV.FEATURE_ASSIGN_DOCUMENT_TYPE_TO_FILE = true

    render(<FileMoreActions {...defaultProps} />)

    const button = screen.getByTestId('assign-document-type-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent(localize(Localization.ASSIGN_DOCUMENT_TYPE))
    expect(button).toHaveAttribute('data-file-id', defaultProps.file.id)
  })

  it('should render FilePDFSplittingButton when feature flag is enabled', () => {
    mockEnv.ENV.FEATURE_PDF_SPLITTING = true

    render(<FileMoreActions {...defaultProps} />)

    const button = screen.getByTestId('split-file-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-file-id', defaultProps.file.id)
  })

  it('should not disable split file button for PDF files', () => {
    defaultProps.file.name = 'test-file.pdf'

    render(<FileMoreActions {...defaultProps} />)

    const button = screen.getByTestId('split-file-button')
    expect(button).not.toBeDisabled()
  })

  it('renders AutoFileSplittingButton when feature flags are enabled', () => {
    render(<FileMoreActions {...defaultProps} />)

    const button = screen.getByTestId('auto-split-file-button')
    expect(button).toBeInTheDocument()
  })

  it('does not render AutoFileSplittingButton when FEATURE_DOCUMENT_TYPES_GROUPS is disabled', () => {
    mockEnv.ENV.FEATURE_DOCUMENT_TYPES_GROUPS = false

    render(<FileMoreActions {...defaultProps} />)

    expect(screen.queryByTestId('auto-split-file-button')).not.toBeInTheDocument()
  })

  it('does not render AutoFileSplittingButton when FEATURE_PDF_SPLITTING is disabled', () => {
    mockEnv.ENV.FEATURE_PDF_SPLITTING = false

    render(<FileMoreActions {...defaultProps} />)

    expect(screen.queryByTestId('auto-split-file-button')).not.toBeInTheDocument()
  })

  it('should not render StudioTriggerButton when feature flag is disabled', () => {
    mockEnv.ENV.FEATURE_PROMPT_CALIBRATION_STUDIO = false

    render(<FileMoreActions {...defaultProps} />)

    const button = screen.queryByTestId('studio-trigger-button')
    expect(button).not.toBeInTheDocument()
  })

  it('should render FileRestartButton when file status is FAILED', () => {
    defaultProps.file.state.status = FileStatus.FAILED

    render(<FileMoreActions {...defaultProps} />)

    const button = screen.getByTestId('restart-file-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-file-id', defaultProps.file.id)
  })

  it.each([
    FileStatus.COMPLETED,
    FileStatus.PROCESSING,
    FileStatus.NEEDS_REVIEW,
    FileStatus.IN_REVIEW,
  ])('should not render FileRestartButton when file status is %s', (status) => {
    defaultProps.file.state.status = status

    render(<FileMoreActions {...defaultProps} />)

    const button = screen.queryByTestId('restart-file-button')
    expect(button).not.toBeInTheDocument()
  })
})
