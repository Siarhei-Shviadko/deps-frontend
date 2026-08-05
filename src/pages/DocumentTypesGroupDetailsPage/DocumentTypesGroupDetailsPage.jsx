
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { fetchDocumentTypes } from '@/actions/documentTypes'
import { useFetchDocumentTypesGroupQuery } from '@/apiRTK/documentTypesGroupsApi'
import { Content } from '@/components/Layout'
import { CenteredSpin } from '@/components/Spin/CenteredSpin'
import { GroupDocumentTypesList } from '@/containers/GroupDocumentTypesList'
import { DocumentTypesGroupExtras } from '@/enums/DocumentTypesGroupExtras'
import { StatusCode } from '@/enums/StatusCode'
import { Localization, localize } from '@/localization/i18n'
import { documentTypesSelector } from '@/selectors/documentTypesListPage'
import { areTypesFetchingSelector } from '@/selectors/requests'
import { navigationMap } from '@/utils/navigationMap'
import { notifyWarning } from '@/utils/notification'
import { goTo } from '@/utils/routerActions'
import { Spin } from './DocumentTypesGroupDetailsPage.styles'
import { DocumentTypesGroupHeader } from './DocumentTypesGroupHeader'

const DocumentTypesGroupDetailsPage = () => {
  const { groupId } = useParams()

  const documentTypes = useSelector(documentTypesSelector)
  const areDocumentTypesFetching = useSelector(areTypesFetchingSelector)

  const dispatch = useDispatch()

  const {
    data: { group } = {},
    isLoading,
    isFetching,
    error,
  } = useFetchDocumentTypesGroupQuery({
    groupId,
    extras: [
      DocumentTypesGroupExtras.CLASSIFIERS,
      DocumentTypesGroupExtras.SPLITTERS,
    ],
  },
  {
    refetchOnMountOrArgChange: true,
  },
  )

  useEffect(() => {
    !documentTypes.length && dispatch(fetchDocumentTypes())
  }, [dispatch, documentTypes])

  if (isLoading || areDocumentTypesFetching) {
    return <CenteredSpin spinning />
  }

  if (error) {
    if (error.status === StatusCode.NOT_FOUND) {
      goTo(navigationMap.error.notFound())
      return null
    }

    notifyWarning(localize(Localization.DEFAULT_ERROR_MESSAGE))
    goTo(navigationMap.documentTypesGroups())
  }

  return (
    <Content>
      <DocumentTypesGroupHeader group={group} />
      <Spin spinning={isFetching}>
        <GroupDocumentTypesList group={group} />
      </Spin>
    </Content>
  )
}

export {
  DocumentTypesGroupDetailsPage,
}
