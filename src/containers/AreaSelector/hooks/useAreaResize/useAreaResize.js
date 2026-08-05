import { useContext } from 'react'
import { AreaResizeContext } from '@/containers/AreaSelector/providers'

export const useAreaResize = () => useContext(AreaResizeContext)
