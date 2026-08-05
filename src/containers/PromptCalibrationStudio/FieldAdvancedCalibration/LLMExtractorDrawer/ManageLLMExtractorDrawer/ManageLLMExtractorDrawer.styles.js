
import styled from 'styled-components'
import { Drawer } from '@/components/Drawer'

export const StyledDrawer = styled(Drawer)`
  .ant-drawer-mask {
    background-color: transparent;
  }
    
  .ant-drawer-content {
    display: flex;
    flex-direction: column;
  }

  .ant-drawer-body {
    padding: 0;
    flex-grow: 1;
    overflow-y: auto;
  }

  .ant-drawer-header {
    padding: 1.6rem 2.4rem;
    border-bottom: 1px solid ${({ theme }) => theme.color.grayscale15};
  }

  .ant-drawer-footer {
    padding: 1.6rem 2.4rem;
    border-top: 1px solid ${({ theme }) => theme.color.grayscale15};
  }

  .ant-drawer-title {
    color: ${({ theme }) => theme.color.grayscale18};
    font-size: 1.4rem;
    font-weight: 600;
    line-height: 2.2rem;
  }
`

export const DrawerFooterWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.6rem;
`
