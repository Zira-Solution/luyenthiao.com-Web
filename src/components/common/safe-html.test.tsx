import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { SafeHtml } from '@/components/common'

describe('SafeHtml', () => {
  afterEach(cleanup)

  it('renders sanitised markup in a span by default', () => {
    const { container } = render(
      <SafeHtml html='<strong>ok</strong><img src=x onerror="alert(1)">' />,
    )
    const span = container.firstElementChild as HTMLElement
    expect(span.tagName).toBe('SPAN')
    expect(span.innerHTML).toBe('<strong>ok</strong><img src="x">')
  })

  it('renders a div with a class when asked', () => {
    const { container } = render(<SafeHtml as="div" className="text-xs" html="<p>a</p>" />)
    const div = container.firstElementChild as HTMLElement
    expect(div.tagName).toBe('DIV')
    expect(div.className).toBe('text-xs')
    expect(div.innerHTML).toBe('<p>a</p>')
  })
})
