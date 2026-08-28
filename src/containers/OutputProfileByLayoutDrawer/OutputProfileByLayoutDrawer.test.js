
import { mockEnv } from '@/mocks/mockEnv'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileExtension, FILE_EXTENSION_TO_DOWNLOAD_FORMAT } from '@/enums/FileExtension'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { localize, Localization } from '@/localization/i18n'
import { DocumentLayoutSchema, OutputProfile } from '@/models/OutputProfile'
import { render } from '@/utils/rendererRTL'
import { OutputProfileByLayoutDrawer } from './OutputProfileByLayoutDrawer'

jest.mock('@/utils/env', () => mockEnv)

const mockProfile = new OutputProfile({
  id: 'mockProfileId',
  name: 'Profile Name',
  format: FILE_EXTENSION_TO_DOWNLOAD_FORMAT[FileExtension.XLSX],
  creationDate: 'creationDate',
  version: 'profileVersion',
  schema: new DocumentLayoutSchema({
    features: [],
    parsingType: KnownProcessingEngines.TESSERACT,
  }),
})

jest.mock('./LayoutEngine', () => ({
  LayoutEngine: () => <div data-testid='layout-engine' />,
}))

test('show Update output drawer if edit mode is on ', () => {
  render(
    <OutputProfileByLayoutDrawer
      isEditMode={true}
      isLoading={false}
      onSubmit={jest.fn()}
      profile={mockProfile}
      setVisible={jest.fn()}
      visible={true}
    />,
  )

  expect(screen.getByText(localize(Localization.UPDATE_PROFILE))).toBeInTheDocument()
  expect(screen.getByRole('button', { name: localize(Localization.SUBMIT) })).toBeInTheDocument()
})

test('show Add profile by layout drawer if edit mode is off ', () => {
  render(
    <OutputProfileByLayoutDrawer
      isEditMode={false}
      isLoading={false}
      onSubmit={jest.fn()}
      profile={mockProfile}
      setVisible={jest.fn()}
      visible={true}
    />,
  )

  expect(screen.getByText(localize(Localization.LAYOUT_PROFILE))).toBeInTheDocument()
  expect(screen.getByRole('button', { name: localize(Localization.CREATE) })).toBeInTheDocument()
})

test('show profile Name section', () => {
  render(
    <OutputProfileByLayoutDrawer
      isEditMode={false}
      isLoading={false}
      onSubmit={jest.fn()}
      profile={mockProfile}
      setVisible={jest.fn()}
      visible={true}
    />,
  )

  expect(screen.getByText(/name/i)).toBeInTheDocument()
})

test('show profile Layouts section', () => {
  render(
    <OutputProfileByLayoutDrawer
      isEditMode={false}
      isLoading={false}
      onSubmit={jest.fn()}
      profile={mockProfile}
      setVisible={jest.fn()}
      visible={true}
    />,
  )

  expect(screen.getByText(/layouts/i)).toBeInTheDocument()
})

test('show profile Engine section', () => {
  render(
    <OutputProfileByLayoutDrawer
      isEditMode={false}
      isLoading={false}
      onSubmit={jest.fn()}
      profile={mockProfile}
      setVisible={jest.fn()}
      visible={true}
    />,
  )

  expect(screen.getByTestId('layout-engine')).toBeInTheDocument()
})

test('show profile Output Format section', () => {
  render(
    <OutputProfileByLayoutDrawer
      isEditMode={false}
      isLoading={false}
      onSubmit={jest.fn()}
      profile={mockProfile}
      setVisible={jest.fn()}
      visible={true}
    />,
  )

  expect(screen.getByText(/output format/i)).toBeInTheDocument()
})

test('call setVisible prop if Cancel button is clicked ', async () => {
  const mockSetVisible = jest.fn()

  render(
    <OutputProfileByLayoutDrawer
      isEditMode={false}
      isLoading={false}
      onSubmit={jest.fn()}
      profile={mockProfile}
      setVisible={mockSetVisible}
      visible={true}
    />,
  )
  const input = screen.getByRole('textbox')
  fireEvent.change(input, { target: { value: 'New Profile Name' } })

  await userEvent.click(screen.getByRole('button', { name: localize(Localization.CANCEL) }))

  expect(mockSetVisible).toHaveBeenCalledTimes(1)
})

test('call onSubmit prop with correct parameters if Submit button is clicked ', async () => {
  const mockOnSubmit = jest.fn()

  render(
    <OutputProfileByLayoutDrawer
      isEditMode={true}
      isLoading={false}
      onSubmit={mockOnSubmit}
      profile={mockProfile}
      setVisible={jest.fn()}
      visible={true}
    />,
  )

  await userEvent.click(screen.getByRole('button', { name: localize(Localization.SUBMIT) }))

  expect(mockOnSubmit).nthCalledWith(
    1,
    {
      name: mockProfile.name,
      schema: mockProfile.schema,
      format: mockProfile.format,
    },
  )
})

test('render disabled loading Submit button if isLoading prop is true ', () => {
  render(
    <OutputProfileByLayoutDrawer
      isEditMode={true}
      isLoading={true}
      onSubmit={jest.fn()}
      profile={mockProfile}
      setVisible={jest.fn()}
      visible={true}
    />,
  )
  const submit = screen.getByRole('button', {
    name: new RegExp(localize(Localization.SUBMIT), 'i'),
  })

  expect(submit).toHaveClass('ant-btn-loading')
  expect(submit).toBeDisabled()
})

test('render disabled Submit button if profile name is not valid ', () => {
  render(
    <OutputProfileByLayoutDrawer
      isEditMode={true}
      isLoading={false}
      onSubmit={jest.fn()}
      profile={mockProfile}
      setVisible={jest.fn()}
      visible={true}
    />,
  )

  const input = screen.getByRole('textbox')
  fireEvent.change(input, { target: { value: '' } })

  const submit = screen.getByRole('button', { name: localize(Localization.SUBMIT) })

  expect(submit).toBeDisabled()
})
