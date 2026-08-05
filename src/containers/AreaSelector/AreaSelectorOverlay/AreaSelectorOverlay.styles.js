import styled from 'styled-components'
import { RESIZE_EDGE } from '../constants'

const HANDLE_POSITIONS = {
  [RESIZE_EDGE.TOP]: 'top: -0.4rem;',
  [RESIZE_EDGE.BOTTOM]: 'bottom: -0.4rem;',
}

export const DrawingOverlay = styled.div`
  position: absolute;
  left: 0;
  width: 100%;
  top: ${({ $coords }) => $coords.y * 100}%;
  height: ${({ $coords }) => $coords.height * 100}%;
  border: 0.2rem solid ${({ theme }) => theme.color.error};
  border-radius: 2px;
  background: ${({ theme }) => `${theme.color.errorBg}`};
  pointer-events: none;
  opacity: 0.5;
`

export const Overlay = styled.div`
  position: absolute;
  left: 0;
  width: 100%;
  top: ${({ $coords }) => $coords.y * 100}%;
  height: ${({ $coords }) => $coords.height * 100}%;
  border: 0.2rem solid ${({ theme }) => theme.color.error};
  border-radius: 2px;
  pointer-events: none;
`

export const Handle = styled.div`
  position: absolute;
  left: 50%;
  width: 0.8rem;
  height: 0.8rem;
  background: ${({ theme }) => theme.color.error};
  cursor: row-resize;
  pointer-events: all;
  ${({ $position }) => HANDLE_POSITIONS[$position]}
`
