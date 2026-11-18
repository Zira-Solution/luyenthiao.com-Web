import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DashboardView } from '@/components/dashboard/dashboard-view'
import planets from '@/schemas/__fixtures__/planets.json'
import { planetsSchema, toPlanets } from '@/schemas/planet'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), usePathname: () => '/' }))

// jsdom has no matchMedia; Swiper reads it for its breakpoints.
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  onchange: null,
  dispatchEvent: () => false,
})) as typeof window.matchMedia

const data = toPlanets(planetsSchema.parse(planets))

describe('DashboardView', () => {
  afterEach(() => {
    cleanup()
    push.mockReset()
  })

  it('renders every planet from the API', () => {
    render(<DashboardView planets={data} />)
    for (const planet of data) expect(screen.getAllByText(planet.name).length).toBeGreaterThan(0)
  })

  it('navigates to the level exam list', () => {
    render(<DashboardView planets={data} />)
    fireEvent.click(screen.getAllByText(data[1]?.name ?? '')[0] as HTMLElement)
    expect(push).toHaveBeenCalledWith('/testlevels/starters')
  })

  it('marks the IOE planet as coming soon and does not navigate', () => {
    render(<DashboardView planets={data} />)
    expect(screen.getByText('Sắp ra mắt')).toBeTruthy()
    fireEvent.click(screen.getAllByText(data[0]?.name ?? '')[0] as HTMLElement)
    expect(push).not.toHaveBeenCalled()
  })

  it('shows the error state when the API failed', () => {
    render(<DashboardView planets={null} />)
    expect(screen.getByText('Tạm thời không tải được dữ liệu, vui lòng thử lại sau.')).toBeTruthy()
  })

  it('renders an absolute image URL as a plain img', () => {
    const first = data[0]
    if (!first) throw new Error('fixture empty')
    render(<DashboardView planets={[{ ...first, image: 'https://cdn.example/p.png' }]} />)
    expect(screen.getByAltText(first.name).getAttribute('src')).toBe('https://cdn.example/p.png')
  })
})
