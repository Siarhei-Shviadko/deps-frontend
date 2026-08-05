
import { Thumbnail as ReactPdfThumbnail } from 'react-pdf'
import styled, { css } from 'styled-components'
import { Button } from '@/components/Button'
import { InView } from '@/containers/InView'

export const StyledInView = styled(InView)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: fit-content;
  width: auto;
  padding-top: 2px;
`

export const ThumbnailWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: fit-content;
  border-radius: 4px;
  outline-offset: 1px;

  & > div:first-child {
    display: none;
  }

  &:hover > div:first-child {
    display: flex;
  }

  &:hover {
    outline: 2px solid ${(props) => props.theme.color.primary2};
  }

  ${(props) => props.$isSelected && css`
    outline: 1px solid ${(props) => props.theme.color.primary2};
    box-shadow: 0 0.4rem 1rem 0  ${(props) => props.theme.color.primary2Light};
  `}

  ${(props) => props.$isActive && css`
    outline: 1px solid ${(props) => props.theme.color.primary2};
  `}

  ${(props) => props.$isExcluded && css`
    & > a {
      opacity: 0.4;
    }
  `}
`

export const PageNumberCorner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  padding: 0 0.5rem;
  font-size: 1rem;
  margin: 0.4rem;
  display: grid;
  place-items: center;
  background-color: ${(props) => props.theme.color.grayscale18};
  opacity: 0.8;
  border-radius: 4px;
  color: white;
`

export const Thumbnail = styled(ReactPdfThumbnail)`
  cursor: pointer;
  outline: 1px solid ${(props) => props.theme.color.grayscale1};
  outline-offset: 1px;
  border-radius: 4px;

  &:hover,
  &:focus {
    outline: 1px solid ${(props) => props.theme.color.grayscale1};
  }

  & canvas {
    height: 15rem !important;
  }
`

export const ThumbnailContainer = styled.div`
  position: relative;
  display: inline-flex;
`

export const BoundingBoxOverlay = styled.div`
  position: absolute;
  left: ${({ $coords }) => $coords.x * 100}%;
  top: ${({ $coords }) => $coords.y * 100}%;
  width: ${({ $coords }) => $coords.width * 100}%;
  height: ${({ $coords }) => $coords.height * 100}%;
  border: 0.15rem solid ${({ theme }) => theme.color.error};
  border-radius: 2px;
  pointer-events: none;
  z-index: 1;
`

export const IconButton = styled(Button.Icon)`
  position: absolute;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 4px;
  background: ${(props) => props.theme.color.grayscale15};
  color: ${(props) => props.theme.color.grayscale12};
  z-index: 10;
`
