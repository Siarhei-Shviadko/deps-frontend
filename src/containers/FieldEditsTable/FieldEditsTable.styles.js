
import styled from 'styled-components'
import { Table } from '@/components/Table'

export const Wrapper = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.6rem 2.4rem;
  border: 1px solid ${(props) => props.theme.color.grayscale21};
  border-radius: 8px;
  background-color: ${(props) => props.theme.color.grayscale14};
`

export const StyledTable = styled(Table)`
  height: 100%;

  .ant-table,
  .ant-table-container,
  .ant-spin-nested-loading,
  .ant-spin-container {
    height: 100%;
  }

  .ant-table-body {
    height: calc(100% - 2.8rem);
  }

  .ant-table-thead,
  .ant-table-tbody .ant-table-cell {
    height: 2.8rem;
  }
`

export const TableBody = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
`
