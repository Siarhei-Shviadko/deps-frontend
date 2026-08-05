import styled from 'styled-components'
import { Collapse } from '@/components/Collapse'
import { FormItem } from '@/components/Form/ReactHookForm'
import { InputNumber } from '@/components/InputNumber'
import { PageSpanSection } from '@/containers/PageSpanSection'

export const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0 1.6rem;
`

export const StyledInputNumber = styled(InputNumber)`
  width: 100%;
  color: ${(props) => props.theme.color.grayscale18};
`

export const StyledFormItem = styled(FormItem)`
  width: 100%;
`

export const StyledCollapse = styled(Collapse)`
  && .ant-collapse-header,
  && .ant-collapse-content-box {
    padding-inline: 0 !important;
  }

  && .ant-collapse-header {
    color: ${(props) => props.theme.color.primary2} !important;
    font-size: 1.2rem;
    font-weight: 600;
  }
`

export const SwitchFormItem = styled(FormItem)`
  width: 100%;
  flex-direction: row;
  margin-bottom: 1.6rem;
  padding: 1.6rem;
  background: ${(props) => props.theme.color.grayscale14};
  border-radius: 0.8rem;

  & > div {
    font-weight: 400;
    font-size: 1.4rem;
  }
`

export const StyledPageSpanSection = styled(PageSpanSection)`
  flex-direction: column;
  gap: 1.5rem;

  & .ant-radio-group {
    margin-right: 0;
  }

  & .ant-radio-button-wrapper {
    flex: 1;
  }

  & .ant-input-number {
    width: 11rem;
  }
`
