
import isEmpty from 'lodash/isEmpty'
import {
  useMemo,
  useEffect,
  useCallback,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDocumentTypes } from '@/actions/documentTypes'
import { setSelection } from '@/actions/navigation'
import { useFetchDocumentTypesGroupsQuery } from '@/apiRTK/documentTypesGroupsApi'
import { Button, ButtonType } from '@/components/Button'
import { Content } from '@/components/Layout'
import { PaginationKeys } from '@/constants/navigation'
import { DOCUMENT_TYPES_GROUPS_PER_PAGE } from '@/constants/storage'
import { AddDocumentTypesGroupDrawerButton } from '@/containers/AddDocumentTypesGroupDrawerButton'
import { DeleteDocumentTypesGroupButton } from '@/containers/DeleteDocumentTypesGroupButton'
import { DocumentTypesGroups } from '@/containers/DocumentTypesGroups'
import { DocumentTypesGroupExtras } from '@/enums/DocumentTypesGroupExtras'
import { Localization, localize } from '@/localization/i18n'
import { Pagination } from '@/models/Pagination'
import { DefaultPaginationConfig } from '@/models/PaginationConfig'
import { filterSelector, selectionSelector } from '@/selectors/navigation'
import { notifyWarning } from '@/utils/notification'
import { Header, Title } from './DocumentTypesGroupsPage.styles'

const DocumentTypesGroupsPage = () => {
  const filters = useSelector(filterSelector)
  const selectedGroups = useSelector(selectionSelector)

  const dispatch = useDispatch()

  const initialPagination = Pagination.getInitialPagination(DOCUMENT_TYPES_GROUPS_PER_PAGE)

  const renderDeleteButton = (onClick) => (
    <Button
      onClick={onClick}
      type={ButtonType.PRIMARY}
    >
      {localize(Localization.DELETE)}
    </Button>
  )

  const clearSelection = useCallback(() => {
    dispatch(setSelection(null))
  }, [dispatch])

  const filterConfig = useMemo(() => ({
    ...DefaultPaginationConfig,
    ...(isEmpty(filters) ? initialPagination : filters),
  }), [filters, initialPagination])

  const {
    data = {},
    isFetching,
    isError,
  } = useFetchDocumentTypesGroupsQuery(
    {
      ...filterConfig,
      [PaginationKeys.PAGE]: filterConfig.page - 1,
      extras: [DocumentTypesGroupExtras.SPLITTERS],
    },
    {
      refetchOnMountOrArgChange: true,
    },
  )

  useEffect(() => {
    dispatch(fetchDocumentTypes())
  }, [dispatch])

  useEffect(() => {
    isError && notifyWarning(localize(Localization.DEFAULT_ERROR))
  }, [isError])

  const ActiveButton = useMemo(() => {
    if (!selectedGroups?.length) {
      return <AddDocumentTypesGroupDrawerButton />
    }

    return (
      <DeleteDocumentTypesGroupButton
        onAfterDelete={clearSelection}
        renderTrigger={renderDeleteButton}
      />
    )
  }, [
    clearSelection,
    selectedGroups?.length,
  ])

  return (
    <Content>
      <Header>
        <Title>
          {localize(Localization.DOCUMENT_TYPES_GROUPS)}
        </Title>
        {ActiveButton}
      </Header>
      <DocumentTypesGroups
        data={data}
        filterConfig={filterConfig}
        isFetching={isFetching}
      />
    </Content>
  )
}

export {
  DocumentTypesGroupsPage,
}
