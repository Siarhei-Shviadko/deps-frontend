
import styled from 'styled-components'

const ChartsWrapper = styled.div`
  width: 100%;
  height: calc(100% - 25rem);
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`

const ChartsRowWrapper = styled.div`
  display: flex;
  align-items: stretch;
  gap: 1.6rem;
  height: 50%;
  min-height: 23rem;
`

export {
  ChartsWrapper,
  ChartsRowWrapper,
}
