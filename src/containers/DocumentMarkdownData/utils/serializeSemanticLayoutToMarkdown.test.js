import { mockEnv } from '@/mocks/mockEnv'
import {
  SEMANTIC_CONTENT_ELEMENT_TYPE,
  SemanticContentElement,
  SemanticLayout,
  SemanticLayoutMetadata,
  SemanticSection,
  SerializedImageContent,
  SerializedListContent,
  SerializedParagraphContent,
  SerializedTableContent,
} from '@/models/DocumentParsingInfo'
import { serializeSemanticLayoutToMarkdown } from './serializeSemanticLayoutToMarkdown'

jest.mock('@/utils/env', () => mockEnv)

const mockImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
const mockLayoutMetadata = new SemanticLayoutMetadata({
  confidence: 0.9,
  processingTimeMs: 100,
  sourceProvider: 'mockProvider',
})

test('returns empty string when semantic layout has no sections', () => {
  expect(serializeSemanticLayoutToMarkdown(undefined)).toBe('')
  expect(serializeSemanticLayoutToMarkdown(new SemanticLayout({
    id: 'layout-1',
    createdAt: '2024-01-01T00:00:00Z',
    metadata: mockLayoutMetadata,
    sections: [],
  }))).toBe('')
})

test('serializes content elements by type', () => {
  const result = serializeSemanticLayoutToMarkdown(new SemanticLayout({
    id: 'layout-1',
    createdAt: '2024-01-01T00:00:00Z',
    metadata: mockLayoutMetadata,
    sections: [
      new SemanticSection({
        id: 'section-1',
        order: 0,
        title: null,
        contentElements: [
          new SemanticContentElement({
            id: 'element-1',
            order: 0,
            type: SEMANTIC_CONTENT_ELEMENT_TYPE.PARAGRAPH,
            content: new SerializedParagraphContent({
              markdown: '**Intro**',
            }),
          }),
          new SemanticContentElement({
            id: 'element-2',
            order: 1,
            type: SEMANTIC_CONTENT_ELEMENT_TYPE.TABLE,
            content: new SerializedTableContent({
              markdownTable: '| A | B |\n| --- | --- |\n| 1 | 2 |',
            }),
          }),
          new SemanticContentElement({
            id: 'element-3',
            order: 2,
            type: SEMANTIC_CONTENT_ELEMENT_TYPE.IMAGE,
            content: new SerializedImageContent({
              name: 'figure.png',
              data: mockImageData,
            }),
          }),
          new SemanticContentElement({
            id: 'element-4',
            order: 3,
            type: SEMANTIC_CONTENT_ELEMENT_TYPE.LIST,
            content: new SerializedListContent({
              markdown: '* one\n* two',
            }),
          }),
        ],
      }),
      new SemanticSection({
        id: 'section-2',
        order: 1,
        title: 'Details',
        contentElements: [
          new SemanticContentElement({
            id: 'element-5',
            order: 0,
            type: SEMANTIC_CONTENT_ELEMENT_TYPE.PARAGRAPH,
            content: new SerializedParagraphContent({
              markdown: 'Second section',
            }),
          }),
        ],
      }),
    ],
  }))

  expect(result).toBe([
    '**Intro**',
    '| A | B |\n| --- | --- |\n| 1 | 2 |',
    `![figure.png](${mockImageData})`,
    '* one\n* two',
    'Second section',
  ].join('\n\n'))
})

test('skips empty list markdown', () => {
  const result = serializeSemanticLayoutToMarkdown(new SemanticLayout({
    id: 'layout-1',
    createdAt: '2024-01-01T00:00:00Z',
    metadata: mockLayoutMetadata,
    sections: [
      new SemanticSection({
        id: 'section-1',
        order: 0,
        title: null,
        contentElements: [
          new SemanticContentElement({
            id: 'element-1',
            order: 0,
            type: SEMANTIC_CONTENT_ELEMENT_TYPE.LIST,
            content: new SerializedListContent({
              markdown: '',
              items: ['alpha', 'beta'],
            }),
          }),
        ],
      }),
    ],
  }))

  expect(result).toBe('')
})

test('does not include section title in markdown output', () => {
  const result = serializeSemanticLayoutToMarkdown(new SemanticLayout({
    id: 'layout-1',
    createdAt: '2024-01-01T00:00:00Z',
    metadata: mockLayoutMetadata,
    sections: [
      new SemanticSection({
        id: 'section-1',
        order: 0,
        title: 'Overview',
        contentElements: [
          new SemanticContentElement({
            id: 'element-1',
            order: 0,
            type: SEMANTIC_CONTENT_ELEMENT_TYPE.PARAGRAPH,
            content: new SerializedParagraphContent({
              markdown: '# Overview',
            }),
          }),
        ],
      }),
    ],
  }))

  expect(result).toBe('# Overview')
})
