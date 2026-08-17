import styled from 'styled-components'

export const LocalBoundary = styled.div`
  display: grid;
  margin: 0.5rem 0;
  padding: 1rem;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.color.warning};
  border-radius: 1px;
`

export const MarkdownContent = styled.div`
  padding: 1.6rem;
  overflow: auto;
  color: ${({ theme }) => theme.color.grayscale13};
  font-size: 1.4rem;
  line-height: 1.6;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 1.6rem 0 0.8rem;
    font-weight: 600;
    color: ${({ theme }) => theme.color.grayscale13};
  }

  h1 {
    font-size: 2.4rem;
  }

  h2 {
    font-size: 2rem;
  }

  h3 {
    font-size: 1.8rem;
  }

  p {
    margin: 0 0 1.2rem;
  }

  ul,
  ol {
    margin: 0 0 1.2rem;
    padding-left: 2.4rem;
  }

  li {
    margin-bottom: 0.4rem;
  }

  li.task-list-item {
    list-style: none;
  }

  li.task-list-item input {
    margin-right: 0.8rem;
  }

  table {
    width: max-content;
    max-width: none;
    margin: 0 0 1.6rem;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 0.8rem 1.2rem;
    border: 0.1rem solid ${({ theme }) => theme.color.grayscale1};
    text-align: left;
    vertical-align: top;
    white-space: nowrap;
  }

  th {
    background: ${({ theme }) => theme.color.grayscale14};
    font-weight: 600;
  }

  img {
    max-width: 100%;
    height: auto;
    margin: 0 0 1.2rem;
  }

  code {
    padding: 0.1rem 0.4rem;
    border-radius: 0.2rem;
    background: ${({ theme }) => theme.color.grayscale8};
    font-family: monospace;
  }

  pre {
    margin: 0 0 1.2rem;
    padding: 1.2rem;
    overflow: auto;
    border-radius: 0.4rem;
    background: ${({ theme }) => theme.color.grayscale8};
  }

  pre code {
    padding: 0;
    background: transparent;
  }

  strong {
    font-weight: 600;
  }

  a {
    color: ${({ theme }) => theme.color.primary2};
  }

  blockquote {
    margin: 0 0 1.2rem;
    padding: 0.4rem 1.2rem;
    border-left: 0.3rem solid ${({ theme }) => theme.color.grayscale1};
    color: ${({ theme }) => theme.color.grayscale5};
  }
`
