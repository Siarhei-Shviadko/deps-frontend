
import styled from 'styled-components'
import { Pagination } from '@/components/Pagination'

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.2rem 0 0;
  border-top: 0.1rem solid ${({ theme }) => theme.color.grayscale21};
  flex-shrink: 0;
`

export const StyledPagination = styled(Pagination)`
  display: block;
`
