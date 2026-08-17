
import { mockReact } from '@/mocks/mockReact'
import { mockComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import React from 'react'
import { GenAIModalButton } from '@/containers/GenAIModalButton'
import {
  DocumentParsingInfo,
  SemanticLayoutInfo,
  SemanticLayoutMetadata,
} from '@/models/DocumentParsingInfo'
import {
  documentSelector,
  documentTypeSelector,
} from '@/selectors/documentReviewPage'
import { ENV } from '@/utils/env'
import { DocumentData } from './DocumentData'
import { Tabs } from './DocumentData.styles'

jest.mock('@/utils/notification', () => mockNotification)
jest.mock('react-redux', () => mockReactRedux)
jest.mock('@/selectors/documentReviewPage')
jest.mock('react', () => mockReact())
jest.mock('@/selectors/requests', () => ({
  isDocumentStateGettingSelector: jest.fn(),
}))

jest.mock('@/containers/DocumentConsolidatedData', () =>
  mockComponent('DocumentConsolidatedData'),
)
jest.mock('@/containers/DocumentEnrichment', () =>
  mockComponent('DocumentEnrichment'),
)
jest.mock('@/containers/DocumentExtractedData', () =>
  mockComponent('DocumentExtractedData'),
)
jest.mock('@/containers/DocumentParsedData', () =>
  mockComponent('DocumentParsedData'),
)
jest.mock('@/containers/DocumentMarkdownData', () =>
  mockComponent('DocumentMarkdownData'),
)
jest.mock('@/containers/GenAiData', () =>
  mockComponent('GenAiData'),
)
jest.mock('@/containers/GenAIModalButton', () =>
  mockComponent('GenAIModalButton'),
)
jest.mock('@/utils/env', () => mockEnv)

jest.mock('@/hooks/useEventSource', () => ({
  useEventSource: jest.fn(() => jest.fn()),
  KnownBusinessEvent: {
    DOCUMENT_STATE_UPDATED: 'DOCUMENT_STATE_UPDATED',
  },
}))

describe('Container: DocumentData', () => {
  let wrapper

  beforeEach(() => {
    jest.clearAllMocks()
    ENV.FEATURE_GEN_AI_CHAT = true

    wrapper = shallow(<DocumentData />)
  })

  it('should render correct layout', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should correctly render Tab with extracted data', () => {
    const extractedDataTab = wrapper.find(Tabs).props().tabs[0].children
    const renderExtractedTab = shallow(<div>{extractedDataTab}</div>)
    expect(renderExtractedTab).toMatchSnapshot()
  })

  it('should render Empty in case document type fields are empty', () => {
    documentTypeSelector.mockImplementationOnce(() => ({}))
    wrapper = shallow(<DocumentData />)
    expect(wrapper).toMatchSnapshot()
  })

  it('should not render GenAiChat if FEATURE_GEN_AI_CHAT is disabled', () => {
    ENV.FEATURE_GEN_AI_CHAT = false

    wrapper = shallow(<DocumentData />)

    expect(wrapper.find(GenAIModalButton).exists()).toBe(false)
  })

  it('should not render Extra Fields and Document Consolidated Data tabs if enrichment feature is disabled', () => {
    const tabs = wrapper.find(Tabs).props().tabs

    const prevTabsAmount = tabs.length

    ENV.FEATURE_ENRICHMENT = false

    wrapper = shallow(<DocumentData />)

    const currentTabsAmount = prevTabsAmount - 2

    expect(wrapper.find(Tabs).props().tabs.length).toBe(currentTabsAmount)
  })

  it('should render Document Layout tab if FEATURE_DOCUMENT_LAYOUT is enabled', () => {
    ENV.FEATURE_DOCUMENT_LAYOUT = true
    documentTypeSelector.mockImplementationOnce(() => ({
      fields: [{
        id: 1,
        name: 'Field 1',
      }],
    }))

    wrapper = shallow(<DocumentData />)
    const tabs = wrapper.find(Tabs).props().tabs

    const hasDocumentLayoutTab = tabs.some((tab) => tab.key === 'DOCUMENT_LAYOUT')

    expect(hasDocumentLayoutTab).toBe(true)
  })

  it('should not render Document Layout tab if FEATURE_DOCUMENT_LAYOUT is disabled', () => {
    ENV.FEATURE_DOCUMENT_LAYOUT = false
    documentTypeSelector.mockImplementationOnce(() => ({
      fields: [{
        id: 1,
        name: 'Field 1',
      }],
    }))

    wrapper = shallow(<DocumentData />)
    const tabs = wrapper.find(Tabs).props().tabs

    const hasDocumentLayoutTab = tabs.some((tab) => tab.key === 'DOCUMENT_LAYOUT')

    expect(hasDocumentLayoutTab).toBe(false)
  })

  it('should render Markdown tab if FEATURE_MARKDOWN_LAYOUT is enabled and document has semanticLayoutInfo', () => {
    ENV.FEATURE_MARKDOWN_LAYOUT = true
    documentSelector.mockImplementationOnce(() => ({
      ...documentSelector.getSelectorMockValue(),
      parsingInfo: new DocumentParsingInfo({
        semanticLayoutInfo: {
          mockProvider: new SemanticLayoutInfo({
            id: 'mockSemanticLayoutId',
            createdAt: '2024-01-01T00:00:00Z',
            provider: 'mockProvider',
            metadata: new SemanticLayoutMetadata({
              confidence: 0.9,
              processingTimeMs: 100,
              sourceProvider: 'mockProvider',
            }),
          }),
        },
      }),
    }))
    documentTypeSelector.mockImplementationOnce(() => ({
      fields: [{
        id: 1,
        name: 'Field 1',
      }],
    }))

    wrapper = shallow(<DocumentData />)
    const tabs = wrapper.find(Tabs).props().tabs

    const hasMarkdownTab = tabs.some((tab) => tab.key === 'MARKDOWN')

    expect(hasMarkdownTab).toBe(true)
  })

  it('should not render Markdown tab if FEATURE_MARKDOWN_LAYOUT is disabled', () => {
    ENV.FEATURE_MARKDOWN_LAYOUT = false
    documentSelector.mockImplementationOnce(() => ({
      ...documentSelector.getSelectorMockValue(),
      parsingInfo: new DocumentParsingInfo({
        semanticLayoutInfo: {
          mockProvider: new SemanticLayoutInfo({
            id: 'mockSemanticLayoutId',
            createdAt: '2024-01-01T00:00:00Z',
            provider: 'mockProvider',
            metadata: new SemanticLayoutMetadata({
              confidence: 0.9,
              processingTimeMs: 100,
              sourceProvider: 'mockProvider',
            }),
          }),
        },
      }),
    }))
    documentTypeSelector.mockImplementationOnce(() => ({
      fields: [{
        id: 1,
        name: 'Field 1',
      }],
    }))

    wrapper = shallow(<DocumentData />)
    const tabs = wrapper.find(Tabs).props().tabs

    const hasMarkdownTab = tabs.some((tab) => tab.key === 'MARKDOWN')

    expect(hasMarkdownTab).toBe(false)
  })

  it('should not render Markdown tab if document has no semanticLayoutInfo', () => {
    ENV.FEATURE_MARKDOWN_LAYOUT = true
    documentSelector.mockImplementationOnce(() => ({
      ...documentSelector.getSelectorMockValue(),
      parsingInfo: new DocumentParsingInfo({}),
    }))
    documentTypeSelector.mockImplementationOnce(() => ({
      fields: [{
        id: 1,
        name: 'Field 1',
      }],
    }))

    wrapper = shallow(<DocumentData />)
    const tabs = wrapper.find(Tabs).props().tabs

    const hasMarkdownTab = tabs.some((tab) => tab.key === 'MARKDOWN')

    expect(hasMarkdownTab).toBe(false)
  })

  it('should render GenAI Fields tab if both FEATURE_GEN_AI_KEY_VALUE_FIELDS and FEATURE_GEN_AI_CHAT are enabled', () => {
    ENV.FEATURE_GEN_AI_KEY_VALUE_FIELDS = true
    ENV.FEATURE_GEN_AI_CHAT = true
    documentTypeSelector.mockImplementationOnce(() => ({
      fields: [{
        id: 1,
        name: 'Field 1',
      }],
    }))

    wrapper = shallow(<DocumentData />)
    const tabs = wrapper.find(Tabs).props().tabs

    const hasGenAiFieldsTab = tabs.some((tab) => tab.key === 'GEN_AI_FIELDS')

    expect(hasGenAiFieldsTab).toBe(true)
  })

  it('should not render GenAI Fields tab if FEATURE_GEN_AI_KEY_VALUE_FIELDS is disabled', () => {
    ENV.FEATURE_GEN_AI_KEY_VALUE_FIELDS = false
    ENV.FEATURE_GEN_AI_CHAT = true
    documentTypeSelector.mockImplementationOnce(() => ({
      fields: [{
        id: 1,
        name: 'Field 1',
      }],
    }))

    wrapper = shallow(<DocumentData />)
    const tabs = wrapper.find(Tabs).props().tabs

    const hasGenAiFieldsTab = tabs.some((tab) => tab.key === 'GEN_AI_FIELDS')

    expect(hasGenAiFieldsTab).toBe(false)
  })

  it('should render Overview tab if FEATURE_CONSOLIDATED_DOCUMENT_TYPE_FIELDS and FEATURE_ENRICHMENT are enabled', () => {
    ENV.FEATURE_CONSOLIDATED_DOCUMENT_TYPE_FIELDS = true
    ENV.FEATURE_ENRICHMENT = true
    documentTypeSelector.mockImplementationOnce(() => ({
      fields: [{
        id: 1,
        name: 'Field 1',
      }],
    }))

    wrapper = shallow(<DocumentData />)
    const tabs = wrapper.find(Tabs).props().tabs

    const hasOverviewTab = tabs.some((tab) => tab.key === 'OVERVIEW')

    expect(hasOverviewTab).toBe(true)
  })

  it('should not render Overview tab if FEATURE_CONSOLIDATED_DOCUMENT_TYPE_FIELDS is disabled', () => {
    ENV.FEATURE_CONSOLIDATED_DOCUMENT_TYPE_FIELDS = false
    ENV.FEATURE_ENRICHMENT = true
    documentTypeSelector.mockImplementationOnce(() => ({
      fields: [{
        id: 1,
        name: 'Field 1',
      }],
    }))

    wrapper = shallow(<DocumentData />)
    const tabs = wrapper.find(Tabs).props().tabs

    const hasOverviewTab = tabs.some((tab) => tab.key === 'OVERVIEW')

    expect(hasOverviewTab).toBe(false)
  })

  it('should render Extracted Data tab if documentType has fields', () => {
    documentTypeSelector.mockImplementationOnce(() => ({
      fields: [{
        id: 1,
        name: 'Field 1',
      }],
    }))

    wrapper = shallow(<DocumentData />)
    const tabs = wrapper.find(Tabs).props().tabs

    const hasExtractedDataTab = tabs.some((tab) => tab.key === 'EXTRACTED_DATA')

    expect(hasExtractedDataTab).toBe(true)
  })

  it('should not render Extracted Data tab if documentType has no fields', () => {
    documentTypeSelector.mockImplementationOnce(() => ({
      fields: [],
    }))

    wrapper = shallow(<DocumentData />)
    const tabs = wrapper.find(Tabs).props().tabs

    const hasExtractedDataTab = tabs.some((tab) => tab.key === 'EXTRACTED_DATA')

    expect(hasExtractedDataTab).toBe(false)
  })

  it('should set the active tab to first tab by default', () => {
    documentTypeSelector.mockImplementationOnce(() => ({
      fields: [{
        id: 1,
        name: 'Field 1',
      }],
    }))

    wrapper = shallow(<DocumentData />)
    const tabs = wrapper.find(Tabs).props().tabs
    const activeKey = wrapper.find(Tabs).props().activeKey

    expect(activeKey).toBe(tabs[0]?.key)
  })

  it('should render Extra Fields tab with correct props when FEATURE_ENRICHMENT is enabled', () => {
    ENV.FEATURE_ENRICHMENT = true
    const mockDocument = {
      ...documentSelector.getSelectorMockValue(),
      _id: 'doc123',
      state: 'EXTRACTED',
    }
    const mockDocType = {
      fields: [{
        id: 1,
        name: 'Field 1',
      }],
      code: 'INVOICE',
      extraFields: [{
        id: 1,
        name: 'Extra Field',
      }],
    }

    documentSelector.mockImplementationOnce(() => mockDocument)
    documentTypeSelector.mockImplementationOnce(() => mockDocType)

    wrapper = shallow(<DocumentData />)
    const tabs = wrapper.find(Tabs).props().tabs
    const extraFieldsTab = tabs.find((tab) => tab.key === 'EXTRA_FIELDS')

    expect(extraFieldsTab).toBeDefined()
  })
})
