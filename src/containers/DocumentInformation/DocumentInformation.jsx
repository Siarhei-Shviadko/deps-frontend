
import PropTypes from 'prop-types'
import { PureComponent } from 'react'
import { connect } from 'react-redux'
import { getDocumentError } from '@/actions/documentReviewPage'
import { fetchAvailableLanguages } from '@/actions/languages'
import { goTo } from '@/actions/navigation'
import { Button } from '@/components/Button'
import { CaretDownIcon } from '@/components/Icons/CaretDownIcon'
import { CaretUpIcon } from '@/components/Icons/CaretUpIcon'
import { List } from '@/components/List'
import { Spin } from '@/components/Spin'
import { DocumentLLMType } from '@/containers/DocumentLLMType'
import { LabelTags } from '@/containers/LabelTags'
import { DocumentState, RESOURCE_DOCUMENT_STATE } from '@/enums/DocumentState'
import { ExtractionType, RESOURCE_EXTRACTION_TYPE } from '@/enums/ExtractionType'
import { localize, Localization } from '@/localization/i18n'
import { documentShape } from '@/models/Document'
import { documentTypeShape, UNKNOWN_DOCUMENT_TYPE } from '@/models/DocumentType'
import { Engine, engineShape } from '@/models/Engine'
import { languageShape } from '@/models/Language'
import { documentSelector, documentTypeSelector } from '@/selectors/documentReviewPage'
import { processingEnginesSelector } from '@/selectors/engines'
import { languagesSelector } from '@/selectors/languages'
import {
  isDocumentErrorGettingSelector,
  areLanguagesFetchingSelector,
} from '@/selectors/requests'
import { toLocalizedDateString } from '@/utils/dayjs'
import { ENV } from '@/utils/env'
import { navigationMap } from '@/utils/navigationMap'
import {
  ManageLabelsModalButton,
  Label,
  Info,
  ListInfo,
  ErrorLabel,
  ErrorInfo,
  ClickableListItem,
  ClickableErrorLabel,
  ErrorListItem,
  ErrorItem,
  HiddenListItem,
} from './DocumentInformation.styles'

class DocumentInformation extends PureComponent {
  static propTypes = {
    document: documentShape.isRequired,
    documentType: documentTypeShape.isRequired,
    engines: PropTypes.arrayOf(engineShape).isRequired,
    languages: PropTypes.arrayOf(languageShape).isRequired,
    languagesFetching: PropTypes.bool.isRequired,
    fetchAvailableLanguages: PropTypes.func.isRequired,
    getDocumentError: PropTypes.func.isRequired,
    goTo: PropTypes.func.isRequired,
    fetching: PropTypes.bool.isRequired,
  }

  state = {
    showError: false,
  }

  componentDidMount () {
    this.props.fetchAvailableLanguages()
    this.props.document.state === DocumentState.FAILED && this.props.getDocumentError()
  }

  showErrorDetails = () => {
    this.setState((state) => ({
      showError: !state.showError,
    }))
  }

  getNameFromCode = (list, item) => list.find((e) => e.code === item)?.name

  renderDocumentTypeName = (documentType) => {
    if (documentType.code === UNKNOWN_DOCUMENT_TYPE.code) {
      return documentType.name
    }

    const source = navigationMap.documentTypes.documentType(documentType.code)

    return (
      <Button.Link
        onClick={() => this.props.goTo(source)}
      >
        {documentType.name}
      </Button.Link>
    )
  }

  renderExtractionType = (documentType) => {
    if (documentType.code === UNKNOWN_DOCUMENT_TYPE.code) {
      return null
    }

    const extractionType = documentType.extractionType ?? ExtractionType.AI_PROMPTED
    return RESOURCE_EXTRACTION_TYPE[extractionType]
  }

  renderValidationContent = (validation) => {
    if (!validation) {
      return localize(Localization.NOT_APPLIED_TEXT)
    }
    return validation?.isValid
      ? localize(Localization.PASSED_TEXT)
      : localize(Localization.FAILED_TEXT)
  }

  renderErrorDescription = (fetching, state, error, showError) => {
    if (fetching) {
      return (
        <span>
          <Spin spinning />
        </span>
      )
    }
    if (state === DocumentState.FAILED) {
      return [
        <ErrorListItem key={'error'}>
          <Label>{localize(Localization.ERROR_TEXT)}</Label>
        </ErrorListItem>,
        <ErrorItem key={'errorState'}>
          <ErrorLabel>{localize(Localization.INSTATE_TEXT)}</ErrorLabel>
          <Info>{RESOURCE_DOCUMENT_STATE[error.inState]}</Info>
        </ErrorItem>,
        <ErrorItem key={'errorDescription'}>
          <ErrorLabel>{localize(Localization.DESCRIPTION_TEXT)}</ErrorLabel>
          <Info>{error.prettyMessage || ''}</Info>
        </ErrorItem>,
        <ClickableListItem
          key={'errorDetails'}
          onClick={this.showErrorDetails}
        >
          <ClickableErrorLabel>{localize(Localization.DETAILS_TEXT)}</ClickableErrorLabel>
          <Info>{showError ? <CaretUpIcon /> : <CaretDownIcon />}</Info>
        </ClickableListItem>,
        <HiddenListItem key={'errorDetailsText'}>
          <ErrorInfo data-visidility={showError}>{error.description}</ErrorInfo>
        </HiddenListItem>,
      ]
    }
  }

  render () {
    const { document, documentType, languages, fetching } = this.props
    const {
      _id: id,
      validation,
      title,
      date,
      state,
      reviewer,
      engine,
      language,
      llmType,
      error,
      labels = [],
    } = document

    const { showError } = this.state
    const engines = Engine.getAvailableEngines(this.props.engines)

    return (
      <ListInfo>
        <List.Item>
          <Label>{localize(Localization.ID_TEXT)}</Label>
          <Info>{id || ''}</Info>
        </List.Item>
        <List.Item>
          <Label>{localize(Localization.TITLE_TEXT)}</Label>
          <Info>{title || ''}</Info>
        </List.Item>
        <List.Item>
          <Label>{localize(Localization.DATE_TEXT)}</Label>
          <Info>{toLocalizedDateString(date, true)}</Info>
        </List.Item>
        <List.Item>
          <Label>{localize(Localization.DOCUMENT_LANGUAGE)}</Label>
          <Spin spinning={this.props.languagesFetching}>
            <Info>{this.getNameFromCode(languages, language)}</Info>
          </Spin>
        </List.Item>
        <List.Item>
          <Label>{localize(Localization.STATE_TEXT)}</Label>
          <Info>{RESOURCE_DOCUMENT_STATE[state] || ''}</Info>
        </List.Item>
        <List.Item>
          <Label>{localize(Localization.ENGINE_TEXT)}</Label>
          <Info>{this.getNameFromCode(engines, engine)}</Info>
        </List.Item>
        <List.Item>
          <Label>{localize(Localization.VALIDATION_TEXT)}</Label>
          <Info>{this.renderValidationContent(validation)}</Info>
        </List.Item>
        <List.Item>
          <Label>{localize(Localization.TYPE_NAME_TEXT)}</Label>
          <Info>{documentType && this.renderDocumentTypeName(documentType)}</Info>
        </List.Item>
        <List.Item>
          <Label>{localize(Localization.TYPE)}</Label>
          <Info>{documentType && this.renderExtractionType(documentType)}</Info>
        </List.Item>
        <List.Item>
          <Label>{localize(Localization.REVIEWER_TEXT)}</Label>
          <Info>{reviewer?.email || ''}</Info>
        </List.Item>
        {
          ENV.FEATURE_LLM_DATA_EXTRACTION && (
            <List.Item>
              <Label>{`${localize(Localization.LLM_TYPE)}:`}</Label>
              {
                llmType && (
                  <Info>
                    <DocumentLLMType llmType={llmType} />
                  </Info>
                )
              }
            </List.Item>
          )
        }
        <List.Item>
          <Label>{localize(Localization.LABELS_TEXT)}</Label>
          <Info>
            <LabelTags
              id={id}
              labels={labels}
            />
            <ManageLabelsModalButton
              documentIds={[id]}
              title={localize(Localization.ADD_LABEL_TITLE)}
            />
          </Info>
        </List.Item>
        {
          this.renderErrorDescription(fetching, state, error, showError)
        }
      </ListInfo>
    )
  }
}

const mapStateToProps = (state) => ({
  fetching: isDocumentErrorGettingSelector(state),
  document: documentSelector(state),
  documentType: documentTypeSelector(state),
  languages: languagesSelector(state),
  languagesFetching: areLanguagesFetchingSelector(state),
  engines: processingEnginesSelector(state),
})

const mapDispatchToProps = {
  fetchAvailableLanguages,
  getDocumentError,
  goTo,
}

const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(DocumentInformation)

export {
  ConnectedComponent as DocumentInformation,
}
