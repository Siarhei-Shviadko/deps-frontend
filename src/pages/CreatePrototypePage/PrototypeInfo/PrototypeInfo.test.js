
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import { FormItem } from '@/components/Form/ReactHookForm'
import { KnownOCREngine } from '@/enums/KnownOCREngine'
import { PrototypeViewType } from '@/enums/PrototypeViewType'
import { ENV } from '@/utils/env'
import { PrototypeInfo } from './PrototypeInfo'

const mockSetValue = jest.fn()
const mockValue = 'test'
const mockEvent = {
  target: {
    value: mockValue,
  },
}

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-redux', () => mockReactRedux)
jest.mock('@/selectors/languages')
jest.mock('@/selectors/engines')

jest.mock('react-hook-form', () => ({
  ...mockReactHookForm,
  useFormContext: jest.fn(() => ({
    setValue: mockSetValue,
  })),
}))

describe('Component: PrototypeInfo', () => {
  let wrapper

  beforeEach(() => {
    jest.clearAllMocks()

    wrapper = shallow(
      <PrototypeInfo
        fieldsViewType={PrototypeViewType.FIELDS}
        setFieldsViewType={jest.fn()}
      />,
    )
  })

  it('should render correctly', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should call setValue if onChange event is triggered on field with code "name"', () => {
    const mockCode = 'name'

    const FormComponent = wrapper.find(FormItem).at(0)
    FormComponent.props().field.handler.onChange(mockEvent)

    expect(mockSetValue).nthCalledWith(1, mockCode, mockValue)
  })

  it('should call setValue if onChange event is triggered on field with code "description"', () => {
    const mockCode = 'description'

    const FormComponent = wrapper.find(FormItem).at(3)
    FormComponent.props().field.handler.onChange(mockEvent)

    expect(mockSetValue).nthCalledWith(1, mockCode, mockValue)
  })

  it('should exclude Tesseract from engine options when Tesseract is available', () => {
    ENV.FEATURE_HIDDEN_ENGINES = []

    const testWrapper = shallow(
      <PrototypeInfo
        fieldsViewType={PrototypeViewType.FIELDS}
        setFieldsViewType={jest.fn()}
      />,
    )

    const engineField = testWrapper.find(FormItem).at(1)
    const optionValues = engineField.props().field.options.map((option) => option.value)

    expect(optionValues).not.toContain(KnownOCREngine.TESSERACT)

    ENV.FEATURE_HIDDEN_ENGINES = [KnownOCREngine.TESSERACT]
  })
})
