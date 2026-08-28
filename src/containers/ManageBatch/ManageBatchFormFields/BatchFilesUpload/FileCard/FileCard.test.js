
import { mockShallowComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FIELD_FORM_CODE } from '@/containers/ManageBatch/constants'
import { PickedFile as MockPickedFile } from '@/containers/ManageBatch/PickedFile'
import { useUploadBatchFiles } from '@/containers/ManageBatch/useUploadBatchFiles'
import { KnownParsingFeature as MockKnownParsingFeature } from '@/enums/KnownParsingFeature'
import { KnownProcessingEngines as MockKnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { render } from '@/utils/rendererRTL'
import { FileCard } from './FileCard'

const mockSetFormValue = jest.fn()

jest.mock('./FileSettings', () => mockShallowComponent('FileSettings'))
jest.mock('@/utils/env', () => mockEnv)

jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn(() => ({
    setValue: mockSetFormValue,
    getValues: jest.fn(() => ({
      documentType: 'pdf',
      engine: MockKnownProcessingEngines.TESSERACT,
      llmType: 'llm1',
      parsingFeatures: [MockKnownParsingFeature.TEXT],
      files: [
        new MockPickedFile(
          {
            uid: '123',
            name: 'file.txt',
          },
          {
            documentType: 'pdf',
            engine: MockKnownProcessingEngines.TESSERACT,
            llmType: 'llm1',
            parsingFeatures: [MockKnownParsingFeature.TEXT],
          },
        ),
      ],
    })),
  })),
  useWatch: jest.fn(() => [
    new MockPickedFile(
      {
        uid: '123',
        name: 'file.txt',
      },
      {
        documentType: 'pdf',
        engine: MockKnownProcessingEngines.TESSERACT,
        llmType: 'llm1',
        parsingFeatures: [MockKnownParsingFeature.TEXT],
      },
    ),
  ]),
}))

jest.mock('@/containers/ManageBatch/useUploadBatchFiles', () => ({
  useUploadBatchFiles: jest.fn(() => ({
    areFilesUploading: false,
  })),
}))

let defaultProps

const TEST_ID = {
  TRASH_ICON: 'trash-icon',
  PROGRESS: 'progress',
}

beforeEach(() => {
  jest.clearAllMocks()
  defaultProps = {
    fileData: new MockPickedFile(
      {
        uid: '123',
        name: 'file.txt',
      },
      {
        documentType: 'pdf',
        engine: MockKnownProcessingEngines.TESSERACT,
        llmType: 'llm1',
        parsingFeatures: [MockKnownParsingFeature.TEXT],
      },
    ),
    index: 0,
  }
})

test('renders file card with file name', () => {
  render(<FileCard {...defaultProps} />)

  expect(screen.getByText('file.txt')).toBeInTheDocument()
  expect(screen.getByTestId('trash-icon')).toBeInTheDocument()
})

test('calls set form value with expected value when clicking trash icon', async () => {
  render(<FileCard {...defaultProps} />)

  const trashIcon = screen.getByTestId('trash-icon')
  await userEvent.click(trashIcon)

  expect(mockSetFormValue).nthCalledWith(1, FIELD_FORM_CODE.FILES, [])
})

test('renders file name when settings is undefined', () => {
  const props = {
    ...defaultProps,
    fileData: new MockPickedFile(
      {
        uid: '123',
        name: 'file.txt',
      },
      undefined,
    ),
  }

  render(<FileCard {...props} />)
  expect(screen.getByText('file.txt')).toBeInTheDocument()
})

test('renders progress component instead of trash icon when files are uploading', () => {
  useUploadBatchFiles.mockReturnValue({ areFilesUploading: true })

  render(<FileCard {...defaultProps} />)

  expect(screen.getByText('file.txt')).toBeInTheDocument()
  expect(screen.queryByTestId(TEST_ID.TRASH_ICON)).not.toBeInTheDocument()
  expect(screen.getByTestId(TEST_ID.PROGRESS)).toBeInTheDocument()
})

test('renders FileSettings component', () => {
  render(<FileCard {...defaultProps} />)

  expect(screen.getByTestId('FileSettings')).toBeInTheDocument()
})
