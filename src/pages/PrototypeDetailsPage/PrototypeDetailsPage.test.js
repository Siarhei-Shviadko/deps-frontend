
import { mockReact } from '@/mocks/mockReact'
import { mockComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import flushPromises from 'flush-promises'
import { setActiveLayoutId } from '@/actions/prototypePage'
import { useFetchPrototypeQuery } from '@/apiRTK/prototypesApi'
import { Spin } from '@/components/Spin'
import { FieldType } from '@/enums/FieldType'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { MappingType } from '@/enums/MappingType'
import { PrototypeViewType } from '@/enums/PrototypeViewType'
import { StatusCode } from '@/enums/StatusCode'
import { Localization, localize } from '@/localization/i18n'
import { Prototype } from '@/models/Prototype'
import {
  PrototypeField,
  PrototypeFieldType,
  PrototypeFieldMapping,
} from '@/models/PrototypeField'
import { navigationMap } from '@/utils/navigationMap'
import { notifyWarning } from '@/utils/notification'
import { goTo } from '@/utils/routerActions'
import { PrototypeDetailsPage } from './PrototypeDetailsPage'
import { PrototypeHeader } from './PrototypeHeader'
import { PrototypeInfo } from './PrototypeInfo'
import { usePrototypeEditMode } from './usePrototypeEditMode'

const mockPrototypeId = 'prototypeId'
const mockPrototypeData = new Prototype({
  id: mockPrototypeId,
  createdAt: '12-12-2000',
  name: 'Prototype Name',
  language: KnownLanguage.ENGLISH,
  engine: KnownProcessingEngines.TESSERACT,
  description: '',
  fields: [
    new PrototypeField({
      id: 'fieldId',
      prototypeId: mockPrototypeId,
      name: 'Test Field',
      fieldType: new PrototypeFieldType({
        typeCode: FieldType.STRING,
        description: {},
      }),
      mapping: new PrototypeFieldMapping({
        keys: [
          'mappingKey1',
          'mappingKey2',
        ],
        mappingDataType: FieldType.STRING,
        mappingType: MappingType.ONE_TO_ONE,
      }),
      required: true,
    }),
  ],
})
const mockRefetch = jest.fn()

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-redux', () => mockReactRedux)
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('@/containers/PrototypeData', () => mockComponent('PrototypeData'))

let mockOnUnmount

jest.mock('react', () => mockReact({
  mockUseEffect: jest.fn((f) => {
    mockOnUnmount = f()
  }),
}))

jest.mock('@/apiRTK/prototypesApi', () => ({
  useFetchPrototypeQuery: jest.fn(() => ({
    data: mockPrototypeData,
    isFetching: false,
    error: null,
    refetch: mockRefetch,
  })),
}))

jest.mock('react-router', () => ({
  useParams: jest.fn(() => ({
    id: mockPrototypeId,
  })),
}))

jest.mock('@/utils/routerActions', () => ({
  goTo: jest.fn(),
}))

jest.mock('@/actions/prototypePage', () => ({
  setActiveLayoutId: jest.fn(),
}))

const mockEditModeHookData = {
  editModePrototype: mockPrototypeData,
  isSaving: false,
  isEditMode: false,
  isPrototypeTouched: false,
  onSave: jest.fn(),
  onCancel: jest.fn(),
  toggleEditMode: jest.fn(),
  onPrototypeFieldChange: jest.fn(),
  onPrototypeInfoDataChange: jest.fn(),
  addPrototypeField: jest.fn(),
  removePrototypeField: jest.fn(),
  fieldsViewType: PrototypeViewType.FIELDS,
  setFieldsViewType: jest.fn(),
}

jest.mock('./usePrototypeEditMode', () => ({
  usePrototypeEditMode: jest.fn(() => mockEditModeHookData),
}))

describe('Page: PrototypeDetailsPage', () => {
  let wrapper

  beforeEach(() => {
    jest.clearAllMocks()

    wrapper = shallow(<PrototypeDetailsPage />)
  })

  it('should render the correct layout', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should render Spin if isFetching is true', () => {
    useFetchPrototypeQuery.mockImplementationOnce(() => ({
      isFetching: true,
    }))

    wrapper = shallow(<PrototypeDetailsPage />)

    expect(wrapper.find(Spin.Centered).exists()).toBe(true)
  })

  it('should render Spin if isSaving is true', () => {
    usePrototypeEditMode.mockImplementationOnce(() => ({
      ...mockEditModeHookData,
      isSaving: true,
    }))

    wrapper = shallow(<PrototypeDetailsPage />)

    expect(wrapper.find(Spin.Centered).exists()).toBe(true)
  })

  it('should call useFetchPrototypeQuery with prototype id when render component', () => {
    expect(useFetchPrototypeQuery).nthCalledWith(
      1,
      mockPrototypeId,
      { refetchOnMountOrArgChange: true },
    )
  })

  it('should call notifyWarning if useFetchPrototypeQuery request will be rejected with error', async () => {
    const mockError = new Error('test')
    useFetchPrototypeQuery.mockImplementationOnce(() => ({
      error: mockError,
    }))

    wrapper = shallow(<PrototypeDetailsPage />)

    await flushPromises()

    expect(notifyWarning).nthCalledWith(1, localize(Localization.DEFAULT_ERROR))
  })

  it('should render NoData component if useFetchPrototypeQuery request is rejected with error', async () => {
    const mockError = new Error('test')
    useFetchPrototypeQuery.mockImplementationOnce(() => ({
      error: mockError,
    }))

    wrapper = shallow(<PrototypeDetailsPage />)

    await flushPromises()

    expect(wrapper).toMatchSnapshot()
  })

  it('should call goTo with correct args if useFetchPrototypeQuery request is finished with 404 error', async () => {
    const error = new Error('test')
    error.status = StatusCode.NOT_FOUND

    useFetchPrototypeQuery.mockImplementationOnce(() => ({
      error,
    }))

    wrapper = shallow(<PrototypeDetailsPage />)

    expect(await goTo).nthCalledWith(1, navigationMap.error.notFound())
  })

  it('should call onSave when prototype save event was fired', async () => {
    wrapper.find(PrototypeHeader).props().onSave()

    expect(mockEditModeHookData.onSave).toHaveBeenCalled()
  })

  it('should call refetch when prototype save event was fired', async () => {
    wrapper.find(PrototypeHeader).props().onSave()

    await flushPromises()

    expect(mockRefetch).toHaveBeenCalled()
  })

  it('should call onCancel when prototype cancel event was fired', async () => {
    wrapper.find(PrototypeHeader).props().onCancel()

    expect(mockEditModeHookData.onCancel).toHaveBeenCalled()
  })

  it('should pass correct prototype prop to PrototypeInfo', () => {
    expect(wrapper.find(PrototypeInfo).props().prototype).toEqual(mockPrototypeData)
  })

  it('should reset activeLayoutId on unmount', () => {
    mockOnUnmount()
    expect(setActiveLayoutId).nthCalledWith(1, null)
  })
})
