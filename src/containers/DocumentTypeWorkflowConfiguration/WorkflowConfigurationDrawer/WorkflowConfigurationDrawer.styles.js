
import styled from 'styled-components'
import { Button } from '@/components/Button'
import { Drawer } from '@/components/Drawer'

const StyledDrawer = styled(Drawer)`
  .ant-drawer-header {
    padding: 1.6rem 2.4rem;
    border-bottom: 1px solid ${(props) => props.theme.color.grayscale15};
  }

  .ant-drawer-body {
    padding: 1.6rem 2rem;
  }

  .ant-drawer-footer {
    padding: 1.6rem 2.4rem;
    border-top: 1px solid ${(props) => props.theme.color.grayscale15};
  }
`

const DrawerFooterWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`

const CancelButton = styled(Button.Secondary)`
  margin-right: 1.6rem;
`

const Description = styled.p`
  margin: 0 0 1.6rem;
  font-size: 1.4rem;
  line-height: 1.5;
  color: ${(props) => props.theme.color.grayscale16};
`

export {
  CancelButton,
  Description,
  DrawerFooterWrapper,
  StyledDrawer as Drawer,
}
