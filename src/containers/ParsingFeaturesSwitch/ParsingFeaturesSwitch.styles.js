import styled from 'styled-components'

export const ParsingFeaturesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.8rem;
  flex-direction: ${(props) => props.$columnView ? 'column' : 'row'};
`

export const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${(props) => props.theme.color.grayscale1};
  border-radius: 0.5rem;
  background-color: ${(props) => props.theme.color.grayscale20};
  cursor: pointer;

  justify-content: ${(props) => props.$columnView ? 'space-between' : 'start'};
`
