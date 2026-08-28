
import { mockReact } from '@/mocks/mockReact'
import { mockEnv } from '@/mocks/mockEnv'
import { shallow } from 'enzyme'
import { useState } from 'react'
import { fetchDocumentType } from '@/api/documentTypesApi'
import { ContainerType } from '@/enums/ContainerType'
import { DocumentState } from '@/enums/DocumentState'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Document, File } from '@/models/Document'
import { DocumentType, UNKNOWN_DOCUMENT_TYPE } from '@/models/DocumentType'
import { PreviewEntity } from '@/models/PreviewEntity'
import { DownloadMenuCommand } from './'

jest.mock('react', () => mockReact())
jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/actions/documentsListPage', () => ({
  updateDocumentsType: jest.fn(() => jest.fn()),
}))
jest.mock('@/api/documentTypesApi', () => ({
  fetchDocumentType: jest.fn(() => Promise.resolve(mockDocumentType)),
}))

const mockDocumentTypeCode = 'test'
const mockDocumentId = 'mockId'

const mockDocumentType = new DocumentType(
  mockDocumentTypeCode,
  'Test',
  KnownProcessingEngines.TESSERACT,
)

const mockDocument = new Document({
  id: mockDocumentId,
  state: DocumentState.FAILED,
  error: {
    description: 'mockDescription',
    inState: DocumentState.PREPROCESSING,
  },
  documentType: new PreviewEntity('Test', mockDocumentTypeCode),
  containerType: ContainerType.CONTAINER,
  title: 'Title',
  files: [new File('documentUrl.png', 'blobName.png')],
})

describe('Container: DownloadMenuCommand', () => {
  let wrapper, defaultProps

  beforeEach(() => {
    jest.clearAllMocks()

    defaultProps = {
      checkedDocuments: [mockDocumentId],
      documents: [mockDocument],
    }
  })

  it('should render correctly', () => {
    useState.mockImplementationOnce(jest.fn(() => ([false, jest.fn()])))
    useState.mockImplementationOnce(jest.fn(() => ([mockDocumentType, jest.fn()])))

    wrapper = shallow(<DownloadMenuCommand {...defaultProps} />)

    expect(wrapper).toMatchSnapshot()
  })

  it('should be disabled if checkedDocuments.length is not 1', () => {
    const currentProps = {
      ...defaultProps,
      checkedDocuments: [],
    }

    wrapper = shallow(<DownloadMenuCommand {...currentProps} />)

    expect(wrapper.props().disabled).toEqual(true)
  })

  it('should call fetchDocumentType if menu is opened and only one document is selected', async () => {
    useState.mockImplementationOnce(jest.fn(() => ([true, jest.fn()])))

    wrapper = shallow(<DownloadMenuCommand {...defaultProps} />)

    expect(fetchDocumentType).nthCalledWith(
      1,
      mockDocumentTypeCode,
      [
        DocumentTypeExtras.EXTRACTION_FIELDS,
        DocumentTypeExtras.PROFILES,
      ],
    )
  })

  it('should not call fetchDocumentType if menu is not opened', async () => {
    useState.mockImplementationOnce(jest.fn(() => ([false, jest.fn()])))

    wrapper = shallow(<DownloadMenuCommand {...defaultProps} />)

    expect(fetchDocumentType).not.toHaveBeenCalled()
  })

  it('should not call fetchDocumentType if document type of selected document has Unknown type', async () => {
    useState.mockImplementationOnce(jest.fn(() => ([true, jest.fn()])))

    const props = {
      ...defaultProps,
      documents: [{
        ...mockDocument,
        documentType: new PreviewEntity(UNKNOWN_DOCUMENT_TYPE.name, UNKNOWN_DOCUMENT_TYPE.code),
      }],
    }

    wrapper = shallow(<DownloadMenuCommand {...props} />)

    expect(fetchDocumentType).not.toBeCalled()
  })

  it('should not call fetchDocumentType if more than one document are selected', async () => {
    useState.mockImplementationOnce(jest.fn(() => ([true, jest.fn()])))

    const props = {
      checkedDocuments: [mockDocumentId, mockDocumentId],
      documents: [mockDocument, mockDocument],
    }

    wrapper = shallow(<DownloadMenuCommand {...props} />)

    expect(fetchDocumentType).not.toBeCalled()
  })
})
