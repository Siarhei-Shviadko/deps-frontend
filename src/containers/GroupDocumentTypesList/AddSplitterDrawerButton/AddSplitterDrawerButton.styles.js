
import styled from 'styled-components'
import { Button } from '@/components/Button'
import { PlusFilledIcon } from '@/components/Icons/PlusFilledIcon'

export const Trigger = styled(Button.Link)`
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.color.grayscale19};
  font-weight: 600;
  text-decoration: none;
  
  &:hover {
    & > svg > path {
      transition: all 0.3s;
      fill: ${(props) => props.theme.color.primary2};
    }
  }
`

export const PlusIcon = styled(PlusFilledIcon)`
  margin-right: 4px;
  path {
    fill: ${(props) => props.theme.color.grayscale19};
  }
`
