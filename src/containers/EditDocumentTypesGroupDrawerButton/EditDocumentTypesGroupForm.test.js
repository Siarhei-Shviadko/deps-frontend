
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen } from '@testing-library/dom'
import { Localization, localize } from '@/localization/i18n'
import { DocumentTypesGroup } from '@/models/DocumentTypesGroup'
import { Splitter } from '@/models/Splitter'
import { ENV } from '@/utils/env'
import { render } from '@/utils/rendererRTL'
import { EditDocumentTypesGroupForm } from './EditDocumentTypesGroupForm'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-hook-form', () => mockReactHookForm)

jest.mock('@/containers/DocumentTypeSplitter', () => ({
  DocumentTypeSplitter: {
    Section: (props) => (
      <div data-testid="DocumentTypeSplitterSection">
        {props.areChildrenVisible && <span data-testid="splitter-visible" />}
        {props.onVisibilityChange && <span data-testid="has-visibility-change" />}
        {props.children}
      </div>
    ),
    Fields: () => <div data-testid="DocumentTypeSplitterFields" />,
  },
}))

const mockGroupId = 'groupId'
const mockOnSplitterVisibilityChange = jest.fn()

const mockDocumentTypesGroup = new DocumentTypesGroup({
  id: mockGroupId,
  name: 'Group Name',
  documentTypeIds: [],
})

const defaultProps = {
  group: mockDocumentTypesGroup,
  handleSubmit: jest.fn(),
  onSplitterVisibilityChange: mockOnSplitterVisibilityChange,
  saveGroup: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders form layout correctly', () => {
  render(
    <EditDocumentTypesGroupForm {...defaultProps} />,
  )

  const input = screen.getByPlaceholderText(localize(Localization.GROUP_PLACEHOLDER))
  const inputTitle = screen.getByText(localize(Localization.NAME))

  expect(inputTitle).toBeInTheDocument()
  expect(input).toBeInTheDocument()
  expect(input).toHaveValue(mockDocumentTypesGroup.name)
})

test('renders splitter section with visibility change handler when FEATURE_PDF_SPLITTING is enabled', () => {
  render(
    <EditDocumentTypesGroupForm {...defaultProps} />,
  )

  expect(screen.getByTestId('DocumentTypeSplitterSection')).toBeInTheDocument()
  expect(screen.getByTestId('has-visibility-change')).toBeInTheDocument()
})

test('renders splitter section as visible when group has group-level splitter', () => {
  const props = {
    ...defaultProps,
    group: new DocumentTypesGroup({
      id: mockGroupId,
      name: 'Group Name',
      documentTypeIds: [],
      splitters: [
        new Splitter({
          id: 'splitter-id',
          groupId: mockGroupId,
          documentTypeId: '',
          name: 'Splitter Name',
          splittingQuery: 'Test query',
          llmType: 'provider1/model-1-1',
        }),
      ],
    }),
  }

  render(
    <EditDocumentTypesGroupForm {...props} />,
  )

  expect(screen.getByTestId('splitter-visible')).toBeInTheDocument()
})

test('does not render splitter section when FEATURE_PDF_SPLITTING is disabled', () => {
  ENV.FEATURE_PDF_SPLITTING = false

  render(
    <EditDocumentTypesGroupForm {...defaultProps} />,
  )

  expect(screen.queryByTestId('DocumentTypeSplitterSection')).not.toBeInTheDocument()

  ENV.FEATURE_PDF_SPLITTING = true
})
