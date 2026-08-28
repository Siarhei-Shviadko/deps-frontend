
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { fetchDocumentType } from '@/actions/documentType'
import { createOutputProfile } from '@/api/outputProfilesApi'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { FILE_EXTENSION_TO_DOWNLOAD_FORMAT, FileExtension } from '@/enums/FileExtension'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { StatusCode } from '@/enums/StatusCode'
import { Localization, localize } from '@/localization/i18n'
import { ExtendedDocumentType } from '@/models/ExtendedDocumentType'
import { DocumentLayoutSchema } from '@/models/OutputProfile'
import { documentTypeStateSelector } from '@/selectors/documentType'
import { notifySuccess, notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { AddOutputProfileByLayoutSection } from './AddOutputProfileByLayoutSection'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('@/selectors/documentType')

jest.mock('@/api/outputProfilesApi', () => ({
  createOutputProfile: jest.fn(() => Promise.resolve({})),
}))

jest.mock('@/actions/documentType', () => ({
  fetchDocumentType: jest.fn(),
}))

let onDrawerSubmit

jest.mock('@/containers/OutputProfileByLayoutDrawer', () => ({
  OutputProfileByLayoutDrawer: ({ onSubmit, visible }) => {
    onDrawerSubmit = onSubmit
    return visible ? <div data-testid="layout-drawer" /> : null
  },
}))

const mockDocumentTypeCode = 'DocType1'
const mockEngine = KnownProcessingEngines.TESSERACT

const mockDocumentType = new ExtendedDocumentType({
  code: mockDocumentTypeCode,
  name: 'Document Type 1',
  engine: mockEngine,
})

const mockProfile = {
  name: 'My Layout Profile',
  schema: new DocumentLayoutSchema({
    features: [],
    parsingType: mockEngine,
  }),
  format: FILE_EXTENSION_TO_DOWNLOAD_FORMAT[FileExtension.XLSX],
}

beforeEach(() => {
  jest.clearAllMocks()
  documentTypeStateSelector.mockReturnValue(mockDocumentType)
})

const clickTrigger = async () => {
  render(<AddOutputProfileByLayoutSection />)

  const trigger = screen.getByRole('heading', {
    level: 3,
    name: localize(Localization.LAYOUT_PROFILE),
  })

  await userEvent.click(trigger)
}

test('shows layout profile drawer when trigger is clicked', async () => {
  await clickTrigger()

  expect(screen.getByTestId('layout-drawer')).toBeInTheDocument()
})

test('calls createOutputProfile API with correct parameters when creating profile', async () => {
  await clickTrigger()

  await act(async () => {
    await onDrawerSubmit(mockProfile)
  })

  expect(createOutputProfile).nthCalledWith(1, {
    documentTypeId: mockDocumentTypeCode,
    name: mockProfile.name,
    schema: mockProfile.schema,
    format: mockProfile.format,
  })
})

test('calls notifySuccess and fetchDocumentType in case profile creation was successful', async () => {
  await clickTrigger()

  await act(async () => {
    await onDrawerSubmit(mockProfile)
  })

  expect(notifySuccess).nthCalledWith(1, localize(Localization.PROFILE_CREATED))
  expect(fetchDocumentType).nthCalledWith(1, mockDocumentTypeCode, [DocumentTypeExtras.PROFILES])
})

test('calls notifyWarning with default message in case creation failed with unknown error', async () => {
  createOutputProfile.mockImplementationOnce(() => Promise.reject(new Error()))

  await clickTrigger()

  await act(async () => {
    await onDrawerSubmit(mockProfile)
  })

  await waitFor(() => {
    expect(notifyWarning).nthCalledWith(1, localize(Localization.DEFAULT_ERROR))
  })
})

test('calls notifyWarning with correct message in case creation failed with known error', async () => {
  const conflictError = new Error()
  conflictError.request = { status: StatusCode.CONFLICT }
  createOutputProfile.mockImplementationOnce(() => Promise.reject(conflictError))

  await clickTrigger()

  await act(async () => {
    await onDrawerSubmit(mockProfile)
  })

  await waitFor(() => {
    expect(notifyWarning).nthCalledWith(1, localize(Localization.OUTPUT_ALREADY_EXISTS))
  })
})
