
import PropTypes from 'prop-types'
import { Fragment, PureComponent } from 'react'
import { Card } from '@/components/Card'
import { WarningIcon } from '@/components/Icons/WarningIcon'
import { optionShape } from '@/components/Select'
import { DocumentFileUploadList } from '@/containers/DocumentFileUpload'
import { FileExtension } from '@/enums/FileExtension'
import { UploadStatus } from '@/enums/UploadStatus'
import { localize, Localization } from '@/localization/i18n'
import { documentToUploadShape } from '@/models/DocumentToUpload'
import { getFileExtension } from '@/utils/getFileExtension'
import {
  DocumentUploadCard,
  DocumentTitle,
  OverrideDocumentOption,
  WarningBanner,
} from './DocumentUploadItem.styles'

class DocumentUploadItem extends PureComponent {
  static propTypes = {
    document: documentToUploadShape.isRequired,
    documentUploadState: PropTypes.shape({
      status: PropTypes.string,
      files: PropTypes.shape({
        _id: PropTypes.string,
      }),
    }).isRequired,
    size: PropTypes.string.isRequired,
    deleteFile: PropTypes.func.isRequired,
    uploading: PropTypes.bool.isRequired,
    uploadStatus: PropTypes.string.isRequired,
    engines: PropTypes.arrayOf(optionShape),
    documentTypes: PropTypes.arrayOf(optionShape).isRequired,
    renderDocumentControls: PropTypes.func,
  }

  getDocumentTypeName = () => this.props.document.documentType && this.props.documentTypes.find((type) => type.value === this.props.document.documentType).text

  getDocumentEngineName = () => this.props.document.engine && this.props.engines.find((engine) => engine.value === this.props.document.engine).text

  renderDocumentTitleAndOverriddenOptions = () => (
    <Fragment>
      <DocumentTitle>{this.props.document.name}</DocumentTitle>
      {
        this.getDocumentTypeName() && (
          <OverrideDocumentOption>
            {`${localize(Localization.DOCUMENT_TYPE)}: ${this.getDocumentTypeName()}`}
          </OverrideDocumentOption>
        )
      }
      {
        this.getDocumentEngineName() && (
          <OverrideDocumentOption>
            {localize(Localization.DOCUMENT_ENGINE) + this.getDocumentEngineName()}
          </OverrideDocumentOption>
        )
      }
    </Fragment>
  )

  isMessageFile = (file) => {
    const fileExtension = getFileExtension(file.name)
    return fileExtension === FileExtension.EML || fileExtension === FileExtension.MSG
  }

  render = () => (
    <DocumentUploadCard size={this.props.size}>
      <Card
        bodyStyle={{ position: 'relative' }}
        extra={this.props.renderDocumentControls && this.props.renderDocumentControls(this.props.document)}
        size={this.props.size}
        title={this.renderDocumentTitleAndOverriddenOptions()}
      >
        {
          this.isMessageFile(this.props.document.files[0]) && this.props.uploadStatus === UploadStatus.PENDING && (
            <WarningBanner>
              <WarningIcon />
              {localize(Localization.DOCUMENT_UPLOAD_WARNING_MESSAGE)}
            </WarningBanner>
          )
        }
        <DocumentFileUploadList
          deleteFile={this.props.deleteFile}
          document={this.props.document}
          documentUploadState={this.props.documentUploadState}
          files={this.props.document.files}
          size={this.props.size}
          uploading={this.props.uploading}
        />
      </Card>
    </DocumentUploadCard>
  )
}

export {
  DocumentUploadItem,
}
