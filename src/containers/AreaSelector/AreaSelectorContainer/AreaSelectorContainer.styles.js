import styled from 'styled-components'

export const Container = styled.div`
  position: relative;
  width: fit-content;
  margin: 0 auto;
  cursor: ${({ $isCreating }) => ($isCreating ? 'crosshair' : 'auto')};
  ${({ $isCreating, theme }) => $isCreating && `border: 1px dashed ${theme.color.error};`}
`
