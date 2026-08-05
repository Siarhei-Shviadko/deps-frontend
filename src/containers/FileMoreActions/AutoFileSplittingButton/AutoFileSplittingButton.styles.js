import styled from 'styled-components'
import { Drawer } from '@/components/Drawer'

export const StyledDrawer = styled(Drawer)`
  z-index: 1001;

  & .ant-drawer-footer {
    padding: 1rem 2.4rem;
  }

  .ant-drawer-title {
    color: ${({ theme }) => theme.color.grayscale18};
  }
`

export const DrawerFooterWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.6rem;
`

export const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.6rem;
`
