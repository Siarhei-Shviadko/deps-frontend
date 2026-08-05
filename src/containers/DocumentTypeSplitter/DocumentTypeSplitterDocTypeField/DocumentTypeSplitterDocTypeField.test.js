
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFormContext } from 'react-hook-form'
import { Localization, localize } from '@/localization/i18n'
import { DocumentType } from '@/models/DocumentType'
import { Splitter } from '@/models/Splitter'
import { documentTypesStateSelector } from '@/selectors/documentTypes'
import { areTypesFetchingSelector } from '@/selectors/requests'
import { render } from '@/utils/rendererRTL'
import { FIELD_CODE, FORM_FIELD_PREFIX } from '../shared/constants'
import { DocumentTypeSplitterDocTypeField } from './DocumentTypeSplitterDocTypeField'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/selectors/documentTypes')
jest.mock('@/selectors/requests')

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn((selector) => selector()),
}))

jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn(() => ({
    reset: mockReset,
  })),
}))

jest.mock('@/containers/GroupDocumentTypeSelect', () => ({
  GroupDocumentTypeSelect: ({
    onChange,
    allowSelectDocumentType,
    documentTypes,
  }) => (
    <div data-testid="GroupDocumentTypeSelect">
      <span data-testid="allow-select">{String(allowSelectDocumentType)}</span>
      <span data-testid="document-types-count">{documentTypes.length}</span>
      <button
        data-testid="change-doc-type"
        onClick={() => onChange('id2')}
      />
    </div>
  ),
}))

jest.mock('@/components/Form', () => ({
  ...jest.requireActual('@/components/Form'),
  FormItem: ({ label, field }) => (
    <div data-testid={`form-item-${field.code}`}>
      {label}
      {field.render()}
    </div>
  ),
}))

const mockReset = jest.fn()

const mockDocTypeId1 = 'id1'
const mockDocTypeId2 = 'id2'
const mockDocTypeId3 = 'id3'

const mockDocType1 = new DocumentType(mockDocTypeId1, 'Doc Type 1')
const mockDocType2 = new DocumentType(mockDocTypeId2, 'Doc Type 2')
const mockDocType3 = new DocumentType(mockDocTypeId3, 'Doc Type 3')

documentTypesStateSelector.mockReturnValue({
  [mockDocTypeId1]: mockDocType1,
  [mockDocTypeId2]: mockDocType2,
  [mockDocTypeId3]: mockDocTypeId3,
})

areTypesFetchingSelector.mockReturnValue(false)

const defaultProps = {
  groupDocumentTypeIds: [mockDocTypeId1, mockDocTypeId2, mockDocTypeId3],
  groupSplitters: [],
  initialDocumentTypeId: mockDocTypeId1,
  allowSelectDocumentType: true,
  children: <div data-testid="child-content" />,
}

beforeEach(() => {
  jest.clearAllMocks()
  documentTypesStateSelector.mockReturnValue({
    [mockDocTypeId1]: mockDocType1,
    [mockDocTypeId2]: mockDocType2,
    [mockDocTypeId3]: mockDocType3,
  })
  useFormContext.mockReturnValue({
    reset: mockReset,
  })
})

test('renders document type field with label', () => {
  render(<DocumentTypeSplitterDocTypeField {...defaultProps} />)

  expect(screen.getByText(localize(Localization.DOCUMENT_TYPE))).toBeInTheDocument()
  expect(screen.getByTestId(`form-item-${FORM_FIELD_PREFIX}.${FIELD_CODE.DOCUMENT_TYPE_ID}`)).toBeInTheDocument()
})

test('renders children after document type field', () => {
  render(<DocumentTypeSplitterDocTypeField {...defaultProps} />)

  expect(screen.getByTestId('child-content')).toBeInTheDocument()
})

test('calls reset with selected document type id on document type change', async () => {
  render(<DocumentTypeSplitterDocTypeField {...defaultProps} />)

  await userEvent.click(screen.getByTestId('change-doc-type'))

  expect(mockReset).toHaveBeenNthCalledWith(1, {
    [`${FORM_FIELD_PREFIX}.${FIELD_CODE.DOCUMENT_TYPE_ID}`]: mockDocTypeId2,
  })
})

test('excludes document types that already have splitters from selectable list', () => {
  const props = {
    ...defaultProps,
    groupSplitters: [
      new Splitter({
        id: 'splitter-1',
        groupId: 'group-1',
        documentTypeId: mockDocTypeId2,
        name: 'Splitter',
        llmType: 'gpt',
        splittingQuery: 'query',
      }),
    ],
  }

  render(<DocumentTypeSplitterDocTypeField {...props} />)

  expect(screen.getByTestId('document-types-count')).toHaveTextContent('2')
})

test('passes allowSelectDocumentType prop to GroupDocumentTypeSelect', () => {
  const props = {
    ...defaultProps,
    allowSelectDocumentType: false,
  }

  render(<DocumentTypeSplitterDocTypeField {...props} />)

  expect(screen.getByTestId('allow-select')).toHaveTextContent('false')
})
