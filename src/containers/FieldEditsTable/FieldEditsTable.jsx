
import { useState } from 'react'
import { useGetMostActiveFieldsQuery } from '@/apiRTK/documentFieldAnalyticsApi'
import { DocumentTypeFieldExtras } from '@/enums/DocumentTypeFieldExtras'
import { withParentSize } from '@/hocs/withParentSize'
import {
  generateChangeCountColumn,
  generateDocumentCountColumn,
  generateDocumentTypeColumn,
  generateFieldNameColumn,
} from './columns'
import { TOP_LIMIT } from './constants'
import {
  TableBody,
  Wrapper,
  StyledTable,
} from './FieldEditsTable.styles'
import { Header } from './Header'

const SizeAwareTable = withParentSize({
  monitorHeight: true,
  noPlaceholder: true,
})((props) => (
  <StyledTable
    {...props}
    height={props.size.height}
  />
))

const getTableColumns = (maxChangeCount) => [
  generateFieldNameColumn(),
  generateChangeCountColumn(maxChangeCount),
  generateDocumentTypeColumn(),
  generateDocumentCountColumn(),
]

export const FieldEditsTable = () => {
  const [topLimit, setTopLimit] = useState(TOP_LIMIT.TEN)

  const { data, isFetching } = useGetMostActiveFieldsQuery({
    limit: topLimit,
    extras: DocumentTypeFieldExtras.NAMES,
  })

  const tableData = data?.items || []
  const [mostChangesField] = tableData.toSorted((a, b) => b.modificationCount - a.modificationCount)
  const maxChangeCount = mostChangesField?.modificationCount || 0

  const rowKey = (record) => record.fieldCode

  return (
    <Wrapper>
      <Header
        setTopLimit={setTopLimit}
        topLimit={topLimit}
      />
      <TableBody>
        <SizeAwareTable
          columns={getTableColumns(maxChangeCount)}
          data={tableData}
          fetching={isFetching}
          pagination={false}
          rowKey={rowKey}
        />
      </TableBody>
    </Wrapper>
  )
}
