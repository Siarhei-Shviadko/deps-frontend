
import { mockEnv } from '@/mocks/mockEnv'
import { screen } from '@testing-library/dom'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setSelection } from '@/actions/navigation'
import { DocumentTypesGroup, GenAiClassifier } from '@/models/DocumentTypesGroup'
import { Splitter } from '@/models/Splitter'
import { selectionSelector } from '@/selectors/navigation'
import { render } from '@/utils/rendererRTL'
import { DocumentTypesGroupHeader } from './DocumentTypesGroupHeader'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('@/selectors/navigation')

jest.mock('@/actions/navigation', () => ({
  setSelection: jest.fn(() => mockAction),
}))

const mockAction = { type: 'action' }

jest.mock('@/containers/AddDocumentTypeToGroupButton', () => ({
  AddDocumentTypesToGroupButton: () => <div data-testid='add-doc-type-button' />,
}))

jest.mock('@/containers/EditDocumentTypesGroupDrawerButton', () => ({
  EditDocumentTypesGroupDrawerButton: () => <div data-testid='edit-button' />,
}))

jest.mock('../SetClassifiersDrawerButton', () => ({
  SetClassifiersDrawerButton: () => <div data-testid='set-classifiers' />,
}))

jest.mock('../SetSplittersDrawerButton', () => ({
  SetSplittersDrawerButton: () => <div data-testid='set-splitters' />,
}))

jest.mock('@/containers/DeleteDocumentTypesFromGroupButton', () => ({
  DeleteDocumentTypesFromGroupButton: (props) => (
    <button
      data-testid='delete-button'
      onClick={props.onAfterDelete}
    />
  ),
}))

const mockDocTypesGroup = new DocumentTypesGroup({
  id: 'id1',
  name: 'Group1',
  documentTypeIds: ['testType1', 'testType2'],
  createdAt: '2012-12-12',
  genAiClassifiers: [],
})

test('renders document type header', async () => {
  render(<DocumentTypesGroupHeader group={mockDocTypesGroup} />)

  const header = screen.getByRole('heading', {
    level: 2,
    name: mockDocTypesGroup.name,
  })

  expect(header).toBeInTheDocument()
})

test('renders document type group control buttons', () => {
  render(<DocumentTypesGroupHeader group={mockDocTypesGroup} />)

  expect(screen.getByTestId('add-doc-type-button')).toBeInTheDocument()
  expect(screen.getByTestId('edit-button')).toBeInTheDocument()
})

test('renders Set Classifiers button if some document type in the group does not have classifier', () => {
  const mockDocTypesGroup = new DocumentTypesGroup({
    id: 'id1',
    name: 'Group1',
    documentTypeIds: ['testType1', 'testType2'],
    createdAt: '2012-12-12',
    genAiClassifiers: [
      new GenAiClassifier({
        genAiClassifierId: 'genAiClassifierId1',
        documentTypeId: 'testType1',
        name: 'Classifier Name',
        llmType: 'Test llm',
        prompt: 'Test prompt',
      }),
    ],
  })

  render(<DocumentTypesGroupHeader group={mockDocTypesGroup} />)

  expect(screen.getByTestId('set-classifiers')).toBeInTheDocument()
})

test('renders Set Splitters button if some document type in the group does not have splitter', () => {
  const groupWithPartialSplitters = new DocumentTypesGroup({
    id: 'id1',
    name: 'Group1',
    documentTypeIds: ['testType1', 'testType2'],
    createdAt: '2012-12-12',
    genAiClassifiers: [],
    splitters: [
      new Splitter({
        id: 'splitter-id',
        groupId: 'id1',
        documentTypeId: 'testType1',
        name: 'Splitter Name',
        splittingQuery: 'Test query',
        llmType: 'provider1/model-1-1',
      }),
    ],
  })

  render(<DocumentTypesGroupHeader group={groupWithPartialSplitters} />)

  expect(screen.getByTestId('set-splitters')).toBeInTheDocument()
})

test('does not render Set Splitters button if all document types in the group have splitter', () => {
  const groupWithAllSplitters = new DocumentTypesGroup({
    id: 'id1',
    name: 'Group1',
    documentTypeIds: ['testType1'],
    createdAt: '2012-12-12',
    genAiClassifiers: [],
    splitters: [
      new Splitter({
        id: 'splitter-id',
        groupId: 'id1',
        documentTypeId: 'testType1',
        name: 'Splitter Name',
        splittingQuery: 'Test query',
        llmType: 'provider1/model-1-1',
      }),
    ],
  })

  render(<DocumentTypesGroupHeader group={groupWithAllSplitters} />)

  expect(screen.queryByTestId('set-splitters')).not.toBeInTheDocument()
})

test('does not renders Set Classifiers button if all document types in the group have classifier', () => {
  const mockDocTypesGroup = new DocumentTypesGroup({
    id: 'id1',
    name: 'Group1',
    documentTypeIds: ['testType1'],
    createdAt: '2012-12-12',
    genAiClassifiers: [
      new GenAiClassifier({
        genAiClassifierId: 'genAiClassifierId1',
        documentTypeId: 'testType1',
        name: 'Classifier Name',
        llmType: 'Test llm',
        prompt: 'Test prompt',
      }),
    ],
  })

  render(<DocumentTypesGroupHeader group={mockDocTypesGroup} />)

  expect(screen.queryByTestId('set-classifiers')).not.toBeInTheDocument()
})

test('renders Delete button if some document types are selected', () => {
  render(<DocumentTypesGroupHeader group={mockDocTypesGroup} />)

  const deleteButton = screen.getByTestId('delete-button')

  const selectedIds = selectionSelector.getSelectorMockValue()

  expect(selectedIds.length).toBeGreaterThan(0)
  expect(deleteButton).toBeInTheDocument()
})

test('clear selection on delete button click', async () => {
  render(<DocumentTypesGroupHeader group={mockDocTypesGroup} />)

  const deleteButton = screen.getByTestId('delete-button')

  await userEvent.click(deleteButton)

  await waitFor(() => {
    expect(setSelection).toHaveBeenCalled()
  })
})
