import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BoxPicker } from './box-picker/box-picker'
import { Field, NumberInput, TextAreaInput, TextInput } from './editor-field'
import { ExamEditor } from './exam-editor'
import { PartCard } from './part-card'
import { QuestionsJsonEditor } from './questions-json-editor'
import { TagsInput } from './tags-input'
import { ValidationPanel } from './validation-panel'

import { saveDraft } from '@/lib/admin-draft'
import { blankExam } from '@/lib/exam-blank'
import { useExamEditorStore } from '@/store/exam-editor-store'
import type { Exam, ExamDetail } from '@/types/exam'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  examById: {} as Record<string, Exam | undefined>,
  isLoading: false,
  error: null as Error | null,
  createMutateAsync: vi.fn(),
  updateMutateAsync: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('@/hooks/admin', () => ({
  useAdminExam: (id: string) => ({
    data: mocks.examById[id],
    isLoading: mocks.isLoading && id !== 'new',
    error: mocks.error,
  }),
  useAdminPlanets: () => ({
    data: [
      {
        id: 'pl-movers',
        slug: 'movers',
        name: 'MOVERS',
        subtitle: 'Vương quốc sóng xanh',
        sortOrder: 1,
        visible: true,
      },
      {
        id: 'pl-flyers',
        slug: 'flyers',
        name: 'FLYERS',
        subtitle: 'Khu Vườn Thần Tiên',
        sortOrder: 2,
        visible: true,
      },
    ],
  }),
  useCreateAdminExam: () => ({ mutateAsync: mocks.createMutateAsync, isPending: false }),
  useUpdateAdminExam: () => ({ mutateAsync: mocks.updateMutateAsync, isPending: false }),
}))

vi.mock('./form/part-form-dragdrop', () => ({ PartFormDragdrop: () => <div /> }))
vi.mock('./form/part-form-gapfill', () => ({ PartFormGapfill: () => <div /> }))
vi.mock('./form/part-form-matching', () => ({ PartFormMatching: () => <div /> }))
vi.mock('./form/part-form-multichoice', () => ({ PartFormMultichoice: () => <div /> }))
vi.mock('./form/part-form-write', () => ({ PartFormWrite: () => <div /> }))
vi.mock('./form/part-form-speak', () => ({ PartFormSpeak: () => <div /> }))
vi.mock('./form/part-settings-fields', () => ({ PartSettingsFields: () => <div /> }))
vi.mock('./question-bank-picker-dialog', () => ({ QuestionBankPickerDialog: () => <div /> }))
vi.mock('@/components/exam/parts', () => ({
  PART_RENDERERS: {
    gapfill: () => <div />,
    multichoice: () => <div />,
    matching: () => <div />,
    dragdrop: () => <div />,
    write: () => <div />,
    speak: () => <div />,
  },
}))
vi.mock('@/components/admin/media', () => ({
  MediaPickerField: () => <div />,
  MediaBrowserDialog: () => <div />,
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
  'game-danger',
  'bg-slate-900',
  'bg-black/10',
  'bg-black/20',
  'text-amber-300',
  'text-amber-400',
  'text-emerald-400',
  'bg-amber-400/5',
  'placeholder:text-slate-400',
  'placeholder:text-white/',
  'min-h-screen',
]

const SOLID_BG_FOR_WHITE_TEXT = ['bg-admin-primary', 'bg-rose-600', 'bg-slate-500', 'bg-black/50']

function expectNoDarkMarkers(html: string): void {
  for (const marker of DARK_MARKERS) {
    expect(html, `unexpected dark marker "${marker}"`).not.toContain(marker)
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  for (const el of Array.from(doc.body.querySelectorAll('[class]'))) {
    const tokens = (el.getAttribute('class') ?? '').split(/\s+/)
    if (!tokens.includes('text-white')) continue
    const desc = `<${el.tagName.toLowerCase()} class="${tokens.join(' ')}"> ${el.textContent?.slice(0, 40) ?? ''}`
    expect(tokens, `text-white on bg-brand-primary (contrast 4.25:1): ${desc}`).not.toContain(
      'bg-brand-primary',
    )
    expect(
      tokens.some((t) => SOLID_BG_FOR_WHITE_TEXT.includes(t)),
      `bare text-white without a solid coloured background: ${desc}`,
    ).toBe(true)
  }
}

function makeExam(): Exam {
  const exam = blankExam()
  exam.id = '11111111-1111-4111-8111-111111111111'
  exam.name = 'Movers Practice Test 1'
  exam.isDemo = false
  exam.order = 1
  return exam
}

describe('exam editor light theme & API persistence', () => {
  beforeEach(() => {
    mocks.push.mockReset()
    mocks.createMutateAsync.mockReset()
    mocks.updateMutateAsync.mockReset()
    mocks.isLoading = false
    mocks.error = null
    mocks.examById = { '11111111-1111-4111-8111-111111111111': makeExam() }
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    useExamEditorStore.getState().reset()
    localStorage.clear()
  })

  describe('ExamEditor', () => {
    it('renders the header as an AdminPageHeader for a new exam', () => {
      render(<ExamEditor examId="new" />)
      const headings = screen.getAllByRole('heading', { level: 1 })
      expect(headings).toHaveLength(1)
      expect(headings[0]).toHaveTextContent('Đề thi mới')

      const nav = screen.getByRole('navigation', { name: 'Đường dẫn' })
      expect(nav).toHaveTextContent('Trang chủ')
      expect(screen.getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('href', '/')
      expect(screen.getByRole('link', { name: 'Đề thi' })).toHaveAttribute('href', '/admin/exam')
    })

    it('uses the exam name as the title and as the last breadcrumb', () => {
      render(<ExamEditor examId="11111111-1111-4111-8111-111111111111" />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Movers Practice Test 1')
      const current = screen
        .getByRole('navigation', { name: 'Đường dẫn' })
        .querySelector('[aria-current="page"]')
      expect(current).toHaveTextContent('Movers Practice Test 1')
    })

    it('creates a new exam via API mutation and updates an existing one', async () => {
      mocks.createMutateAsync.mockResolvedValueOnce(makeExam())
      const first = render(<ExamEditor examId="new" />)
      fireEvent.change(screen.getByPlaceholderText('VD: Movers Practice Test 1'), {
        target: { value: 'New Server Exam' },
      })
      fireEvent.click(screen.getByRole('button', { name: /Lưu đề/ }))
      await waitFor(() => {
        expect(mocks.createMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'New Server Exam' }),
        )
        expect(mocks.push).toHaveBeenCalledWith('/admin/exam')
      })
      first.unmount()

      mocks.updateMutateAsync.mockResolvedValueOnce(makeExam())
      render(<ExamEditor examId="11111111-1111-4111-8111-111111111111" />)
      fireEvent.click(screen.getByRole('button', { name: /Lưu đề/ }))
      await waitFor(() => {
        expect(mocks.updateMutateAsync).toHaveBeenCalledWith({
          id: '11111111-1111-4111-8111-111111111111',
          exam: expect.objectContaining({ name: 'Movers Practice Test 1' }),
        })
      })
    })

    it('keeps the back button working in the header actions', () => {
      render(<ExamEditor examId="11111111-1111-4111-8111-111111111111" />)
      const save = screen.getByRole('button', { name: /Lưu đề/ })
      expect(save).toHaveClass('bg-admin-primary')
      expect(save).not.toHaveClass('bg-brand-primary')

      fireEvent.click(screen.getByRole('button', { name: /Quay lại/ }))
      expect(mocks.push).toHaveBeenCalledWith('/admin/exam')
    })

    it('renders no dark-theme classes in the loaded editor', () => {
      const { container } = render(<ExamEditor examId="11111111-1111-4111-8111-111111111111" />)
      expectNoDarkMarkers(container.innerHTML)
    })

    it('renders no dark-theme classes with the dirty badge, the draft banner and a save error', () => {
      const unsaved = makeExam()
      unsaved.name = 'Unsaved name'
      saveDraft('11111111-1111-4111-8111-111111111111', unsaved)

      const { container } = render(<ExamEditor examId="11111111-1111-4111-8111-111111111111" />)
      expect(screen.getByText(/Bạn có một bản nháp chưa lưu/)).toBeInTheDocument()

      fireEvent.change(screen.getByPlaceholderText('VD: Movers Practice Test 1'), {
        target: { value: 'Changed' },
      })
      expect(screen.getByText('Chưa lưu')).toBeInTheDocument()

      act(() => {
        useExamEditorStore
          .getState()
          .setJsonMode(useExamEditorStore.getState().draft!.structures[0]!.parts[0]!.id, true)
        useExamEditorStore
          .getState()
          .setJsonText(useExamEditorStore.getState().draft!.structures[0]!.parts[0]!.id, '')
      })
      fireEvent.click(screen.getByRole('button', { name: /Lưu đề/ }))
      expect(screen.getByText(/chưa có dữ liệu câu hỏi/)).toBeInTheDocument()

      expectNoDarkMarkers(container.innerHTML)
    })

    it('renders not-found or loading state cleanly', () => {
      mocks.isLoading = true
      const loading = render(<ExamEditor examId="does-not-exist" />)
      expectNoDarkMarkers(loading.container.innerHTML)
    })
  })

  describe('PartCard', () => {
    function seedEditor(): void {
      useExamEditorStore.getState().init(makeExam())
    }

    it('renders no dark-theme classes when collapsed', () => {
      seedEditor()
      const { container } = render(<PartCard structIdx={0} partIdx={0} />)
      expectNoDarkMarkers(container.innerHTML)
    })

    it('renders no dark-theme classes when expanded (forms stubbed)', () => {
      seedEditor()
      const { container } = render(<PartCard structIdx={0} partIdx={0} />)
      fireEvent.click(screen.getByRole('button', { name: /Câu hỏi/ }))
      expect(screen.getByText('Xem trước')).toBeInTheDocument()
      expectNoDarkMarkers(container.innerHTML)
    })
  })

  describe('QuestionsJsonEditor', () => {
    it('renders no dark-theme classes in form mode, JSON mode and error state', () => {
      vi.useFakeTimers()
      try {
        useExamEditorStore.getState().init(makeExam())
        const { container } = render(<QuestionsJsonEditor structIdx={0} partIdx={0} />)
        expectNoDarkMarkers(container.innerHTML)

        fireEvent.click(screen.getByRole('button', { name: 'Bật JSON' }))
        expectNoDarkMarkers(container.innerHTML)

        fireEvent.change(screen.getByRole('textbox'), { target: { value: '{ not json' } })
        act(() => {
          vi.advanceTimersByTime(500)
        })
        expect(screen.getByText(/JSON chưa hợp lệ/)).toBeInTheDocument()
        expectNoDarkMarkers(container.innerHTML)
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('ValidationPanel', () => {
    it('renders no dark-theme classes for a valid and an invalid exam', () => {
      const valid = render(<ValidationPanel exam={makeExam()} />)
      expect(valid.container.querySelector('li')).not.toBeNull()
      expectNoDarkMarkers(valid.container.innerHTML)
      valid.unmount()

      const empty: Exam = { ...makeExam(), structures: [] }
      const none = render(<ValidationPanel exam={empty} />)
      expectNoDarkMarkers(none.container.innerHTML)
    })
  })

  describe('editor-field', () => {
    it('renders no dark-theme classes', () => {
      const { container } = render(
        <Field label="Tên">
          <TextInput value="a" onChange={() => {}} placeholder="p" />
          <NumberInput value={3} onChange={() => {}} />
          <TextAreaInput value="b" onChange={() => {}} />
        </Field>,
      )
      expectNoDarkMarkers(container.innerHTML)
    })
  })

  describe('TagsInput', () => {
    it('renders no dark-theme classes with and without tags', () => {
      const withTags = render(<TagsInput values={['one', 'two']} onChange={() => {}} />)
      expectNoDarkMarkers(withTags.container.innerHTML)
      withTags.unmount()

      const empty = render(<TagsInput values={undefined} onChange={() => {}} placeholder="p" />)
      expectNoDarkMarkers(empty.container.innerHTML)
    })
  })

  describe('BoxPicker', () => {
    const noop = (): void => {}

    it('renders no dark-theme classes without an image', () => {
      const { container } = render(
        <BoxPicker
          imageUrl={null}
          details={[]}
          selectedId={null}
          onSelect={noop}
          onDraw={noop}
          onClear={noop}
        />,
      )
      expectNoDarkMarkers(container.innerHTML)
    })

    it('renders no dark-theme classes with an image, boxes and manual inputs', () => {
      const details: ExamDetail[] = [
        {
          id: 'd1',
          label: 'A',
          box: { left: '10%', top: '10%', width: '20%', height: '20%' },
          correctAnswers: [],
        },
        { id: 'd2', label: 'B', box: null, correctAnswers: [] },
      ]
      const withSelection = render(
        <BoxPicker
          imageUrl="/x.png"
          details={details}
          selectedId="d1"
          onSelect={noop}
          onDraw={noop}
          onClear={noop}
        />,
      )
      expectNoDarkMarkers(withSelection.container.innerHTML)
      withSelection.unmount()

      const noSelection = render(
        <BoxPicker
          imageUrl="/x.png"
          details={details}
          selectedId={null}
          onSelect={noop}
          onDraw={noop}
          onClear={noop}
        />,
      )
      expectNoDarkMarkers(noSelection.container.innerHTML)
      noSelection.unmount()

      const emptyBox = render(
        <BoxPicker
          imageUrl="/x.png"
          details={details}
          selectedId="d2"
          onSelect={noop}
          onDraw={noop}
          onClear={noop}
        />,
      )
      expectNoDarkMarkers(emptyBox.container.innerHTML)
    })
  })
})
