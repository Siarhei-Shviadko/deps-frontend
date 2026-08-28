
import { mockEnv } from '@/mocks/mockEnv'
import { waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { goTo } from '@/actions/navigation'
import { documentsApi } from '@/api/documentsApi'
import { PROJECT_CREATION_DATE } from '@/constants/common'
import { DocumentFilterKeys, PaginationKeys } from '@/constants/navigation'
import { DOCUMENT_STATISTIC_STATE_TO_DOCUMENT_STATE } from '@/enums/DocumentStatisticState'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { Localization, localize } from '@/localization/i18n'
import { Template } from '@/models/Template'
import { navigationMap } from '@/utils/navigationMap'
import { notifyWarning } from '@/utils/notification'
import { render } from '@/utils/rendererRTL'
import { DocumentStatesByTypeDrawer } from './DocumentStatesByTypeDrawer'

const mockTotalDocsQuantity = 5

const mockDocsByDocTypeResponse = {
  meta: {
    total: mockTotalDocsQuantity,
  },
  result: [],
}

const mockDocsByDocTypeAndStateResponse = {
  meta: {
    total: 2,
  },
  result: [],
}

jest.mock('@/utils/env', () => mockEnv)

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/actions/navigation', () => ({
  goTo: jest.fn(),
}))

jest.mock('@/api/documentsApi', () => ({
  documentsApi: {
    getDocuments: jest.fn((param) => (
      Promise.resolve(
        param.states
          ? mockDocsByDocTypeAndStateResponse
          : mockDocsByDocTypeResponse,
      )
    )),
  },
}))

jest.mock('@/utils/notification', () => ({
  notifyWarning: jest.fn(),
}))

const mockDispatch = jest.fn()

const defaultProps = {
  activeDocumentType: new Template({
    id: 'mockId',
    name: 'mockName',
    language: KnownLanguage.ENGLISH,
    engine: KnownProcessingEngines.TESSERACT,
    groupId: 'testId1',
    createdAt: PROJECT_CREATION_DATE,
    description: 'mocked description',
  }),
  closeDrawer: jest.fn(),
}

test('drawer is opened if visible prop is set to true', async () => {
  render(<DocumentStatesByTypeDrawer {...defaultProps} />)
  const drawer = await screen.findByTestId('drawer')

  expect(drawer).toBeInTheDocument()
})

test('drawer title contains document type name as a content', async () => {
  render(<DocumentStatesByTypeDrawer {...defaultProps} />)
  const title = await screen.findByText(defaultProps.activeDocumentType.name)

  expect(title).toMatchSnapshot()
})

test('spinner is shown when api request is in progress', async () => {
  render(<DocumentStatesByTypeDrawer {...defaultProps} />)

  await waitFor(() => {
    expect(screen.getAllByTestId('spin')[1]).toHaveClass('ant-spin-spinning')
  })
})

test('no cards are shown when api request is in progress', async () => {
  render(<DocumentStatesByTypeDrawer {...defaultProps} />)

  await waitFor(() => {
    expect(screen.queryAllByRole('heading', { level: 5 })).toHaveLength(0)
  })
})

test('all cards with statistic are displayed', async () => {
  render(<DocumentStatesByTypeDrawer {...defaultProps} />)

  const cards = await screen.findAllByRole('heading', { level: 5 })
  const failedStateCard = await screen.findByRole('heading', {
    level: 5,
    name: localize(Localization.FAILED_TEXT),
  })
  const completedStateCard = await screen.findByRole('heading', {
    level: 5,
    name: localize(Localization.COMPLETED),
  })
  const inReviewStateCard = await screen.findByRole('heading', {
    level: 5,
    name: localize(Localization.IN_REVIEW),
  })
  const inProcessingStateCard = await screen.findByRole('heading', {
    level: 5,
    name: localize(Localization.IN_PROCESSING),
  })
  const needsReviewStateCard = await screen.findByRole('heading', {
    level: 5,
    name: localize(Localization.NEEDS_REVIEW),
  })

  expect(failedStateCard).toBeInTheDocument()
  expect(completedStateCard).toBeInTheDocument()
  expect(inReviewStateCard).toBeInTheDocument()
  expect(inProcessingStateCard).toBeInTheDocument()
  expect(needsReviewStateCard).toBeInTheDocument()
  expect(cards).toHaveLength(5)
})

test('total value in the cards is equal to the fetched number of docs', async () => {
  render(<DocumentStatesByTypeDrawer {...defaultProps} />)
  const regexp = new RegExp(mockTotalDocsQuantity, 'i')
  const totalValue = await screen.findAllByText(regexp)

  expect(totalValue).toHaveLength(5)
})

test('warning notification is displayed if api request failed', async () => {
  documentsApi.getDocuments.mockImplementationOnce(() => Promise.reject(new Error('')))
  render(<DocumentStatesByTypeDrawer {...defaultProps} />)

  await waitFor(() => {
    expect(notifyWarning).nthCalledWith(1, localize(Localization.DEFAULT_ERROR))
  })
})

test('user is redirected to the appropriate documents page on card button click', async () => {
  render(<DocumentStatesByTypeDrawer {...defaultProps} />)
  const buttons = await screen.findAllByRole('button')

  for (const btn of buttons) {
    const index = buttons.indexOf(btn)

    jest.clearAllMocks()
    await userEvent.click(btn)

    expect(mockDispatch).toHaveBeenNthCalledWith(1, goTo(
      navigationMap.documents(),
      {
        filters: {
          [DocumentFilterKeys.TYPES]: [defaultProps.activeDocumentType.id],
          [DocumentFilterKeys.STATES]: Object.values(DOCUMENT_STATISTIC_STATE_TO_DOCUMENT_STATE)[index],
          [PaginationKeys.PAGE]: 1,
        },
      },
    ))
  }
})
