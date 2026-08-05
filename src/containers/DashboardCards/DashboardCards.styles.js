
import styled from 'styled-components'

const CardsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 1.4rem;
  box-shadow: 0 0.4rem 1rem ${(props) => props.theme.color.primary2Light};
  background-color: ${(props) => props.theme.color.primary3};
  border-radius: 0.5rem;
  margin-bottom: clamp(1.4rem, 1vw, 7rem);

  .ant-spin-container,
  .ant-spin-nested-loading,
  .ant-upload-drag-container {
    width: 100%;
  }
`

export {
  CardsWrapper,
}
