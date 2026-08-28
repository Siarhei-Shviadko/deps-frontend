
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { fetchProcessingEngines } from '@/actions/engines'
import { useLayoutData } from '@/containers/ParsingLayout/EntityLayout/hooks'
import { DOCUMENT_LAYOUT_PARSING_TYPE } from '@/enums/DocumentLayoutType'
import { DocumentState } from '@/enums/DocumentState'
import { KnownParsingFeature } from '@/enums/KnownParsingFeature'
import { localize, Localization } from '@/localization/i18n'
import { documentSelector } from '@/selectors/documentReviewPage'
import { processingEnginesSelector } from '@/selectors/engines'
import { areEnginesFetchingSelector } from '@/selectors/requests'
import { render } from '@/utils/rendererRTL'
import { LayoutSelect } from './LayoutSelect'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/containers/ParsingLayout/EntityLayout/hooks', () => ({
  useLayoutData: jest.fn(() => mockUseLayoutData),
}))

jest.mock('@/apiRTK/documentLayoutApi')
jest.mock('@/selectors/engines')
jest.mock('@/selectors/documentReviewPage')
jest.mock('@/selectors/requests')
jest.mock('./hooks/useLayoutEditAction', () => ({
  useLayoutEditAction: jest.fn(() => ({
    handleEditAction: mockHandleEditAction,
  })),
}))

jest.mock('@/components/Icons/AngleDownIcon', () => ({
  AngleDownIcon: () => <div data-testid="angle-down-icon" />,
}))

jest.mock('./ParsingTypeOption', () => ({
  ParsingTypeOption: jest.fn(({ option }) => <div data-testid="parsing-type-option">{option.text}</div>),
}))

jest.mock('./LayoutSelect.styles', () => {
  const originalModule = jest.requireActual('./LayoutSelect.styles')

  return {
    ...originalModule,
    StyledMenu: ({ children }) => <div data-testid="styled-menu">{children}</div>,
    StyledMenuItem: ({ onClick, children }) => (
      <div
        data-testid="styled-menu-item"
        onClick={onClick}
      >
        {children}
      </div>
    ),
  }
})

jest.mock('@/components/Dropdown', () => ({
  Dropdown: ({ children, dropdownRender, open }) => (
    <>
      <div data-testid="dropdown-trigger">
        {children}
      </div>
      {
        open && (
          <div data-testid="dropdown-overlay">
            {dropdownRender?.()}
          </div>
        )
      }
    </>
  ),
}))

jest.mock('@/actions/engines', () => ({
  fetchProcessingEngines: jest.fn(),
}))

const mockHandleEditAction = jest.fn().mockResolvedValue(true)
const mockDispatch = jest.fn()
const MOCK_DOCUMENT_ID = 'doc123'
const MOCK_ENGINE_OPTION = {
  value: 'GCP_VISION',
  text: 'Google Cloud Vision',
}
const MOCK_ENGINES = [
  {
    code: 'GCP_VISION',
    name: 'Google Cloud Vision',
  },
  {
    code: 'TESSERACT',
    name: 'Tesseract',
  },
]
const MOCK_DOCUMENT = {
  _id: MOCK_DOCUMENT_ID,
  state: DocumentState.IN_REVIEW,
  engine: 'GCP_VISION',
  llmType: 'test',
  error: null,
  files: [
    {
      blobName: 'document.pdf',
    },
  ],
}

const setSelectedParsingType = jest.fn()

const mockUseLayoutData = {
  layoutId: MOCK_DOCUMENT_ID,
  layoutType: 'document',
  isFile: false,
  file: null,
  document: MOCK_DOCUMENT,
}

const mockRawParsingInfoData = {
  documentLayoutInfo: {
    parsingFeatures: {
      [DOCUMENT_LAYOUT_PARSING_TYPE.USER_DEFINED]: [
        KnownParsingFeature.TEXT,
        KnownParsingFeature.TABLES,
      ],
      [DOCUMENT_LAYOUT_PARSING_TYPE.DOCX]: [
        KnownParsingFeature.TEXT,
        KnownParsingFeature.TABLES,
      ],
      [MOCK_ENGINE_OPTION.value]: [
        KnownParsingFeature.TEXT,
      ],
    },
  },
}

const defaultProps = {
  selectedParsingType: DOCUMENT_LAYOUT_PARSING_TYPE.USER_DEFINED,
  setSelectedParsingType: setSelectedParsingType,
  rawParsingInfoData: mockRawParsingInfoData,
}

beforeEach(() => {
  jest.clearAllMocks()

  processingEnginesSelector.mockReturnValue(MOCK_ENGINES)
  documentSelector.mockReturnValue(MOCK_DOCUMENT)
  areEnginesFetchingSelector.mockReturnValue(false)
})

test('renders component with dropdown and edit link', () => {
  render(<LayoutSelect {...defaultProps} />)

  expect(screen.getByRole('button', { name: localize(Localization.EDIT) })).toBeInTheDocument()
  expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument()
})

test('displays correct selected option text', () => {
  const rawParsingInfoData = {
    documentLayoutInfo: {
      parsingFeatures: {
        [DOCUMENT_LAYOUT_PARSING_TYPE.USER_DEFINED]: [
          KnownParsingFeature.TEXT,
          KnownParsingFeature.TABLES,
        ],
      },
    },
  }

  render(
    <LayoutSelect
      {...defaultProps}
      rawParsingInfoData={rawParsingInfoData}
    />,
  )

  const dropdownTrigger = screen.getByTestId('dropdown-trigger')
  expect(dropdownTrigger).toHaveTextContent(localize(Localization.EDITABLE_VERSION))
})

test('enables edit button when non-USER_DEFINED parsing type is selected', () => {
  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  expect(screen.getByRole('button', { name: localize(Localization.EDIT) })).toBeEnabled()
})

test('calls handleEditAction when edit button is clicked', async () => {
  const user = userEvent.setup()

  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  const editLink = screen.getByRole('button', { name: localize(Localization.EDIT) })
  await user.click(editLink)

  expect(mockHandleEditAction).toHaveBeenCalledWith(MOCK_ENGINE_OPTION.value)
  expect(setSelectedParsingType).toHaveBeenCalledWith(DOCUMENT_LAYOUT_PARSING_TYPE.USER_DEFINED)
})

test('selects parsing type when menu item is clicked', async () => {
  jest.clearAllMocks()

  const user = userEvent.setup()

  const rawParsingInfoData = {
    documentLayoutInfo: {
      parsingFeatures: {
        [DOCUMENT_LAYOUT_PARSING_TYPE.USER_DEFINED]: [
          KnownParsingFeature.TEXT,
          KnownParsingFeature.TABLES,
        ],
        [MOCK_ENGINE_OPTION.value]: [
          KnownParsingFeature.TEXT,
        ],
      },
    },
  }

  jest.spyOn(React, 'useState').mockReturnValueOnce([true, jest.fn()])

  const handleSelectParsingType = jest.fn()

  render(
    <LayoutSelect
      {...defaultProps}
      rawParsingInfoData={rawParsingInfoData}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
      setSelectedParsingType={handleSelectParsingType}
    />,
  )

  const menuItems = screen.getAllByTestId('styled-menu-item')

  await user.click(menuItems[0])

  expect(handleSelectParsingType).toHaveBeenCalledWith(DOCUMENT_LAYOUT_PARSING_TYPE.USER_DEFINED)
})

test('disables edit button when feature flag is disabled', () => {
  const originalFeatureFlag = mockEnv.ENV.FEATURE_DOCUMENT_LAYOUT_EDITING
  mockEnv.ENV.FEATURE_DOCUMENT_LAYOUT_EDITING = false

  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  expect(screen.getByRole('button', { name: localize(Localization.EDIT) })).toBeDisabled()

  mockEnv.ENV.FEATURE_DOCUMENT_LAYOUT_EDITING = originalFeatureFlag
})

test('disables edit button when parsing info is fetching', () => {
  useLayoutData.mockReturnValueOnce({
    layoutId: MOCK_DOCUMENT_ID,
    layoutType: 'document',
    isFile: false,
    file: null,
    document: MOCK_DOCUMENT,
    isParsingDataFetching: true,
    isParsingDataError: false,
  })

  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  expect(screen.getByRole('button', { name: localize(Localization.EDIT) })).toBeDisabled()
})

test('disables edit button when parsing info has error', () => {
  useLayoutData.mockReturnValueOnce({
    layoutId: MOCK_DOCUMENT_ID,
    layoutType: 'document',
    isFile: false,
    file: null,
    document: MOCK_DOCUMENT,
    isParsingDataFetching: false,
    isParsingDataError: true,
  })

  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  expect(screen.getByRole('button', { name: localize(Localization.EDIT) })).toBeDisabled()
})

test('disables edit button when no parsing type is selected', () => {
  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={''}
    />,
  )

  expect(screen.getByRole('button', { name: localize(Localization.EDIT) })).toBeDisabled()
})

test('disables edit button when selected parsing type is USER_DEFINED', () => {
  render(<LayoutSelect {...defaultProps} />)

  expect(screen.getByRole('button', { name: localize(Localization.EDIT) })).toBeDisabled()
})

test('enables edit button when all conditions are met for non-USER_DEFINED parsing type', () => {
  const mockParsingInfoData = {
    documentLayoutInfo: {
      parsingFeatures: {
        [DOCUMENT_LAYOUT_PARSING_TYPE.USER_DEFINED]: [
          KnownParsingFeature.TEXT,
          KnownParsingFeature.TABLES,
        ],
      },
    },
  }

  render(
    <LayoutSelect
      {...defaultProps}
      rawParsingInfoData={mockParsingInfoData}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  expect(screen.getByRole('button', { name: localize(Localization.EDIT) })).toBeEnabled()
})

test('disables edit button when document state is not in AVAILABLE_STATES_TO_CREATE_EDITABLE_COPY', () => {
  const documentWithNewState = {
    ...MOCK_DOCUMENT,
    state: DocumentState.NEW,
  }

  useLayoutData.mockReturnValueOnce({
    ...mockUseLayoutData,
    document: documentWithNewState,
  })

  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  expect(screen.getByRole('button', { name: localize(Localization.EDIT) })).toBeDisabled()
})

test('disables edit button when document state is PARSING', () => {
  const documentWithParsingState = {
    ...MOCK_DOCUMENT,
    state: DocumentState.PARSING,
  }

  useLayoutData.mockReturnValueOnce({
    ...mockUseLayoutData,
    document: documentWithParsingState,
  })

  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  expect(screen.getByRole('button', { name: localize(Localization.EDIT) })).toBeDisabled()
})

test('disables edit button when document state is FAILED', () => {
  const documentWithFailedState = {
    ...MOCK_DOCUMENT,
    state: DocumentState.FAILED,
  }

  useLayoutData.mockReturnValueOnce({
    ...mockUseLayoutData,
    document: documentWithFailedState,
  })

  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  expect(screen.getByRole('button', { name: localize(Localization.EDIT) })).toBeDisabled()
})

test('enables edit button when document state is IN_REVIEW', () => {
  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  expect(screen.getByRole('button', { name: localize(Localization.EDIT) })).toBeEnabled()
})

test('enables edit button when document state is COMPLETED', () => {
  useLayoutData.mockReturnValueOnce({
    ...mockUseLayoutData,
    document: {
      ...MOCK_DOCUMENT,
      state: DocumentState.COMPLETED,
    },
  })

  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  expect(screen.getByRole('button', { name: localize(Localization.EDIT) })).toBeEnabled()
})

test('includes DOCX option when document has DOCX extension', async () => {
  jest.clearAllMocks()

  const user = userEvent.setup()

  const documentWithDocx = {
    ...MOCK_DOCUMENT,
    files: [
      {
        blobName: 'document.docx',
      },
    ],
  }

  useLayoutData.mockReturnValueOnce({
    ...mockUseLayoutData,
    document: documentWithDocx,
  })

  jest.spyOn(React, 'useState').mockReturnValueOnce([true, jest.fn()])

  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  const dropdownTrigger = screen.getByTestId('dropdown-trigger')
  await user.click(dropdownTrigger)

  expect(screen.getByText(localize(Localization.DOCX))).toBeInTheDocument()
})

test('does not include DOCX option when document does not have DOCX extension', async () => {
  const user = userEvent.setup()

  useLayoutData.mockReturnValueOnce({
    ...mockUseLayoutData,
    document: {
      ...MOCK_DOCUMENT,
      files: [
        {
          blobName: 'document.pdf',
        },
      ],
    },
  })

  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  const dropdownTrigger = screen.getByTestId('dropdown-trigger')
  await user.click(dropdownTrigger)

  expect(screen.queryByText(localize(Localization.DOCX))).not.toBeInTheDocument()
})

test('includes DOCX option when document has DOCX extension in filename with other text', async () => {
  jest.clearAllMocks()

  const user = userEvent.setup()

  const documentWithDocx = {
    ...MOCK_DOCUMENT,
    files: [
      {
        blobName: 'my-document-with-docx-extension.docx',
      },
    ],
  }

  useLayoutData.mockReturnValueOnce({
    ...mockUseLayoutData,
    document: documentWithDocx,
  })

  jest.spyOn(React, 'useState').mockReturnValueOnce([true, jest.fn()])

  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  const dropdownTrigger = screen.getByTestId('dropdown-trigger')
  await user.click(dropdownTrigger)

  expect(screen.getByText(localize(Localization.DOCX))).toBeInTheDocument()
})

test('does not include DOCX option when document has similar extension like DOC', async () => {
  const user = userEvent.setup()

  useLayoutData.mockReturnValueOnce({
    ...mockUseLayoutData,
    document: {
      ...MOCK_DOCUMENT,
      files: [
        {
          blobName: 'document.doc',
        },
      ],
    },
  })

  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  const dropdownTrigger = screen.getByTestId('dropdown-trigger')
  await user.click(dropdownTrigger)

  expect(screen.queryByText(localize(Localization.DOCX))).not.toBeInTheDocument()
})

test('displays SELECT text when no valid parsing type is selected', () => {
  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType=""
    />,
  )

  const dropdownTrigger = screen.getByTestId('dropdown-trigger')
  expect(dropdownTrigger).toHaveTextContent(localize(Localization.SELECT))
})

test('displays SELECT text when selected parsing type does not exist in options', () => {
  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType="NON_EXISTENT_PARSING_TYPE"
    />,
  )

  const dropdownTrigger = screen.getByTestId('dropdown-trigger')
  expect(dropdownTrigger).toHaveTextContent(localize(Localization.SELECT))
})

test('disables edit button when engines are fetching', () => {
  areEnginesFetchingSelector.mockReturnValueOnce(true)
  areEnginesFetchingSelector.mockReturnValueOnce(true)

  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  const editLink = screen.getByRole('button', { name: localize(Localization.EDIT) })
  expect(editLink).toBeDisabled()
})

test('disables dropdown when engines are fetching', () => {
  areEnginesFetchingSelector.mockReturnValue(true)

  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  const dropdownTrigger = screen.getByTestId('dropdown-trigger')
  expect(dropdownTrigger).toBeInTheDocument()

  const dropdownOverlay = screen.queryByTestId('dropdown-overlay')
  expect(dropdownOverlay).not.toBeInTheDocument()
})

test('fetches engines when component is rendered', () => {
  processingEnginesSelector.mockReturnValueOnce([])

  render(
    <LayoutSelect
      {...defaultProps}
      selectedParsingType={MOCK_ENGINE_OPTION.value}
    />,
  )

  expect(mockDispatch).nthCalledWith(1, fetchProcessingEngines())
})
