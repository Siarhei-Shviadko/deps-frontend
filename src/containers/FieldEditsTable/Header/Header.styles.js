import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  margin-bottom: 1.2rem;
`

export const Title = styled.h2`
  flex: 1;
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 2.4rem;
  margin-bottom: 0;
  color: ${(props) => props.theme.color.grayscale16};
`

export const TopSelectWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`

export const TopSelectLabel = styled.span`
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 2rem;
  color: ${(props) => props.theme.color.grayscale16};
`

export const TopSelect = styled.div`
  min-width: 8rem;
`
