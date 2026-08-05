
import { FIELD_FORM_CODE } from '@/containers/UploadDocumentsDrawer/constants'
import { SplittingFilesUpload } from '../SplittingFilesUpload'
import { StyledFormItem, StyledForm } from './UploadFilesForm.styles'

const filesUploadField = {
  code: FIELD_FORM_CODE.FILES,
  render: SplittingFilesUpload,
  rules: {
    validate: (files) => !!files?.length,
  },
}

export const UploadFilesForm = () => (
  <StyledForm>
    <StyledFormItem
      field={filesUploadField}
    />
  </StyledForm>
)
