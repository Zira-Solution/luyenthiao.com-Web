import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PlanetsAdminView } from '@/components/admin/planets'
import { SiteConfigView } from '@/components/admin/site-config'
import { DEFAULT_SITE_CONFIG_CLIENT } from '@/components/admin/site-config/site-config-defaults'

const mocks = vi.hoisted(() => ({
  reorderMutateAsync: vi.fn(),
  deleteMutateAsync: vi.fn(),
  createMutateAsync: vi.fn(),
  updateMutateAsync: vi.fn(),
  saveSiteConfigMutateAsync: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/hooks/admin', () => ({
  useAdminPlanets: () => ({
    data: [
      {
        id: 'p1',
        slug: 'starters',
        name: 'STARTERS',
        nameEn: 'STARTERS',
        subtitle: 'Hòn Đảo Kẹo Ngọt',
        subtitleEn: '',
        level: 'Pre A1',
        image: '/assets/planets/planet_candy_wonderland.png',
        mapBackground: '',
        linkUrl: '',
        mapTotal: 200,
        glowColor: '#ec4899',
        ribbonFrom: '#f472b6',
        ribbonTo: '#fb7185',
        sortOrder: 0,
        visible: true,
      },
      {
        id: 'p2',
        slug: 'movers',
        name: 'MOVERS',
        nameEn: 'MOVERS',
        subtitle: 'Vương quốc sóng xanh',
        subtitleEn: '',
        level: 'A1',
        image: '/clone-assets/media/planet_movers.png',
        mapBackground: '',
        linkUrl: '',
        mapTotal: 200,
        glowColor: '#06b6d4',
        ribbonFrom: '#22d3ee',
        ribbonTo: '#3b82f6',
        sortOrder: 1,
        visible: true,
      },
    ],
    isLoading: false,
    error: null,
  }),
  useCreateAdminPlanet: () => ({ mutateAsync: mocks.createMutateAsync, isPending: false }),
  useUpdateAdminPlanet: () => ({ mutateAsync: mocks.updateMutateAsync, isPending: false }),
  useReorderAdminPlanets: () => ({ mutateAsync: mocks.reorderMutateAsync, isPending: false }),
  useDeleteAdminPlanet: () => ({ mutateAsync: mocks.deleteMutateAsync, isPending: false }),
  useAdminSiteConfig: () => ({ data: DEFAULT_SITE_CONFIG_CLIENT, isLoading: false, error: null }),
  useSaveAdminSiteConfig: () => ({
    mutateAsync: mocks.saveSiteConfigMutateAsync,
    isPending: false,
  }),
}))

vi.mock('@/components/admin/media', () => ({
  MediaPickerField: ({
    value,
    onChange,
  }: {
    value?: string
    onChange: (v: string | null) => void
  }) => (
    <input
      data-testid="mock-media-picker"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

describe('Admin Planets & SiteConfig Views', () => {
  beforeEach(() => {
    mocks.reorderMutateAsync.mockResolvedValue({ message: 'OK' })
    mocks.deleteMutateAsync.mockRejectedValue(
      new Error(
        'Hành tinh đang có 3 bộ đề thi — hãy chuyển các đề sang hành tinh khác trước khi xóa.',
      ),
    )
    mocks.saveSiteConfigMutateAsync.mockResolvedValue(DEFAULT_SITE_CONFIG_CLIENT)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('hiển thị bảng Hành tinh, gọi reorder và hiển thị lỗi 409 rõ ràng khi xóa hành tinh đang có đề', async () => {
    render(<PlanetsAdminView />)
    expect(screen.getByText('STARTERS')).toBeInTheDocument()
    expect(screen.getByText('MOVERS')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Đưa STARTERS xuống' }))
    await waitFor(() => expect(mocks.reorderMutateAsync).toHaveBeenCalledWith(['p2', 'p1']))

    fireEvent.click(screen.getByRole('button', { name: 'Xóa STARTERS' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('3 bộ đề thi')
  })

  it('khóa trường slug khi mở modal Sửa hành tinh', () => {
    render(<PlanetsAdminView />)
    fireEvent.click(screen.getAllByRole('button', { name: /Sửa/i })[0]!)
    const slugInput = screen.getByLabelText(/Slug định danh/i)
    expect(slugInput).toBeDisabled()
  })

  it('hiển thị SiteConfigView đủ tab và lưu cấu hình', async () => {
    render(<SiteConfigView />)
    expect(screen.getByText('Cấu hình Trang chủ & Tài nguyên')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'Bản đồ (Chữ)' }))
    expect(screen.getByDisplayValue('Trở về')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Lưu cấu hình/i }))
    await waitFor(() => expect(mocks.saveSiteConfigMutateAsync).toHaveBeenCalledTimes(1))
  })
})
