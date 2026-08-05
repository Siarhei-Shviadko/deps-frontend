
import styled, { css } from 'styled-components'
import { Tag } from '@/components/Tag'
import { Select } from '../Select'

const StyledSelect = styled(Select)`
  .ant-select-dropdown {
    border: 1px solid ${(props) => props.theme.color.grayscale15};
  }
    
  &.ant-select-disabled {
    & > .ant-select-selector {
      background-color: ${(props) => props.theme.color.grayscale14};
      color: ${(props) => props.theme.color.grayscale12};
      border: none;
    }
  }
    
  .ant-select-item.ant-select-item-option {
    padding: 0.8rem 1.2rem;
      
    &-active {
      background-color: ${(props) => props.theme.color.grayscale20};
    }
  }

  .rc-virtual-list-scrollbar {
    max-width: 6px !important;

    &-thumb {
      background: ${(props) => props.theme.color.grayscale15} !important;
    }
  }
  
  ${(props) => props.mode && css`
    .ant-select-selection-overflow-item {
      margin-right: 0.5rem;
    }

    .ant-select-selection-item {
      padding: 0 0.2rem;
      height: 2.9rem;
      border-color: ${(props) => props.theme.color.grayscale15};
    }
  `}
`

const StyledTag = styled(Tag)`
  margin: 0.2rem 0.5rem 0.2rem 0;
`

export {
  StyledSelect as Select,
  StyledTag as Tag,
}
