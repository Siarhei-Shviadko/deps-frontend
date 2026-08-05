
import styled from 'styled-components'
import { GroupOfRadio, Radio } from '@/components/Radio'

const StyledRadio = styled(Radio)`
  &.ant-radio-button-wrapper {
    background: transparent;
    border: none !important;
    box-shadow: none !important;

    color: ${({ theme }) => theme.color.grayscale12};

    &::before {
      display: none;
    }

    &:hover {
      color: ${({ theme }) => theme.color.primary2};
    }

    &.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
      background: ${({ theme }) => theme.color.grayscale20};
      color: ${({ theme }) => theme.color.primary2};
    }
  }
`

const StyledRadioGroup = styled(GroupOfRadio)`
  border: 1px solid ${({ theme }) => theme.color.grayscale21};
  border-radius: 0.4rem;
  height: fit-content;
  display: inline-flex;
  align-items: center;
`

const SubHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
`

const Wrapper = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
`

export {
  ContentArea,
  SubHeader,
  StyledRadioGroup,
  StyledRadio,
  Wrapper,
}
