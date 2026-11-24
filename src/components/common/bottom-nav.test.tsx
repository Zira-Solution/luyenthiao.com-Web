import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BottomNav } from '@/components/common/bottom-nav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
}))

describe('BottomNav Mascot and Actions', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the lion mascot in the center dock', () => {
    render(<BottomNav />)

    expect(screen.getByAltText('Luyện Thi Ảo Mascot')).toBeInTheDocument()
    expect(screen.getByText('LUYỆN THI ẢO')).toBeInTheDocument()
  })

  it('renders left and right action buttons', () => {
    render(<BottomNav />)

    expect(screen.getByText('TẤT CẢ')).toBeInTheDocument()
    expect(screen.getByText('SỔ TAY')).toBeInTheDocument()
    expect(screen.getByText('KÍCH HOẠT')).toBeInTheDocument()
  })
})
