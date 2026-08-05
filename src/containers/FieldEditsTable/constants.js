import { SelectOption } from '@/components/Select'

export const TOP_LIMIT = {
  TEN: 10,
  TWENTY: 20,
  FIFTY: 50,
}

export const TOP_LIMIT_OPTIONS = [
  new SelectOption(String(TOP_LIMIT.TEN), String(TOP_LIMIT.TEN)),
  new SelectOption(String(TOP_LIMIT.TWENTY), String(TOP_LIMIT.TWENTY)),
  new SelectOption(String(TOP_LIMIT.FIFTY), String(TOP_LIMIT.FIFTY)),
]
