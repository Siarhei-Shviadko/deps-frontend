
import styled from 'styled-components'
import { Badge } from '@/components/Badge'

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.6rem;
  background-color: ${(props) => props.theme.color.primary3};
  border: 1px solid ${(props) => props.theme.color.grayscale15};
  border-radius: 0.8rem;
  color: ${(props) => props.theme.color.grayscale18};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 2.2rem;
`

const Details = styled.div`
  display: flex;
  align-items: center;
  gap: 1.6rem;
`

const BaseFieldsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 4px;
`

const ExtractionName = styled.div`
  font-weight: 600;
  padding: 1px 0;
`

const ExtractionParamsWrapper = styled.div`
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
`

const ExtractionParam = styled.div`
  display: flex;
  gap: 0.8rem;
  padding: 1px 0;
  align-items: center;

  > span {
    font-weight: 600;
  }
`

const InstructionText = styled.pre`
  font-family: 'Open Sans', sans-serif;
  margin: 0;
  overflow-wrap: break-word;
  white-space: pre-wrap;
`

const HorizontalDivider = styled.div`
  background-color: ${(props) => props.theme.color.grayscale15};
  height: 1px;
  width: 100%;
`

const VerticalDivider = styled.div`
  background-color: ${(props) => props.theme.color.grayscale15};
  height: 2.4rem;
  width: 1px;
`

const ExpandCollapseIconWrapper = styled.span`
  position: absolute;
  right: 2rem;
  bottom: 1rem;
`

const StyledBadge = styled(Badge)`
  background-color: ${(props) => props.theme.color.grayscale20};
  border: 1px solid ${(props) => props.theme.color.grayscale15};
  border-radius: 0.4rem;
  color: ${(props) => props.theme.color.grayscale18};
  line-height: 2rem;
  padding: 0.4rem 1.6rem;
`

export {
  BaseFieldsWrapper,
  Details,
  ExtractionName,
  ExtractionParam,
  ExtractionParamsWrapper,
  HorizontalDivider,
  InstructionText,
  StyledBadge as Badge,
  Wrapper,
  VerticalDivider,
  ExpandCollapseIconWrapper,
}
