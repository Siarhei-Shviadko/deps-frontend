
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { screen } from '@testing-library/react'
import { PickedFile as MockPickedFile } from '@/containers/ManageBatch/PickedFile'
import { KnownParsingFeature as MockKnownParsingFeature } from '@/enums/KnownParsingFeature'
import { KnownProcessingEngines as MockKnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { localize, Localization } from '@/localization/i18n'
import { render } from '@/utils/rendererRTL'
import { FileName } from './FileName'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-hook-form', () => mockReactHookForm)

let defaultProps

const documentType = 'same-doc-type'
const engine = MockKnownProcessingEngines.TESSERACT
const parsingFeatures = [MockKnownParsingFeature.TEXT]

beforeEach(() => {
  jest.clearAllMocks()
  defaultProps = {
    fileData: new MockPickedFile(
      {
        uid: 'test-uid',
        name: 'test-file.pdf',
      },
    ),
  }
})

test('renders file name when no settings exist', () => {
  render(<FileName fileData={defaultProps.fileData} />)

  expect(screen.getByText('test-file.pdf')).toBeInTheDocument()
})

test('renders file name and disclaimer when bulk settings differ from file settings', () => {
  const bulkDocType = 'bulk-doc-type'
  const bulkEngine = MockKnownProcessingEngines.GCP_VISION
  const bulkParsingFeatures = [MockKnownParsingFeature.TEXT, MockKnownParsingFeature.TABLES]

  mockReactHookForm.useWatch
    .mockReturnValueOnce(bulkDocType)
    .mockReturnValueOnce(bulkEngine)
    .mockReturnValueOnce(bulkParsingFeatures)

  const fileData = new MockPickedFile(
    {
      uid: 'test-uid',
      name: 'test-file.pdf',
    },
    {
      documentType,
      engine,
      parsingFeatures,
    },
  )

  render(<FileName fileData={fileData} />)

  expect(screen.getByText('test-file.pdf')).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.MANUALLY_CONFIGURED))).toBeInTheDocument()
})

test('renders file name without disclaimer when bulk settings match file settings', () => {
  mockReactHookForm.useWatch
    .mockReturnValueOnce(documentType)
    .mockReturnValueOnce(engine)
    .mockReturnValueOnce(parsingFeatures)

  const fileData = new MockPickedFile(
    {
      uid: 'test-uid',
      name: 'test-file.pdf',
    },
    {
      documentType,
      engine,
      parsingFeatures,
    },
  )

  render(<FileName fileData={fileData} />)

  expect(screen.getByText('test-file.pdf')).toBeInTheDocument()
  expect(screen.queryByText(localize(Localization.MANUALLY_CONFIGURED))).not.toBeInTheDocument()
})

test('renders file name without disclaimer when bulk and file parsing features match regardless of order', () => {
  const bulkParsingFeatures = [MockKnownParsingFeature.TEXT, MockKnownParsingFeature.TABLES, MockKnownParsingFeature.IMAGES]
  const parsingFeatures = [MockKnownParsingFeature.IMAGES, MockKnownParsingFeature.TEXT, MockKnownParsingFeature.TABLES]

  mockReactHookForm.useWatch
    .mockReturnValueOnce(documentType)
    .mockReturnValueOnce(engine)
    .mockReturnValueOnce(bulkParsingFeatures)

  const fileData = new MockPickedFile(
    {
      uid: 'test-uid',
      name: 'test-file.pdf',
    },
    {
      documentType,
      engine,
      parsingFeatures,
    },
  )

  render(<FileName fileData={fileData} />)

  expect(screen.getByText('test-file.pdf')).toBeInTheDocument()
  expect(screen.queryByText(localize(Localization.MANUALLY_CONFIGURED))).not.toBeInTheDocument()
})

test('renders file name with disclaimer when parsing features differ in content', () => {
  const bulkParsingFeatures = [MockKnownParsingFeature.TEXT, MockKnownParsingFeature.TABLES]
  const parsingFeatures = [MockKnownParsingFeature.TEXT, MockKnownParsingFeature.IMAGES]

  mockReactHookForm.useWatch
    .mockReturnValueOnce(documentType)
    .mockReturnValueOnce(engine)
    .mockReturnValueOnce(bulkParsingFeatures)

  const fileData = new MockPickedFile(
    {
      uid: 'test-uid',
      name: 'test-file.pdf',
    },
    {
      documentType,
      engine,
      parsingFeatures,
    },
  )

  render(<FileName fileData={fileData} />)

  expect(screen.getByText('test-file.pdf')).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.MANUALLY_CONFIGURED))).toBeInTheDocument()
})

test('renders file name with disclaimer when parsing features differ in length', () => {
  const bulkParsingFeatures = [MockKnownParsingFeature.TEXT, MockKnownParsingFeature.TABLES, MockKnownParsingFeature.IMAGES]
  const parsingFeatures = [MockKnownParsingFeature.TEXT, MockKnownParsingFeature.TABLES]

  mockReactHookForm.useWatch
    .mockReturnValueOnce(documentType)
    .mockReturnValueOnce(engine)
    .mockReturnValueOnce(bulkParsingFeatures)

  const fileData = new MockPickedFile(
    {
      uid: 'test-uid',
      name: 'test-file.pdf',
    },
    {
      documentType,
      engine,
      parsingFeatures,
    },
  )

  render(<FileName fileData={fileData} />)

  expect(screen.getByText('test-file.pdf')).toBeInTheDocument()
  expect(screen.getByText(localize(Localization.MANUALLY_CONFIGURED))).toBeInTheDocument()
})
