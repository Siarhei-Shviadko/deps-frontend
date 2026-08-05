
import styled from 'styled-components'

const ChartWrapper = styled.div`
  width: clamp(40rem, 38%, 70rem);
  padding: 1.6rem 2.4rem;
  border: 1px solid ${(props) => props.theme.color.grayscale21};
  border-radius: 8px;
  background-color: ${(props) => props.theme.color.grayscale14};
`

const ChartTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 2.4rem;
  margin-bottom: 1.2rem;
  color: ${(props) => props.theme.color.grayscale16};
`

const ContentWrapper = styled.div`
  display: flex;

  & .ant-list {
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`

const DiagramWrapper = styled.div`
  height: min(11vw, 21rem);
  width: clamp(14rem, 10vw, 20rem);
`

export {
  ChartWrapper,
  ChartTitle,
  ContentWrapper,
  DiagramWrapper,
}
