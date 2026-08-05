
import styled from 'styled-components'
import { Button } from '@/components/Button'
import { Drawer } from '@/components/Drawer'
import { Spin } from '@/components/Spin'

export const DrawerHeaderWrapper = styled.span`
  font-size: 1.4rem;
  font-weight: 600;
`

export const WarningButton = styled(Button.Secondary)`
  border-color: ${({ theme }) => theme.color.warning};
  color: ${({ theme }) => theme.color.warning};

  &:hover,
  &:focus {
    border-color: ${({ theme }) => theme.color.warning};
    color: ${({ theme }) => theme.color.warning};
  }
`

export const StyledDrawer = styled(Drawer)`
  & .ant-drawer-header-title {
    flex-direction: row-reverse;

    & > button {
      align-self: end;
    }
  }

  & .ant-drawer-body,
  & .ant-drawer-header {
    padding: 1.6rem;
    display: flex;
    gap: 2rem;
  }

  & .ant-drawer-body > .ant-spin-spinning {
    display: block;
  }
`

export const StyledSpin = styled(Spin)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`
