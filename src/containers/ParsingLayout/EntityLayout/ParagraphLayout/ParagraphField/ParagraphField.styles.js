
import styled from 'styled-components'
import { Button } from '@/components/Button'
import { InView } from '@/containers/InView'

const StyledInView = styled(InView)`
  && > div {
    margin: 0 0 0.5rem 0;
    padding: 1rem;
  }
`

const ParagraphWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  border: 0.2rem solid ${(props) => props.theme.color.grayscale4};
  border-radius: 0.5rem;
  padding: 1.5rem 0.5rem 0.5rem 1rem;
  margin: 0.5rem;
`

const LinesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const IconButton = styled(Button.Icon)`
  margin: 0.5rem 0.5rem 0 0;
`

export {
  ParagraphWrapper,
  LinesWrapper,
  IconButton,
  StyledInView as InView,
}
