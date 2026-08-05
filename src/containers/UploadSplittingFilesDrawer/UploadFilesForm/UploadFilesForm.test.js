
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import { FIELD_FORM_CODE } from '@/containers/UploadDocumentsDrawer/constants'
import { render } from '@/utils/rendererRTL'
import { UploadFilesForm } from './UploadFilesForm'

jest.mock('@/utils/env', () => mockEnv)

const capturedFields = []

jest.mock('@/components/Form', () => ({
  ...jest.requireActual('@/components/Form'),
  FormItem: (props) => {
    capturedFields.push(props.field)

    return (
      <div data-testid={`form-item-${props.field?.code}`}>
        {props.label}
        Form Item
      </div>
    )
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
  capturedFields.length = 0
})

test('renders files upload field when form is rendered', () => {
  render(<UploadFilesForm />)

  const uploadFilesField = screen.getByTestId(`form-item-${FIELD_FORM_CODE.FILES}`)
  expect(uploadFilesField).toBeInTheDocument()
})

test('marks files field as invalid when files list is empty', () => {
  render(<UploadFilesForm />)

  const filesField = capturedFields.find((field) => field.code === FIELD_FORM_CODE.FILES)

  expect(filesField.rules.validate([])).toBe(false)
  expect(filesField.rules.validate(undefined)).toBe(false)
})

test('marks files field as valid when files list is not empty', () => {
  render(<UploadFilesForm />)

  const filesField = capturedFields.find((field) => field.code === FIELD_FORM_CODE.FILES)
  const mockFiles = [new File(['content'], 'test.pdf', { type: 'application/pdf' })]

  expect(filesField.rules.validate(mockFiles)).toBe(true)
})
