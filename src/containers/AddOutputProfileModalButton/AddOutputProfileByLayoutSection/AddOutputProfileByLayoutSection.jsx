
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDocumentType } from '@/actions/documentType'
import { createOutputProfile } from '@/api/outputProfilesApi'
import { ModalOptionTrigger } from '@/components/ModalOptionTrigger'
import { OutputProfileByLayoutDrawer } from '@/containers/OutputProfileByLayoutDrawer'
import { DocumentTypeExtras } from '@/enums/DocumentTypeExtras'
import {
  FILE_EXTENSION_TO_DOWNLOAD_FORMAT,
  FileExtension,
} from '@/enums/FileExtension'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { StatusCode } from '@/enums/StatusCode'
import { Localization, localize } from '@/localization/i18n'
import { DocumentLayoutSchema } from '@/models/OutputProfile'
import { documentTypeStateSelector } from '@/selectors/documentType'
import { notifySuccess, notifyWarning } from '@/utils/notification'

const AddOutputProfileByLayoutSection = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const dispatch = useDispatch()
  const documentType = useSelector(documentTypeStateSelector)

  const refetchProfiles = () => {
    dispatch(fetchDocumentType(documentType.code, [DocumentTypeExtras.PROFILES]))
  }

  const initialProfile = {
    name: '',
    schema: new DocumentLayoutSchema({
      features: [],
      parsingType: documentType.engine ?? KnownProcessingEngines.TESSERACT,
    }),
    format: FILE_EXTENSION_TO_DOWNLOAD_FORMAT[FileExtension.XLSX],
  }

  const createProfile = async ({ name, schema, format }) => {
    try {
      setIsCreating(true)
      await createOutputProfile({
        documentTypeId: documentType.code,
        name,
        schema,
        format,
      })
      notifySuccess(localize(Localization.PROFILE_CREATED))
      setIsDrawerVisible(false)
      await refetchProfiles()
    } catch (e) {
      if (e.request?.status === StatusCode.CONFLICT) {
        return notifyWarning(localize(Localization.OUTPUT_ALREADY_EXISTS))
      }
      notifyWarning(localize(Localization.DEFAULT_ERROR))
    } finally {
      setIsCreating(false)
    }
  }

  const toggleDrawer = () => setIsDrawerVisible((prev) => !prev)

  return (
    <>
      <ModalOptionTrigger
        description={localize(Localization.ADD_LAYOUT_PROFILE_TOOLTIP)}
        onClick={toggleDrawer}
        title={localize(Localization.LAYOUT_PROFILE)}
      />
      <OutputProfileByLayoutDrawer
        isLoading={isCreating}
        onSubmit={createProfile}
        profile={initialProfile}
        setVisible={setIsDrawerVisible}
        visible={isDrawerVisible}
      />
    </>
  )
}

export {
  AddOutputProfileByLayoutSection,
}
