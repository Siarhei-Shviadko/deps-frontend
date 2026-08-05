
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen } from '@testing-library/react'
import { useWatch } from 'react-hook-form'
import { FieldType } from '@/enums/FieldType'
import { render } from '@/utils/rendererRTL'
import { ManageDisplayModeFormSection } from './ManageDisplayModeFormSection'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('react-hook-form', () => ({
  ...mockReactHookForm,
  useWatch: jest.fn(() => false),
  useFormContext: jest.fn(() => ({
    setValue: jest.fn(),
  })),
}))

const mockFieldName = 'mockFieldName'
const readOnlySwitchTestId = 'switch-readOnly'
const confidentialSwitchTestId = 'switch-confidential'

test('show the disabled input field with name if fieldName prop was passed', async () => {
  render(
    <ManageDisplayModeFormSection
      fieldName={mockFieldName}
      fieldType={FieldType.STRING}
      isConfidentialField={false}
      isEditMode={false}
      isReadOnlyField={false}
    />,
  )

  const input = screen.getByDisplayValue(mockFieldName)

  expect(screen.getByText(/name/i)).toBeInTheDocument()
  expect(input).toBeInTheDocument()
  expect(input).toBeDisabled()
})

test('do not show the input field with name if fieldName prop was not passed', async () => {
  render(
    <ManageDisplayModeFormSection
      fieldType={FieldType.STRING}
      isConfidentialField={false}
      isEditMode={false}
      isReadOnlyField={false}
    />,
  )

  const input = screen.queryByDisplayValue(mockFieldName)

  expect(input).not.toBeInTheDocument()
})

test('show correctly readOnly switch in case confidential flag is false and it is an edit mode', async () => {
  jest.clearAllMocks()

  render(
    <ManageDisplayModeFormSection
      fieldType={FieldType.STRING}
      isConfidentialField={false}
      isEditMode={true}
      isReadOnlyField={true}
    />,
  )

  expect(screen.getByText(/read-only mode/i)).toBeInTheDocument()
  expect(screen.getByTestId(readOnlySwitchTestId)).toBeInTheDocument()
  expect(screen.getByTestId(readOnlySwitchTestId)).not.toBeDisabled()
})

test('show disabled readOnly switch in case it is not an edit mode', async () => {
  render(
    <ManageDisplayModeFormSection
      fieldType={FieldType.STRING}
      isConfidentialField={false}
      isEditMode={false}
      isReadOnlyField={false}
    />,
  )

  expect(screen.getByTestId(readOnlySwitchTestId)).toBeDisabled()
})

test('show enabled readOnly switch in case confidential flag is true and it is edit mode', async () => {
  render(
    <ManageDisplayModeFormSection
      fieldType={FieldType.STRING}
      isConfidentialField={true}
      isEditMode={true}
      isReadOnlyField={true}
    />,
  )

  expect(screen.getByTestId(readOnlySwitchTestId)).not.toBeDisabled()
})

test('show correctly confidential switch', async () => {
  render(
    <ManageDisplayModeFormSection
      fieldType={FieldType.STRING}
      isConfidentialField={true}
      isEditMode={false}
      isReadOnlyField={true}
    />,
  )

  expect(screen.getByText(/mask mode/i)).toBeInTheDocument()
  expect(screen.getByTestId(confidentialSwitchTestId)).toBeInTheDocument()
})

test('show disabled confidential switch in case it is not an edit mode', async () => {
  render(
    <ManageDisplayModeFormSection
      fieldType={FieldType.STRING}
      isConfidentialField={true}
      isEditMode={false}
      isReadOnlyField={true}
    />,
  )

  expect(screen.getByTestId(confidentialSwitchTestId)).toBeDisabled()
})

test('show char limit input in case confidential flag is true', async () => {
  useWatch.mockImplementationOnce(() => true)

  const mockDisplayCharLimit = 3

  render(
    <ManageDisplayModeFormSection
      displayCharLimit={mockDisplayCharLimit}
      fieldType={FieldType.STRING}
      isConfidentialField={true}
      isEditMode={false}
      isReadOnlyField={true}
    />,
  )

  expect(screen.getByText(/visible symbols/i)).toBeInTheDocument()
  expect(screen.getByDisplayValue(mockDisplayCharLimit)).toBeInTheDocument()
})

test('do not show char limit input in case confidential flag is false', async () => {
  jest.clearAllMocks()

  const mockDisplayCharLimit = 3

  render(
    <ManageDisplayModeFormSection
      displayCharLimit={mockDisplayCharLimit}
      fieldType={FieldType.STRING}
      isConfidentialField={false}
      isEditMode={false}
      isReadOnlyField={true}
    />,
  )

  expect(screen.queryByDisplayValue(mockDisplayCharLimit)).not.toBeInTheDocument()
})

test('do not show confidential switch when isMaskingModeDisabled is true', async () => {
  render(
    <ManageDisplayModeFormSection
      fieldType={FieldType.STRING}
      isConfidentialField={true}
      isEditMode={true}
      isMaskingModeDisabled={true}
      isReadOnlyField={true}
    />,
  )

  expect(screen.queryByTestId(confidentialSwitchTestId)).not.toBeInTheDocument()
})
