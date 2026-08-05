import styled from 'styled-components'
import { Drawer } from '@/components/Drawer'

export const StyledDrawer = styled(Drawer)`
  .ant-drawer-content {
    overflow: hidden;
  }
  
  .ant-drawer-header {
    padding: 0 1.6rem;
    border-color: ${(props) => props.theme.color.grayscale15};
  }

  .ant-drawer-title {
    padding: 1.6rem 0;
    color: ${(props) => props.theme.color.grayscale18};
  }

  .ant-drawer-body {
    padding: 1.6rem 1.6rem 0;
  }

  .ant-drawer-footer {
    padding: 1.6rem;
    border: none;
    border-top: 1px solid ${(props) => props.theme.color.grayscale15};
  }
`

export const DrawerFooterWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.6rem;
`

export const Wrapper = styled.div`
  width: fit-content;
`
