import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HelloPlaceholder } from './hello-placeholder'

describe('HelloPlaceholder', () => {
  it('renders the greeting heading', () => {
    render(<HelloPlaceholder />)

    expect(
      screen.getByRole('heading', { name: /hello, english-learning-app/i }),
    ).toBeInTheDocument()
  })
})
