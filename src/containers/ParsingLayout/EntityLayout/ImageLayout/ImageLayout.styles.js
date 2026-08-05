
import styled from 'styled-components'
import { Spin } from '@/components/Spin'

const ImagesFieldContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: start;
  padding: 1.6rem;
  gap: 1.2rem;
`

const Spinner = styled(Spin)`
  width: 100%;
  margin-top: 2rem;
`

export { ImagesFieldContainer, Spinner }
