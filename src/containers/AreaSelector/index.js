import { AreaSelectorContainer } from './AreaSelectorContainer'
import { AreaSelectorOverlay } from './AreaSelectorOverlay'
import { AreaSelectorProvider } from './providers'

export const AreaSelector = {
  Provider: AreaSelectorProvider,
  Overlay: AreaSelectorOverlay,
  Container: AreaSelectorContainer,
}

export { useAreaCreate, useAreaResize } from './hooks'
