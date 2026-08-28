
import { mockComponent } from '@/mocks/mockComponent'
import { mockEnv } from '@/mocks/mockEnv'
import { shallow } from 'enzyme'
import { FieldType } from 'labeling-tool/lib/enums/FieldType'
import { Field } from 'labeling-tool/lib/models/Field'
import { Engine } from '@/models/Engine'
import {
  LabelingTool,
  Mode,
  Panel,
  Tool,
  Feature,
} from '.'

jest.mock('@/utils/env', () => mockEnv)

jest.mock('labeling-tool', () => ({
  ...jest.requireActual('labeling-tool'),
  LabelingTool: () => mockComponent('LabelingTool'),
}))

describe('Component: LabelingTool', () => {
  let wrapper, defaultProps

  beforeEach(() => {
    defaultProps = {
      config: {
        document: {
          pages: ['test'],
        },
        fields: [
          new Field('verticalReference', 'Vertical Reference', FieldType.STRING),
          new Field('glElevation', 'GL Elevation', FieldType.STRING),
        ],
        api: {
          close: jest.fn(),
          save: jest.fn(),
          saveMarkup: jest.fn(),
          recognize: jest.fn(),
        },
        ocr: {
          engines: [
            new Engine('mock engine code',
              'mock engine title'),
          ],
        },
        markup: null,
        settings: {
          mode: Mode.MARKUP,
          panels: Object.values(Panel),
          tools: Object.values(Tool),
          features: Object.values(Feature),
        },
      },
    }

    wrapper = shallow(<LabelingTool {...defaultProps} />)
  })

  it('should render correct layout', () => {
    expect(wrapper).toMatchSnapshot()
  })
})
