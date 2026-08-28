
import PropTypes from 'prop-types'
import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { fetchDocumentType } from '@/actions/documentType'
import { Spin } from '@/components/Spin'
import { AddTemplateVersionButton } from '@/containers/AddTemplateVersionButton'
import { PageNavigationHeader } from '@/containers/PageNavigationHeader'
import { documentTypeStateSelector } from '@/selectors/documentType'
import { processingEnginesSelector } from '@/selectors/engines'
import { languagesSelector } from '@/selectors/languages'
import { isDocumentTypeFetchingSelector } from '@/selectors/requests'
import { navigationMap } from '@/utils/navigationMap'
import {
  AdditionalInformation,
  InfoCellText,
  RefreshTableButton,
} from './TemplateNavHeader.styles'

const getNameFromCode = (list, code) => list?.find((i) => i.code === code)?.name

const TemplateNavHeader = ({ getTemplateVersions }) => {
  const { id } = useParams()

  const isTemplateFetching = useSelector(isDocumentTypeFetchingSelector)
  const engines = useSelector(processingEnginesSelector)
  const languages = useSelector(languagesSelector)

  const currentTemplate = useSelector(documentTypeStateSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchDocumentType(id))
  }, [
    dispatch,
    id,
  ])

  const renderHeaderExtra = useCallback(() => (
    <>
      <AdditionalInformation>
        <InfoCellText
          text={
            getNameFromCode(engines, currentTemplate?.engine) ||
            currentTemplate?.engine
          }
        />
        <InfoCellText
          text={
            getNameFromCode(languages, currentTemplate?.language) ||
            currentTemplate?.language
          }
        />
      </AdditionalInformation>
      <RefreshTableButton
        refreshTable={getTemplateVersions}
      />
      <AddTemplateVersionButton />
    </>
  ), [
    engines,
    languages,
    currentTemplate?.engine,
    currentTemplate?.language,
    getTemplateVersions,
  ])

  if (isTemplateFetching) {
    return <Spin.Centered spinning />
  }

  return (
    <PageNavigationHeader
      parentPath={navigationMap.documentTypes.documentType(id)}
      renderExtra={renderHeaderExtra}
      title={currentTemplate?.name}
    />
  )
}

TemplateNavHeader.propTypes = {
  getTemplateVersions: PropTypes.func.isRequired,
}

export {
  TemplateNavHeader,
}
