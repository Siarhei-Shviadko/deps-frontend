
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Localization, localize } from '@/localization/i18n'
import { Splitter } from '@/models/Splitter'
import { render } from '@/utils/rendererRTL'
import { DocumentTypeSplitterDrawer } from './DocumentTypeSplitterDrawer'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/components/Spin', () => ({
  Spin: ({ children }) => <div data-testid="spin">{children}</div>,
}))

jest.mock('react-hook-form', () => ({
  ...mockReactHookForm,
  useForm: jest.fn(() => ({
    getValues: jest.fn(() => ({ splitter: mockFormValues })),
    handleSubmit: jest.fn(),
    formState: {
      isValid: true,
      isDirty: true,
    },
  })),
}))

const mockFormValues = {
  'splitter.documentTypeId': 'doc-type-id',
  'splitter.name': 'Splitter Name',
}

const mockDocumentTypeId = 'doc-type-id'

const mockSplitter = new Splitter({
  id: 'splitter-id',
  groupId: 'group-id',
  documentTypeId: mockDocumentTypeId,
  name: 'Splitter Name',
  llmType: 'provider/model',
  splittingQuery: 'query',
})

const mockTrigger = (onClick) => (
  <button
    data-testid="drawer-trigger"
    onClick={onClick}
  />
)

const defaultProps = {
  documentTypeId: mockDocumentTypeId,
  isLoading: false,
  onSubmit: jest.fn(),
  renderTrigger: mockTrigger,
  children: <div data-testid="form-content">FormContent</div>,
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('shows add splitter drawer on trigger click', async () => {
  render(<DocumentTypeSplitterDrawer {...defaultProps} />)

  await userEvent.click(screen.getByTestId('drawer-trigger'))

  expect(screen.getByTestId('drawer')).toBeInTheDocument()
  expect(screen.getByTestId('drawer')).toHaveTextContent(localize(Localization.ADD_SPLITTER))
})

test('shows edit splitter drawer title when splitter is provided', async () => {
  const props = {
    ...defaultProps,
    splitter: mockSplitter,
  }

  render(<DocumentTypeSplitterDrawer {...props} />)

  await userEvent.click(screen.getByTestId('drawer-trigger'))

  expect(screen.getByTestId('drawer')).toHaveTextContent(localize(Localization.EDIT_SPLITTER))
})

test('closes drawer on cancel button click', async () => {
  render(<DocumentTypeSplitterDrawer {...defaultProps} />)

  await userEvent.click(screen.getByTestId('drawer-trigger'))

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.CANCEL),
  }))

  expect(screen.queryByTestId('drawer')).not.toBeInTheDocument()
})

test('disables save button when form is not valid', async () => {
  useForm
    .mockImplementationOnce(() => ({
      getValues: jest.fn(() => ({ splitter: mockFormValues })),
      handleSubmit: jest.fn(),
      formState: {
        isValid: false,
        isDirty: true,
      },
    }))
    .mockImplementationOnce(() => ({
      getValues: jest.fn(() => ({ splitter: mockFormValues })),
      handleSubmit: jest.fn(),
      formState: {
        isValid: false,
        isDirty: true,
      },
    }))

  render(<DocumentTypeSplitterDrawer {...defaultProps} />)

  await userEvent.click(screen.getByTestId('drawer-trigger'))

  expect(screen.getByRole('button', {
    name: localize(Localization.SAVE),
  })).toBeDisabled()
})

test('disables save button when form is not dirty', async () => {
  useForm
    .mockImplementationOnce(() => ({
      getValues: jest.fn(() => ({ splitter: mockFormValues })),
      handleSubmit: jest.fn(),
      formState: {
        isValid: true,
        isDirty: false,
      },
    }))
    .mockImplementationOnce(() => ({
      getValues: jest.fn(() => ({ splitter: mockFormValues })),
      handleSubmit: jest.fn(),
      formState: {
        isValid: true,
        isDirty: false,
      },
    }))

  render(<DocumentTypeSplitterDrawer {...defaultProps} />)

  await userEvent.click(screen.getByTestId('drawer-trigger'))

  expect(screen.getByRole('button', {
    name: localize(Localization.SAVE),
  })).toBeDisabled()
})

test('calls onSubmit with splitter form values when save button is clicked', async () => {
  const props = {
    ...defaultProps,
    onSubmit: jest.fn(),
  }

  render(<DocumentTypeSplitterDrawer {...props} />)

  await userEvent.click(screen.getByTestId('drawer-trigger'))

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.SAVE),
  }))

  await waitFor(() => {
    expect(props.onSubmit).toHaveBeenNthCalledWith(1, mockFormValues)
  })
})

test('keeps drawer open after save button is clicked', async () => {
  const props = {
    ...defaultProps,
    onSubmit: jest.fn(() => Promise.resolve()),
  }

  render(<DocumentTypeSplitterDrawer {...props} />)

  await userEvent.click(screen.getByTestId('drawer-trigger'))

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.SAVE),
  }))

  await waitFor(() => {
    expect(props.onSubmit).toHaveBeenCalledTimes(1)
  })

  expect(screen.getByTestId('drawer')).toBeInTheDocument()
})

test('renders children inside drawer', async () => {
  render(<DocumentTypeSplitterDrawer {...defaultProps} />)

  await userEvent.click(screen.getByTestId('drawer-trigger'))

  expect(screen.getByTestId('form-content')).toBeInTheDocument()
})
