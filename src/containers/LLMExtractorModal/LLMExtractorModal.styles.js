
import styled from 'styled-components'
import { Modal } from '@/components/Modal'

const StyledModal = styled(Modal)`
  .ant-modal-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 0.8rem;
    border-top: 1px solid ${(props) => props.theme.color.grayscale15};
  }

  .ant-modal-body {
    padding: 0;
    flex-grow: 1;
    height: calc(100% - 11rem);
  }

  .ant-modal-header {
    padding: 1.6rem;
    border-bottom: 1px solid ${(props) => props.theme.color.grayscale15};
  }

  .ant-modal-footer {
    padding: 1.6rem;
    border-top: 1px solid ${(props) => props.theme.color.grayscale15};
  }

  .ant-modal-title {
    color: ${(props) => props.theme.color.grayscale18};
    font-size: 1.4rem;
    font-weight: 600;
    line-height: 2.2rem;
  }
`

const ModalFooterWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
`

export {
  StyledModal as Modal,
  ModalFooterWrapper,
}
