import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createAdminExam,
  deleteR2Upload,
  listAdminExams,
  listAdminPlanets,
  listAdminQuestions,
  listR2Uploads,
  toggleExamDemo,
  uploadR2File,
} from '@/lib/api/admin'
import { useAuthStore } from '@/store/auth-store'
import type { Exam } from '@/types/exam'

function mockJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('admin API clients', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: 'admin-token',
      user: { id: 1, role: 'ADMIN' },
      status: 'authenticated',
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    useAuthStore.setState({ accessToken: null, user: null, status: 'idle' })
  })

  it('strips non-UUID client draft id when creating an exam', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      mockJsonResponse({
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Flyers 1',
        levelSlug: 'flyers',
        levelName: 'FLYERS',
        isDemo: true,
        order: 2,
        structures: [],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const draft: Exam = {
      id: 'exam_temp-123',
      name: 'Flyers 1',
      levelSlug: 'flyers',
      levelName: 'FLYERS',
      isDemo: true,
      order: 2,
      structures: [],
    }
    const created = await createAdminExam(draft)

    expect(created.id).toBe('11111111-1111-4111-8111-111111111111')
    expect(created.isDemo).toBe(true)

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit
    const sent = JSON.parse(String(init.body)) as Record<string, unknown>
    expect(sent.id).toBeUndefined()
    expect(sent.isDemo).toBe(true)
    expect(sent.order).toBe(2)
  })

  it('parses paged and unpaged exam lists and toggles demo', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJsonResponse([]))
      .mockResolvedValueOnce(
        mockJsonResponse({
          items: [
            {
              id: 'e1',
              name: 'Movers',
              levelSlug: 'movers',
              levelName: 'MOVERS',
              isDemo: false,
              structures: [],
            },
          ],
          total: 1,
          page: 1,
          limit: 20,
        }),
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          id: 'e1',
          name: 'Movers',
          levelSlug: 'movers',
          levelName: 'MOVERS',
          isDemo: true,
          structures: [],
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const plain = await listAdminExams()
    expect(plain).toEqual([])

    const paged = await listAdminExams({ page: 1, limit: 20, q: 'mov' })
    expect(paged).toEqual({
      items: [expect.objectContaining({ id: 'e1' })],
      total: 1,
      page: 1,
      limit: 20,
    })

    const toggled = await toggleExamDemo('e1', true)
    expect(toggled.isDemo).toBe(true)
    expect(String(fetchMock.mock.calls[2]?.[0])).toContain('/exams/e1/demo')
  })

  it('lists questions, R2 uploads and deletes uploaded keys cleanly', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        mockJsonResponse({
          items: [
            {
              id: 'q1',
              levelSlug: 'movers',
              kind: 'multichoice',
              skillTags: ['reading'],
              question: { id: 'q1', isExample: false, details: [] },
            },
          ],
          total: 1,
          page: 1,
          limit: 20,
        }),
      )
      .mockResolvedValueOnce(mockJsonResponse({ configured: false, items: [], nextCursor: null }))
      .mockResolvedValueOnce(mockJsonResponse({ url: 'https://pub-abc.r2.dev/photo.png' }))
      .mockResolvedValueOnce(mockJsonResponse({ message: 'Đã xóa file.' }))
      .mockResolvedValueOnce(
        mockJsonResponse([
          {
            id: 'pl1',
            slug: 'movers',
            name: 'MOVERS',
            subtitle: 'Vương quốc sóng xanh',
            sortOrder: 1,
            visible: true,
          },
        ]),
      )
    vi.stubGlobal('fetch', fetchMock)

    const qs = await listAdminQuestions({ page: 1, level: 'movers' })
    expect(qs).toMatchObject({ total: 1 })

    const uploads = await listR2Uploads({ type: 'image' })
    expect(uploads.configured).toBe(false)

    const file = new File(['hello'], 'photo.png', { type: 'image/png' })
    const uploaded = await uploadR2File(file)
    expect(uploaded.url).toBe('https://pub-abc.r2.dev/photo.png')
    expect((fetchMock.mock.calls[2]?.[1] as RequestInit).body).toBeInstanceOf(FormData)

    const deleted = await deleteR2Upload('folder/photo.png')
    expect(deleted.message).toBe('Đã xóa file.')
    expect(String(fetchMock.mock.calls[3]?.[0])).toContain('/uploads?key=folder%2Fphoto.png')

    const planets = await listAdminPlanets()
    expect(planets[0]?.slug).toBe('movers')
  })
})
