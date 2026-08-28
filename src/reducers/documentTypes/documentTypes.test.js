
import { mockEnv } from '@/mocks/mockEnv'
import { storeDocumentType } from '@/actions/documentType'
import { storeDocumentTypes } from '@/actions/documentTypes'
import { ExtractionType } from '@/enums/ExtractionType'
import { FieldType } from '@/enums/FieldType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { DocumentType } from '@/models/DocumentType'
import { DocumentTypeField } from '@/models/DocumentTypeField'
import { documentTypesReducer, initialState } from '@/reducers/documentTypes'

jest.mock('@/utils/env', () => mockEnv)

const mockDocumentTypes = [
  new DocumentType(
    'MarketingContract',
    '',
    KnownProcessingEngines.TESSERACT,
    KnownLanguage.ENGLISH,
    ExtractionType.ML,
    [
      new DocumentTypeField(
        'MarketingClause',
        'Marketing Clause',
        {},
        FieldType.LIST,
        false,
        0,
        'MarketingContract',
        1021,
      ),
    ],
  ),
]

describe('Reducer: documentTypes', () => {
  describe('Action handler: storeDocumentType', () => {
    it('should add new document type to the state object', () => {
      const [first] = mockDocumentTypes
      const stateBefore = { ...initialState }

      const expectedStateAfter = {
        ...initialState,
        [first.code]: first,
      }

      const action = storeDocumentType(first)
      const stateAfter = documentTypesReducer(stateBefore, action)
      expect(stateAfter).toEqual(expectedStateAfter)
    })
  })

  describe('Action handler: storeDocumentTypes', () => {
    it('should put fetched types to the state', () => {
      const stateBefore = { ...initialState }

      const action = storeDocumentTypes(mockDocumentTypes)

      const updatedEntities = {}

      mockDocumentTypes.forEach((type) => {
        updatedEntities[type.code] = {
          ...stateBefore[type.code],
          ...mockDocumentTypes.find((resType) => resType.code === type.code),
        }
      })

      const expectedStateAfter = {
        ...stateBefore,
        ...updatedEntities,
      }

      const stateAfter = documentTypesReducer(stateBefore, action)
      expect(stateAfter).toEqual(expectedStateAfter)
    })
  })
})
