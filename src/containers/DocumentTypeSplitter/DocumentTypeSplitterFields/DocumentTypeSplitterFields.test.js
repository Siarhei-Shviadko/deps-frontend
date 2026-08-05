
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import { SplittingContextAttachments } from '@/enums/SplittingContextAttachments'
import { SPLITTING_MODE } from '@/enums/SplittingMode'
import { Localization, localize } from '@/localization/i18n'
import { Splitter } from '@/models/Splitter'
import { render } from '@/utils/rendererRTL'
import { FIELD_CODE, FORM_FIELD_PREFIX } from '../shared/constants'
import { DocumentTypeSplitterFields } from './DocumentTypeSplitterFields'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/components/Form/ReactHookForm', () => ({
  ...jest.requireActual('@/components/Form/ReactHookForm'),
  FormItem: (props) => (
    <div
      data-disabled={String(!!props.field?.disabled)}
      data-testid={`form-item-${props.field?.code}`}
    >
      {props.label}
    </div>
  ),
}))

jest.mock('./ExtractionLLMSelect', () => mockShallowComponent('ExtractionLLMSelect'))

const mockSplitter = new Splitter({
  id: 'splitter-1',
  groupId: 'group-1',
  documentTypeId: 'document-type-1',
  name: 'Splitter Name',
  llmType: 'provider1/model-1-1',
  splittingQuery: 'Test query',
  description: 'Test description',
  splittingContextAttachments: [SplittingContextAttachments.FILE_LAYOUT],
  splittingMode: SPLITTING_MODE.PAGE_BASED,
})

const defaultProps = {
  splitter: mockSplitter,
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders all splitter form fields when form is rendered', () => {
  render(
    <DocumentTypeSplitterFields {...defaultProps} />,
  )

  const expectedLabels = [
    localize(Localization.NAME),
    localize(Localization.LLM_TYPE),
    localize(Localization.SPLITTING_CONTEXT_ATTACHMENTS),
    localize(Localization.SPLITTING_MODE),
    localize(Localization.PROMPT),
    localize(Localization.DESCRIPTION),
  ]

  expectedLabels.forEach((label) => {
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  const expectedFieldCodes = [
    FIELD_CODE.NAME,
    FIELD_CODE.LLM_TYPE,
    FIELD_CODE.SPLITTING_CONTEXT_ATTACHMENTS,
    FIELD_CODE.SPLITTING_MODE,
    FIELD_CODE.QUERY,
    FIELD_CODE.DESCRIPTION,
  ]

  expectedFieldCodes.forEach((fieldCode) => {
    expect(screen.getByTestId(`form-item-${FORM_FIELD_PREFIX}.${fieldCode}`)).toBeInTheDocument()
  })
})

test('renders enabled splitting mode field when splitter is not provided', () => {
  render(
    <DocumentTypeSplitterFields />,
  )

  const splittingModeField = screen.getByTestId(`form-item-${FORM_FIELD_PREFIX}.${FIELD_CODE.SPLITTING_MODE}`)

  expect(screen.getByText(localize(Localization.SPLITTING_MODE))).toBeInTheDocument()
  expect(splittingModeField).toBeInTheDocument()
  expect(splittingModeField).toHaveAttribute('data-disabled', 'false')
})

test('renders disabled splitting mode field when splitter is provided', () => {
  render(
    <DocumentTypeSplitterFields {...defaultProps} />,
  )

  const splittingModeField = screen.getByTestId(`form-item-${FORM_FIELD_PREFIX}.${FIELD_CODE.SPLITTING_MODE}`)

  expect(screen.getByText(localize(Localization.SPLITTING_MODE))).toBeInTheDocument()
  expect(splittingModeField).toBeInTheDocument()
  expect(splittingModeField).toHaveAttribute('data-disabled', 'true')
})
