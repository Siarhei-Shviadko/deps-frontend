
import styled, { css } from 'styled-components'
import { Button } from '@/components/Button'
import { LongText } from '@/components/LongText'
import { TypographyText } from '@/components/TypographyText'

export const SegmentCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.color.primary3};
  cursor: pointer;
  padding: 1.6rem;
  border: 1px solid ${(props) => props.theme.color.grayscale15};
  border-radius: 8px;

  &:hover {
    background-color: ${(props) => props.theme.color.grayscale6};
  }

  ${(props) => props.$isSelected && css`
    border-color: ${(props) => props.theme.color.grayscale21};
    box-shadow: 0 0.4rem 1rem 0  ${(props) => props.theme.color.primary2Light};
  `}
`

export const SegmentPagesRange = styled(TypographyText)`
  font-size: 1.2rem;
  color: ${(props) => props.theme.color.grayscale12};
`

export const SegmentTitle = styled(LongText)`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${(props) => props.theme.color.grayscale18};
`

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.6rem;
  margin-bottom: 1.6rem;
`

export const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 90%;
`

export const IconButton = styled(Button.Icon)`
  margin-left: auto;
  padding: 0.3rem;

  svg {
    path {
      fill: ${(props) => props.theme.color.grayscale12};
    }
  }
`
