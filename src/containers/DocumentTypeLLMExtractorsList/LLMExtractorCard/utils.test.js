
import { mockEnv } from '@/mocks/mockEnv'
import { Localization, localize } from '@/localization/i18n'
import { EXTRACTION_PARAMS_KEYS } from '@/models/LLMExtractor'
import { render } from '@/utils/rendererRTL'
import { getExtractionParameter } from './utils'

jest.mock('@/utils/env', () => mockEnv)

test('getExtractionParameter returns All Pages when pageSpan is null', () => {
  render(getExtractionParameter(EXTRACTION_PARAMS_KEYS.PAGE_SPAN, null))

  expect(document.body).toHaveTextContent(localize(Localization.ALL_PAGES))
})

test('getExtractionParameter returns null when value is null for non-pageSpan fields', () => {
  const result = getExtractionParameter(EXTRACTION_PARAMS_KEYS.TEMPERATURE, null)

  expect(result).toBeNull()
})

test('getExtractionParameter formats page span range', () => {
  render(getExtractionParameter(EXTRACTION_PARAMS_KEYS.PAGE_SPAN, {
    start: 1,
    end: 5,
  }))

  expect(document.body).toHaveTextContent('1 — 5')
})
