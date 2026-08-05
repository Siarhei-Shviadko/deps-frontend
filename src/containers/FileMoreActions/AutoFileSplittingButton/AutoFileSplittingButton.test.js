import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { Localization, localize } from '@/localization/i18n'
import { File } from '@/models/File'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { AutoFileSplittingButton } from './AutoFileSplittingButton'
import { FIELD_CODE } from './constants'
import { mapProcessingParamsToFormValues } from './mappers'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-hook-form', () => mockReactHookForm)
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('./AutoFileSplittingForm', () => mockShallowComponent('AutoFileSplittingForm'))

jest.mock('@/components/Spin', () => {
  const Spin = ({ children }) => <div data-testid="spin">{children}</div>
  Spin.Centered = () => <div data-testid="spin-centered" />

  return { Spin }
})

const mockSplitUnwrap = jest.fn(() => Promise.resolve())
const mockSplitFile = jest.fn(() => ({
  unwrap: mockSplitUnwrap,
}))

jest.mock('@/apiRTK/filesApi', () => ({
  useSplitExistingFileMutation: jest.fn(() => [
    mockSplitFile,
    { isLoading: false },
  ]),
}))

const mockFetchGroupUnwrap = jest.fn(() => Promise.resolve({ group: mockGroup }))
const mockFetchGroup = jest.fn(() => ({
  unwrap: mockFetchGroupUnwrap,
}))

let mockFetchGroupState = {
  isFetching: false,
  error: null,
}

jest.mock('@/apiRTK/documentTypesGroupsApi', () => ({
  useLazyFetchDocumentTypesGroupQuery: jest.fn(() => [
    mockFetchGroup,
    mockFetchGroupState,
  ]),
}))

const mockGroup = {
  id: 'group-1',
  name: 'Test Group',
  documentTypeIds: ['doc-type-1'],
}

const mockFormValues = {
  group: mockGroup,
  documentTypeId: 'doc-type-1',
  engine: 'tesseract',
  llmType: 'gpt-4',
  parsingFeatures: [KnownParsingFeature.TEXT],
  needsSplittingProposalReview: true,
}

const mockReset = jest.fn()
const mockSetValue = jest.fn()
const mockGetValues = jest.fn(() => mockFormValues)

let defaultProps
let mockFile
let mockFormApi

beforeEach(() => {
  jest.clearAllMocks()

  mockFetchGroupState = {
    isFetching: false,
    error: null,
  }

  mockSplitUnwrap.mockImplementation(() => Promise.resolve())
  mockFetchGroupUnwrap.mockImplementation(() => Promise.resolve({ group: mockGroup }))
  mockGetValues.mockImplementation(() => mockFormValues)

  mockFormApi = {
    formState: {
      isValid: true,
    },
    getValues: mockGetValues,
    reset: mockReset,
    setValue: mockSetValue,
  }

  useForm.mockImplementation(() => mockFormApi)

  mockFile = new File({
    id: 'file-1',
    name: 'test.pdf',
    tenantId: 'tenant-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    labels: [],
    processingParams: {
      groupId: 'group-1',
      splittingEnabled: true,
      classificationEnabled: true,
      workflowParams: {
        documentTypeId: 'doc-type-1',
        engine: 'tesseract',
        llmType: 'gpt-4',
        parsingFeatures: [KnownParsingFeature.TEXT],
      },
    },
  })

  defaultProps = {
    file: mockFile,
  }
})

test('renders automatic file splitting trigger button', () => {
  render(<AutoFileSplittingButton {...defaultProps} />)

  expect(screen.getByRole('button', {
    name: localize(Localization.AUTOMATIC_FILE_SPLITTING),
  })).toBeInTheDocument()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('opens drawer with form when trigger button is clicked', async () => {
  render(<AutoFileSplittingButton {...defaultProps} />)

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.AUTOMATIC_FILE_SPLITTING),
  }))

  const dialog = screen.getByRole('dialog')

  expect(dialog).toBeInTheDocument()
  expect(within(dialog).getByText(localize(Localization.AUTOMATIC_FILE_SPLITTING))).toBeInTheDocument()
  expect(within(dialog).getByTestId('AutoFileSplittingForm')).toBeInTheDocument()
})

test('renders centered spin when group is fetching', async () => {
  mockFetchGroupState = {
    isFetching: true,
    error: null,
  }

  render(<AutoFileSplittingButton {...defaultProps} />)

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.AUTOMATIC_FILE_SPLITTING),
  }))

  expect(screen.getByTestId('spin-centered')).toBeInTheDocument()
  expect(screen.queryByTestId('AutoFileSplittingForm')).not.toBeInTheDocument()
})

test('fetches group and sets form value when file has groupId', async () => {
  render(<AutoFileSplittingButton {...defaultProps} />)

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.AUTOMATIC_FILE_SPLITTING),
  }))

  await waitFor(() => {
    expect(mockFetchGroup).toHaveBeenNthCalledWith(1, { groupId: 'group-1' })
  })

  await waitFor(() => {
    expect(mockSetValue).toHaveBeenNthCalledWith(
      1,
      FIELD_CODE.GROUP,
      mockGroup,
      { shouldValidate: true },
    )
  })
})

test('does not fetch group when file has no groupId', async () => {
  const props = {
    file: new File({
      ...mockFile,
      processingParams: {
        ...mockFile.processingParams,
        groupId: undefined,
      },
    }),
  }

  render(<AutoFileSplittingButton {...props} />)

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.AUTOMATIC_FILE_SPLITTING),
  }))

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(mockFetchGroup).not.toHaveBeenCalled()
})

test('shows warning notification when group fetch fails', async () => {
  mockFetchGroupUnwrap.mockRejectedValueOnce(new Error('fetch failed'))

  render(<AutoFileSplittingButton {...defaultProps} />)

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.AUTOMATIC_FILE_SPLITTING),
  }))

  await waitFor(() => {
    expect(notifyWarning).toHaveBeenNthCalledWith(1, localize(Localization.DEFAULT_ERROR))
  })
})

test('initializes form with mapped processing params', () => {
  render(<AutoFileSplittingButton {...defaultProps} />)

  expect(useForm).toHaveBeenCalledWith({
    mode: expect.any(String),
    shouldUnregister: true,
    defaultValues: mapProcessingParamsToFormValues(mockFile.processingParams),
  })
})

test('disables Split button when form is invalid', async () => {
  mockFormApi.formState.isValid = false

  render(<AutoFileSplittingButton {...defaultProps} />)

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.AUTOMATIC_FILE_SPLITTING),
  }))

  expect(screen.getByRole('button', {
    name: localize(Localization.SPLIT),
  })).toBeDisabled()
})

test('calls splitFile with mapped form values when Split is clicked', async () => {
  render(<AutoFileSplittingButton {...defaultProps} />)

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.AUTOMATIC_FILE_SPLITTING),
  }))

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.SPLIT),
  }))

  await waitFor(() => {
    expect(mockSplitFile).toHaveBeenNthCalledWith(1, {
      fileId: 'file-1',
      groupId: 'group-1',
      documentTypeId: 'doc-type-1',
      engine: 'tesseract',
      llmType: 'gpt-4',
      parsingFeatures: [KnownParsingFeature.TEXT],
      needsSplittingProposalReview: true,
    })
  })
})

test('shows success notification and closes drawer after successful split', async () => {
  render(<AutoFileSplittingButton {...defaultProps} />)

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.AUTOMATIC_FILE_SPLITTING),
  }))

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.SPLIT),
  }))

  await waitFor(() => {
    expect(notifySuccess).toHaveBeenNthCalledWith(
      1,
      localize(Localization.AUTO_SPLITTING_STARTED),
    )
  })

  await waitFor(() => {
    expect(mockReset).toHaveBeenCalled()
  })

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

test('shows warning notification when split fails', async () => {
  mockSplitUnwrap.mockRejectedValueOnce({ data: { code: 'UNKNOWN_ERROR' } })

  render(<AutoFileSplittingButton {...defaultProps} />)

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.AUTOMATIC_FILE_SPLITTING),
  }))

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.SPLIT),
  }))

  await waitFor(() => {
    expect(notifyWarning).toHaveBeenNthCalledWith(1, localize(Localization.DEFAULT_ERROR))
  })
})

test('resets form and closes drawer when Cancel is clicked', async () => {
  render(<AutoFileSplittingButton {...defaultProps} />)

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.AUTOMATIC_FILE_SPLITTING),
  }))

  await userEvent.click(screen.getByRole('button', {
    name: localize(Localization.CANCEL),
  }))

  expect(mockReset).toHaveBeenCalled()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
