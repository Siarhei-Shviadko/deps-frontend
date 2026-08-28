
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProcessingEngines } from '@/actions/engines'
import { ButtonType } from '@/components/Button'
import { Dropdown } from '@/components/Dropdown'
import { AngleDownIcon } from '@/components/Icons/AngleDownIcon'
import { MenuTrigger } from '@/components/Menu'
import { useLayoutData } from '@/containers/ParsingLayout/EntityLayout/hooks'
import { DOCUMENT_LAYOUT_PARSING_TYPE } from '@/enums/DocumentLayoutType'
import { DocumentState } from '@/enums/DocumentState'
import { FileExtension } from '@/enums/FileExtension'
import { FileStatus } from '@/enums/FileStatus'
import { localize, Localization } from '@/localization/i18n'
import { Document } from '@/models/Document'
import { DocumentLayoutInfo } from '@/models/DocumentParsingInfo'
import { Engine } from '@/models/Engine'
import { processingEnginesSelector } from '@/selectors/engines'
import { areEnginesFetchingSelector } from '@/selectors/requests'
import { ENV } from '@/utils/env'
import { useLayoutEditAction } from './hooks'
import {
  SelectContainer,
  EditLink,
  DropdownTrigger,
  StyledMenu,
  StyledMenuItem,
} from './LayoutSelect.styles'
import { ParsingTypeOption } from './ParsingTypeOption'

const AVAILABLE_STATES_TO_CREATE_EDITABLE_COPY = [
  DocumentState.IN_REVIEW,
  DocumentState.COMPLETED,
]

export const LayoutSelect = ({
  rawParsingInfoData,
  selectedParsingType,
  setSelectedParsingType,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false)

  const {
    document,
    file,
    isFile,
    isParsingDataFetching,
    isParsingDataError,
  } = useLayoutData()

  const { handleEditAction } = useLayoutEditAction(rawParsingInfoData)

  const areEnginesFetching = useSelector(areEnginesFetchingSelector)
  const engines = useSelector(processingEnginesSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    !engines.length && dispatch(fetchProcessingEngines())
  }, [dispatch, engines])

  const selectOption = (value) => {
    setSelectedParsingType(value)
    setDropdownVisible(false)
  }

  const handleEditClick = async (e) => {
    e.stopPropagation()
    const done = await handleEditAction(selectedParsingType)
    done && setSelectedParsingType(DOCUMENT_LAYOUT_PARSING_TYPE.USER_DEFINED)
  }

  const isDocx = document ? Document.checkExtension(document, FileExtension.DOCX) : false

  const isAlreadyProcessed = (v) => (
    !!rawParsingInfoData?.documentLayoutInfo &&
    DocumentLayoutInfo.getParsingType(rawParsingInfoData.documentLayoutInfo).includes(v)
  )

  const availableEngines = Engine.toAllEnginesOptions(engines)

  const options = [
    ...(
      isAlreadyProcessed(DOCUMENT_LAYOUT_PARSING_TYPE.USER_DEFINED)
        ? [{
          value: DOCUMENT_LAYOUT_PARSING_TYPE.USER_DEFINED,
          text: localize(Localization.EDITABLE_VERSION),
        }]
        : []
    ),
    ...(
      isDocx
        ? [{
          value: DOCUMENT_LAYOUT_PARSING_TYPE.DOCX,
          text: localize(Localization.DOCX),
        }]
        : []
    ),
    ...availableEngines,
  ]

  const renderDropdownMenu = () => (
    <StyledMenu>
      {
        options.map((option) => (
          <StyledMenuItem
            key={option.value}
            disabled={!isAlreadyProcessed(option.value)}
            onClick={() => selectOption(option.value)}
          >
            <ParsingTypeOption
              closeDropdown={() => setDropdownVisible(false)}
              option={option}
              rawParsingInfoData={rawParsingInfoData}
              setSelectedParsingType={setSelectedParsingType}
            />
          </StyledMenuItem>
        ))
      }
    </StyledMenu>
  )

  const getSelectedOptionText = () => {
    const selectedOption = options.find((option) => option.value === selectedParsingType)
    return selectedOption ? selectedOption.text : localize(Localization.SELECT)
  }

  const documentState = document?.state
  const fileState = file?.state?.status

  const isInAvailableState = isFile
    ? fileState === FileStatus.COMPLETED
    : documentState && AVAILABLE_STATES_TO_CREATE_EDITABLE_COPY.includes(documentState)

  const isDisabledEdit = (
    (isFile ? !ENV.FEATURE_FILE_LAYOUT_EDITING : !ENV.FEATURE_DOCUMENT_LAYOUT_EDITING) ||
    areEnginesFetching ||
    isParsingDataFetching ||
    isParsingDataError ||
    !selectedParsingType ||
    selectedParsingType === DOCUMENT_LAYOUT_PARSING_TYPE.USER_DEFINED ||
    !isInAvailableState
  )

  return (
    <SelectContainer>
      <Dropdown
        dropdownRender={renderDropdownMenu}
        onOpenChange={setDropdownVisible}
        open={dropdownVisible && !areEnginesFetching}
        trigger={[MenuTrigger.CLICK]}
      >
        <DropdownTrigger $isActive={dropdownVisible}>
          <span>
            {getSelectedOptionText()}
          </span>
          <AngleDownIcon />
        </DropdownTrigger>
      </Dropdown>
      <EditLink
        disabled={isDisabledEdit}
        onClick={handleEditClick}
        type={ButtonType.LINK}
      >
        {localize(Localization.EDIT)}
      </EditLink>
    </SelectContainer>
  )
}

LayoutSelect.propTypes = {
  rawParsingInfoData: PropTypes.shape({
    documentLayoutInfo: PropTypes.shape({
      parsingFeatures: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
    }),
  }),
  selectedParsingType: PropTypes.string,
  setSelectedParsingType: PropTypes.func.isRequired,
}
