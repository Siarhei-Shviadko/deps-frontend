import { mockEnv } from '@/mocks/mockEnv'
import { renderMarkdownToSafeHtml } from './renderMarkdownToSafeHtml'

jest.mock('@/utils/env', () => mockEnv)

test('renders markdown to html', () => {
  const result = renderMarkdownToSafeHtml('# Title\n\n**bold**')

  expect(result).toContain('<h1>Title</h1>')
  expect(result).toContain('<strong>bold</strong>')
})

test('keeps raw html tables from provider markdown', () => {
  const result = renderMarkdownToSafeHtml('<table><tr><td>cell</td></tr></table>')

  expect(result).toContain('<table>')
  expect(result).toContain('<td>cell</td>')
})

test('normalizes provider table tag artifacts', () => {
  const result = renderMarkdownToSafeHtml(
    '<table><tr><td$"#,##0.00">12</td><th$x>Name</th></tr></table>',
  )

  expect(result).toContain('<td>12</td>')
  expect(result).toContain('<th>Name</th>')
  expect(result).not.toContain('<td$')
  expect(result).not.toContain('<th$')
})

test('removes unsafe html from rendered output', () => {
  const result = renderMarkdownToSafeHtml('Safe<script>alert(1)</script>')

  expect(result).toContain('Safe')
  expect(result).not.toContain('<script>')
  expect(result).not.toContain('alert(1)')
})
