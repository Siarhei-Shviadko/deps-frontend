
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  margin: 0 1.2rem;
  height: clamp(14rem, 7vw, 19rem);
  background-color: ${(props) => props.theme.color.primary5};
  border-radius: 0.5rem;
  border: 1px solid ${(props) => props.theme.color.grayscale21};

  &:hover {
    cursor: pointer;
    box-shadow: 0 0 3px ${(props) => props.theme.color.primary2Lighter};
  }
`

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.color.primary2};
  width: clamp(6rem, 4vw, 8rem);
  padding-block: 1vw;
  margin-bottom: 1rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background-color: ${(props) => props.theme.color.primary3}; 
    
  & > svg {
    width: min(2vw, 3rem);
    height: min(2vw, 3rem);
  }
`

const Title = styled.span`
  font-size: clamp(1.2rem, 0.9vw, 1.8rem);
  font-weight: 600;
  color: ${(props) => props.theme.color.grayscale16};
  gap: 1rem;
  display: flex;
  align-items: center;
`

const Count = styled.span`
  font-size: clamp(2rem, 1.2vw, 2.5rem);
  font-weight: 700;
  color: ${(props) => props.theme.color.primary2};
`

export {
  Wrapper,
  IconWrapper,
  Title,
  Count,
}
