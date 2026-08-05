
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Localization, localize } from '@/localization/i18n'
import { render } from '@/utils/rendererRTL'
import {
  DefaultFormValues,
  FIELD_FORM_CODE,
  MAX_FILES_COUNT_FOR_ONE_BATCH,
} from './constants'
import { UploadSplittingFilesDrawer } from './UploadSplittingFilesDrawer'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-hook-form', () => mockReactHookForm)
jest.mock('@/utils/notification', () => mockNotification)

jest.mock('react-redux', () => mockReactRedux)

const mockUploadSplittingFiles = jest.fn(() => Promise.resolve([{
  name: 'file1.png',
  uid: 'uid1',
}]))

const mockAutoSplitFiles = jest.fn(() => Promise.resolve())
const mockResetAutoSplitCounter = jest.fn()

jest.mock('./hooks', () => ({
  useUploadSplittingFiles: jest.fn(() => ({
    uploadSplittingFiles: mockUploadSplittingFiles,
    completedRequests: 0,
    resetRequestsCounter: jest.fn(),
  })),
  useAutoSplitFiles: jest.fn(() => ({
    autoSplitFiles: mockAutoSplitFiles,
    completedRequests: 0,
    resetRequestsCounter: mockResetAutoSplitCounter,
  })),
}))

jest.mock('@/apiRTK/batchesApi', () => ({
  useCreateBatchMutation: jest.fn(() => [mockCreateBatch]),
}))

jest.mock('@/containers/BatchFilesSplittingDrawer', () => ({
  BatchFilesSplittingDrawer: (props) => <div>{props.isVisible ? mockBatchFilesSplittingDrawer : null}</div>,
}))

const mockBatchFilesSplittingDrawer = 'BatchFilesSplittingDrawer'

const mockCreateBatch = jest.fn(() => ({
  unwrap: jest.fn(),
}))

jest.mock('./UploadFilesForm', () => mockShallowComponent('UploadFilesForm'))
jest.mock('./BatchSettingsForm', () => mockShallowComponent('BatchSettingsForm'))

const mockTrigger = jest.fn(() => Promise.resolve(true))

useForm.mockImplementation(() => ({
  watch: jest.fn(() => mockFormValues),
  getValues: jest.fn(() => mockFormValues),
  reset: mockResetCallback,
  trigger: mockTrigger,
  formState: {
    isValid: true,
  },
}))

const mockFile = {
  name: 'file1.png',
  uid: 'uid1',
}

const mockFormValues = {
  ...DefaultFormValues,
  [FIELD_FORM_CODE.FILES]: [mockFile],
  [FIELD_FORM_CODE.BATCH_NAME]: 'test',
}

const mockResetCallback = jest.fn()

let defaultProps

beforeEach(() => {
  jest.clearAllMocks()

  defaultProps = {
    isVisible: true,
    onClose: jest.fn(),
  }
})

test('uploads splitting files with correct data when Upload btn is clicked', async () => {
  render(<UploadSplittingFilesDrawer {...defaultProps} />)

  const triggerBtn = screen.getByRole('button', {
    name: localize(Localization.NEXT_STEP),
  })

  await userEvent.click(triggerBtn)

  const confirmBtn = screen.getByRole('button', { name: localize(Localization.OK) })

  await userEvent.click(confirmBtn)

  expect(mockUploadSplittingFiles).nthCalledWith(1, [{ file: mockFile }])
})

test('calls createBatch with correct data when Upload btn is clicked', async () => {
  render(<UploadSplittingFilesDrawer {...defaultProps} />)

  const triggerBtn = screen.getByRole('button', {
    name: localize(Localization.NEXT_STEP),
  })

  await userEvent.click(triggerBtn)

  const confirmBtn = screen.getByRole('button', { name: localize(Localization.OK) })

  await userEvent.click(confirmBtn)

  expect(mockCreateBatch).nthCalledWith(1, {
    name: mockFormValues.batchName,
    groupId: mockFormValues.group?.id,
    files: [{
      name: mockFile.name,
      path: mockFile.path,
      documentTypeId: null,
      processingParams: {
        engine: mockFormValues.engine,
        llmType: mockFormValues.llmType,
        parsingFeatures: mockFormValues.parsingFeatures,
      },
    }],
  })
})

test('shows BatchFilesSplittingDrawer when Upload btn is clicked if pdf files are uploaded', async () => {
  useForm.mockImplementationOnce(() => ({
    watch: jest.fn(() => ({
      ...mockFormValues,
      files: [{
        ...mockFile,
        name: 'file1.pdf',
      }],
    })),
    getValues: jest.fn(() => mockFormValues),
    reset: mockResetCallback,
    formState: {
      isValid: true,
    },
  }))

  render(<UploadSplittingFilesDrawer {...defaultProps} />)

  const triggerBtn = screen.getByRole('button', {
    name: localize(Localization.NEXT_STEP),
  })

  await userEvent.click(triggerBtn)

  await waitFor(() => {
    expect(screen.getByText(mockBatchFilesSplittingDrawer)).toBeInTheDocument()
  })
})

test('disables Save button when no files are selected', async () => {
  useForm.mockImplementationOnce(() => ({
    watch: jest.fn(() => ({
      ...mockFormValues,
      files: [],
    })),
    getValues: jest.fn(() => ({
      ...mockFormValues,
      files: [],
    })),
    formState: {
      isValid: true,
    },
  }))

  render(<UploadSplittingFilesDrawer {...defaultProps} />)

  const saveBtn = screen.getByRole('button', {
    name: localize(Localization.NEXT_STEP),
    exact: false,
  })

  expect(saveBtn).toBeDisabled()
})

test('disables Save button if form is invalid', async () => {
  useForm.mockImplementationOnce(() => ({
    watch: jest.fn(() => mockFormValues),
    getValues: jest.fn(() => mockFormValues),
    reset: mockResetCallback,
    formState: {
      isValid: false,
    },
  }))

  render(<UploadSplittingFilesDrawer {...defaultProps} />)

  const saveBtn = screen.getByRole('button', {
    name: localize(Localization.NEXT_STEP),
    exact: false,
  })

  expect(saveBtn).toBeDisabled()
})

test('calls for reset when click on Reset All button', async () => {
  render(<UploadSplittingFilesDrawer {...defaultProps} />)

  const resetBtn = screen.getByRole('button', {
    name: localize(Localization.RESET_SETTINGS),
    exact: false,
  })

  await userEvent.click(resetBtn)

  expect(mockResetCallback).nthCalledWith(1, {
    ...mockFormValues,
    [FIELD_FORM_CODE.BATCH_NAME]: '',
  })
})

test('renders ProgressModal when files are uploading', () => {
  jest.spyOn(React, 'useState').mockImplementationOnce(() => [true, jest.fn()])

  render(<UploadSplittingFilesDrawer {...defaultProps} />)

  expect(screen.getByText(localize(Localization.UPLOAD_FILES))).toBeInTheDocument()
})

test('shows error message when upload files limit is exceeded', async () => {
  const mockFiles = Array.from(
    { length: MAX_FILES_COUNT_FOR_ONE_BATCH + 1 },
    () => new File(['content'], 'test1.png', { type: 'application/pdf' }),
  )

  useForm.mockImplementationOnce(() => ({
    watch: jest.fn(() => ({
      ...mockFormValues,
      files: mockFiles,
    })),
    getValues: jest.fn(() => mockFormValues),
    reset: mockResetCallback,
    formState: {
      isValid: true,
    },
  }))

  render(<UploadSplittingFilesDrawer {...defaultProps} />)

  await waitFor(() => {
    const errorMessage = screen.getByText(localize(Localization.FILES_LIMIT_FOR_BATCH_EXCEEDED))
    expect(errorMessage).toBeInTheDocument()
  })
})

test('disables Upload button when upload files limit is exceeded', async () => {
  const mockFiles = Array.from(
    { length: MAX_FILES_COUNT_FOR_ONE_BATCH + 1 },
    () => new File(['content'], 'test1.png', { type: 'application/pdf' }),
  )

  useForm.mockImplementationOnce(() => ({
    watch: jest.fn(() => ({
      ...mockFormValues,
      files: mockFiles,
    })),
    getValues: jest.fn(() => mockFormValues),
    reset: mockResetCallback,
    formState: {
      isValid: true,
    },
  }))

  render(<UploadSplittingFilesDrawer {...defaultProps} />)

  await waitFor(() => {
    const uploadButton = screen.getByRole('button', { name: localize(Localization.NEXT_STEP) })
    expect(uploadButton).toBeDisabled()
  })
})

test('calls autoSplitFiles with correct data when Upload btn is clicked and automatic splitting is enabled', async () => {
  const autoSplitFormValues = {
    ...mockFormValues,
    [FIELD_FORM_CODE.AUTOMATIC_SPLITTING]: true,
    group: { id: 'group-1' },
  }

  useForm.mockImplementationOnce(() => ({
    watch: jest.fn(() => autoSplitFormValues),
    getValues: jest.fn(() => autoSplitFormValues),
    reset: mockResetCallback,
    trigger: mockTrigger,
    formState: {
      isValid: true,
    },
  }))

  render(<UploadSplittingFilesDrawer {...defaultProps} />)

  const uploadBtn = screen.getByRole('button', {
    name: localize(Localization.UPLOAD),
  })

  await userEvent.click(uploadBtn)

  await waitFor(() => {
    expect(mockAutoSplitFiles).toHaveBeenNthCalledWith(1, [{
      file: mockFile,
      groupId: 'group-1',
      automaticSplitting: true,
      batchType: autoSplitFormValues.batchType,
      batchName: autoSplitFormValues.batchName,
      llmType: autoSplitFormValues.llmType,
      engine: autoSplitFormValues.engine,
      parsingFeatures: autoSplitFormValues.parsingFeatures,
      needsSplittingProposalReview: autoSplitFormValues[FIELD_FORM_CODE.NEEDS_SPLITTING_PROPOSAL_REVIEW],
    }])
  })

  await waitFor(() => {
    expect(mockTrigger).toHaveBeenCalledTimes(1)
  })
})

test('does not call autoSplitFiles when form validation fails', async () => {
  const autoSplitFormValues = {
    ...mockFormValues,
    [FIELD_FORM_CODE.AUTOMATIC_SPLITTING]: true,
    group: { id: 'group-1' },
  }

  const mockInvalidTrigger = jest.fn(() => Promise.resolve(false))

  useForm.mockImplementationOnce(() => ({
    watch: jest.fn(() => autoSplitFormValues),
    getValues: jest.fn(() => autoSplitFormValues),
    reset: mockResetCallback,
    trigger: mockInvalidTrigger,
    formState: {
      isValid: true,
    },
  }))

  render(<UploadSplittingFilesDrawer {...defaultProps} />)

  const uploadBtn = screen.getByRole('button', {
    name: localize(Localization.UPLOAD),
  })

  await userEvent.click(uploadBtn)

  await waitFor(() => {
    expect(mockInvalidTrigger).toHaveBeenCalledTimes(1)
  })

  expect(mockAutoSplitFiles).not.toHaveBeenCalled()
  expect(mockResetAutoSplitCounter).not.toHaveBeenCalled()
})

test('renders Upload button when automatic splitting is enabled', () => {
  useForm.mockImplementationOnce(() => ({
    watch: jest.fn(() => ({
      ...mockFormValues,
      [FIELD_FORM_CODE.AUTOMATIC_SPLITTING]: true,
    })),
    getValues: jest.fn(() => mockFormValues),
    reset: mockResetCallback,
    trigger: mockTrigger,
    formState: {
      isValid: true,
    },
  }))

  render(<UploadSplittingFilesDrawer {...defaultProps} />)

  const uploadBtn = screen.getByRole('button', {
    name: localize(Localization.UPLOAD),
  })

  expect(uploadBtn).toBeInTheDocument()
})
