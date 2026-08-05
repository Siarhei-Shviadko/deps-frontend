
import styled from 'styled-components'
import { List } from '@/components/List'

const ListStyleType = styled.span`
  display: inline-block;
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 50%;
  background-color: ${(props) => props.color};
`

const ListItem = styled(List.Item)`
  border: none !important;
  padding: 0;
  margin-inline: 1.6rem;

  & .ant-list-item-meta-avatar {
    display: flex;
  }

  & .ant-list-item-meta {
    align-items: center;
    margin-bottom: 0.5rem;
  }

  & .ant-list-meta-avatar {
    margin-right: 1rem;
  }

  & h4 {
    margin-bottom: 0;
    color: ${(props) => props.theme.color.grayscale12};
  }
`

const TitleWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const TitleValue = styled.span`
  font-weight: 700;
  color: ${(props) => props.theme.color.grayscale18};
`

export {
  ListStyleType,
  ListItem,
  TitleWrapper,
  TitleValue,
}
