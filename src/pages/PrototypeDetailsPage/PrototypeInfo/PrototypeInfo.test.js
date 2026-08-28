
import { mockEnv } from '@/mocks/mockEnv'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import { Input } from '@/components/Input'
import { CustomSelect } from '@/components/Select'
import { KnownLanguage } from '@/enums/KnownLanguage'
import { KnownProcessingEngines } from '@/enums/KnownProcessingEngines'
import { PrototypeViewType } from '@/enums/PrototypeViewType'
import { Prototype } from '@/models/Prototype'
import { PrototypeInfo } from './PrototypeInfo'

jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-redux', () => mockReactRedux)
jest.mock('@/selectors/languages')
jest.mock('@/selectors/engines')

const mockPrototype = new Prototype({
  id: 'testId',
  name: 'testName',
  engine: KnownProcessingEngines.TESSERACT,
  language: KnownLanguage.ENGLISH,
  createdAt: '2023-12-22T07:25:56.466801',
  description: '',
})

describe('Component: PrototypeInfo', () => {
  let defaultProps, wrapper

  beforeEach(() => {
    defaultProps = {
      fieldsViewType: PrototypeViewType.FIELDS,
      isEditMode: false,
      prototype: mockPrototype,
      onValueChange: jest.fn(),
      setFieldsViewType: jest.fn(),
    }

    wrapper = shallow(<PrototypeInfo {...defaultProps} />)
  })

  it('should render correctly with default props', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should render CustomSelects as engine and language fields in case edit mode is enabled', () => {
    wrapper.setProps({
      ...defaultProps,
      isEditMode: true,
    })

    wrapper.find(CustomSelect).forEach((Select) => {
      expect(Select.props()).toMatchSnapshot()
    })
  })

  it('should render Input as description field in case edit mode is enabled', () => {
    wrapper.setProps({
      ...defaultProps,
      isEditMode: true,
    })

    expect(wrapper.find(Input).props()).toMatchSnapshot()
  })

  it('should call onValueChange with correct arguments in case engine was changed', () => {
    wrapper.setProps({
      ...defaultProps,
      isEditMode: true,
    })

    const mockValue = 'mockValue'

    wrapper.find(CustomSelect).at(0).props().onChange(mockValue)
    expect(defaultProps.onValueChange).nthCalledWith(1, {
      engine: mockValue,
    })
  })

  it('should call onValueChange with correct arguments in case language was changed', () => {
    wrapper.setProps({
      ...defaultProps,
      isEditMode: true,
    })

    const mockValue = 'mockValue'
    wrapper.find(CustomSelect).at(1).props().onChange(mockValue)

    expect(defaultProps.onValueChange).nthCalledWith(1, {
      language: mockValue,
    })
  })

  it('should call onValueChange with correct arguments in case description was changed', () => {
    wrapper.setProps({
      ...defaultProps,
      isEditMode: true,
    })

    const mockEvent = {
      target: {
        value: 'mockValue',
      },
    }
    wrapper.find(Input).props().onChange(mockEvent)

    expect(defaultProps.onValueChange).nthCalledWith(1, {
      description: mockEvent.target.value,
    })
  })
})
