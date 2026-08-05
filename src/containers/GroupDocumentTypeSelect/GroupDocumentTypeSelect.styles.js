
import styled from 'styled-components'
import { Button } from '@/components/Button'
import { Spin } from '@/components/Spin'

const Controls = styled.div`
  display: flex;
  gap: 1.6rem;
  margin-left: 1.6rem;
`

const PrevButton = styled(Button.Secondary)`
  transform: rotate(90deg);
`

const NextButton = styled(Button.Secondary)`
  transform: rotate(-90deg);
`

const StyledSpin = styled(Spin)`
  width: 100%;
  
  .ant-spin-container {
    display: flex;
    justify-content: space-between;
  }

  .ant-carousel {
    width: 70%;
    flex-grow: 1;
  }
`

export {
  Controls,
  PrevButton,
  NextButton,
  StyledSpin as Spin,
}
