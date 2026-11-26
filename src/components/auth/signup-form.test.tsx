import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SignupForm } from '@/components/auth/signup-form'

const replace = vi.fn()
const push = vi.fn()
const mutate = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push }),
  useSearchParams: () => new URLSearchParams(''),
}))
vi.mock('@/hooks', () => ({
  useRegister: () => ({ mutate, error: null, isPending: false }),
}))

describe('SignupForm social buttons', () => {
  beforeEach(() => {
    push.mockReset()
    replace.mockReset()
    mutate.mockReset()
  })
  afterEach(() => {
    cleanup()
  })

  it.each([/Google/, /Facebook/])(
    'renders the %s button disabled with a visible coming-soon label',
    (name) => {
      render(<SignupForm />)
      const button = screen.getByRole('button', { name }) as HTMLButtonElement
      expect(button.disabled).toBe(true)
      expect(button.getAttribute('aria-disabled')).toBe('true')
      expect(button.textContent).toContain('Sắp có')
    },
  )

  it.each([/Google/, /Facebook/])(
    'does not register or navigate when the disabled %s button is clicked',
    (name) => {
      render(<SignupForm />)
      fireEvent.click(screen.getByRole('button', { name }))
      expect(mutate).not.toHaveBeenCalled()
      expect(push).not.toHaveBeenCalled()
      expect(replace).not.toHaveBeenCalled()
    },
  )
})
