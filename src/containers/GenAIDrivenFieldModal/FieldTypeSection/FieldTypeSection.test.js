
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen } from '@testing-library/dom'
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { useWatch } from 'react-hook-form'
import { FORM_FIELD_CODES } from '@/containers/GenAIDrivenFieldModal/constants'
import { FieldType, RESOURCE_FIELD_TYPE } from '@/enums/FieldType'
import { Localization, localize } from '@/localization/i18n'
import {
  LLMQueryCardinality,
  LLMQueryDataType,
  LLMExtractionQueryFormat,
} from '@/models/LLMExtractor'
import { render } from '@/utils/rendererRTL'
import { FieldTypeSection } from './FieldTypeSection'

const mockSetValue = jest.fn()

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-hook-form', () => ({
  ...mockReactHookForm,
  useFormContext: jest.fn(() => ({
    control: {},
    setValue: mockSetValue,
  })),
}))

const mockShape = new LLMExtractionQueryFormat({
  dataType: LLMQueryDataType.BOOLEAN,
  cardinality: LLMQueryCardinality.LIST,
  includeAliases: true,
})

beforeEach(() => {
  jest.clearAllMocks()
})

test('render FieldTypeSection layout correctly', () => {
  render(
    <FieldTypeSection disabled={false} />,
  )

  expect(screen.getByText(localize(Localization.FIELD_TYPE))).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.ALIASES))).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.SINGLE))).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.LIST))).toBeInTheDocument()
})

test('renders Cardinality field correctly', () => {
  render(
    <FieldTypeSection disabled={false} />,
  )

  const [scalarOption, listOption] = screen.getAllByRole('radio')
  expect(scalarOption).toBeChecked()
  expect(scalarOption.value).toEqual(LLMQueryCardinality.SCALAR)
  expect(listOption.value).toEqual(LLMQueryCardinality.LIST)
})

test('disables Aliases field for Scalar cardinality', () => {
  useWatch.mockImplementationOnce(() => LLMQueryCardinality.SCALAR)

  render(
    <FieldTypeSection disabled={false} />,
  )

  const aliasesCheckbox = screen.getByRole('checkbox')
  expect(aliasesCheckbox).toBeDisabled()
})

test('sets Confidential field to false when field type is CHECKMARK', async () => {
  render(
    <FieldTypeSection disabled={false} />,
  )

  const fieldTypeSelect = screen.getByRole('combobox')
  await userEvent.click(fieldTypeSelect)

  const option = screen.getByText(RESOURCE_FIELD_TYPE[FieldType.CHECKMARK])

  await userEvent.click(option, {
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  })

  expect(mockSetValue).nthCalledWith(1, FORM_FIELD_CODES.CONFIDENTIAL, false)
})

test('does not set Confidential field to false when field type is DICTIONARY', async () => {
  render(
    <FieldTypeSection disabled={false} />,
  )

  const fieldTypeSelect = screen.getByRole('combobox')
  await userEvent.click(fieldTypeSelect)

  const option = screen.getByText(RESOURCE_FIELD_TYPE[FieldType.DICTIONARY])

  await userEvent.click(option, {
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  })

  expect(mockSetValue).not.toHaveBeenCalledWith(FORM_FIELD_CODES.CONFIDENTIAL, false)
})

test('sets Include Aliases field to false if cardinality is not a "list"', async () => {
  render(
    <FieldTypeSection
      disabled={false}
      shape={mockShape}
    />,
  )

  const [scalarOption] = screen.getAllByRole('radio')
  await userEvent.click(scalarOption)

  expect(mockSetValue).nthCalledWith(1, FORM_FIELD_CODES.INCLUDE_ALIASES, false)
})

test('renders FieldTypeSection correctly if field data passed', () => {
  const mockValue = FieldType.CHECKMARK

  render(
    <FieldTypeSection
      disabled={false}
      shape={mockShape}
      value={mockValue}
    />,
  )

  const [, listOption] = screen.getAllByRole('radio')
  const aliasesCheckbox = screen.getByRole('checkbox')

  expect(screen.getByTitle(RESOURCE_FIELD_TYPE[mockValue])).toBeInTheDocument()
  expect(listOption).toBeChecked()
  expect(aliasesCheckbox).toBeChecked()
})
