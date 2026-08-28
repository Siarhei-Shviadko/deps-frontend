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

test('renders inline math with katex', () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

  const result = renderMarkdownToSafeHtml('Inline $a$ math')

  expect(result).toContain('class="katex"')
  expect(result).toContain('Inline')
  expect(result).toContain('math')

  warnSpy.mockRestore()
})

test('renders display math with katex-display', () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

  const result = renderMarkdownToSafeHtml('Display $$a$$ math')

  expect(result).toContain('class="katex-display"')
  expect(result).toContain('class="katex"')

  warnSpy.mockRestore()
})

test('converts single line breaks to br tags', () => {
  const result = renderMarkdownToSafeHtml('line one\nline two')

  expect(result).toContain('line one<br />')
  expect(result).toContain('line two')
})

test('renders task list checkboxes', () => {
  const result = renderMarkdownToSafeHtml('- [x] done\n- [ ] todo')

  expect(result).toContain('<input checked disabled type="checkbox" />')
  expect(result).toContain('<input disabled type="checkbox" />')
  expect(result).toContain('done')
  expect(result).toContain('todo')
})
