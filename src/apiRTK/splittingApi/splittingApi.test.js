
import { mockEnv } from '@/mocks/mockEnv'
import { waitFor } from '@testing-library/dom'
import { renderHook } from '@testing-library/react-hooks'
import { RequestMethod } from '@/enums/RequestMethod'
import { apiMap } from '@/utils/apiMap'
import {
  useConfirmSplittingProposalsMutation,
  useCreateSplitterMutation,
  useDeleteSplitterMutation,
  useLazyFetchSplittingProposalsQuery,
  useUpdateSplitterMutation,
  useUpdateSplittingProposalsMutation,
} from './splittingApi'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('../documentTypesGroupsApi', () => ({
  GROUP_TAG: 'Group',
  GROUPS_TAG: 'Groups',
}))

jest.mock('../filesApi', () => ({
  FILES_TAG: 'Files',
}))

jest.mock('@/apiRTK/rootApi', () => ({
  rootApi: {
    injectEndpoints: (args) => {
      const res = args.endpoints({
        query: (arg) => arg.query,
        mutation: (arg) => arg.query,
      })

      return {
        useLazyFetchSplittingProposalsQuery: jest.fn((fileId) => res.fetchSplittingProposals(fileId)),
        useUpdateSplittingProposalsMutation: jest.fn((args) => res.updateSplittingProposals(args)),
        useConfirmSplittingProposalsMutation: jest.fn((fileId) => res.confirmSplittingProposals(fileId)),
        useCreateSplitterMutation: jest.fn((args) => res.createSplitter(args)),
        useUpdateSplitterMutation: jest.fn((args) => res.updateSplitter(args)),
        useDeleteSplitterMutation: jest.fn((splitterId) => res.deleteSplitter(splitterId)),
      }
    },
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
})

test('useLazyFetchSplittingProposalsQuery calls correct endpoint with correct args', async () => {
  const fileId = 'file-id'

  const { result } = renderHook(() => useLazyFetchSplittingProposalsQuery(fileId))

  await waitFor(() => {
    expect(result.current).toEqual(
      apiMap.apiGatewayV2.v5.splitting.proposals(fileId),
    )
  })
})

test('useUpdateSplittingProposalsMutation calls correct endpoint with correct args', async () => {
  const fileId = 'file-id'
  const batchName = 'batch-name'
  const segments = [
    {
      name: 'Segment 1',
      contentRegions: [],
    },
  ]

  const { result } = renderHook(() => useUpdateSplittingProposalsMutation({
    fileId,
    segments,
    batchName,
  }))

  await waitFor(() => {
    expect(result.current).toEqual({
      url: apiMap.apiGatewayV2.v5.splitting.proposals(fileId),
      method: RequestMethod.PATCH,
      body: {
        segments,
        batchName,
      },
    })
  })
})

test('useConfirmSplittingProposalsMutation calls correct endpoint with correct args', async () => {
  const fileId = 'file-id'

  const { result } = renderHook(() => useConfirmSplittingProposalsMutation(fileId))

  await waitFor(() => {
    expect(result.current).toEqual({
      url: apiMap.apiGatewayV2.v5.splitting.proposals.confirm(fileId),
      method: RequestMethod.POST,
    })
  })
})

test('useCreateSplitterMutation calls correct endpoint with correct args', async () => {
  const splitterData = {
    groupId: 'group-id',
    documentTypeId: 'doc-type-id',
    name: 'Splitter Name',
    llmType: 'provider/model',
    splittingQuery: 'query',
  }

  const { result } = renderHook(() => useCreateSplitterMutation(splitterData))

  await waitFor(() => {
    expect(result.current).toEqual({
      url: apiMap.apiGatewayV2.v5.splitting.splitters(),
      method: RequestMethod.POST,
      body: splitterData,
    })
  })
})

test('useUpdateSplitterMutation calls correct endpoint with correct args', async () => {
  const splitterId = 'splitter-id'
  const body = {
    name: 'Updated Splitter',
    splittingQuery: 'updated query',
    llmType: 'provider/model',
  }

  const { result } = renderHook(() => useUpdateSplitterMutation({
    id: splitterId,
    ...body,
  }))

  await waitFor(() => {
    expect(result.current).toEqual({
      url: apiMap.apiGatewayV2.v5.splitting.splitter(splitterId),
      method: RequestMethod.PATCH,
      body,
    })
  })
})

test('useDeleteSplitterMutation calls correct endpoint with correct args', async () => {
  const splitterId = 'splitter-id'

  const { result } = renderHook(() => useDeleteSplitterMutation(splitterId))

  await waitFor(() => {
    expect(result.current).toEqual({
      url: apiMap.apiGatewayV2.v5.splitting.splitter(splitterId),
      method: RequestMethod.DELETE,
    })
  })
})
