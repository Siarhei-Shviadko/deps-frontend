
import { mockReact } from '@/mocks/mockReact'
import { mockEnv } from '@/mocks/mockEnv'
import { mockNotification } from '@/mocks/mockNotification'
import { mockReactHookForm } from '@/mocks/mockReactHookForm'
import { mockReactRedux } from '@/mocks/mockReactRedux'
import { shallow } from 'enzyme'
import React from 'react'
import { fetchProcessingEngines } from '@/actions/engines'
import { AuthType } from '@/enums/AuthType'
import {
  Localization,
  localize,
} from '@/localization/i18n'
import { ENV } from '@/utils/env'
import { DocumentUploadSettingsForm } from './DocumentUploadSettingsForm'

const mockDispatch = jest.fn((action) => action)

jest.mock('react', () => mockReact())
jest.mock('@/selectors/requests')
jest.mock('@/selectors/engines')
jest.mock('@/utils/notification', () => mockNotification)
jest.mock('@/utils/env', () => mockEnv)
jest.mock('react-hook-form', () => mockReactHookForm)

jest.mock('react-redux', () => ({
  ...mockReactRedux,
  useDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/actions/engines', () => ({
  fetchProcessingEngines: jest.fn(),
}))

describe('Container: DocumentUploadSettingsForm', () => {
  let wrapper

  beforeEach(() => {
    ENV.AUTH_TYPE = AuthType.NO_AUTH
    wrapper = shallow(<DocumentUploadSettingsForm />)
  })

  it('should render DocumentUploadSettingsForm with correct props', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should call dispatch with fetchProcessingEngines when component did mount', () => {
    expect(mockDispatch).nthCalledWith(1, fetchProcessingEngines)
  })

  it('should render "Assign to me" option, if ENV.AUTH_TYPE is not equal to AuthType.NO_AUTH ', () => {
    ENV.AUTH_TYPE = AuthType.OIDC
    wrapper = shallow(<DocumentUploadSettingsForm />)

    expect(wrapper.find({
      label: localize(Localization.ASSIGN_ME_AS_A_REVIEWER_FOR_DOCUMENTS),
    }).exists()).toBe(true)
  })
})
