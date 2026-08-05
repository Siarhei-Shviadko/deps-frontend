
import { mockComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/react'
import { Splitter } from '@/models/Splitter'
import { render } from '@/utils/rendererRTL'
import { DocumentTypeSplitterCell } from './DocumentTypeSplitterCell'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('../AddSplitterDrawerButton', () => mockComponent('AddSplitterDrawerButton'))
jest.mock('../EditSplitterDrawerButton', () => mockComponent('EditSplitterDrawerButton'))

const mockDocumentTypeId = 'mockDocumentTypeId'
const mockSplitter = new Splitter({
  id: 'splitter-id',
  groupId: 'group-id',
  documentTypeId: mockDocumentTypeId,
  name: 'Splitter Name',
  llmType: 'Test Splitter Llm',
  splittingQuery: 'Test Splitter Query',
})

test('shows splitter name and edit button if splitter exists', () => {
  render(
    <DocumentTypeSplitterCell
      documentTypeId={mockDocumentTypeId}
      splitter={mockSplitter}
    />,
  )

  const editSplitterButton = screen.getByText('EditSplitterDrawerButton')
  const splitterName = screen.getByText(mockSplitter.name)

  expect(editSplitterButton).toBeInTheDocument()
  expect(splitterName).toBeInTheDocument()
})

test('shows button to add splitter if splitter does not exist', () => {
  render(
    <DocumentTypeSplitterCell
      documentTypeId={mockDocumentTypeId}
    />,
  )

  const button = screen.getByText('AddSplitterDrawerButton')

  expect(button).toBeInTheDocument()
})
