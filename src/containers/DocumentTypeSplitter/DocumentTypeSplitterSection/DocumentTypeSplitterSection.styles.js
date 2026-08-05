
import styled from 'styled-components'
import { Button } from '@/components/Button'
import { TableActionIcon } from '@/components/TableActionIcon'

export const SplitterTitle = styled.div`
  display: flex;
  align-items: center;
  margin-block: 0.5rem 1.6rem;
  font-weight: 600;
  color: ${(props) => props.theme.color.grayscale18};
`

export const SplitterWrapper = styled.div`
  border-top: 1px solid ${({ theme }) => theme.color.grayscale15};
`

export const RemoveSplitterButton = styled(TableActionIcon)`
  display: flex;
  align-items: center;
  margin-left: auto;
`

export const CreateButton = styled(Button)`
  display: flex;
  align-items: center;
  margin-left: auto;

  & svg {
    padding-top: 0.2rem;
  }
`
