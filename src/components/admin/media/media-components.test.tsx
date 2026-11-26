import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MediaBrowserDialog } from './media-browser-dialog'
import { MediaPickerField } from './media-picker-field'

const mediaMocks = vi.hoisted(() => ({
  uploadMutateAsync: vi.fn(),
  deleteMutateAsync: vi.fn(),
  r2Data: {
    configured: true,
    items: [
      {
        key: 'hero.png',
        url: 'https://pub-123.r2.dev/hero.png',
        name: 'hero.png',
        kind: 'image' as const,
        size: 1024,
        lastModified: '2026-11-26T00:00:00.000Z',
      },
    ],
    nextCursor: null as string | null,
  },
}))

vi.mock('@/hooks/use-media-library', () => ({
  useMediaLibrary: (kind: 'image' | 'audio') => ({
    data:
      kind === 'image'
        ? [{ name: 'cat.png', path: '/clone-assets/cat.png', dir: 'pets', ext: 'png' }]
        : [{ name: 'track.mp3', path: '/clone-assets/track.mp3', dir: 'audio', ext: 'mp3' }],
    isLoading: false,
    error: null,
  }),
}))

vi.mock('@/hooks/admin', () => ({
  useR2Uploads: (params?: { type?: 'image' | 'audio' }) => ({
    data: {
      configured: mediaMocks.r2Data.configured,
      items: mediaMocks.r2Data.items.filter((i) => !params?.type || i.kind === params.type),
      nextCursor: mediaMocks.r2Data.nextCursor,
    },
    isLoading: false,
    error: null,
  }),
  useUploadR2File: () => ({
    mutateAsync: mediaMocks.uploadMutateAsync,
    isPending: false,
  }),
  useDeleteR2Upload: () => ({
    mutateAsync: mediaMocks.deleteMutateAsync,
    isPending: false,
  }),
}))

const DARK_MARKERS = [
  'bg-white/',
  'text-white/',
  'border-white/',
  'backdrop-blur',
  'bg-dashboard-bg',
  'bg-topbar-login-bg',
  'text-game-',
  'bg-game-',
  'bg-slate-900',
  'placeholder:text-slate-400',
  'placeholder:text-white/',
  'bg-black/20',
  'semantic-warning',
]

function expectNoDarkMarkers(html: string): void {
  for (const marker of DARK_MARKERS) {
    expect(html, `unexpected dark marker "${marker}"`).not.toContain(marker)
  }
}

describe('admin media components light theme', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders MediaPickerField without dark markers across empty, selected and url modes', () => {
    const empty = render(<MediaPickerField kind="image" value={null} onChange={() => {}} />)
    expectNoDarkMarkers(empty.container.innerHTML)
    empty.unmount()

    const filled = render(
      <MediaPickerField kind="audio" value="/clone-assets/track.mp3" onChange={() => {}} />,
    )
    expectNoDarkMarkers(filled.container.innerHTML)
    fireEvent.click(screen.getByRole('button', { name: /Dán URL/ }))
    expectNoDarkMarkers(filled.container.innerHTML)
  })

  it('renders MediaBrowserDialog with light theme and selects items cleanly', () => {
    const onSelect = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <MediaBrowserDialog
        kind="image"
        open
        onOpenChange={onOpenChange}
        value="/clone-assets/cat.png"
        onSelect={onSelect}
      />,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('admin-theme')
    expectNoDarkMarkers(dialog.className)
    expectNoDarkMarkers(dialog.innerHTML)

    // Tab Kho R2 (Cloud) là mặc định khi R2 configured: chọn item R2
    fireEvent.click(screen.getByRole('button', { name: 'hero.png' }))
    expect(onSelect).toHaveBeenCalledWith('https://pub-123.r2.dev/hero.png')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('switches to built-in clone-assets tab and accepts external https URL in MediaPickerField', () => {
    const onChange = vi.fn()
    render(<MediaPickerField kind="image" value={null} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /Dán URL/ }))
    fireEvent.change(screen.getByPlaceholderText(/hoặc https:\/\//), {
      target: { value: 'https://pub-123.r2.dev/banner.png' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(onChange).toHaveBeenCalledWith('https://pub-123.r2.dev/banner.png')

    const onSelect = vi.fn()
    render(
      <MediaBrowserDialog
        kind="image"
        open
        onOpenChange={() => {}}
        value={null}
        onSelect={onSelect}
      />,
    )
    fireEvent.click(screen.getByRole('tab', { name: /Tài nguyên sẵn/ }))
    fireEvent.click(screen.getByRole('button', { name: /cat\.png/ }))
    expect(onSelect).toHaveBeenCalledWith('/clone-assets/cat.png')
  })

  it('shows unconfigured R2 notice gracefully when configured is false', () => {
    mediaMocks.r2Data.configured = false
    render(
      <MediaBrowserDialog
        kind="image"
        open
        onOpenChange={() => {}}
        value={null}
        onSelect={() => {}}
      />,
    )
    expect(screen.getByText(/Chưa cấu hình Cloudflare R2/)).toBeInTheDocument()
    mediaMocks.r2Data.configured = true
  })
})
