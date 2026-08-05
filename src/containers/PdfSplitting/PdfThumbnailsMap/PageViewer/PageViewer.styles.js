
import styled from 'styled-components'

export const Header = styled.div`
  position: absolute;
  width: 100%;

  & > div:last-child {
    right: 31rem;

    @media (max-width: 1250px) {
      right: 19rem;
    }
  }
`

export const PageWrapper = styled.div`
  flex: 1;
  position: relative;
  height: 100%;
  overflow: auto;
  outline: 1px solid ${(props) => props.theme.color.grayscale1};
  outline-offset: 1px;
  border-radius: 8px;
  box-shadow: 0 0.3rem 2rem 0 ${(props) => props.theme.color.shadow3};
`

export const PageNumberCorner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  padding: 0.4rem 1rem;
  margin: 0.4rem;
  display: grid;
  place-items: center;
  background-color: ${(props) => props.theme.color.grayscale18};
  opacity: 0.8;
  border-radius: 4px;
  color: white;
`
