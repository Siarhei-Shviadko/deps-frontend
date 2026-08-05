import { useContext } from 'react'
import { AreaCreateContext } from '@/containers/AreaSelector/providers'

export const useAreaCreate = () => useContext(AreaCreateContext)
